import React, { useState } from 'react';
import axios from 'axios';
import { ButtonLoader, PageLoader } from '../common/Loader';
import Modal from '../../common/Modal';

const BankForm = ({ bank, onClose, onSubmit }) => {
  console.log("bank")
  console.log(bank)
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: bank?.name || '',
    address: bank?.address || '',
    city: bank?.city || '',
    state: bank?.state || '',
    zipCode: bank?.zipCode || '',
    routing_number: bank?.routingNumber || '',
    account_number: bank?.accountNumber || '',
    contact: bank?.contact || '',
    phone: bank?.phone || '',
  });
  const [showModal, setShowModal] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Function to format phone number
  const formatPhoneNumber = (phoneNumber) => {
    let cleaned = ('' + phoneNumber).replace(/\D/g, '');
    cleaned = cleaned.substring(0, 10);
    let formatted = cleaned;
    if (cleaned.length > 0) {
      if (cleaned.length <= 3) {
        formatted = `(${cleaned}`;
      } else if (cleaned.length <= 6) {
        formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
      } else {
        formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
      }
    }
    return formatted;
  };

  // Handle phone input change
  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formattedPhone });
    
    if (formattedPhone && formattedPhone.replace(/\D/g, '').length !== 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
    } else {
      setPhoneError('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation for state: only capital letters, max 2 characters
    if (name === 'state' && !/^[A-Z]{0,2}$/.test(value)) {
      return;
    }

    // Validation for zip: only numbers, max 5 digits
    if (name === 'zip' && !/^\d{0,5}$/.test(value)) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = `${process.env.REACT_APP_API_URL}/banks${bank ? `/${bank.id}` : ''}`;
      const method = bank ? 'put' : 'post';
      
      const response = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Show modal only when adding a new bank
      if (!bank) {
        setShowModal(true);
      } else {
        onSubmit(response.data);
      }
    } catch (error) {
      console.error('Error saving bank:', error);
      alert('Error saving bank information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAdding = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      routing_number: '',
      account_number: '',
      contact: '',
      phone: '',
    });
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onSubmit();
  };

  return (
    <div className="px-2 py-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        {bank ? 'Edit Bank' : 'Add Bank Form'}
      </h2>

      {formLoading ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <PageLoader />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-x-4 gap-y-2">
            <div className="col-span-1 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Bank</label>
            </div>
            <div className="col-span-11">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-1/2 px-2 py-1 border border-gray-600"
              />
            </div>

            <div className="col-span-1 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Address</label>
            </div>
            <div className="col-span-11">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-1/2 px-2 py-1 border border-gray-600"
              />
            </div>

            <div className="col-span-1 flex items-center">
              <label className="block text-sm font-medium text-gray-700">City</label>
            </div>
            <div className="col-span-5">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-gray-600"
              />
            </div>

            <div className="col-span-1 flex items-center">
              <label className="block text-sm font-medium text-gray-700">State</label>
            </div>
            <div className="col-span-2">
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-1/2 px-2 py-1 border border-gray-600"
              />
            </div>

            <div className="col-span-1 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Zip</label>
            </div>
            <div className="col-span-2">
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-gray-600"
              />
            </div>

            <div className="col-span-1 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Phone</label>
            </div>
            <div className="col-span-3">
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(123) 456-7890"
                className={`w-full px-2 py-1 border ${phoneError ? 'border-red-300' : 'border-gray-600'}`}
              />
              {phoneError && (
                <p className="text-xs text-red-600">{phoneError}</p>
              )}
            </div>

            <div className="col-span-1 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Contact</label>
            </div>
            <div className="col-span-7">
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="w-1/2 px-2 py-1 border border-gray-600"
              />
            </div>

            <div className="col-span-1 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Account #</label>
            </div>
            <div className="col-span-3">
              <input
                type="text"
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-gray-600"
              />
            </div>

            <div className="col-span-1 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Routing #</label>
            </div>
            <div className="col-span-3">
              <input
                type="text"
                name="routing_number"
                value={formData.routing_number}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-gray-600"
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
              {loading ? <ButtonLoader text={bank ? "Updating..." : "Saving..."} /> : (bank ? "Update" : "Save")}
            </button>
          </div>
        </form>
      )}

      {/* Modal for confirmation */}
      {showModal && (
        <Modal onClose={handleCloseModal}>
          <h2 className="text-lg font-bold">Success!</h2>
          <p>Bank added successfully! Do you want to add another?</p>
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

export default BankForm; 