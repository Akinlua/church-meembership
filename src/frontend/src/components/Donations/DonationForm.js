import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePickerField from '../common/DatePickerField';
import MaskedDateInput from '../common/MaskedDateInput';
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
    <div className="px-2 py-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        {donation ? 'Edit Donation' : 'Add Donation Form'}
      </h2>

      {formLoading ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <PageLoader />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-x-4 gap-y-2">
            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Member</label>
            </div>
            <div className="col-span-9">
              <select
                value={formData.member_id}
                onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                className="w-full px-2 py-1 border border-gray-600"
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

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Donation Type</label>
            </div>
            <div className="col-span-9">
              <select
                value={formData.donation_type}
                onChange={(e) => setFormData({ ...formData, donation_type: e.target.value })}
                className="w-full px-2 py-1 border border-gray-600"
                required
              >
                <option value="">Select Donation Type</option>
                {donationTypes.map(type => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Amount</label>
            </div>
            <div className="col-span-9">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  onBlur={() => setFormData({ ...formData, amount: formatCurrency(formData.amount) })}
                  required
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-2 py-1 pl-7 border border-gray-600"
                />
              </div>
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Donation Date</label>
            </div>
            {/* <div className="col-span-9">
              <DatePickerField
                value={formData.donation_date}
                onChange={(date) => setFormData({ ...formData, donation_date: date })}
                required
                containerClassName="w-full"
                inputClassName="w-full px-2 py-1 border border-gray-300 rounded"
              />
            </div> */}
            <div className="col-span-9">
               <MaskedDateInput
                value={formData.donation_date}
                onChange={(date) => setFormData({ ...formData, donation_date: date })}
                required
                className="w-full px-2 py-1 pl-7 border border-gray-600"
              />
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
            </div>
            <div className="col-span-9">
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-2 py-1 border border-gray-600"
                rows="2"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? <ButtonLoader text={donation ? "Updating..." : "Saving..."} /> : (donation ? "Update" : "Add")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DonationForm; 