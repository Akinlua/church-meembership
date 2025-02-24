import React, { useState, useEffect } from 'react';
import DonationList from './DonationList';
import DonationForm from './DonationForm';
import axios from 'axios';
import { PageLoader } from '../common/Loader';

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

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

  const handleAddDonation = () => {
    setSelectedDonation(null);
    setShowForm(true);
  };

  const handleEditDonation = (donation) => {
    setSelectedDonation(donation);
    setShowForm(true);
  };

  const handleDeleteDonation = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/donations/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchDonations();
    } catch (error) {
      console.error('Error deleting donation:', error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    fetchDonations();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
        <button
          onClick={handleAddDonation}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Donation
        </button>
      </div>

      {showForm ? (
        <DonationForm
          donation={selectedDonation}
          onClose={handleFormClose}
          onSubmit={fetchDonations}
        />
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <PageLoader />
        </div>
      ) : (
        <DonationList 
          donations={donations} 
          onEdit={handleEditDonation} 
          onDelete={handleDeleteDonation}
          loading={loading}
          selectedDonation={selectedDonation}
          setSelectedDonation={setSelectedDonation}
        />
      )}
    </div>
  );
};

export default Donations; 