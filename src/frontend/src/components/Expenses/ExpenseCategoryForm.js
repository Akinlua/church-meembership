import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ButtonLoader } from '../common/Loader';
import Modal from '../../common/Modal';

const ExpenseCategoryForm = ({ expenseCategory, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: expenseCategory?.name || '',
    description: expenseCategory?.description || '',
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (expenseCategory) {
      console.log(expenseCategory)
      setFormData({
        name: expenseCategory.name,
        description: expenseCategory.description,
      });
    }
  }, [expenseCategory]);

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
      const url = `${process.env.REACT_APP_API_URL}/expense-categories${expenseCategory ? `/${expenseCategory.id}` : ''}`;
      const method = expenseCategory ? 'put' : 'post';
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Show modal only when adding a new expense category
      if (!expenseCategory) {
        setShowModal(true);
      } else {
        onClose(); // Close the form if updating
      }
    } catch (error) {
      console.error('Error saving expense category:', error);
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
        {expenseCategory ? 'Edit' : 'Add'} Expense Category
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
              className="w-full px-2 py-1 border border-gray-600"
              required
            />
          </div>
        </div>

        {/* <div className="grid grid-cols-12 gap-x-4 gap-y-2">
          <div className="col-span-3 flex items-center">
            <label className="block text-sm font-medium text-gray-700">Description</label>
          </div>
          <div className="col-span-9">
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-2 py-1 border border-gray-600"
            />
          </div>
        </div> */}

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
            {loading ? <ButtonLoader text={expenseCategory ? "Updating..." : "Saving..."} /> : (expenseCategory ? "Update" : "Save")}
          </button>
        </div>
      </form>

      {showModal && (
        <Modal onClose={handleCloseModal}>
          <h2 className="text-lg font-bold">Success!</h2>
          <p>Expense category added successfully! Do you want to add another?</p>
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

export default ExpenseCategoryForm; 