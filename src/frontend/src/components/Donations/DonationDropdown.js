import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PageLoader } from '../common/Loader';
import DonationForm from './DonationForm';
import { format } from 'date-fns';

const DonationDropdown = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchDonations();
    
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

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/donations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDonations(response.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonationDetails = async (donationId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/donations/${donationId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching donation details:', error);
      return null;
    }
  };

  const filteredDonations = donations.filter(donation => {
    const memberName = donation.member ? `${donation.member.lastName} ${donation.member.firstName}`.toLowerCase() : '';
    const amount = donation.amount ? donation.amount.toString() : '';
    const donationType = donation.donationType ? donation.donationType.toLowerCase() : '';
    const donationId = donation.id ? donation.id.toString() : '';
    const query = searchTerm.toLowerCase();
    
    return memberName.includes(query) || 
           amount.includes(query) || 
           donationType.includes(query) || 
           donationId.includes(query);
  });

  const handleSelectDonation = async (donation) => {
    try {
      // Get full donation details
      const fullDonation = await fetchDonationDetails(donation.id);
      if (fullDonation) {
        setSelectedDonation(fullDonation);
        setShowDropdown(false);
        setSearchTerm(`${donation.member.lastName} ${donation.member.firstName} - $${parseFloat(donation.amount).toFixed(2)}`);
      }
    } catch (error) {
      console.error('Error selecting donation:', error);
    }
  };

  const handleInputClick = () => {
    setShowDropdown(true);
  };

  const handleAddDonation = () => {
    setSelectedDonation(null);
    setIsEditing(false);
    setShowForm(true);
  };
  
  const handleEditDonation = () => {
    setIsEditing(true);
    setShowForm(true);
  };
  
  const handleDeleteDonation = async () => {
    if (!window.confirm('Are you sure you want to delete this donation?')) return;
    
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/donations/${selectedDonation.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNotification({
        show: true,
        message: 'Donation was successfully deleted!',
        type: 'success'
      });
      
      setSelectedDonation(null);
      setSearchTerm('');
      await fetchDonations();
    } catch (error) {
      console.error('Error deleting donation:', error);
      setNotification({
        show: true,
        message: 'Error deleting donation.',
        type: 'error'
      });
    }
  };
  
  const handleFormSubmit = async (donationId) => {
    setShowForm(false);
    
    try {
      // Refresh the donations list
      await fetchDonations();
      
      if (donationId) {
        // Get the full donation details
        const donation = await fetchDonationDetails(donationId);
        
        if (donation) {
          // Select the donation
          setSelectedDonation(donation);
          setSearchTerm(`${donation.member.lastName} ${donation.member.firstName} - $${parseFloat(donation.amount).toFixed(2)}`);
          
          // Show success notification
          setNotification({
            show: true,
            message: `Donation was successfully ${isEditing ? 'updated' : 'added'}!`,
            type: 'success'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching donation details:', error);
      setNotification({
        show: true,
        message: `Donation was ${isEditing ? 'updated' : 'added'} but could not display details.`,
        type: 'warning'
      });
      await fetchDonations();
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSearchTerm('');
    setSelectedDonation(null);
    setShowDropdown(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Member Donation</h1>
      
      {notification.show && (
        <div className={`p-4 mb-4 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
          <button
            onClick={handleAddDonation}
            className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 focus:outline-none"
          >
            Add
          </button>
        </div>
        
        {loading ? (
          <PageLoader />
        ) : (
          <>
            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredDonations.length === 0 ? (
                  <div className="p-3 text-gray-500">No donations found</div>
                ) : (
                  filteredDonations.map((donation) => (
                    <div
                      key={donation.id}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                      onClick={() => handleSelectDonation(donation)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium">{donation.member.lastName} {donation.member.firstName}</span>
                        </div>
                        <div className="text-green-600 font-medium">
                          ${parseFloat(donation.amount).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <div>{donation.donationType}</div>
                        <div>{format(new Date(donation.donationDate), 'MM/dd/yyyy')}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedDonation && (
              <div className="mt-6">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="text-lg font-semibold">Donation Details</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Member</p>
                        <p className="font-medium">{selectedDonation.member.lastName} {selectedDonation.member.firstName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium text-green-600">${parseFloat(selectedDonation.amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Donation Type</p>
                        <p className="font-medium">{selectedDonation.donationType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{format(new Date(selectedDonation.donationDate), 'MM/dd/yyyy')}</p>
                      </div>
                    </div>
                    
                    {selectedDonation.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="bg-gray-50 p-2 rounded">{selectedDonation.notes}</p>
                      </div>
                    )}

                    <div className="flex space-x-3 mt-4">
                      <button 
                        onClick={handleEditDonation}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Donation
                      </button>
                      
                      <button 
                        onClick={handleDeleteDonation}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Donation
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
            <DonationForm
              donation={isEditing ? selectedDonation : null}
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

export default DonationDropdown; 