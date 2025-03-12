import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../../common/Modal';

const DonationTypeForm = ({ initialData, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
  });
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = `${process.env.REACT_APP_API_URL}/donation-types${initialData ? `/${initialData.id}` : ''}`;
      const method = initialData ? 'put' : 'post';
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Show modal only when adding a new donation type
      if (!initialData) {
        setShowModal(true);
      } else {
        onClose(); // Close the form if updating
      }
    } catch (error) {
      console.error('Error saving donation type:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAdding = () => {
    setFormData({
      name: '',
      description: '',
    });
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onClose();
  };

  return (
    <div className="px-2 py-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        {initialData ? 'Edit' : 'Add'} Donation Type
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-x-4 gap-y-2">
          <div className="col-span-3 flex items-center">
            <label className="block text-sm font-medium text-gray-700">Name</label>
          </div>
          <div className="col-span-9">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-2 py-1 border border-gray-600"
            />
          </div>
          
          <div className="col-span-3 flex items-center">
            <label className="block text-sm font-medium text-gray-700">Description</label>
          </div>
          <div className="col-span-9">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
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
            {loading ? "Saving..." : (initialData ? "Update" : "Add")}
          </button>
        </div>
      </form>

      {showModal && (
        <Modal onClose={handleCloseModal}>
          <h2 className="text-lg font-bold">Success!</h2>
          <p>Donation type added successfully! Do you want to add another?</p>
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

export default DonationTypeForm;
