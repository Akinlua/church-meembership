import React, { useState } from 'react';
import axios from 'axios';
import { ButtonLoader } from '../common/Loader';

const UserLevelForm = ({ onClose, onSubmit }) => {
  const [levelName, setLevelName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState({
    memberAccess: false,
    visitorAccess: false,
    vendorAccess: false,
    groupAccess: false,
    donationAccess: false,
    adminAccess: false,
    expenseAccess: false,
    chargesAccess: false,
    reportsAccess: false,
    depositAccess: false,
    bankAccess: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePermissionChange = (e) => {
    setPermissions({
      ...permissions,
      [e.target.name]: e.target.checked
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/user-levels`,
        { 
          name: levelName, 
          description,
          ...permissions
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      onSubmit();
    } catch (error) {
      console.error('Error creating user level:', error);
      setError(error.response?.data?.message || 'Failed to create user level');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-center">Add User Level</h2>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Level Name
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={levelName}
            onChange={(e) => setLevelName(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Access Permissions
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="memberAccess"
                  name="memberAccess"
                  checked={permissions.memberAccess}
                  onChange={handlePermissionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="memberAccess" className="ml-2 block text-sm text-gray-700">
                  Member Access
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="visitorAccess"
                  name="visitorAccess"
                  checked={permissions.visitorAccess}
                  onChange={handlePermissionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="visitorAccess" className="ml-2 block text-sm text-gray-700">
                  Visitor Access
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vendorAccess"
                  name="vendorAccess"
                  checked={permissions.vendorAccess}
                  onChange={handlePermissionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="vendorAccess" className="ml-2 block text-sm text-gray-700">
                  Vendor Access
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="groupAccess"
                  name="groupAccess"
                  checked={permissions.groupAccess}
                  onChange={handlePermissionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="groupAccess" className="ml-2 block text-sm text-gray-700">
                  Group Access
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="donationAccess"
                  name="donationAccess"
                  checked={permissions.donationAccess}
                  onChange={handlePermissionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="donationAccess" className="ml-2 block text-sm text-gray-700">
                  Donation Access
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="adminAccess"
                  name="adminAccess"
                  checked={permissions.adminAccess}
                  onChange={handlePermissionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="adminAccess" className="ml-2 block text-sm text-gray-700">
                  Admin Access
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="expenseAccess"
                  name="expenseAccess"
                  checked={permissions.expenseAccess}
                  onChange={handlePermissionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="expenseAccess" className="ml-2 block text-sm text-gray-700">
                  Expense Access
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="chargesAccess"
                  name="chargesAccess"
                  checked={permissions.chargesAccess}
                  onChange={handlePermissionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="chargesAccess" className="ml-2 block text-sm text-gray-700">
                  Charges Access
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reportsAccess"
                  name="reportsAccess"
                  checked={permissions.reportsAccess}
                  onChange={handlePermissionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="reportsAccess" className="ml-2 block text-sm text-gray-700">
                  Reports Access
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="depositAccess"
                  name="depositAccess"
                  checked={permissions.depositAccess}
                  onChange={handlePermissionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="depositAccess" className="ml-2 block text-sm text-gray-700">
                  Deposit Access
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="bankAccess"
                  name="bankAccess"
                  checked={permissions.bankAccess}
                  onChange={handlePermissionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="bankAccess" className="ml-2 block text-sm text-gray-700">
                  Bank Access
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <ButtonLoader /> : 'Create Level'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserLevelForm; 