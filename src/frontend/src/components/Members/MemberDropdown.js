import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PageLoader } from '../common/Loader';

const MemberDropdown = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Member Lookup</h1>
        
        {loading ? (
          <PageLoader />
        ) : (
          <>
            <div className="relative mb-8" ref={dropdownRef}>
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
                            src={member.profileImage || '/default-avatar.png'}
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

            {selectedMember && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
                    <img
                      src={selectedMember.profileImage || '/default-avatar.png'}
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
    </div>
  );
};

export default MemberDropdown; 