import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold">
              Church Management
            </Link>
            <Link to="/members" className="hover:text-gray-300">
              Members
            </Link>
            <Link to="/groups" className="hover:text-gray-300">
              Groups
            </Link>
            <Link to="/donations" className="hover:text-gray-300">
              Donations
            </Link>
            <Link to="/reports" className="hover:text-gray-300">
              Reports
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 