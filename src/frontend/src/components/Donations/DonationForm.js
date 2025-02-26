import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePickerField from '../common/DatePickerField';
import { ButtonLoader, PageLoader } from '../common/Loader';

const DonationForm = ({ donation, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [donationTypes, setDonationTypes] = useState([]);
  const [formData, setFormData] = useState({
    member_id: donation?.memberId || '',
    amount: donation?.amount || '',
    donation_type: donation?.donationType || '',
    donation_date: donation?.donationDate ? new Date(donation.donationDate) : null,
    notes: donation?.notes || ''
  });

  useEffect(() => {
    const loadFormData = async () => {
      try {
        await fetchMembers();
        await fetchDonationTypes();
        if (donation) {
          setFormData({
            member_id: donation.memberId || '',
            amount: donation.amount || '',
            donation_type: donation.donationType || '',
            donation_date: donation.donationDate ? new Date(donation.donationDate) : null,
            notes: donation.notes || ''
          });
        }
      } finally {
        setFormLoading(false);
      }
    };
    loadFormData();
  }, []);

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

  const fetchDonationTypes = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/donation-types`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDonationTypes(response.data);
    } catch (error) {
      console.error('Error fetching donation types:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_API_URL}/donations${donation ? `/${donation.id}` : ''}`;
      const method = donation ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      await onSubmit();
      onClose();
    } catch (error) {
      console.error('Error saving donation:', error);
      alert('Error saving donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    const number = parseFloat(value);
    if (isNaN(number)) return value;
    return number.toFixed(2);
  };

  return (
    <div className="relative">
      {formLoading ? (
        <div className="min-h-[400px]">
          <PageLoader />
        </div>
      ) : (
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
                <label className="block text-sm font-medium text-gray-700">Donation Type</label>
                <select
                  value={formData.donation_type}
                  onChange={(e) => setFormData({ ...formData, donation_type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Donation Type</option>
                  {donationTypes.map(type => (
                    <option key={type.id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    onBlur={() => setFormData({ ...formData, amount: formatCurrency(formData.amount) })}
                    className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <DatePickerField
                label="Donation Date"
                value={formData.donation_date}
                onChange={(date) => setFormData({ ...formData, donation_date: date })}
                required
              />

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

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <ButtonLoader /> : donation ? 'Update' : 'Add'} Donation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DonationForm; 