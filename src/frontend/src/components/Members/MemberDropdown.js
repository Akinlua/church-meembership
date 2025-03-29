import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PageLoader } from '../common/Loader';
import MemberForm from './MemberForm';
import { useAuth } from '../../contexts/AuthContext';
import QRCodeSection from './QRCodeSection';

const MemberDropdown = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const dropdownRef = useRef(null);
  const { hasDeleteAccess, hasAddAccess, currentUser, shouldSeeOnlyOwnData } = useAuth();

  useEffect(() => {
    fetchMembers();
    
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

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: {
          ownDataOnly: shouldSeeOnlyOwnData('member') ? 'true' : 'false',
          userId: currentUser?.id
        }
      });
      setMembers(response.data);
      
      // If user can only see their own data and has data, auto-select it
      if (shouldSeeOnlyOwnData('member') && response.data.length === 1) {
        setSelectedMember(response.data[0]);
        setSearchTerm(`${response.data[0].lastName} ${response.data[0].firstName}`);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const fullName = `${member.lastName} ${member.firstName}`.toLowerCase();
    const memberNumber = member.memberNumber ? member.memberNumber.toString() : '';
    const memberId = member.id ? member.id.toString() : '';
    const query = searchTerm.toLowerCase();
    
    return fullName.includes(query) || memberNumber.includes(query) || memberId.includes(query);
  });

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setShowDropdown(false);
    setSearchTerm(`${member.lastName} ${member.firstName}`);
  };

  const handleInputClick = () => {
    setShowDropdown(true);
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    setIsEditing(false);
    setShowForm(true);
  };
  
  const handleEditMember = () => {
    setIsEditing(true);
    setShowForm(true);
  };
  
  const handleDeleteMember = async () => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/members/${selectedMember.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Show success notification
        setNotification({
          show: true,
          message: `${selectedMember.lastName} ${selectedMember.firstName} was successfully deleted!`,
          type: 'success'
        });
        
        // Clear selection and refresh list
        setSelectedMember(null);
        setSearchTerm('');
        await fetchMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
        setNotification({
          show: true,
          message: 'Error deleting member.',
          type: 'error'
        });
      }
    }
  };

  const handleMemberAdded = async (memberId) => {
    try {
      // Refresh the members list
      await fetchMembers();
      
      // Get the newly added member details
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const newMember = response.data;
      
      // Select the new member
      setSelectedMember(newMember);
      setSearchTerm(`${newMember.lastName} ${newMember.firstName}`);
      
      // Show success notification
      setNotification({
        show: true,
        message: `${newMember.lastName} ${newMember.firstName} was successfully ${isEditing ? 'updated' : 'added'}!`,
        type: 'success'
      });
      
      // Close the form
      setShowForm(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Error fetching new member details:', error);
      setNotification({
        show: true,
        message: `Member was ${isEditing ? 'updated' : 'added'} but could not display details.`,
        type: 'warning'
      });
      await fetchMembers();
      setShowForm(false);
    }
  };

  const handleCancel = () => {
    setSearchTerm('');
    setSelectedMember(null);
    setShowDropdown(false);
  };

  const handleFormSubmit = async (memberId) => {
    try {
      await fetchMembers();
      if (isEditing) {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/members/${memberId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const updatedMember = response.data;
        setSelectedMember(updatedMember);
        setSearchTerm(`${updatedMember.lastName} ${updatedMember.firstName}`);
        setNotification({
          show: true,
          message: `${updatedMember.lastName} was successfully updated!`,
          type: 'success'
        });
      } else {
        await handleMemberAdded(memberId);
      }
      setShowForm(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating member details:', error);
      setNotification({
        show: true,
        message: 'Error updating member details.',
        type: 'error'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {notification.show && (
        <div className={`fixed top-5 right-5 px-6 py-4 rounded-lg shadow-lg z-50 transition-all duration-500 transform translate-x-0 ${
          notification.type === 'success' ? 'bg-green-100 border-l-4 border-green-500 text-green-700' : 
          notification.type === 'warning' ? 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700' : 
          'bg-blue-100 border-l-4 border-blue-500 text-blue-700'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' && (
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {notification.type === 'warning' && (
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <p>{notification.message}</p>
            <button 
              className="ml-auto text-gray-500 hover:text-gray-800" 
              onClick={() => setNotification({...notification, show: false})}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Member Lookup</h1>
        
        {shouldSeeOnlyOwnData('member') && (
          <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700">
            <p>You are viewing your membership data only. Contact an administrator if you need access to other records.</p>
          </div>
        )}
        
        {loading ? (
          <PageLoader />
        ) : (
          <>
            <div className="flex mb-8 items-end gap-4">
              <div className="relative flex-grow" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Member
                </label>
                <div className="flex">
                  <input
                    type="text"
                    className="w-32 p-3 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder=""
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={handleInputClick}
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
                    onClick={handleCancel}
                    className="bg-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-400 focus:outline-none border-t border-b border-gray-300"
                  >
                    Cancel
                  </button>
                  {hasAddAccess('member') && (
                    <button
                      onClick={handleAddMember}
                      className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 focus:outline-none"
                    >
                      Add
                    </button>
                  )}
                </div>
                
                {showDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectMember(member)}
                        >
                          <div className="flex-shrink-0 h-8 w-8 mr-3">
                            <img
                              className="h-8 w-8 rounded-full object-cover"
                              src={member.profileImage || '/default.jpg'}
                              alt=""
                            />
                          </div>
                          <div>
                          {member.memberNumber} {member.lastName}, {member.firstName}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No members found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedMember && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
                    <img
                      src={selectedMember.profileImage || '/default.jpg'}
                      alt={`${selectedMember.lastName} ${selectedMember.firstName}`}
                      className="h-48 w-48 rounded-full object-cover"
                    />
                  </div>
                  
                  <div className="md:w-2/3 md:pl-8">
                    <h2 className="text-2xl font-bold mb-4">
                    {selectedMember.lastName}, {selectedMember.firstName} {selectedMember.middleName ? selectedMember.middleName + ' ' : ''}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                        <p className="mb-1"><span className="font-medium">Email:</span> {selectedMember.email || 'N/A'}</p>
                        <p className="mb-1"><span className="font-medium">Phone:</span> {selectedMember.cellPhone || 'N/A'}</p>
                        <p className="mb-1">
                          <span className="font-medium">Address:</span>{' '}
                          {[
                            selectedMember.address,
                            selectedMember.city,
                            selectedMember.state,
                            selectedMember.zipCode
                          ].filter(Boolean).join(', ') || 'N/A'}
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">Birth Date:</span>{' '}
                          {selectedMember.membershipDate ? new Date(selectedMember.birthday).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Church Information</h3>
                        <p className="mb-1">
                          <span className="font-medium">Member Status:</span>{' '}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedMember.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedMember.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">Member Since:</span>{' '}
                          {selectedMember.membershipDate ? new Date(selectedMember.membershipDate).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">Baptismal Date:</span>{' '}
                          {selectedMember.baptismalDate ? new Date(selectedMember.baptismalDate).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">Member Number:</span> {selectedMember.memberNumber || 'N/A'}
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">Past Church:</span> {selectedMember.pastChurch || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {selectedMember.groups && selectedMember.groups.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Groups</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedMember.groups.map((groupMembership) => (
                            <span
                              key={groupMembership.group?.id || groupMembership.groupId || groupMembership.id}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {groupMembership.group?.name || groupMembership.name || 'Unknown Group'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-3 mt-6">
                      {/* Show Edit button if user has add access OR if it's their own record */}
                      {(hasAddAccess('member') || (currentUser && currentUser.memberId === selectedMember.id)) && (
                        <button 
                          onClick={handleEditMember}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit
                        </button>
                      )}
                      
                      {/* Show Delete button if user has delete access OR if it's their own record */}
                      {(hasDeleteAccess('member') || (currentUser && currentUser.memberId === selectedMember.id)) && (
                        <button 
                          onClick={handleDeleteMember}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      )}
                      
                      {/* Show "Your record" indicator if it's the user's own record */}
                      {currentUser && currentUser.memberId === selectedMember.id && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Your record
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add QR Code Section for Member Registration */}
      <QRCodeSection />

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-8 border shadow-lg rounded-md bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <MemberForm
              member={isEditing ? selectedMember : null}
              onClose={() => {
                setShowForm(false);
                setIsEditing(false);
                fetchMembers();
              }}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDropdown; 