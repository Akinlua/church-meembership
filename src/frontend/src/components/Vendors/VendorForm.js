import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ButtonLoader, PageLoader } from '../common/Loader';

const VendorForm = ({ vendor, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    last_name: vendor?.lastName || '',
    address: vendor?.address || '',
    city: vendor?.city || '',
    state: vendor?.state || '',
    zip_code: vendor?.zipCode || '',
    phone: vendor?.phone || '',
    email: vendor?.email || '',
    account_number: vendor?.accountNumber || '',
    profile_image: vendor?.profileImage || ''
  });
  
  const fileInputRef = useRef();
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (vendor) {
      setFormData({
        last_name: vendor.lastName || '',
        address: vendor.address || '',
        city: vendor.city || '',
        state: vendor.state || '',
        zip_code: vendor.zipCode || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        account_number: vendor.accountNumber || '',
        profile_image: vendor.profileImage || ''
      });
    }
    setFormLoading(false);
  }, [vendor]);

  // Function to format phone number
  const formatPhoneNumber = (phoneNumber) => {
    // Remove all non-digit characters
    let cleaned = ('' + phoneNumber).replace(/\D/g, '');
    
    // Limit to 10 digits
    cleaned = cleaned.substring(0, 10);
    
    // Format as (XXX) XXX-XXXX
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
    
    // Validate
    if (formattedPhone && formattedPhone.replace(/\D/g, '').length !== 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
    } else {
      setPhoneError('');
    }
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, profile_image: event.target.result });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number if provided
    if (formData.phone && formData.phone.replace(/\D/g, '').length !== 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }
    
    try {
      setLoading(true);
      
      const formPayload = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'profile_image' || (key === 'profile_image' && formData[key] && !formData[key].startsWith('http'))) {
          formPayload.append(key, formData[key]);
        }
      });
      
      // Handle file upload if a file is selected
      if (fileInputRef.current && fileInputRef.current.files[0]) {
        formPayload.append('profile_image', fileInputRef.current.files[0]);
      }
      
      let response;
      if (vendor) {
        // Update existing vendor
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/vendors/${vendor.id}`,
          formPayload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // Create new vendor
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/vendors`,
          formPayload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      
      if (onSubmit) {
        onSubmit(response.data.id);
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      alert('Error saving vendor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-2 py-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        {vendor ? 'Edit Vendor' : 'Add Vendor Form'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-x-4 gap-y-2">
          <div className="col-span-3 flex items-center">
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
          </div>
          <div className="col-span-9">
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
              className="w-full px-2 py-1 border border-gray-600"
            />
          </div>

          <div className="col-span-3 flex items-center">
            <label className="block text-sm font-medium text-gray-700">Address</label>
          </div>
          <div className="col-span-9">
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-2 py-1 border border-gray-600"
            />
          </div>
          
          <div className="col-span-3 flex items-center">
            <label className="block text-sm font-medium text-gray-700">City</label>
          </div>
          <div className="col-span-5">
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-2 py-1 border border-gray-600"
            />
          </div>
          <div className="col-span-1 flex items-center">
            <label className="block text-sm font-medium text-gray-700">State</label>
          </div>
          <div className="col-span-3">
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-2 py-1 border border-gray-600"
              maxLength="2"
            />
          </div>

          <div className="col-span-3 flex items-center">
            <label className="block text-sm font-medium text-gray-700">Phone</label>
          </div>
          <div className="col-span-4">
            <input
              type="text"
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
            <label className="block text-sm font-medium text-gray-700">Zip</label>
          </div>
          <div className="col-span-4">
          <input
            type="text"
            className="w-20 border border-gray-600 px-2 py-1 text-sm h-8"
            value={formData.zip_code}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, '').slice(0, 5);
              setFormData({ ...formData, zip_code: numericValue });
            }}
            maxLength={5}
            pattern="[0-9]{5}"
            placeholder="12345"
          />
          </div>

          <div className="col-span-3 flex items-center">
            <label className="block text-sm font-medium text-gray-700">Email</label>
          </div>
          <div className="col-span-9">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-2 py-1 border border-gray-600"
            />
          </div>

          <div className="col-span-3 flex items-center">
            <label className="block text-sm font-medium text-gray-700">Account #</label>
          </div>
          <div className="col-span-9">
            <input
              type="text"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
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
            {loading ? <ButtonLoader text={vendor ? "Updating..." : "Saving..."} /> : (vendor ? "Update" : "Add")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorForm; 