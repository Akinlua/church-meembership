import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PageLoader } from '../common/Loader';
import ExpenseCategoryForm from './ExpenseCategoryForm';

const ExpenseCategoryDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/expense-categories`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching expense categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryDetails = async (categoryId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/expense-categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching expense category details:', error);
      return null;
    }
  };

  const filteredCategories = categories.filter(category => {
    const categoryName = category.name.toLowerCase();
    const categoryId = category.id ? category.id.toString() : '';
    const query = searchTerm.toLowerCase();
    
    return categoryName.includes(query) || categoryId.includes(query);
  });

  const handleSelectCategory = async (category) => {
    setSelectedCategory(category);
    setShowDropdown(false);
    setSearchTerm(category.name);
  };

  const handleInputClick = () => {
    setShowDropdown(true);
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsEditing(false);
    setShowForm(true);
  };
  
  const handleEditCategory = () => {
    setIsEditing(true);
    setShowForm(true);
  };
  
  const handleDeleteCategory = async () => {
    if (!window.confirm('Are you sure you want to delete this expense category?')) return;
    
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/expense-categories/${selectedCategory.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNotification({
        show: true,
        message: 'Expense category was successfully deleted!',
        type: 'success'
      });
      
      setSelectedCategory(null);
      setSearchTerm('');
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting expense category:', error);
      setNotification({
        show: true,
        message: 'Error deleting expense category.',
        type: 'error'
      });
    }
  };
  
  const handleFormSubmit = async (categoryId) => {
    setShowForm(false);
    
    try {
      // Refresh the categories list
      await fetchCategories();
      
      if (categoryId) {
        // Get the full category details
        const category = await fetchCategoryDetails(categoryId);
        
        if (category) {
          // Select the category
          setSelectedCategory(category);
          setSearchTerm(category.name);
          
          // Show success notification
          setNotification({
            show: true,
            message: `Expense category was successfully ${isEditing ? 'updated' : 'added'}!`,
            type: 'success'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching category details:', error);
      setNotification({
        show: true,
        message: `Expense category was ${isEditing ? 'updated' : 'added'} but could not display details.`,
        type: 'warning'
      });
      await fetchCategories();
    }
    
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Expense Category Lookup</h1>
      
      {notification.show && (
        <div className={`p-4 mb-4 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-700' : notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
          {notification.message}
        </div>
      )}
      
      <div className="relative mb-6" ref={dropdownRef}>
        <div className="flex">
          <input
            type="text"
            placeholder="Search by category name..."
            className="w-full p-3 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={handleInputClick}
          />
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 focus:outline-none"
          >
            Add Category
          </button>
        </div>
        
        {loading ? (
          <PageLoader />
        ) : (
          <>
            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredCategories.length === 0 ? (
                  <div className="p-3 text-gray-500">No expense categories found</div>
                ) : (
                  filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                      onClick={() => handleSelectCategory(category)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedCategory && (
              <div className="mt-6">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="text-lg font-semibold">Expense Category Details</h3>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Category Name</p>
                      <p className="font-medium">{selectedCategory.name}</p>
                    </div>

                    <div className="flex space-x-3 mt-4">
                      <button 
                        onClick={handleEditCategory}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Category
                      </button>
                      
                      <button 
                        onClick={handleDeleteCategory}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Category
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-8 border shadow-lg rounded-md bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ExpenseCategoryForm
              category={isEditing ? selectedCategory : null}
              onClose={() => {
                setShowForm(false);
                setIsEditing(false);
              }}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCategoryDropdown; 