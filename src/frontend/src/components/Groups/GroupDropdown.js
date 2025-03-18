import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PageLoader } from '../common/Loader';
import GroupForm from './GroupForm';
import { useAuth } from '../../contexts/AuthContext';

const GroupDropdown = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const dropdownRef = useRef(null);
  const { hasDeleteAccess, hasAddAccess } = useAuth();

  useEffect(() => {
    fetchGroups();
    
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

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async (groupId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching group details:', error);
      return null;
    }
  };

  const filteredGroups = groups.filter(group => {
    const groupName = group.name.toLowerCase();
    const groupId = group.id ? group.id.toString() : '';
    const query = searchTerm.toLowerCase();
    
    return groupName.includes(query) || groupId.includes(query);
  });

  const handleSelectGroup = async (group) => {
    try {
      setLoading(true);
      // Fetch full group details including members
      const fullGroupDetails = await fetchGroupDetails(group.id);
      if (fullGroupDetails) {
        setSelectedGroup(fullGroupDetails);
        setShowDropdown(false);
        setSearchTerm(fullGroupDetails.name);
      }
    } catch (error) {
      console.error('Error selecting group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputClick = () => {
    setShowDropdown(true);
  };

  const handleAddGroup = () => {
    setSelectedGroup(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditGroup = () => {
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteGroup = async () => {
    if (!hasDeleteAccess('group')) {
      setNotification({
        show: true,
        message: 'You do not have permission to delete groups.',
        type: 'error'
      });
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/groups/${selectedGroup.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Show success notification
        setNotification({
          show: true,
          message: `${selectedGroup.name} was successfully deleted!`,
          type: 'success'
        });
        
        // Clear selection and refresh list
        setSelectedGroup(null);
        setSearchTerm('');
        await fetchGroups();
      } catch (error) {
        console.error('Error deleting group:', error);
        setNotification({
          show: true,
          message: 'Error deleting group.',
          type: 'error'
        });
      }
    }
  };

  const handleFormSubmit = async (groupId) => {
    setShowForm(false);
    
    try {
      // Refresh the groups list
      await fetchGroups();
      
      if (groupId) {
        // Get the complete group details including members
        const group = await fetchGroupDetails(groupId);
        
        if (group) {
          // Select the group
          setSelectedGroup(group);
          setSearchTerm(group.name);
          
          // Show success notification
          setNotification({
            show: true,
            message: `${group.name} was successfully ${isEditing ? 'updated' : 'added'}!`,
            type: 'success'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
      setNotification({
        show: true,
        message: `Group was ${isEditing ? 'updated' : 'added'} but could not display details.`,
        type: 'warning'
      });
      await fetchGroups();
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSearchTerm('');
    setSelectedGroup(null);
    setShowDropdown(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {notification.show && (
        <div className={`mb-4 p-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {notification.message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Group Lookup</h1>
        
        {loading ? (
          <PageLoader />
        ) : (
          <>
            <div className="flex mb-8 items-end gap-4">
              <div className="relative flex-grow" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Group
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
                    className="bg-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-400 focus:outline-none border-t border-b border-r border-gray-300"
                  >
                    Cancel
                  </button>
                  {hasAddAccess('group') && (
                    <button
                      onClick={handleAddGroup}
                      className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 focus:outline-none"
                    >
                      Add
                    </button>
                  )}
                </div>
                
                {showDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                    {filteredGroups.length > 0 ? (
                      filteredGroups.map((group) => (
                        <div
                          key={group.id}
                          className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectGroup(group)}
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {group.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {group.id}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        No groups found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {selectedGroup && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex flex-col">
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold">{selectedGroup.name}</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Group Information</h3>
                        <p className="mb-4">
                          <span className="font-medium">Description:</span> {selectedGroup.description || 'No description provided'}
                        </p>
                      </div>
                      
                      {selectedGroup.members && selectedGroup.members.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Members</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {selectedGroup.members.map((member) => (
                              <div 
                                key={member.id} 
                                className="flex items-center p-2 bg-white rounded-md shadow-sm"
                              >
                                <div className="flex-shrink-0 h-8 w-8 mr-3">
                                  <img
                                    className="h-8 w-8 rounded-full object-cover"
                                    src={member.profileImage || '/default.jpg'}
                                    alt=""
                                  />
                                </div>
                                <div className="text-sm font-medium">
                                  {member.firstName} {member.lastName}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-3 mt-2">
                        <button 
                          onClick={handleEditGroup}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit Group
                        </button>
                        
                        {hasDeleteAccess('group') && (
                          <button 
                            onClick={handleDeleteGroup}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Group
                          </button>
                        )}
                      </div>
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
            <GroupForm
              group={isEditing ? selectedGroup : null}
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

export default GroupDropdown; 