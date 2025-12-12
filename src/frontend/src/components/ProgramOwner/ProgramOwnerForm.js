import React, { useState } from 'react';
import axios from 'axios';
import { ButtonLoader, PageLoader } from '../common/Loader';
import Modal from '../../common/Modal';
import { validateZipCodeInput, formatPhoneNumber } from '../../utils/formValidation';

const ProgramOwnerForm = ({ onClose, programOwner, onSave }) => {
  const [formData, setFormData] = useState({
    church: programOwner?.church || '',
    address: programOwner?.address || '',
    city: programOwner?.city || '',
    state: programOwner?.state || '',
    zip: programOwner?.zip || '',
    phone: programOwner?.phone || '',
    webAddress: programOwner?.webAddress || '',
    pastor: programOwner?.pastor || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate state (2 capital letters)
    if (name === 'state') {
      const upperCaseValue = value.toUpperCase();
      setFormData({
        ...formData,
        [name]: upperCaseValue
      });

      if (value && (upperCaseValue.length > 2 || !/^[A-Z]*$/.test(upperCaseValue))) {
        setValidationErrors({
          ...validationErrors,
          state: 'State must be 2 capital letters'
        });
      } else {
        const newErrors = { ...validationErrors };
        delete newErrors.state;
        setValidationErrors(newErrors);
      }
    }
    // Validate zip (5 numbers only)
    else if (name === 'zip') {
      const numericValue = validateZipCodeInput(value);
      setFormData({
        ...formData,
        [name]: numericValue
      });

      if (numericValue && numericValue.length > 5) {
        setValidationErrors({
          ...validationErrors,
          zip: 'Zip must be 5 digits'
        });
      } else {
        const newErrors = { ...validationErrors };
        delete newErrors.zip;
        setValidationErrors(newErrors);
      }
    }
    // Validate phone number (format: xxx-xxx-xxxx)
    else if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData({ ...formData, phone: formattedPhone });

      // Validate the format
      if (formattedPhone && formattedPhone.replace(/\D/g, '').length !== 10) {
        setValidationErrors({
          ...validationErrors,
          phone: 'Phone must be in format: (123) 456-7890'
        });
      } else {
        const newErrors = { ...validationErrors };
        delete newErrors.phone;
        setValidationErrors(newErrors);
      }
    }
    // Validate web address
    else if (name === 'webAddress') {
      setFormData({
        ...formData,
        [name]: value
      });

      if (value && !value.match(/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(\.[a-zA-Z]{2,})?([\/\?\#].*)?$/)) {
        setValidationErrors({
          ...validationErrors,
          webAddress: 'Please enter a valid web address'
        });
      } else {
        const newErrors = { ...validationErrors };
        delete newErrors.webAddress;
        setValidationErrors(newErrors);
      }
    }
    else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;
      const url = `${process.env.REACT_APP_API_URL}/program-owner`;
      const headers = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };

      if (programOwner) {
        // Update existing program owner
        response = await axios.put(`${url}/${programOwner.id}`, formData, headers);
      } else {
        // Create new program owner
        response = await axios.post(url, formData, headers);
      }

      onSave(response.data);
      onClose();
    } catch (err) {
      setError('An error occurred while saving the program owner details. Please try again.');
      console.error('Error saving program owner:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Program Owner Form
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-24 text-right mr-2 font-medium">Church</div>
              <div className="flex-1">
                <input
                  type="text"
                  name="church"
                  value={formData.church}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border border-black"
                />
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-24 text-right mr-2 font-medium">Address</div>
              <div className="flex-1">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border border-black"
                />
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-24 text-right mr-2 font-medium">City</div>
              <div className="w-44">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border border-black"
                />
              </div>
              <div className="w-12 text-right mr-2 font-medium">State</div>
              <div className="w-20">
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  maxLength={2}
                  className={`w-full px-2 py-1 border border-black ${validationErrors.state ? 'border-red-500' : ''}`}
                />
                {validationErrors.state && (
                  <p className="text-red-500 text-xs absolute">{validationErrors.state}</p>
                )}
              </div>
              <div className="w-10 text-right mr-2 font-medium">Zip</div>
              <div className="w-20">
                <input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  required
                  maxLength={5}
                  className={`w-full px-2 py-1 border border-black ${validationErrors.zip ? 'border-red-500' : ''}`}
                />
                {validationErrors.zip && (
                  <p className="text-red-500 text-xs absolute">{validationErrors.zip}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-24 text-right mr-2 font-medium">Phone #</div>
              <div className="w-40">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="(123) 456-7890"
                  className={`w-full px-2 py-1 border border-black ${validationErrors.phone ? 'border-red-500' : ''}`}
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-xs absolute">{validationErrors.phone}</p>
                )}
              </div>
              <div className="w-28 text-right mr-2 font-medium">Web Address</div>
              <div className="flex-1">
                <input
                  type="text"
                  name="webAddress"
                  value={formData.webAddress}
                  onChange={handleChange}
                  className={`w-full px-2 py-1 border border-black ${validationErrors.webAddress ? 'border-red-500' : ''}`}
                />
                {validationErrors.webAddress && (
                  <p className="text-red-500 text-xs absolute">{validationErrors.webAddress}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-24 text-right mr-2 font-medium">Pastor</div>
              <div className="flex-1">
                <input
                  type="text"
                  name="pastor"
                  value={formData.pastor}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border border-black"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Object.keys(validationErrors).length > 0}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgramOwnerForm;