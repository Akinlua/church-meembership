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
            {/* <Link to="/members" className="hover:text-gray-300">
              Members
            </Link> */}
            <Link to="/member-lookup" className="hover:text-gray-300">
              Member
            </Link>
            {/* <Link to="/visitors" className="hover:text-gray-300">
              Visitors
            </Link> */}
            <Link to="/visitor-lookup" className="hover:text-gray-300">
              Visitor
            </Link>
            <Link to="/vendor" className="hover:text-gray-300">
              Vendor
            </Link>
            {/* <Link to="/groups" className="hover:text-gray-300">
              Groups
            </Link> */}
            <Link to="/group-lookup" className="hover:text-gray-300">
              Group
            </Link>
            {/* <Link to="/donations" className="hover:text-gray-300">
              Donations
            </Link> */}
            <Link to="/donation-lookup" className="hover:text-gray-300">
              Donation
            </Link>
            <Link to="/donation-types" className="hover:text-gray-300">
              Donation Types
            </Link>
            <Link to="/donation-types-dropdown" className="hover:text-gray-300">
              Donation Types
            </Link>         
            <Link to="/expense-categories" className="hover:text-gray-300">
              Expense Categories
            </Link>
            <Link to="/charges" className="hover:text-gray-300">
              Charges
            </Link>
            <Link to="/reports" className="hover:text-gray-300">
              Reports
            </Link>  
          </div>
          <div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded text-sm font-medium hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 