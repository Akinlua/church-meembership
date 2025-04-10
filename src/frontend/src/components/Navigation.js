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
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold">
              Church Management
            </Link>
            
            {hasAccess('member') && (
              <Link to="/member-lookup" className="hover:text-gray-300">
                Member
              </Link>
            )}              
            {hasAccess('visitor') && (
              <Link to="/visitor-lookup" className="hover:text-gray-300">
                Visitor
              </Link>
            )}
            
            {hasAccess('vendor') && (
              <Link to="/vendor" className="hover:text-gray-300">
                Vendor
              </Link>
            )}
            
            {hasAccess('group') && (
              <Link to="/group-lookup" className="hover:text-gray-300">
                Group
              </Link>
            )}
            
            {hasAccess('donation') && (
              <Link to="/donation-lookup" className="hover:text-gray-300">
                Donation
              </Link>
            )}

            {hasAccess('donation') && (
              <Link to="/donation-types-dropdown" className="hover:text-gray-300">
              Donation Types
              </Link>   
            )}

                  
            {hasAccess('expense') && (
              <Link to="/expense-categories" className="hover:text-gray-300">
                Expense
              </Link>
            )}
            {hasAccess('charges') && (
              <Link to="/charges" className="hover:text-gray-300">
                Charges
              </Link>
            )}           
            
            {hasAccess('checks') && (
            <Link to="/reports/check-generator" className="hover:text-gray-300">
                Checks
              </Link>
            )}

            {hasAccess('deposit') && (
              <Link to="/deposit-dropdown" className="hover:text-gray-300">
                Deposit
              </Link>
            )}
            {hasAccess('bank') && (
              <Link to="/bank-dropdown" className="hover:text-gray-300">
                Bank
              </Link>
            )}
            
            {hasAccess('admin') && (
               <Link to="/admin/users" className="hover:text-gray-300">
                Administrator
             </Link>
            )}
            
            {hasAccess('reports') && (
              <Link to="/reports" className="hover:text-gray-300">
                Reports
              </Link>
            )}
          </div>
          
          <div className="flex items-center">
            {currentUser ? (
              <>
                <span className="mr-4 text-sm">
                  {currentUser.name || currentUser.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 