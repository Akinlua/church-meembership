import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ButtonLoader } from '../common/Loader';

const UserForm = ({ user, userLevels, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    userLevelId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        password: '', // Don't populate password for security
        userLevelId: user.userLevelId || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = user 
        ? `${process.env.REACT_APP_API_URL}/admin/users/${user.id}` 
        : `${process.env.REACT_APP_API_URL}/admin/users`;
      
      const method = user ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      onSubmit();
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-lg font-bold mb-3 text-center">
        {user ? 'Edit User' : 'Add System User'}
      </h2>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-2 rounded-md text-sm mb-3">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-12 gap-x-3 gap-y-2">
          <div className="col-span-3 flex items-center">
            <label className="block text-sm font-medium text-gray-700">Name</label>
          </div>
          <div className="col-span-9">
            <input
              type="text"
              required
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div className="col-span-3 flex items-center">
            <label className="block text-sm font-medium text-gray-700">Username</label>
          </div>
          <div className="col-span-9">
            <input
              type="text"
              required
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          
          <div className="col-span-3 flex items-center">
            <label className="block text-sm font-medium text-gray-700">User Level</label>
          </div>
          <div className="col-span-9">
            <select
              required
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.userLevelId}
              onChange={(e) => setFormData({ ...formData, userLevelId: e.target.value })}
            >
              <option value="">Select User Level</option>
              {userLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-span-3 flex items-center">
            <label className="block text-sm font-medium text-gray-700">
              {user ? 'New Password' : 'Temp Password'}
            </label>
          </div>
          <div className="col-span-9">
            <input
              type="password"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!user}
              placeholder={user ? "Leave blank to keep current" : ""}
            />
            {!user && (
              <p className="text-xs text-gray-500 mt-0.5">
                User will be prompted to change on first login
              </p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <ButtonLoader /> : (user ? 'Update User' : 'Create User')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm; 