import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PageLoader } from '../common/Loader';
import DonationTypeForm from './DonationTypeForm';
import { useAuth } from '../../contexts/AuthContext';

const DonationTypeDropdown = () => {
  const [donationTypes, setDonationTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const dropdownRef = useRef(null);
  const { hasDeleteAccess, hasAddAccess } = useAuth();

  useEffect(() => {
    fetchDonationTypes();
    
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

  const fetchDonationTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/donation-types`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDonationTypes(response.data);
    } catch (error) {
      console.error('Error fetching donation types:', error);
      setNotification({
        show: true,
        message: 'Error fetching donation types.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDonationTypeDetails = async (typeId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/donation-types/${typeId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching donation type details:', error);
      return null;
    }
  };

  const filteredTypes = donationTypes.filter(type => {
    const name = type.name ? type.name.toLowerCase() : '';
    const description = type.description ? type.description.toLowerCase() : '';
    const query = searchTerm.toLowerCase();
    
    return name.includes(query) || description.includes(query);
  });

  const handleSelectType = async (type) => {
    try {
      // Get full donation type details
      const fullType = await fetchDonationTypeDetails(type.id);
      if (fullType) {
        setSelectedType(fullType);
        setShowDropdown(false);
        setSearchTerm(fullType.name);
      }
    } catch (error) {
      console.error('Error selecting donation type:', error);
    }
  };

  const handleInputClick = () => {
    setShowDropdown(true);
  };

  const handleAddType = () => {
    setSelectedType(null);
    setIsEditing(false);
    setShowForm(true);
  };
  
  const handleEditType = () => {
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteType = async () => {
    if (window.confirm('Are you sure you want to delete this donation type?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/donation-types/${selectedType.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        setNotification({
          show: true,
          message: 'Donation type deleted successfully!',
          type: 'success'
        });
        
        setSelectedType(null);
        setSearchTerm('');
        await fetchDonationTypes();
      } catch (error) {
        console.error('Error deleting donation type:', error);
        setNotification({
          show: true,
          message: 'Error deleting donation type.',
          type: 'error'
        });
      }
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/donation-types/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob' // Important for handling binary data
      });

      // Create a URL for the PDF blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'donation_types_report.pdf'); // Set the file name
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading donation types report:', error);
      setNotification({
        show: true,
        message: 'Error downloading report.',
        type: 'error'
      });
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    
    try {
      await fetchDonationTypes();
      
      setNotification({
        show: true,
        message: `Donation type was successfully ${isEditing ? 'updated' : 'added'}!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error after form submission:', error);
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSearchTerm('');
    setSelectedType(null);
    setShowDropdown(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Donation Types</h1>
      
      {notification.show && (
        <div className={`p-4 mb-4 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-700' : notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
          {notification.message}
        </div>
      )}
      
      {/* <div className="mb-4">
        <button 
          onClick={handleDownload}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
        >
          Download Report (PDF)
        </button>
      </div> */}
      
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
          {hasAddAccess('donation') && (
            <button
              onClick={handleAddType}
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
            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredTypes.length === 0 ? (
                  <div className="p-3 text-gray-500">No donation types found</div>
                ) : (
                  filteredTypes.map((type) => (
                    <div
                      key={type.id}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                      onClick={() => handleSelectType(type)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{type.name}</span>
                        </div>
                      </div>
                      {type.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {type.description}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedType && (
              <div className="mt-6">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="text-lg font-semibold">Donation Type Details</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{selectedType.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="font-medium">{selectedType.description || 'No description'}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-6">
                      {hasAddAccess('donation') && (
                      <button 
                        onClick={handleEditType}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>
                      )}
                      
                      {hasDeleteAccess('donation') && (
                        <button 
                          onClick={handleDeleteType}
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
            <DonationTypeForm
              initialData={isEditing ? selectedType : null}
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

export default DonationTypeDropdown; 