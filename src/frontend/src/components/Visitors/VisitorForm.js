import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ButtonLoader, PageLoader } from '../common/Loader';
import Modal from '../../common/Modal';
import { validateZipCodeInput, formatPhoneNumber } from '../../utils/formValidation';

const VisitorForm = ({ visitor, onClose, onSubmit, isPublicForm = false }) => {
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [formData, setFormData] = useState({
    first_name: visitor?.firstName || '',
    last_name: visitor?.lastName || '',
    address: visitor?.address || '',
    city: visitor?.city || '',
    state: visitor?.state || '',
    zip_code: visitor?.zipCode || '',
    phone: visitor?.phone || '',
    email: visitor?.email || '',
    visit_date: visitor?.visitDate || new Date().toISOString().split('T')[0],
    notes: visitor?.notes || '',
    profile_image: visitor?.profileImage || ''
  });

  const fileInputRef = useRef();
  const firstNameRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (visitor) {
      setFormData({
        first_name: visitor.firstName || '',
        last_name: visitor.lastName || '',
        address: visitor.address || '',
        city: visitor.city || '',
        state: visitor.state || '',
        zip_code: visitor.zipCode || '',
        phone: visitor.phone || '',
        email: visitor.email || '',
        visit_date: visitor.visitDate ? visitor.visitDate.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: visitor.notes || '',
        profile_image: visitor.profileImage || ''
      });
    }
    setFormLoading(false);
  }, [visitor]);

  const handlePhoneChange = (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formattedNumber });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        setLoading(true);

        // Handle the public form case differently
        const headers = {
          'Content-Type': 'multipart/form-data'
        };

        if (!isPublicForm) {
          headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
        }

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/upload-image`,
          formData,
          { headers }
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
    setLoading(true);

    try {
      const url = `${process.env.REACT_APP_API_URL}/visitors${visitor ? `/${visitor.id}` : ''}`;
      const method = visitor ? 'put' : 'post';

      let headers = {};
      if (!isPublicForm) {
        headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
      }

      // For public form, we're using a special public endpoint
      const apiUrl = isPublicForm
        ? `${process.env.REACT_APP_API_URL}/public/visitors`
        : url;

      const response = await axios[isPublicForm ? 'post' : method](apiUrl, formData, { headers });

      if (onSubmit) {
        onSubmit(response.data.id);
      }

      if (!visitor && !isPublicForm) {
        setShowModal(true);
      } else if (!isPublicForm) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving visitor:', error);
      alert('Failed to save visitor information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAdding = () => {
    setFormData({
      first_name: '',
      last_name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      phone: '',
      email: '',
      visit_date: new Date().toISOString().split('T')[0],
      notes: '',
      profile_image: ''
    });
    setShowModal(false);
    setTimeout(() => {
      if (firstNameRef.current) {
        firstNameRef.current.focus();
      }
    }, 0);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onClose();
  };

  if (formLoading) {
    return <PageLoader />;
  }

  return (
    <div className="px-2 py-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        {isPublicForm
          ? 'Church Visitor Registration'
          : (visitor ? 'Edit Visitor' : 'Add Church Visitor Form')}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row">
          {/* Main form (left side) */}
          <div className="flex-grow md:pr-4 order-2 md:order-1">
            <div className="grid grid-cols-12 gap-x-4 gap-y-2">
              {/* Form fields */}
              <div className="col-span-12 md:col-span-3 flex items-center">
                <label className="block text-sm font-medium text-gray-700">First Name</label>
              </div>
              <div className="col-span-12 md:col-span-5">
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  ref={firstNameRef}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-600"
                />
              </div>

              <div className="col-span-12 md:col-span-1 flex items-center">
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
              </div>
              <div className="col-span-12 md:col-span-3">
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-600"
                />
              </div>

              <div className="col-span-12 md:col-span-3 flex items-center">
                <label className="block text-sm font-medium text-gray-700">Address</label>
              </div>
              <div className="col-span-12 md:col-span-9">
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-600"
                />
              </div>

              <div className="col-span-12 md:col-span-3 flex items-center">
                <label className="block text-sm font-medium text-gray-700">City</label>
              </div>
              <div className="col-span-12 md:col-span-9 flex flex-col md:flex-row md:items-center gap-2">
                <input
                  type="text"
                  className="flex-grow border border-gray-600 px-2 py-1 w-full md:w-auto"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <div className="flex flex-col md:flex-row md:items-center w-full md:w-auto">
                  <span className="text-sm font-medium md:mr-2 mb-1 md:mb-0">State</span>
                  <input
                    type="text"
                    className="w-full md:w-12 border border-gray-600 px-2 py-1"
                    value={formData.state}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().slice(0, 2);
                      setFormData({ ...formData, state: value });
                    }}
                    maxLength={2}
                  />
                </div>
                <div className="flex flex-col md:flex-row md:items-center w-full md:w-auto">
                  <span className="text-sm font-medium md:mr-2 mb-1 md:mb-0">Zip</span>
                  <input
                    type="text"
                    className="w-full md:w-20 border border-gray-600 px-2 py-1"
                    value={formData.zip_code}
                    onChange={(e) => {
                      const numericValue = validateZipCodeInput(e.target.value);
                      setFormData({ ...formData, zip_code: numericValue });
                    }}
                    maxLength={5}
                    pattern="[0-9]{5}"
                    placeholder="12345"
                  />
                </div>
              </div>

              <div className="col-span-12 md:col-span-3 flex items-center">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
              </div>
              <div className="col-span-12 md:col-span-9 flex flex-col md:flex-row md:items-center gap-2">
                <input
                  type="text"
                  className="w-full md:w-40 border border-gray-600 px-2 py-1 mb-2 md:mb-0"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(123) 456-7890"
                />
                <div className="flex flex-col md:flex-row md:items-center flex-grow w-full md:w-auto">
                  <span className="text-sm font-medium md:mr-2 mb-1 md:mb-0">Email</span>
                  <input
                    type="email"
                    className="w-full md:w-auto flex-grow border border-gray-600 px-2 py-1"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="col-span-12 md:col-span-3 flex items-center">
                <label className="block text-sm font-medium text-gray-700">Visit Date</label>
              </div>
              <div className="col-span-12 md:col-span-9">
                <input
                  type="date"
                  className="w-40 border border-gray-600 px-2 py-1"
                  value={formData.visit_date}
                  onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                />
              </div>

              <div className="col-span-12 md:col-span-3 flex items-center">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
              </div>
              <div className="col-span-12 md:col-span-9">
                <textarea
                  className="w-full border border-gray-600 px-2 py-1"
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>
            </div>
          </div>
          {/* Visitor's Picture (right side) */}
          <div className="w-full md:w-48 flex flex-col items-center mb-6 md:mb-0 order-1 md:order-2">
            <div className="text-sm font-medium mb-2">Visitor's Picture</div>
            <div
              className="border border-gray-300 w-48 h-48 flex items-center justify-center mb-2 cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >
              {formData.profile_image ? (
                <img
                  src={formData.profile_image}
                  alt="Profile"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-gray-400 text-sm">No image</div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="flex space-x-2 mt-auto" style={{ marginTop: '10px' }}>
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
                {loading ? <ButtonLoader /> : (visitor ? 'Update' : 'Submit')}
              </button>
            </div>
          </div>
        </div>
      </form>

      {showModal && !isPublicForm && (
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