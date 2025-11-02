import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check permissions based on user level
  const hasAccess = (accessType) => {
    if (!currentUser) return false;
    
    // Super admin can access everything
    if (currentUser.role === 'admin') return true;
    
    // Otherwise check direct user permissions
    switch(accessType) {
      case 'member':
        return currentUser.memberAccess;
      case 'visitor':
        return currentUser.visitorAccess;
      case 'vendor':
        return currentUser.vendorAccess;
      case 'group':
        return currentUser.groupAccess;
      case 'donation':
        return currentUser.donationAccess;
      case 'admin':
        return currentUser.adminAccess;
      case 'expense':
        return currentUser.expenseAccess;
      case 'charges':
        return currentUser.chargesAccess;
      case 'reports':
        return currentUser.reportsAccess;
      case 'deposit':
        return currentUser.depositAccess;
      case 'bank':
        return currentUser.bankAccess;
      case 'checks':
        return currentUser.checksAccess;
      default:
        return false;
    }
  };

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <Link to="/" className="text-xl font-bold block hover:text-gray-300">
          Church Management
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="py-2">
          {hasAccess('member') && (
            <li>
              <Link to="/member-lookup" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Member
              </Link>
            </li>
          )}
          {hasAccess('visitor') && (
            <li>
              <Link to="/visitor-lookup" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Visitor
              </Link>
            </li>
          )}
          {hasAccess('vendor') && (
            <li>
              <Link to="/vendor" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Vendor
              </Link>
            </li>
          )}
          {hasAccess('group') && (
            <li>
              <Link to="/group-lookup" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Group
              </Link>
            </li>
          )}
          {hasAccess('donation') && (
            <li>
              <Link to="/donation-lookup" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Donation
              </Link>
            </li>
          )}
          {hasAccess('donation') && (
            <li>
              <Link to="/donation-types-dropdown" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Donation Types
              </Link>
            </li>
          )}
          {hasAccess('expense') && (
            <li>
              <Link to="/expense-categories" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Expense
              </Link>
            </li>
          )}
          {hasAccess('charges') && (
            <li>
              <Link to="/charges" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Charges
              </Link>
            </li>
          )}
          {hasAccess('checks') && (
            <li>
              <Link to="/reports/check-generator" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Checks
              </Link>
            </li>
          )}
          {hasAccess('deposit') && (
            <li>
              <Link to="/deposit-dropdown" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Deposit
              </Link>
            </li>
          )}
          {hasAccess('bank') && (
            <li>
              <Link to="/bank-dropdown" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Bank
              </Link>
            </li>
          )}
          {hasAccess('admin') && (
            <li>
              <Link to="/admin/users" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Administrator
              </Link>
            </li>
          )}
          {hasAccess('reports') && (
            <li>
              <Link to="/reports" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Reports
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        {currentUser ? (
          <div>
            <div className="text-sm mb-2">{currentUser.name || currentUser.username}</div>
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="block w-full px-3 py-2 text-center rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            Login
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Navigation;