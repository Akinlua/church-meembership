import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from '../common/Loader';
import UserForm from './UserForm';
import UserLevelForm from './UserLevelForm';
import UserList from './UserList';
import UserLevelList from './UserLevelList';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [userLevels, setUserLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showLevelForm, setShowLevelForm] = useState(false);
  const [showLevelList, setShowLevelList] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchUserLevels();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLevels = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/user-levels`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserLevels(response.data);
    } catch (error) {
      console.error('Error fetching user levels:', error);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowUserForm(true);
    setShowLevelForm(false);
    setShowLevelList(false);
  };

  const handleViewLevels = () => {
    setShowLevelList(true);
    setShowLevelForm(false);
    setShowUserForm(false);
  };
  
  const handleAddUserLevel = () => {
    setSelectedLevel(null);
    setShowLevelForm(true);
    setShowUserForm(false);
    setShowLevelList(false);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserForm(true);
    setShowLevelForm(false);
    setShowLevelList(false);
  };
  
  const handleEditLevel = (level) => {
    setSelectedLevel(level);
    setShowLevelForm(true);
    setShowUserForm(false);
    setShowLevelList(false);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        await fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };
  
  const handleDeleteLevel = async (id) => {
    if (window.confirm('Are you sure you want to delete this user level?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/admin/user-levels/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        await fetchUserLevels();
      } catch (error) {
        console.error('Error deleting user level:', error);
        alert(error.response?.data?.message || 'Error deleting user level');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">System Administrator</h1>
            <div className="space-x-2">
              <button
                onClick={handleViewLevels}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Levels
              </button>
              <button
                onClick={handleAddUser}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add User
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading && !showLevelForm && !showUserForm && !showLevelList ? (
            <div className="flex justify-center items-center h-64">
              <PageLoader />
            </div>
          ) : showUserForm ? (
            <UserForm
              user={selectedUser}
              userLevels={userLevels}
              onClose={() => setShowUserForm(false)}
              onSubmit={() => {
                setShowUserForm(false);
                fetchUsers();
              }}
            />
          ) : showLevelForm ? (
            <UserLevelForm
              level={selectedLevel}
              onClose={() => setShowLevelForm(false)}
              onSubmit={() => {
                setShowLevelForm(false);
                fetchUserLevels();
                // Return to level list if we came from there
                if (showLevelList || selectedLevel) {
                  setShowLevelList(true);
                }
              }}
            />
          ) : showLevelList ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">User Levels</h2>
                <button
                  onClick={handleAddUserLevel}
                  className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add Level
                </button>
              </div>
              <UserLevelList 
                userLevels={userLevels}
                onEdit={handleEditLevel}
                onDelete={handleDeleteLevel}
              />
              <div className="mt-4">
                <button
                  onClick={() => {
                    setShowLevelList(false);
                    setShowLevelForm(false);
                    setShowUserForm(false);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Users
                </button>
              </div>
            </div>
          ) : (
            <UserList
              users={users}
              userLevels={userLevels}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 