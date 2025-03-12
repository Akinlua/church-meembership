import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import DatePickerField from '../common/DatePickerField';
import { ButtonLoader, PageLoader } from '../common/Loader';

const VisitorForm = ({ visitor, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: visitor?.firstName || '',
    last_name: visitor?.lastName || '',
    middle_initial: visitor?.middleInitial || '',
    address: visitor?.address || '',
    city: visitor?.city || '',
    state: visitor?.state || '',
    zip_code: visitor?.zipCode || '',
    cell_phone: visitor?.cellPhone || '',
    email: visitor?.email || '',
    home_church: visitor?.homeChurch || '',
    profile_image: visitor?.profileImage || '',
    visit_date: visitor?.visitDate ? new Date(visitor.visitDate) : new Date()
  });
  
  const fileInputRef = useRef();
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (visitor) {
      setFormData({
        first_name: visitor.firstName || '',
        last_name: visitor.lastName || '',
        middle_initial: visitor.middleInitial || '',
        address: visitor.address || '',
        city: visitor.city || '',
        state: visitor.state || '',
        zip_code: visitor.zipCode || '',
        cell_phone: visitor.cellPhone || '',
        email: visitor.email || '',
        home_church: visitor.homeChurch || '',
        profile_image: visitor.profileImage || '',
        visit_date: visitor.visitDate ? new Date(visitor.visitDate) : new Date()
      });
    }
  }, [visitor]);

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
    setFormData({ ...formData, cell_phone: formattedPhone });
    
    if (formattedPhone && formattedPhone.replace(/\D/g, '').length !== 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
    } else {
      setPhoneError('');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        setLoading(true);
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/upload-image`, 
          formData, 
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setFormData(prev => ({ ...prev, profile_image: response.data.imageUrl }));
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number if provided
    if (formData.cell_phone && formData.cell_phone.replace(/\D/g, '').length !== 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }
    
    try {
      setLoading(true);
      
      if (visitor) {
        // Update existing visitor
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/visitors/${visitor.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        if (onSubmit) onSubmit(response.data.id);
      } else {
        // Create new visitor
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/visitors`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        if (onSubmit) onSubmit(response.data.id);
      }
    } catch (error) {
      console.error('Error saving visitor:', error);
      alert('Failed to save visitor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-2 py-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        {visitor ? 'Edit Visitor' : 'Add Church Visitor Form'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="flex">
          {/* Main form (left side) */}
          <div className="flex-grow pr-4">
            <div className="grid grid-cols-12 gap-x-4 gap-y-2">
              <div className="col-span-3 flex items-center">
                <label className="block text-sm font-medium text-gray-700">First Name</label>
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </div>
              <div className="col-span-1 flex items-center">
                <label className="block text-sm font-medium text-gray-700">M.I.</label>
              </div>
              <div className="col-span-3">
                <input
                  type="text"
                  value={formData.middle_initial}
                  onChange={(e) => setFormData({ ...formData, middle_initial: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                  maxLength="1"
                />
              </div>

              <div className="col-span-3 flex items-center">
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
              </div>
              <div className="col-span-9">
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
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
                  className="w-full px-2 py-1 border border-gray-300 rounded"
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
                  className="w-full px-2 py-1 border border-gray-300 rounded"
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
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                  maxLength="2"
                />
              </div>

              <div className="col-span-3 flex items-center">
                <label className="block text-sm font-medium text-gray-700">Cell Phone</label>
              </div>
              <div className="col-span-4">
                <input
                  type="text"
                  value={formData.cell_phone}
                  onChange={handlePhoneChange}
                  placeholder="(123) 456-7890"
                  className={`w-full px-2 py-1 border ${phoneError ? 'border-red-300' : 'border-gray-300'} rounded`}
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
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm h-8"
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
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </div>

              <div className="col-span-3 flex items-center">
                <label className="block text-sm font-medium text-gray-700">Home Church</label>
              </div>
              <div className="col-span-9">
                <input
                  type="text"
                  value={formData.home_church}
                  onChange={(e) => setFormData({ ...formData, home_church: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Visitor's Picture (right side) */}
          <div className="w-48">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visitor's Picture</label>
              <div className="border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center h-48 w-48">
                {formData.profile_image ? (
                  <img 
                    src={formData.profile_image} 
                    alt="Profile" 
                    className="max-h-44 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-400 text-sm">No image</div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="mt-2 w-full text-sm py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                {formData.profile_image ? 'Change Image' : 'Upload Image'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-3 mt-4">
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
            {loading ? <ButtonLoader /> : visitor ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitorForm; 