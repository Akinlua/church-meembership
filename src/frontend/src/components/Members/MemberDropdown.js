import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PageLoader } from '../common/Loader';
import MemberForm from './MemberForm';

const MemberDropdown = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const dropdownRef = useRef(null);

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
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setShowDropdown(false);
    setSearchTerm(`${member.firstName} ${member.lastName}`);
  };

  const handleInputClick = () => {
    setShowDropdown(true);
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    setShowForm(true);
  };

  const handleMemberAdded = async (newMemberId) => {
    try {
      // Refresh the members list
      await fetchMembers();
      
      // Get the newly added member details
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/members/${newMemberId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const newMember = response.data;
      
      // Select the new member
      setSelectedMember(newMember);
      setSearchTerm(`${newMember.firstName} ${newMember.lastName}`);
      
      // Show success notification
      setNotification({
        show: true,
        message: `${newMember.firstName} ${newMember.lastName} was successfully added!`,
        type: 'success'
      });
      
      // Close the form
      setShowForm(false);
    } catch (error) {
      console.error('Error fetching new member details:', error);
      setNotification({
        show: true,
        message: 'Member was added but could not display details.',
        type: 'warning'
      });
      await fetchMembers();
      setShowForm(false);
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
        
        {loading ? (
          <PageLoader />
        ) : (
          <>
            <div className="flex mb-8 items-end gap-4">
              <div className="relative flex-grow" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Member
                </label>
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Search for a member..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={handleInputClick}
                />
                
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
                            {member.firstName} {member.lastName}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No members found</div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleAddMember}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 h-10"
              >
                Add Member
              </button>
            </div>

            {selectedMember && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
                    <img
                      src={selectedMember.profileImage || '/default.jpg'}
                      alt={`${selectedMember.firstName} ${selectedMember.lastName}`}
                      className="h-48 w-48 rounded-full object-cover"
                    />
                  </div>
                  
                  <div className="md:w-2/3 md:pl-8">
                    <h2 className="text-2xl font-bold mb-4">
                      {selectedMember.firstName} {selectedMember.middleName ? selectedMember.middleName + ' ' : ''}{selectedMember.lastName}
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
            <MemberForm
              member={null}
              onClose={() => {
                setShowForm(false);
              }}
              onSubmit={async (memberId) => {
                // Pass the member ID to the handler for selection
                await handleMemberAdded(memberId);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDropdown; 