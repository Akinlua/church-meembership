import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PageLoader } from '../common/Loader';
import BankForm from './BankForm';
import { useAuth } from '../../contexts/AuthContext';

const BankDropdown = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const dropdownRef = useRef(null);
  const { hasDeleteAccess, hasAddAccess } = useAuth();


  useEffect(() => {
    fetchBanks();

    
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

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/banks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBanks(response.data);
    } catch (error) {
      console.error('Error fetching banks:', error);
      setNotification({
        show: true,
        message: 'Error fetching banks.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBankDetails = async (bankId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/banks/${bankId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching bank details:', error);
      return null;
    }
  };

  const filteredBanks = banks.filter(bank => {
    const name = bank.name ? bank.name.toLowerCase() : '';
    const branch = bank.branch ? bank.branch.toLowerCase() : '';
    const query = searchTerm.toLowerCase();
    
    return name.includes(query) || branch.includes(query);
  });

  const handleSelectBank = async (bank) => {
    try {
      const fullBank = await fetchBankDetails(bank.id);
      if (fullBank) {
        setSelectedBank(fullBank);
        setShowDropdown(false);
        setSearchTerm(fullBank.name);
      }
    } catch (error) {
      console.error('Error selecting bank:', error);
    }
  };

  const handleInputClick = () => {
    setShowDropdown(true);
  };

  const handleAddBank = () => {
    setSelectedBank(null);
    setIsEditing(false);
    setShowForm(true);
  };
  
  const handleEditBank = () => {
    setIsEditing(true);
    setShowForm(true);
  };
  
  const handleDeleteBank = async (bank) => {
    if (!bank) {
      console.error('No bank selected for deletion.');
      setNotification({
        show: true,
        message: 'No bank selected for deletion.',
        type: 'error'
      });
      return;
    }

    if (!window.confirm('Are you sure you want to delete this bank?')) return;
    
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/banks/${bank.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNotification({
        show: true,
        message: 'Bank was successfully deleted!',
        type: 'success'
      });
      
      setSelectedBank(null);
      setSearchTerm('');
      await fetchBanks();
    } catch (error) {
      console.error('Error deleting bank:', error);
      setNotification({
        show: true,
        message: 'Error deleting bank.',
        type: 'error'
      });
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    
    try {
      await fetchBanks();
      
      setNotification({
        show: true,
        message: `Bank was successfully ${isEditing ? 'updated' : 'added'}!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error after form submission:', error);
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSearchTerm('');
    setSelectedBank(null);
    setShowDropdown(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Banks Management</h1>
      
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
            onClick={handleCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-400 focus:outline-none border-t border-b border-gray-300"
          >
            Cancel
          </button>
          {hasAddAccess('bank') && (
            <button
              onClick={handleAddBank}
              className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 focus:outline-none"
            >
              Add
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="mt-6">
            <PageLoader />
          </div>
        ) : (
          <>
            {selectedBank && (
              <div className="mt-6 bg-white rounded-lg shadow-md p-6 border border-gray-200 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">{selectedBank.name}</h2>
                    <p><span className="font-medium">Address:</span> {selectedBank.address || 'N/A'}</p>
                    <p><span className="font-medium">City:</span> {selectedBank.city || 'N/A'}</p>
                    <p><span className="font-medium">State:</span> {selectedBank.state || 'N/A'}</p>
                    <p><span className="font-medium">Routing Number:</span> {selectedBank.routingNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Contact Person:</span> {selectedBank.contact || 'N/A'}</p>
                    <p><span className="font-medium">Zip Code:</span> {selectedBank.zipCode || 'N/A'}</p>
                    <p><span className="font-medium">Phone:</span> {selectedBank.phone || 'N/A'}</p>
                    <p><span className="font-medium">Account Number:</span>{selectedBank.accountNumber || 'No account number added'}</p>
{/* 
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Account Number:</h3>
                      <p>{selectedBank.accountNumber || 'No account number added'}</p>
                    </div> */}
                    <div className="flex space-x-3 mt-6">
                      {hasAddAccess('bank') && (
                      <button 
                        onClick={handleEditBank}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>
                      )}

                      {hasDeleteAccess('bank') && (
                          <button 
                          onClick={() => handleDeleteBank(selectedBank)}
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
            )}
            
            {showDropdown && (
              <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        City
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBanks.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                          No banks found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredBanks.map((bank) => (
                        <tr key={bank.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectBank(bank)}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {bank.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {bank.accountNumber || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {bank.city || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              {hasAddAccess('bank') && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectBank(bank).then(() => {
                                    setIsEditing(true);
                                    setShowForm(true);
                                  });
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              )}
                              {hasDeleteAccess('bank') && (
                                <button 
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await handleSelectBank(bank);
                                    handleDeleteBank(bank);
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
            )}
          </>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-8 border shadow-lg rounded-md bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <BankForm
              bank={isEditing ? selectedBank : null}
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

export default BankDropdown; 