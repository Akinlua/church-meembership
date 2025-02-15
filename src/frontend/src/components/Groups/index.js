import React, { useState, useEffect } from 'react';
import GroupList from './GroupList';
import GroupForm from './GroupForm';
import axios from 'axios';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleAddGroup = () => {
    setSelectedGroup(null);
    setShowForm(true);
  };

  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setShowForm(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Church Groups</h1>
            <button
              onClick={handleAddGroup}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Group
            </button>
          </div>
        </div>

        <div className="p-6">
          {showForm ? (
            <GroupForm
              group={selectedGroup}
              onClose={() => setShowForm(false)}
              onSubmit={() => {
                setShowForm(false);
                fetchGroups();
              }}
            />
          ) : (
            <GroupList
              groups={groups}
              onEdit={handleEditGroup}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups; 