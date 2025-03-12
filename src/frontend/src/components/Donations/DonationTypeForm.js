import React, { useState } from 'react';
import axios from 'axios';
import { ButtonLoader } from '../common/Loader';

const DonationTypeForm = ({ onClose, onSubmit, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let response;
      
      if (initialData) {
        // Update
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/donation-types/${initialData.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      } else {
        // Create
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/donation-types`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      }
      
      onSubmit(response.data);
    } catch (error) {
      console.error("Error saving donation type:", error);
      alert("Error saving donation type");
    } finally {
      setLoading(false);
    }
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
              className="w-full px-2 py-1 border border-gray-300 rounded"
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
              className="w-full px-2 py-1 border border-gray-300 rounded"
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
            {loading ? <ButtonLoader text={initialData ? "Updating..." : "Saving..."} /> : (initialData ? "Update" : "Add")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DonationTypeForm;
