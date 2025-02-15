import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DonationForm = ({ donation, onClose, onSubmit }) => {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    member_id: donation?.id || '',
    amount: donation?.amount || '',
    donation_date: donation?.donationDate ? new Date(donation.donationDate).toISOString().split('T')[0] : '',
    notes: donation?.notes || ''
  });

  useEffect(() => {
    fetchMembers();
    // Update form data when donation prop changes
    if (donation) {
      setFormData({
        member_id: donation.id || '',
        amount: donation.amount || '',
        donation_date: donation.donationDate ? new Date(donation.donationDate).toISOString().split('T')[0] : '',
        notes: donation.notes || ''
      });
    }
  }, [donation]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `${process.env.REACT_APP_API_URL}/donations${donation ? `/${donation.id}` : ''}`;
      const method = donation ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      onSubmit();
    } catch (error) {
      console.error('Error saving donation:', error);
      alert('Error saving donation. Please try again.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{donation ? 'Edit' : 'Add'} Donation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Member</label>
            <select
              value={formData.member_id}
              onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Member</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {`${member.firstName} ${member.lastName}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Donation Date</label>
            <input
              type="date"
              value={formData.donation_date}
              onChange={(e) => setFormData({ ...formData, donation_date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows="3"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {donation ? 'Update' : 'Add'} Donation
          </button>
        </div>
      </form>
    </div>
  );
};

export default DonationForm; 