import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PageLoader } from '../common/Loader';
import ExpenseCategoryForm from './ExpenseCategoryForm';
import { useAuth } from '../../contexts/AuthContext';

const ExpenseCategoryDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showDropdown, setShowDropdown] = useState(false);
  const { hasAccess, hasDeleteAccess, hasAddAccess } = useAuth();

  useEffect(() => {
    fetchCategories();
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

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsEditing(false);
    setShowForm(true);
  };
  
  const handleEditCategory = (category) => {
    console.log("yes")
    console.log(category)
    setSelectedCategory(category);
    setIsEditing(true);
    setShowForm(true);
  };
  
  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) return;
    
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/expense-categories/${category.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNotification({
        show: true,
        message: 'Expense category was successfully deleted!',
        type: 'success'
      });
      
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
  
  const handleFormSubmit = async () => {
    setShowForm(false);
    
    try {
      await fetchCategories();
      
      setNotification({
        show: true,
        message: `Expense category was successfully ${isEditing ? 'updated' : 'added'}!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error refreshing categories:', error);
      setNotification({
        show: true,
        message: 'Error updating category list.',
        type: 'error'
      });
    }
    
    setIsEditing(false);
  };

  const filteredCategories = categories.filter(category => {
    const categoryName = category.name.toLowerCase();
    const query = searchTerm.toLowerCase();
    return categoryName.includes(query);
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Expense Categories</h1>
      
      {notification.show && (
        <div className={`p-4 mb-4 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-700' : notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
          {notification.message}
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex mb-4">
          <input
            type="text"
            className="w-32 p-3 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder=""
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={() => setShowDropdown(true)}
          />
          <button
            onClick={() => setShowDropdown(prev => !prev)}
            className="bg-gray-100 text-gray-700 px-3 hover:bg-gray-200 focus:outline-none border-t border-b border-r border-gray-300"
            aria-label="Show all options"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => setShowDropdown(false)}
            className="bg-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-400 focus:outline-none"
          >
            Cancel
          </button>
          {hasAddAccess('expense') && (
            <button
              onClick={handleAddCategory}
              className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 focus:outline-none"
            >
              Add
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center">
            <PageLoader />
          </div>
        ) : (
          showDropdown && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">
                        No expense categories found
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((category) => (
                      <tr 
                        key={category.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {hasAddAccess('expense') && (
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          )}
                          {hasDeleteAccess('expense') && (
                            <button
                              onClick={() => handleDeleteCategory(category)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-8 border shadow-lg rounded-md bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ExpenseCategoryForm
              expenseCategory={isEditing ? selectedCategory : null}
              onClose={() => {
                setShowForm(false);
                setIsEditing(false);
                fetchCategories();
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