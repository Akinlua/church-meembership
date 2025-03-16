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
    
    // Otherwise check user level permissions
    if (!currentUser.userLevel) return false;
    
    // Check specific access type
    switch(accessType) {
      case 'member':
        return currentUser.userLevel.memberAccess;
      case 'visitor':
        return currentUser.userLevel.visitorAccess;
      case 'vendor':
        return currentUser.userLevel.vendorAccess;
      case 'group':
        return currentUser.userLevel.groupAccess;
      case 'donation':
        return currentUser.userLevel.donationAccess;
      case 'admin':
        return currentUser.userLevel.adminAccess;
      case 'expense':
        return currentUser.userLevel.expenseAccess;
      case 'charges':
        return currentUser.userLevel.chargesAccess;
      case 'reports':
        return currentUser.userLevel.reportsAccess;
      case 'deposit':
        return currentUser.userLevel.depositAccess;
      case 'bank':
        return currentUser.userLevel.bankAccess;
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

            {hasAccess('reports') && (
              // <div className="relative group">
              //   <button className="hover:text-gray-300 flex items-center">
              //     Reports <span className="ml-1">▼</span>
              //   </button>
              //   <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  
              //     {/* Add other report links as needed */}
              //   </div>
              // </div>
              <Link to="/reports" className="hover:text-gray-300">
                    Reports
              </Link>                  
            )} 
            {hasAccess('reports') && (
            <Link to="/reports/check-generator" className="hover:text-gray-300">
                Check Generator
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
                User Management
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