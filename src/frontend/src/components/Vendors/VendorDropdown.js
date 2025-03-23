import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PageLoader } from '../common/Loader';
import VendorForm from './VendorForm';
import { useAuth } from '../../contexts/AuthContext';

const VendorDropdown = () => {
  const { hasAccess, hasDeleteAccess, hasAddAccess } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchVendors();
    
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

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/vendors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const vendorName = vendor.lastName.toLowerCase();
    const vendorNumber = vendor.vendorNumber ? vendor.vendorNumber.toString() : '';
    // const vendorId = vendor.id ? vendor.id.toString() : '';
    // const accountNumber = vendor.accountNumber ? vendor.accountNumber.toString() : '';
    const query = searchTerm.toLowerCase();
    
    return vendorName.includes(query) || 
           vendorNumber.includes(query)
  });

  const handleSelectVendor = (vendor) => {
    setSelectedVendor(vendor);
    setShowDropdown(false);
    setSearchTerm(vendor.lastName);
  };

  const handleInputClick = () => {
    setShowDropdown(true);
  };

  const handleAddVendor = () => {
    setSelectedVendor(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditVendor = () => {
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteVendor = async () => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/vendors/${selectedVendor.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Show success notification
        setNotification({
          show: true,
          message: `${selectedVendor.lastName} was successfully deleted!`,
          type: 'success'
        });
        
        // Clear selection and refresh list
        setSelectedVendor(null);
        setSearchTerm('');
        await fetchVendors();
      } catch (error) {
        console.error('Error deleting vendor:', error);
        setNotification({
          show: true,
          message: 'Error deleting vendor.',
          type: 'error'
        });
      }
    }
  };

  const handleVendorAdded = async (vendorId) => {
    try {
      // Refresh the vendors list
      await fetchVendors();
      
      // Get the newly added vendor details
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/vendors/${vendorId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const newVendor = response.data;
      
      // Select the new vendor
      setSelectedVendor(newVendor);
      setSearchTerm(newVendor.lastName);
      
      // Show success notification
      setNotification({
        show: true,
        message: `${newVendor.lastName} was successfully ${isEditing ? 'updated' : 'added'}!`,
        type: 'success'
      });
      
      // Close the form
      // setShowForm(false);
      // setIsEditing(false);
    } catch (error) {
      console.error('Error fetching new vendor details:', error);
      setNotification({
        show: true,
        message: `Vendor was ${isEditing ? 'updated' : 'added'} but could not display details.`,
        type: 'warning'
      });
      await fetchVendors();
      setShowForm(false);
    }
  };

  const handleFormSubmit = async (vendorId) => {
    try {
      await fetchVendors();
      if (isEditing) {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/vendors/${vendorId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const updatedVendor = response.data;
        setSelectedVendor(updatedVendor);
        setSearchTerm(updatedVendor.lastName);
        setNotification({
          show: true,
          message: `${updatedVendor.lastName} was successfully updated!`,
          type: 'success'
        });
      } else {
        await handleVendorAdded(vendorId);
      }
      // setShowForm(false);
      // setIsEditing(false);
    } catch (error) {
      console.error('Error updating vendor details:', error);
      setNotification({
        show: true,
        message: 'Error updating vendor details.',
        type: 'error'
      });
    }
  };

  const handleCancel = () => {
    setSearchTerm('');
    setSelectedVendor(null);
    setShowDropdown(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {notification.show && (
        <div className={`mb-4 p-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {notification.message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Vendor Lookup</h1>
        
        {loading ? (
          <PageLoader />
        ) : (
          <>
            <div className="flex mb-8 items-end gap-4">
              <div className="relative flex-grow" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Vendor
                </label>
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
                  {hasAddAccess('vendor') && (
                    <button
                      onClick={handleAddVendor}
                      className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 focus:outline-none"
                    >
                      Add
                    </button>
                  )}
                </div>
                
                {showDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                    {filteredVendors.length > 0 ? (
                      filteredVendors.map((vendor) => (
                        <div
                          key={vendor.id}
                          className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectVendor(vendor)}
                        >
                          <div className="flex-shrink-0 h-8 w-8 mr-3">
                            <img
                              className="h-8 w-8 rounded-full object-cover"
                              src={vendor.profileImage || '/default.jpg'}
                              alt=""
                            />
                          </div>
                          <div>
                            {vendor.lastName}
                            {vendor.accountNumber && ` (Account: ${vendor.accountNumber})`}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No vendors found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedVendor && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img
                        src={selectedVendor.profileImage || '/default.jpg'}
                        alt={selectedVendor.lastName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold">{selectedVendor.lastName}</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                        <p className="mb-1"><span className="font-medium">Email:</span> {selectedVendor.email || 'N/A'}</p>
                        <p className="mb-1"><span className="font-medium">Phone:</span> {selectedVendor.phone || 'N/A'}</p>
                        <p className="mb-1">
                          <span className="font-medium">Address:</span>{' '}
                          {[
                            selectedVendor.address,
                            selectedVendor.city,
                            selectedVendor.state,
                            selectedVendor.zipCode
                          ].filter(Boolean).join(', ') || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Vendor Details</h3>
                        {/* <p className="mb-1"><span className="font-medium">Vendor #:</span> {selectedVendor.vendorNumber || 'N/A'}</p> */}
                        <p className="mb-1"><span className="font-medium">Account #:</span> {selectedVendor.accountNumber || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      {hasAddAccess('vendor') && (
                      <button 
                        onClick={handleEditVendor}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>
                      )}
                      
                      {hasDeleteAccess('vendor') && (
                        <button 
                          onClick={handleDeleteVendor}
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
          </>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-8 border shadow-lg rounded-md bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <VendorForm
              vendor={isEditing ? selectedVendor : null}
              onClose={() => {
                setShowForm(false);
                setIsEditing(false);
                fetchVendors();
              }}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDropdown; 