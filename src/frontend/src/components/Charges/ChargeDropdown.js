import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PageLoader } from '../common/Loader';
import ChargeForm from './ChargeForm';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

const ChargeDropdown = () => {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const dropdownRef = useRef(null);
  const [selectedCharges, setSelectedCharges] = useState([]);
  const [showPaymentOption, setShowPaymentOption] = useState(false);
  const { hasDeleteAccess, hasAddAccess } = useAuth();

  useEffect(() => {
    fetchCharges();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Update showPaymentOption based on selectedCharges
  useEffect(() => {
    setShowPaymentOption(selectedCharges.length > 0);
  }, [selectedCharges]);

  const fetchCharges = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/charges`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCharges(response.data);
      // Reset selected charges when fetching new data
      setSelectedCharges([]);
    } catch (error) {
      console.error('Error fetching charges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChargeDetails = async (chargeId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/charges/${chargeId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching charge details:', error);
      return null;
    }
  };

  const filteredCharges = charges.filter(charge => {
    const vendorName = charge.vendor && charge.vendor.lastName ? charge.vendor.lastName.toLowerCase() : '';
    const categoryName = charge.expenseCategory && charge.expenseCategory.name ? charge.expenseCategory.name.toLowerCase() : '';
    const amount = charge.amount ? charge.amount.toString() : '';
    const chargeId = charge.id ? charge.id.toString() : '';
    const query = searchTerm.toLowerCase();
    
    return vendorName.includes(query) || 
           categoryName.includes(query) || 
           amount.includes(query) || 
           chargeId.includes(query);
  });

  const handleSelectCharge = async (charge) => {
    setSelectedCharge(charge);
    setShowDropdown(false);
    setSearchTerm(`${charge.vendor.lastName}`);
  };

  const handleInputClick = () => {
    setShowDropdown(true);
  };

  const handleAddCharge = () => {
    setSelectedCharge(null);
    setIsEditing(false);
    setShowForm(true);
  };
  
  const handleCancelSelection = () => {
    setSelectedCharge(null);
    setSearchTerm('');
    setShowDropdown(false);
  };
  
  const handleEditCharge = async () => {
    try {
      // Fetch the latest charge data before editing
      const freshCharge = await fetchChargeDetails(selectedCharge.id);
      if (freshCharge) {
        setSelectedCharge(freshCharge);
        setIsEditing(true);
        setShowForm(true);
      } else {
        throw new Error("Failed to fetch latest charge data");
      }
    } catch (error) {
      console.error("Error preparing charge for edit:", error);
      setNotification({
        show: true,
        message: 'Error loading charge details for editing.',
        type: 'error'
      });
    }
  };
  
  const handleDeleteCharge = async (selectedCharge) => {
    if (!window.confirm('Are you sure you want to delete this charge?')) return;
    
    try {
      console.log("selectedCharge")
      console.log(selectedCharge)
      await axios.delete(`${process.env.REACT_APP_API_URL}/charges/${selectedCharge.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNotification({
        show: true,
        message: 'Charge was successfully deleted!',
        type: 'success'
      });
      
      setSelectedCharge(null);
      setSearchTerm('');
      await fetchCharges();
    } catch (error) {
      console.error('Error deleting charge:', error);
      setNotification({
        show: true,
        message: 'Error deleting charge.',
        type: 'error'
      });
    }
  };
  
  const togglePaidStatus = async () => {
    try {
      const updatedCharge = {
        ...selectedCharge,
        isPaid: !selectedCharge.isPaid,
        vendorId: selectedCharge.vendorId.toString(),
        expenseCategoryId: selectedCharge.expenseCategoryId.toString(),
        amount: selectedCharge.amount.toString(),
        dueDate: format(new Date(selectedCharge.dueDate), 'yyyy-MM-dd')
      };
      
      await axios.put(
        `${process.env.REACT_APP_API_URL}/charges/${selectedCharge.id}`,
        updatedCharge,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      // Get updated charge details
      const refreshedCharge = await fetchChargeDetails(selectedCharge.id);
      setSelectedCharge(refreshedCharge);
    } catch (error) {
      console.error('Error updating paid status:', error);
      setNotification({
        show: true,
        message: 'Error updating paid status.',
        type: 'error'
      });
    }
  };

  const handleFormSubmit = async (chargeId) => {
    setShowForm(false);
    
    try {
      // Refresh the charges list
      await fetchCharges();
      
      if (chargeId) {
        // Get the full charge details
        const charge = await fetchChargeDetails(chargeId.id);
        
        if (charge) {
          // Select the charge
          setSelectedCharge(charge);
          setSearchTerm(`${charge.vendor.lastName}`);
          
          // Show success notification
          setNotification({
            show: true,
            message: `Charge was successfully ${isEditing ? 'updated' : 'added'}!`,
            type: 'success'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching charge details:', error);
      setNotification({
        show: true,
        message: `Charge was ${isEditing ? 'updated' : 'added'} but could not display details.`,
        type: 'warning'
      });
      await fetchCharges();
    }
    
    setIsEditing(false);
  };

  // Handle checkbox change for a charge
  const handleCheckboxChange = (chargeId) => {
    setSelectedCharges(prevSelected => {
      if (prevSelected.includes(chargeId)) {
        return prevSelected.filter(id => id !== chargeId);
      } else {
        return [...prevSelected, chargeId];
      }
    });
  };

  // Handle marking selected charges for payment
  const handleMarkForPayment = async () => {
    if (selectedCharges.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to mark ${selectedCharges.length} charge(s) for payment?`)) return;
    
    try {
      // Process each selected charge
      const promises = selectedCharges.map(async (chargeId) => {
        const charge = charges.find(c => c.id === chargeId);
        if (!charge) return null;
        
        const updatedCharge = {
          ...charge,
          isPaid: true,
          vendorId: charge.vendorId.toString(),
          expenseCategoryId: charge.expenseCategoryId.toString(),
          amount: charge.amount.toString(),
          dueDate: format(new Date(charge.dueDate), 'yyyy-MM-dd'),
          markedForPayment: true
        };
        
        return axios.put(
          `${process.env.REACT_APP_API_URL}/charges/${chargeId}`,
          updatedCharge,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
      });
      
      await Promise.all(promises);
      
      setNotification({
        show: true,
        message: `${selectedCharges.length} charge(s) marked for payment successfully!`,
        type: 'success'
      });
      
      // Refresh charges
      await fetchCharges();
    } catch (error) {
      console.error('Error marking charges for payment:', error);
      setNotification({
        show: true,
        message: 'Error marking charges for payment.',
        type: 'error'
      });
    }
  };

  // Toggle selection of all charges
  const toggleSelectAll = () => {
    if (selectedCharges.length === charges.length) {
      // If all are selected, unselect all
      setSelectedCharges([]);
    } else {
      // Otherwise, select all
      setSelectedCharges(charges.map(charge => charge.id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Charges/Bills Management</h1>
      
      {notification.show && (
        <div className={`p-4 mb-4 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-700' : notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
          {notification.message}
        </div>
      )}
      
      <div className="relative mb-6" ref={dropdownRef}>
        <div className="flex">
          <input
            type="text"
            className="w-32 p-3 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder=""
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={handleInputClick}
          />
          <button
            onClick={() => setShowDropdown(prev => !prev)}
            className="bg-gray-100 text-gray-700 px-3 hover:bg-gray-200 focus:outline-none border-t border-b border-r border-gray-300"
            aria-label="Show all options"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={handleCancelSelection}
            className="bg-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-400 focus:outline-none"
          >
            Cancel
          </button> 
          {hasAddAccess('charges') && (
            <button
              onClick={handleAddCharge}
              className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 focus:outline-none"
            >
              Add
            </button>
          )}
        </div>
        
        {loading ? (
          <PageLoader />
        ) : (
          <>
            {/* Comment out the dropdown logic */}
            {/* {showDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredCharges.length === 0 ? (
                  <div className="p-3 text-gray-500">No charges found</div>
                ) : (
                  filteredCharges.map((charge) => (
                    <div
                      key={charge.id}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                      onClick={() => handleSelectCharge(charge)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{charge.vendor?.lastName || 'Unknown Vendor'}</span>
                          <span className="text-sm text-gray-500 ml-2">({charge.expenseCategory?.name || 'Uncategorized'})</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-bold text-gray-700">${parseFloat(charge.amount || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      {charge.dueDate && (
                        <div className="text-sm text-gray-500 mt-1">
                          Due: {format(new Date(charge.dueDate), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )} */}

            {selectedCharge ? (
              <div className="mt-6">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="text-lg font-semibold">Charge Details</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Vendor</p>
                        <p className="font-medium">{selectedCharge.vendor?.lastName || 'Unknown Vendor'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expense Category</p>
                        <p className="font-medium">{selectedCharge.expenseCategory?.name || 'Uncategorized'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium">${parseFloat(selectedCharge.amount || 0).toFixed(2)}</p>
                      </div>
                      {selectedCharge.dueDate && (
                        <div>
                          <p className="text-sm text-gray-500">Due Date</p>
                          <p className="font-medium">{format(new Date(selectedCharge.dueDate), 'MMMM dd, yyyy')}</p>
                        </div>
                      )}
                    </div>
                    
                    {selectedCharge.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="font-medium">{selectedCharge.notes}</p>
                      </div>
                    )}

                    <div className="flex space-x-3 mt-4">
                      {hasAddAccess('charges') && (
                      <button 
                        onClick={handleEditCharge}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>
                      )}
                      
                      {hasDeleteAccess('charges') && (
                          <button 
                            onClick={handleDeleteCharge}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              showDropdown && (
                <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow">
                  {/* Show payment button if charges are selected */}
                  {showPaymentOption && (
                    <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                      <div>
                        <span className="font-medium">{selectedCharges.length} charge(s) selected</span>
                      </div>
                      <button
                        onClick={handleMarkForPayment}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Mark Selected for Payment
                      </button>
                    </div>
                  )}
                  
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={selectedCharges.length > 0 && selectedCharges.length === charges.length}
                              onChange={toggleSelectAll}
                            />
                            <span className="ml-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Pay</span>
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vendor
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expense Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Account #
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCharges.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                            No charges found
                          </td>
                        </tr>
                      ) : (
                        filteredCharges.map((charge) => (
                          <tr key={charge.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={selectedCharges.includes(charge.id)}
                                onChange={() => handleCheckboxChange(charge.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleSelectCharge(charge)}>
                              <div className="text-sm font-medium text-gray-900">
                                {charge.vendor?.lastName || 'Unknown'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleSelectCharge(charge)}>
                              <div className="text-sm text-gray-900">
                                {charge.expenseCategory?.name || 'Unknown'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleSelectCharge(charge)}>
                              <div className="text-sm text-gray-900">
                                {charge.vendor?.accountNumber || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleSelectCharge(charge)}>
                              <div className="text-sm font-medium text-gray-900">
                                ${parseFloat(charge.amount || 0).toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleSelectCharge(charge)}>
                              <div className="text-sm text-gray-900">
                                {charge.dueDate ? format(new Date(charge.dueDate), 'MM/dd/yyyy') : 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex space-x-2">
                                {hasAddAccess('charges') && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCharge(charge);
                                    setIsEditing(true);
                                    setShowForm(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Edit
                                </button>
                                )}
                                {hasDeleteAccess('charges') && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCharge(charge);
                                      handleDeleteCharge(charge);
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-8 border shadow-lg rounded-md bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ChargeForm
              charge={isEditing ? selectedCharge : null}
              onClose={() => {
                setShowForm(false);
                setIsEditing(false);
              }}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChargeDropdown; 