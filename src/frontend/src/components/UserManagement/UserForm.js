import React, { useState, useEffect, useRef } from 'react';
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
    checksAccess: false,
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
    cannotDeleteChecks: true,
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
    canAddChecks: false,
    canAddReports: false,
    canAddDeposit: false,
    canAddBank: false,
    memberOnlyOwnData: false,
    visitorOnlyOwnData: false,
    convertFromVisitor: false,
    convertFromMember: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' or 'permissions'
  const [members, setMembers] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [visitorsLoading, setVisitorsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [userType, setUserType] = useState('member'); // 'member' or 'visitor'
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) {
      fetchMembers();
      fetchVisitors();
    }

    if (user) {
      console.log("User data loaded:", user);
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
      
      // Ensure memberOnlyOwnData and visitorOnlyOwnData are properly set
      if (user.memberOnlyOwnData !== undefined) {
        newPermissions.memberOnlyOwnData = user.memberOnlyOwnData;
      }
      
      if (user.visitorOnlyOwnData !== undefined) {
        newPermissions.visitorOnlyOwnData = user.visitorOnlyOwnData;
      }
      
      console.log("Setting permissions:", newPermissions);
      setPermissions(newPermissions);

      // If user has a linked memberId, set userType to member
      if (user.memberId) {
        setUserType('member');
      } else if (user.visitorId) {
        setUserType('visitor');
      }
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  const fetchMembers = async () => {
    try {
      setMembersLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setMembersLoading(false);
    }
  };

  const fetchVisitors = async () => {
    try {
      setVisitorsLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/visitors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVisitors(response.data);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setVisitorsLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const fullName = `${member.lastName} ${member.firstName}`.toLowerCase();
    const memberNumber = member.memberNumber ? member.memberNumber.toString() : '';
    const query = searchTerm.toLowerCase();
    
    return fullName.includes(query) || memberNumber.includes(query);
  });

  const filteredVisitors = visitors.filter(visitor => {
    const fullName = `${visitor.lastName} ${visitor.firstName}`.toLowerCase();
    const visitorNumber = visitor.visitorNumber ? visitor.visitorNumber.toString() : '';
    const query = searchTerm.toLowerCase();
    
    return fullName.includes(query) || visitorNumber.includes(query);
  });

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setSelectedVisitor(null);
    setShowDropdown(false);
    setSearchTerm(`${member.lastName} ${member.firstName}`);
    setFormData({
      ...formData,
      name: `${member.firstName} ${member.lastName}`,
      username: member.email ? member.email.split('@')[0] : ''
    });
  };

  const handleSelectVisitor = (visitor) => {
    setSelectedVisitor(visitor);
    setSelectedMember(null);
    setShowDropdown(false);
    setSearchTerm(`${visitor.lastName} ${visitor.firstName}`);
    setFormData({
      ...formData,
      name: `${visitor.firstName} ${visitor.lastName}`,
      username: visitor.email ? visitor.email.split('@')[0] : ''
    });
  };

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
        ...permissions,
      };

      // Add the appropriate ID based on userType
      if (userType === 'member' && selectedMember) {
        userData.memberId = selectedMember.id;
        userData.visitorId = null;
        userData.memberOnlyOwnData = true; // Set this to true by default for member users
      } else if (userType === 'visitor' && selectedVisitor) {
        userData.visitorId = selectedVisitor.id;
        userData.memberId = null;
        userData.visitorOnlyOwnData = true; // Set this to true by default for visitor users
      }
      
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
    const onlyOwnDataKey = `${category}OnlyOwnData`;
    
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
        
        {permissions[accessKey] && category !== 'checks' && (
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
                <label htmlFor={canAddKey} className="ml-2 text-sm">Can Add</label>
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
                <label htmlFor={cannotDeleteKey} className="ml-2 text-sm">Can Delete</label>
              </div>
            </div>
            
            {/* Only show "Only Own Data" checkbox for member and visitor */}
            {(category === 'member' || category === 'visitor') && (
              <div className="w-1/3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={onlyOwnDataKey}
                    name={onlyOwnDataKey}
                    checked={permissions[onlyOwnDataKey]}
                    onChange={handlePermissionChange}
                    className="h-4 w-4"
                  />
                  <label htmlFor={onlyOwnDataKey} className="ml-2 text-sm">Only Own Data</label>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{user ? 'Edit User' : 'Add User'}</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-4">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'basic' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'permissions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('permissions')}
          >
            Permissions
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'basic' && (
          <div className="space-y-4">
            {!user && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Type
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-blue-600"
                      checked={userType === 'member'}
                      onChange={() => {
                        setUserType('member');
                        setSelectedVisitor(null);
                        setSearchTerm('');
                        // Reset any visitor-specific settings
                        setPermissions(prev => ({
                          ...prev,
                          memberOnlyOwnData: true,
                          visitorOnlyOwnData: false
                        }));
                      }}
                    />
                    <span className="ml-2">Member</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-blue-600"
                      checked={userType === 'visitor'}
                      onChange={() => {
                        setUserType('visitor');
                        setSelectedMember(null);
                        setSearchTerm('');
                        // Reset any member-specific settings
                        setPermissions(prev => ({
                          ...prev,
                          memberOnlyOwnData: false,
                          visitorOnlyOwnData: true
                        }));
                      }}
                    />
                    <span className="ml-2">Visitor</span>
                  </label>
                </div>
              </div>
            )}

            {!user && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {userType === 'member' ? 'Select Member' : 'Select Visitor'}
                </label>
                <div className="relative" ref={dropdownRef}>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={() => setShowDropdown(true)}
                    placeholder={userType === 'member' ? "Search for a member..." : "Search for a visitor..."}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 overflow-auto border rounded">
                      {userType === 'member' ? (
                        membersLoading ? (
                          <div className="p-2 text-center text-gray-500">Loading members...</div>
                        ) : filteredMembers.length > 0 ? (
                          filteredMembers.map(member => (
                            <div
                              key={member.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                              onClick={() => handleSelectMember(member)}
                            >
                              {member.profileImage && (
                                <img
                                  src={member.profileImage}
                                  alt=""
                                  className="w-8 h-8 rounded-full mr-2 object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium">{member.lastName}, {member.firstName}</div>
                                <div className="text-xs text-gray-500">Member #{member.memberNumber}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-center text-gray-500">No members found</div>
                        )
                      ) : (
                        visitorsLoading ? (
                          <div className="p-2 text-center text-gray-500">Loading visitors...</div>
                        ) : filteredVisitors.length > 0 ? (
                          filteredVisitors.map(visitor => (
                            <div
                              key={visitor.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                              onClick={() => handleSelectVisitor(visitor)}
                            >
                              {visitor.profileImage && (
                                <img
                                  src={visitor.profileImage}
                                  alt=""
                                  className="w-8 h-8 rounded-full mr-2 object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium">{visitor.lastName}, {visitor.firstName}</div>
                                <div className="text-xs text-gray-500">Visitor #{visitor.visitorNumber}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-center text-gray-500">No visitors found</div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {selectedMember && (
                  <div className="mt-2 p-2 bg-blue-50 rounded flex items-center">
                    <span className="font-medium mr-2">Selected Member:</span>
                    <span>
                      {selectedMember.firstName} {selectedMember.lastName} (#{selectedMember.memberNumber})
                    </span>
                  </div>
                )}

                {selectedVisitor && (
                  <div className="mt-2 p-2 bg-purple-50 rounded flex items-center">
                    <span className="font-medium mr-2">Selected Visitor:</span>
                    <span>
                      {selectedVisitor.firstName} {selectedVisitor.lastName} (#{selectedVisitor.visitorNumber})
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {user ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!user}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-4">
            <div className="border rounded-md p-4">
              <h3 className="font-semibold text-lg mb-3">Module Access</h3>
              
              {renderPermissionFields('member')}
              {renderPermissionFields('visitor')}
              {renderPermissionFields('vendor')}
              {renderPermissionFields('group')}
              {renderPermissionFields('donation')}
              {renderPermissionFields('expense')}
              {renderPermissionFields('charges')}
              {renderPermissionFields('checks')}
              {renderPermissionFields('reports')}
              {renderPermissionFields('deposit')}
              {renderPermissionFields('bank')}
              {renderPermissionFields('admin')}
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || (!user && userType === 'member' && !selectedMember) || (!user && userType === 'visitor' && !selectedVisitor)}
            className={`px-4 py-2 ${((!user && userType === 'member' && !selectedMember) || (!user && userType === 'visitor' && !selectedVisitor)) ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded`}
          >
            {loading ? <ButtonLoader /> : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm; 