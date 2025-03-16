import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DepositForm from './DepositForm';
import DepositList from './DepositList';
import { PageLoader } from '../common/Loader';

const Deposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/deposits`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDeposits(response.data);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeposit = () => {
    setSelectedDeposit(null);
    setShowForm(true);
  };

  const handleEditDeposit = (deposit) => {
    setSelectedDeposit(deposit);
    setShowForm(true);
  };

  const handleDeleteDeposit = async (deposit) => {
    if (!window.confirm('Are you sure you want to delete this deposit?')) return;
    
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/deposits/${deposit.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      await fetchDeposits();
    } catch (error) {
      console.error('Error deleting deposit:', error);
      alert('Error deleting deposit. Please try again.');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedDeposit(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Deposits</h1>
        <button
          onClick={handleAddDeposit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Deposit
        </button>
      </div>

      {showForm ? (
        <DepositForm
          deposit={selectedDeposit}
          onClose={handleFormClose}
          onSubmit={fetchDeposits}
        />
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <PageLoader />
        </div>
      ) : (
        <DepositList 
          deposits={deposits} 
          onEdit={handleEditDeposit} 
          onDelete={handleDeleteDeposit}
          loading={loading}
          selectedDeposit={selectedDeposit}
          setSelectedDeposit={setSelectedDeposit}
        />
      )}
    </div>
  );
};

export default Deposits; 