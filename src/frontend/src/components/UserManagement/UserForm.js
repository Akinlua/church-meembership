import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ButtonLoader } from '../common/Loader';

const UserForm = ({ user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
  });
  
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
    bankAccess: false,
    cannotDeleteMember: true,
    cannotDeleteVisitor: true,
    cannotDeleteVendor: true,
    cannotDeleteGroup: true,
    cannotDeleteDonation: true,
    cannotDeleteExpense: true,
    cannotDeleteCharges: true,
    cannotDeleteReports: true,
    cannotDeleteDeposit: true,
    cannotDeleteBank: true,
    canAddMember: false,
    canAddVisitor: false,
    canAddVendor: false,
    canAddGroup: false,
    canAddDonation: false,
    canAddExpense: false,
    canAddCharges: false,
    canAddReports: false,
    canAddDeposit: false,
    canAddBank: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' or 'permissions'

  useEffect(() => {
    if (user) {
      // Set basic user data
      setFormData({
        name: user.name || '',
        username: user.username || '',
        password: '', // Don't populate password for security
      });
      
      // Set all permissions from the user object
      const newPermissions = { ...permissions };
      Object.keys(newPermissions).forEach(key => {
        if (key in user) {
          newPermissions[key] = user[key];
        }
      });
      setPermissions(newPermissions);
    }
  }, [user]);

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    
    // Special handling for inverted delete permissions
    if (name.startsWith('cannotDelete')) {
      setPermissions({
        ...permissions,
        [name]: !checked
      });
    } else {
      setPermissions({
        ...permissions,
        [name]: checked
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = user 
        ? `${process.env.REACT_APP_API_URL}/admin/users/${user.id}` 
        : `${process.env.REACT_APP_API_URL}/admin/users`;
      
      const method = user ? 'put' : 'post';
      
      // Combine form data with permissions
      const userData = {
        ...formData,
        ...permissions
      };
      
      await axios[method](url, userData, {
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

  // Render permission fields for a specific category
  const renderPermissionFields = (category) => {
    const accessKey = `${category}Access`;
    const cannotDeleteKey = `cannotDelete${category.charAt(0).toUpperCase() + category.slice(1)}`;
    const canAddKey = `canAdd${category.charAt(0).toUpperCase() + category.slice(1)}`;
    
    return (
      <div className="flex items-center space-x-2 py-1 border-b border-gray-100">
        <div className="w-1/3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id={accessKey}
              name={accessKey}
              checked={permissions[accessKey]}
              onChange={handlePermissionChange}
              className="h-4 w-4"
            />
            <label htmlFor={accessKey} className="ml-2 text-sm capitalize">{category}</label>
          </div>
        </div>
        
        {permissions[accessKey] && (
          <>
            <div className="w-1/3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={canAddKey}
                  name={canAddKey}
                  checked={permissions[canAddKey]}
                  onChange={handlePermissionChange}
                  className="h-4 w-4"
                />
                <label htmlFor={canAddKey} className="ml-2 text-sm text-green-600">Can Add</label>
              </div>
            </div>
            
            <div className="w-1/3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={cannotDeleteKey}
                  name={cannotDeleteKey}
                  checked={!permissions[cannotDeleteKey]}
                  onChange={handlePermissionChange}
                  className="h-4 w-4"
                />
                <label htmlFor={cannotDeleteKey} className="ml-2 text-sm text-red-600">Can Delete</label>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-lg font-bold mb-3 text-center">
        {user ? 'Edit User' : 'Add System User'}
      </h2>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-2 rounded-md text-sm mb-3">
          {error}
        </div>
      )}
      
      <div className="mb-4 flex border-b">
        <button
          type="button"
          className={`px-4 py-2 ${activeTab === 'basic' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Info
        </button>
        <button
          type="button"
          className={`px-4 py-2 ${activeTab === 'permissions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('permissions')}
        >
          Permissions
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        {activeTab === 'basic' && (
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
        )}
        
        {activeTab === 'permissions' && (
          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Access Permissions</h3>
            
            <div className="grid grid-cols-1 gap-1">
              {renderPermissionFields('member')}
              {renderPermissionFields('visitor')}
              {renderPermissionFields('vendor')}
              {renderPermissionFields('group')}
              {renderPermissionFields('donation')}
              {renderPermissionFields('expense')}
              {renderPermissionFields('charges')}
              {renderPermissionFields('reports')}
              {renderPermissionFields('deposit')}
              {renderPermissionFields('bank')}
              
              {/* Admin access is special, only needs the access toggle */}
              <div className="flex items-center py-1 border-b border-gray-100">
                <div className="w-full">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="adminAccess"
                      name="adminAccess"
                      checked={permissions.adminAccess}
                      onChange={handlePermissionChange}
                      className="h-4 w-4"
                    />
                    <label htmlFor="adminAccess" className="ml-2 text-sm font-medium text-blue-600">Admin Access</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
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