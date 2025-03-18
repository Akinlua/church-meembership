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
    bankAccess: false,
    cannotDeleteMember: false,
    cannotDeleteVisitor: false,
    cannotDeleteVendor: false,
    cannotDeleteGroup: false,
    cannotDeleteDonation: false,
    cannotDeleteExpense: false,
    cannotDeleteCharges: false,
    cannotDeleteReports: false,
    cannotDeleteDeposit: false,
    cannotDeleteBank: false,
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

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    
    // For delete permissions, invert the value since we're changing from "cannotDelete" to "canDelete"
    if (name.startsWith('cannotDelete')) {
      setPermissions({
        ...permissions,
        [name]: !checked // Invert the value for cannotDelete fields
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
      setError(error.response?.data?.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow max-w-md mx-auto">
      {error && (
        <div className="mb-2 p-1 bg-red-100 border border-red-400 text-red-700 rounded text-xs">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700">Level Name</label>
            <input
              type="text"
              required
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md"
              value={levelName}
              onChange={(e) => setLevelName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700">Description</label>
            <input
              type="text"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">Access Permissions</p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="memberAccess"
                  name="memberAccess"
                  checked={permissions.memberAccess}
                  onChange={handlePermissionChange}
                  className="h-3 w-3"
                />
                <label htmlFor="memberAccess" className="ml-1 text-xs">Member</label>
                {permissions.memberAccess && (
                  <>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="cannotDeleteMember"
                        name="cannotDeleteMember"
                        checked={!permissions.cannotDeleteMember}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="cannotDeleteMember" className="ml-0.5 text-xs text-red-600">Delete</label>
                    </div>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="canAddMember"
                        name="canAddMember"
                        checked={permissions.canAddMember}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="canAddMember" className="ml-0.5 text-xs text-green-600">Add</label>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="visitorAccess"
                  name="visitorAccess"
                  checked={permissions.visitorAccess}
                  onChange={handlePermissionChange}
                  className="h-3 w-3"
                />
                <label htmlFor="visitorAccess" className="ml-1 text-xs">Visitor</label>
                {permissions.visitorAccess && (
                  <>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="cannotDeleteVisitor"
                        name="cannotDeleteVisitor"
                        checked={!permissions.cannotDeleteVisitor}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="cannotDeleteVisitor" className="ml-0.5 text-xs text-red-600">Delete</label>
                    </div>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="canAddVisitor"
                        name="canAddVisitor"
                        checked={permissions.canAddVisitor}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="canAddVisitor" className="ml-0.5 text-xs text-green-600">Add</label>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vendorAccess"
                  name="vendorAccess"
                  checked={permissions.vendorAccess}
                  onChange={handlePermissionChange}
                  className="h-3 w-3"
                />
                <label htmlFor="vendorAccess" className="ml-1 text-xs">Vendor</label>
                {permissions.vendorAccess && (
                  <>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="cannotDeleteVendor"
                        name="cannotDeleteVendor"
                        checked={!permissions.cannotDeleteVendor}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="cannotDeleteVendor" className="ml-0.5 text-xs text-red-600">Delete</label>
                    </div>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="canAddVendor"
                        name="canAddVendor"
                        checked={permissions.canAddVendor}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="canAddVendor" className="ml-0.5 text-xs text-green-600">Add</label>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="groupAccess"
                  name="groupAccess"
                  checked={permissions.groupAccess}
                  onChange={handlePermissionChange}
                  className="h-3 w-3"
                />
                <label htmlFor="groupAccess" className="ml-1 text-xs">Group</label>
                {permissions.groupAccess && (
                  <>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="cannotDeleteGroup"
                        name="cannotDeleteGroup"
                        checked={!permissions.cannotDeleteGroup}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="cannotDeleteGroup" className="ml-0.5 text-xs text-red-600">Delete</label>
                    </div>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="canAddGroup"
                        name="canAddGroup"
                        checked={permissions.canAddGroup}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="canAddGroup" className="ml-0.5 text-xs text-green-600">Add</label>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="donationAccess"
                  name="donationAccess"
                  checked={permissions.donationAccess}
                  onChange={handlePermissionChange}
                  className="h-3 w-3"
                />
                <label htmlFor="donationAccess" className="ml-1 text-xs">Donation</label>
                {permissions.donationAccess && (
                  <>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="cannotDeleteDonation"
                        name="cannotDeleteDonation"
                        checked={!permissions.cannotDeleteDonation}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="cannotDeleteDonation" className="ml-0.5 text-xs text-red-600">Delete</label>
                    </div>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="canAddDonation"
                        name="canAddDonation"
                        checked={permissions.canAddDonation}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="canAddDonation" className="ml-0.5 text-xs text-green-600">Add</label>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="adminAccess"
                  name="adminAccess"
                  checked={permissions.adminAccess}
                  onChange={handlePermissionChange}
                  className="h-3 w-3"
                />
                <label htmlFor="adminAccess" className="ml-1 text-xs">Admin</label>
              </div>
            </div>
            
            <div className="space-y-0.5">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="expenseAccess"
                  name="expenseAccess"
                  checked={permissions.expenseAccess}
                  onChange={handlePermissionChange}
                  className="h-3 w-3"
                />
                <label htmlFor="expenseAccess" className="ml-1 text-xs">Expense</label>
                {permissions.expenseAccess && (
                  <>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="cannotDeleteExpense"
                        name="cannotDeleteExpense"
                        checked={!permissions.cannotDeleteExpense}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="cannotDeleteExpense" className="ml-0.5 text-xs text-red-600">Delete</label>
                    </div>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="canAddExpense"
                        name="canAddExpense"
                        checked={permissions.canAddExpense}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="canAddExpense" className="ml-0.5 text-xs text-green-600">Add</label>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="chargesAccess"
                  name="chargesAccess"
                  checked={permissions.chargesAccess}
                  onChange={handlePermissionChange}
                  className="h-3 w-3"
                />
                <label htmlFor="chargesAccess" className="ml-1 text-xs">Charges</label>
                {permissions.chargesAccess && (
                  <>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="cannotDeleteCharges"
                        name="cannotDeleteCharges"
                        checked={!permissions.cannotDeleteCharges}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="cannotDeleteCharges" className="ml-0.5 text-xs text-red-600">Delete</label>
                    </div>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="canAddCharges"
                        name="canAddCharges"
                        checked={permissions.canAddCharges}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="canAddCharges" className="ml-0.5 text-xs text-green-600">Add</label>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reportsAccess"
                  name="reportsAccess"
                  checked={permissions.reportsAccess}
                  onChange={handlePermissionChange}
                  className="h-3 w-3"
                />
                <label htmlFor="reportsAccess" className="ml-1 text-xs">Reports</label>
                {permissions.reportsAccess && (
                  <>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="cannotDeleteReports"
                        name="cannotDeleteReports"
                        checked={!permissions.cannotDeleteReports}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="cannotDeleteReports" className="ml-0.5 text-xs text-red-600">Delete</label>
                    </div>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="canAddReports"
                        name="canAddReports"
                        checked={permissions.canAddReports}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="canAddReports" className="ml-0.5 text-xs text-green-600">Add</label>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="depositAccess"
                  name="depositAccess"
                  checked={permissions.depositAccess}
                  onChange={handlePermissionChange}
                  className="h-3 w-3"
                />
                <label htmlFor="depositAccess" className="ml-1 text-xs">Deposit</label>
                {permissions.depositAccess && (
                  <>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="cannotDeleteDeposit"
                        name="cannotDeleteDeposit"
                        checked={!permissions.cannotDeleteDeposit}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="cannotDeleteDeposit" className="ml-0.5 text-xs text-red-600">Delete</label>
                    </div>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="canAddDeposit"
                        name="canAddDeposit"
                        checked={permissions.canAddDeposit}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="canAddDeposit" className="ml-0.5 text-xs text-green-600">Add</label>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="bankAccess"
                  name="bankAccess"
                  checked={permissions.bankAccess}
                  onChange={handlePermissionChange}
                  className="h-3 w-3"
                />
                <label htmlFor="bankAccess" className="ml-1 text-xs">Bank</label>
                {permissions.bankAccess && (
                  <>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="cannotDeleteBank"
                        name="cannotDeleteBank"
                        checked={!permissions.cannotDeleteBank}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="cannotDeleteBank" className="ml-0.5 text-xs text-red-600">Delete</label>
                    </div>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="canAddBank"
                        name="canAddBank"
                        checked={permissions.canAddBank}
                        onChange={handlePermissionChange}
                        className="h-3 w-3"
                      />
                      <label htmlFor="canAddBank" className="ml-0.5 text-xs text-green-600">Add</label>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-0.5 text-xs border border-gray-300 rounded-md font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-2 py-0.5 text-xs border border-transparent rounded-md font-medium text-white bg-blue-600"
          >
            {loading ? <ButtonLoader /> : 'Create Level'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserLevelForm; 