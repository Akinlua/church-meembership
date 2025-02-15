import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DonationForm = ({ donation, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    donation_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
    if (donation) {
      setFormData(donation);
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
      if (donation) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/donations/${donation.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/donations`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      }
      onSubmit();
    } catch (error) {
      console.error('Error saving donation:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <select
          name="member_id"
          value={formData.member_id}
          onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Member</option>
          {members.map(member => (
            <option key={member.id} value={member.id}>
              {`${member.firstName} ${member.lastName}`}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="border p-2 rounded"
          required
          step="0.01"
          min="0"
        />

        <input
          type="date"
          name="donation_date"
          value={formData.donation_date}
          onChange={(e) => setFormData({ ...formData, donation_date: e.target.value })}
          className="border p-2 rounded"
          required
        />

        <textarea
          name="notes"
          placeholder="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="border p-2 rounded"
          rows="3"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {donation ? 'Update' : 'Add'} Donation
        </button>
      </div>
    </form>
  );
};

export default DonationForm; 