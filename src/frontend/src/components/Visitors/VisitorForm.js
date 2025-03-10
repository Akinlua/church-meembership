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
    setFormData({ ...formData, cell_phone: formattedPhone });
    
    // Validate
    if (formattedPhone && formattedPhone.replace(/\D/g, '').length !== 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
    } else {
      setPhoneError('');
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
      alert('Error saving visitor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload-visitor-image`,
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
      alert('Error uploading image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {formLoading ? (
        <div className="min-h-[400px]">
          <PageLoader />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6">{visitor ? 'Edit' : 'Add'} Visitor</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Middle Initial</label>
                <input
                  type="text"
                  value={formData.middle_initial}
                  onChange={(e) => setFormData({ ...formData, middle_initial: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  maxLength={1}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cell Phone</label>
                <input
                  type="text"
                  value={formData.cell_phone}
                  onChange={handlePhoneChange}
                  placeholder="(123) 456-7890"
                  className={`mt-1 block w-full rounded-md ${phoneError ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                />
                {phoneError && (
                  <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Home Church</label>
              <input
                type="text"
                value={formData.home_church}
                onChange={(e) => setFormData({ ...formData, home_church: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Visit Date</label>
              <DatePickerField
                selectedDate={formData.visit_date}
                onChange={(date) => setFormData({ ...formData, visit_date: date })}
              />
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700">Profile Image</label>
              <div className="mt-1 flex items-center space-x-6">
                {formData.profile_image && (
                  <img
                    src={formData.profile_image}
                    alt="Profile"
                    className="h-24 w-24 object-cover rounded-full"
                  />
                )}
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
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  {formData.profile_image ? 'Change Image' : 'Upload Image'}
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
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
                {loading ? <ButtonLoader /> : visitor ? 'Update' : 'Add'} Visitor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VisitorForm; 