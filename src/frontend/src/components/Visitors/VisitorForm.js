import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import DatePickerField from '../common/DatePickerField';
import { ButtonLoader, PageLoader } from '../common/Loader';
import Modal from '../../common/Modal';

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
  const [showModal, setShowModal] = useState(false);

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
      
      const url = `${process.env.REACT_APP_API_URL}/visitors${visitor ? `/${visitor.id}` : ''}`;
      const method = visitor ? 'put' : 'post';
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Show modal only when adding a new visitor
      if (!visitor) {
        setShowModal(true);
      } else {
        onClose(); // Close the form if updating
      }
    } catch (error) {
      console.error('Error saving visitor:', error);
      alert('Failed to save visitor');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAdding = () => {
    setFormData({
      first_name: '',
      last_name: '',
      middle_initial: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      cell_phone: '',
      email: '',
      home_church: '',
      profile_image: '',
      visit_date: new Date()
    });
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onClose();
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
                  className="w-full px-2 py-1 border border-gray-600"
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
                  className="w-full px-2 py-1 border border-gray-600"
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
              <div className="col-span-1">
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().slice(0, 2);
                    setFormData({ ...formData, state: value });
                  }}
                  className="w-12 border border-gray-600 px-2 py-1 text-sm h-8"
                  maxLength="2"
                />
              </div>

              <div className="col-span-3 flex items-center">
                <label className="block text-sm font-medium text-gray-700">Cell Phone</label>
              </div>
              <div className="col-span-3">
                <input
                  type="text"
                  value={formData.cell_phone}
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
                  className="w-34 px-2 py-1 border border-gray-600"
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
                  className="w-full px-2 py-1 border border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Visitor's Picture (right side) */}
          <div className="w-48 flex flex-col items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visitor's Picture</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center h-48 w-48 cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
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
            </div>

            {/* Visitor ID Field */}
              <div className="mt-2">
                <label className="text-sm font-medium">Visitor ID: {visitor ? visitor.visitorNumber : ""}</label>
              </div>
            

            {/* Buttons under profile image */}
            <div className="flex space-x-2 mt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1 border border-transparent rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <ButtonLoader /> : (visitor ? 'Update' : 'Add')}
              </button>
            </div>
          </div>
        </div>
      </form>

      {showModal && (
        <Modal onClose={handleCloseModal}>
          <h2 className="text-lg font-bold">Success!</h2>
          <p>Visitor added successfully! Do you want to add another?</p>
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

export default VisitorForm; 