import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PageLoader } from '../common/Loader';
import VisitorForm from './VisitorForm';

const VisitorDropdown = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchVisitors();
    
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

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/visitors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVisitors(response.data);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVisitors = visitors.filter(visitor => {
    const fullName = `${visitor.lastName} ${visitor.firstName}`.toLowerCase();
    const visitorNumber = visitor.visitorNumber?.toString() || '';
    return fullName.includes(searchTerm.toLowerCase()) || visitorNumber.includes(searchTerm);
  });

  const handleSelectVisitor = (visitor) => {
    setSelectedVisitor(visitor);
    setShowDropdown(false);
    setSearchTerm(`${visitor.lastName} ${visitor.firstName}`);
  };

  const handleInputClick = () => {
    setShowDropdown(true);
  };

  const handleAddVisitor = () => {
    setSelectedVisitor(null);
    setShowForm(true);
  };

  const handleVisitorAdded = async (newVisitorId) => {
    try {
      // Refresh the visitors list
      await fetchVisitors();
      
      // Get the newly added visitor details
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/visitors/${newVisitorId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const newVisitor = response.data;
      
      // Select the new visitor
      setSelectedVisitor(newVisitor);
      setSearchTerm(`${newVisitor.lastName} ${newVisitor.firstName}`);
      
      // Show success notification
      setNotification({
        show: true,
        message: `${newVisitor.lastName} ${newVisitor.firstName} was successfully added!`,
        type: 'success'
      });
      
      // Close the form
      setShowForm(false);
    } catch (error) {
      console.error('Error fetching new visitor details:', error);
      setNotification({
        show: true,
        message: 'Visitor was added but could not display details.',
        type: 'warning'
      });
      await fetchVisitors();
      setShowForm(false);
    }
  };

  const handleEditVisitor = () => {
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteVisitor = async () => {
    if (window.confirm('Are you sure you want to delete this visitor?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/visitors/${selectedVisitor.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Show success notification
        setNotification({
          show: true,
          message: `${selectedVisitor.lastName} ${selectedVisitor.firstName} was successfully deleted!`,
          type: 'success'
        });
        
        // Clear selection and refresh list
        setSelectedVisitor(null);
        setSearchTerm('');
        await fetchVisitors();
      } catch (error) {
        console.error('Error deleting visitor:', error);
        setNotification({
          show: true,
          message: 'Error deleting visitor.',
          type: 'error'
        });
      }
    }
  };

  const handleFormSubmit = async (visitorId) => {
    try {
      // Refresh the visitors list
      await fetchVisitors();
      
      // If editing, get the updated visitor details
      if (isEditing) {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/visitors/${visitorId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        const updatedVisitor = response.data;
        
        // Update the selected visitor
        setSelectedVisitor(updatedVisitor);
        setSearchTerm(`${updatedVisitor.lastName} ${updatedVisitor.firstName}`);
        
        // Show success notification
        setNotification({
          show: true,
          message: `${updatedVisitor.lastName} ${updatedVisitor.firstName} was successfully updated!`,
          type: 'success'
        });
      } else {
        // Handle adding new visitor (existing code)
        await handleVisitorAdded(visitorId);
      }
      
      // Close the form and reset editing state
      setShowForm(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating visitor details:', error);
      setNotification({
        show: true,
        message: 'Error updating visitor details.',
        type: 'error'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleCancel = () => {
    setSearchTerm('');
    setSelectedVisitor(null);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Visitor Lookup</h1>
        
        {loading ? (
          <PageLoader />
        ) : (
          <>
            <div className="flex mb-8 items-end gap-4">
              <div className="relative flex-grow" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Visitor
                </label>
                <div className="flex">
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search for a visitor by name or visitor number..."
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
                    className="bg-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-400 focus:outline-none border-t border-b border-r border-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddVisitor}
                    className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 focus:outline-none"
                  >
                    Add
                  </button>
                </div>
                
                {showDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                    {filteredVisitors.length > 0 ? (
                      filteredVisitors.map((visitor) => (
                        <div
                          key={visitor.id}
                          className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectVisitor(visitor)}
                        >
                          <div className="flex-shrink-0 h-8 w-8 mr-3">
                            <img
                              className="h-8 w-8 rounded-full object-cover"
                              src={visitor.profileImage || '/default.jpg'}
                              alt=""
                            />
                          </div>
                          <div>
                            {visitor.lastName}, {visitor.firstName} - {visitor.visitorNumber}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No visitors found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedVisitor && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
                    <img
                      src={selectedVisitor.profileImage || '/default.jpg'}
                      alt={`${selectedVisitor.lastName} ${selectedVisitor.firstName}`}
                      className="h-48 w-48 rounded-full object-cover"
                    />
                  </div>
                  
                  <div className="md:w-2/3 md:pl-8">
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold">
                      {selectedVisitor.lastName}, {selectedVisitor.firstName} {selectedVisitor.middleInitial ? selectedVisitor.middleInitial + '.' : ''}
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                        <p className="mb-1"><span className="font-medium">Email:</span> {selectedVisitor.email || 'N/A'}</p>
                        <p className="mb-1"><span className="font-medium">Phone:</span> {selectedVisitor.cellPhone || 'N/A'}</p>
                        <p className="mb-1">
                          <span className="font-medium">Address:</span>{' '}
                          {[
                            selectedVisitor.address,
                            selectedVisitor.city,
                            selectedVisitor.state,
                            selectedVisitor.zipCode
                          ].filter(Boolean).join(', ') || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Visitor Details</h3>
                        <p className="mb-1"><span className="font-medium">Visitor #:</span> {selectedVisitor.visitorNumber}</p>
                        <p className="mb-1"><span className="font-medium">Visit Date:</span> {formatDate(selectedVisitor.visitDate)}</p>
                        <p className="mb-1"><span className="font-medium">Home Church:</span> {selectedVisitor.homeChurch || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <button 
                        onClick={handleEditVisitor}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Visitor
                      </button>
                      
                      <button 
                        onClick={handleDeleteVisitor}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Visitor
                      </button>
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
            <VisitorForm
              visitor={isEditing ? selectedVisitor : null}
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

export default VisitorDropdown; 