import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import DatePickerField from '../common/DatePickerField';
import MaskedDateInput from '../common/MaskedDateInput';
import { ButtonLoader, PageLoader } from '../common/Loader';
import Modal from '../../common/Modal';

const customStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: 'black',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'black',
    },
    width: '250px',
  }),
};

const DonationForm = ({ donation, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [donationTypes, setDonationTypes] = useState([]);
  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    donation_type: '',
    donation_date: new Date(),
    notes: ''
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        await fetchMembers();
        await fetchDonationTypes();
        if (donation) {
          setFormData({
            member_id: donation.memberId ? { value: donation.memberId, label: `${donation.member.lastName}, ${donation.member.firstName}` } : '',
            amount: donation.amount || '',
            donation_type: donation.donationType ? { value: donation.donationType, label: donation.donationType } : '',
            donation_date: donation.donationDate ? new Date(donation.donationDate) : null,
            notes: donation.notes || ''
          });
        }
      } catch (error) {
        console.error('Error loading form data:', error);
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
      setMembers(response.data.map(member => ({ value: member.id, label: `${member.memberNumber} ${member.lastName}, ${member.firstName}` })));
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchDonationTypes = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/donation-types`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDonationTypes(response.data.map(type => ({ value: type.name, label: type.name })));
    } catch (error) {
      console.error('Error fetching donation types:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check if member_id is valid
    if (!formData.member_id || !formData.member_id.value) {
      alert('Please select a valid member.');
      setLoading(false);
      return;
    }

    try {
      const url = `${process.env.REACT_APP_API_URL}/donations${donation ? `/${donation.id}` : ''}`;
      const method = donation ? 'put' : 'post';

      const donationData = {
        ...formData,
        member_id: formData.member_id.value,
        donation_type: formData.donation_type.value.toString(),
        donation_date: formData.donation_date,
      };

      await axios[method](url, donationData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Show modal only when adding a new donation
      if (!donation) {
        setShowModal(true);
      } else {
        onClose(); // Close the form if updating
      }

    } catch (error) {
      console.error('Error saving donation:', error);
      alert('Error saving donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAdding = () => {
    setFormData({
      member_id: '',
      amount: '',
      donation_type: '',
      donation_date: new Date(),
      notes: ''
    });
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onClose();
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
              <Select
                options={members}
                value={formData.member_id}
                onChange={(selected) => setFormData({ ...formData, member_id: selected })}
                placeholder="Select Member"
                isSearchable
                styles={customStyles}
                required
              />
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Donation Type</label>
            </div>
            <div className="col-span-9">
              <Select
                options={donationTypes}
                value={formData.donation_type}
                onChange={(selected) => setFormData({ ...formData, donation_type: selected })}
                placeholder="Select Donation Type"
                isSearchable
                styles={customStyles}
                required
              />
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
                  className="w-34 px-2 py-1 pl-7 border border-gray-600"
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
                inputClassName="w-full px-2 py-1 pl-7 border border-gray-600"
              />
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
            </div>
            <div className="col-span-3">
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
              {loading ? <ButtonLoader text={donation ? "Updating..." : "Saving..."} /> : (donation ? "Update" : "Save")}
            </button>
          </div>
        </form>
      )}

      {/* Modal for confirmation */}
      {showModal && (
        <Modal onClose={handleCloseModal}>
          <h2 className="text-lg font-bold">Success!</h2>
          <p>Donation added successfully! Do you want to add another?</p>
          <div className="flex justify-end mt-4">
            <button onClick={handleContinueAdding} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Add
            </button>
            <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 ml-2">
              Exit
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DonationForm; 