import React, { useState } from 'react';
import axios from 'axios';
import { ButtonLoader } from '../common/Loader';

const ExpenseCategoryForm = ({ category, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: category?.name || '',
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
      
      if (category) {
        // Update existing category
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/expense-categories/${category.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      } else {
        // Create new category
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/expense-categories`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      }
      
      onSubmit(response.data.id);
    } catch (error) {
      console.error('Error saving expense category:', error);
      alert('Failed to save expense category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-2 py-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        {category ? 'Edit' : 'Add'} Expense Category
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-x-4 gap-y-2">
          <div className="col-span-3 flex items-center">
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
          </div>
          <div className="col-span-9">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-2 py-1 border border-gray-300 rounded"
              required
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            disabled={loading}
          >
            {loading ? <ButtonLoader text={category ? "Updating..." : "Saving..."} /> : (category ? "Update" : "Save")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseCategoryForm; 