import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ButtonLoader } from '../common/Loader';

const ExpenseCategoryForm = ({ category, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || ''
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (category) {
        // Update existing category
        response = await axios.put(`${process.env.REACT_APP_API_URL}/expense-categories/${category.id}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        // Create new category
        response = await axios.post(`${process.env.REACT_APP_API_URL}/expense-categories`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }

      if (onSubmit) {
        onSubmit(response.data.id);
      }
    } catch (error) {
      console.error('Error saving expense category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{category ? 'Edit' : 'Add'} Expense Category</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
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