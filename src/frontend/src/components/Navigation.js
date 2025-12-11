import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Check permissions based on user level
  const hasAccess = (accessType) => {
    if (!currentUser) return false;

    // Super admin can access everything
    if (currentUser.role === 'admin') return true;

    // Otherwise check direct user permissions
    switch (accessType) {
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
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 focus:outline-none"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-gray-800 text-white min-h-screen flex flex-col
        fixed md:relative z-50 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-700">
          <Link to="/" className="text-xl font-bold block hover:text-gray-300" onClick={closeMobileMenu}>
            Church Management
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="py-2">
            {hasAccess('member') && (
              <li>
                <Link to="/member-lookup" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={closeMobileMenu}>
                  Member
                </Link>
              </li>
            )}
            {hasAccess('visitor') && (
              <li>
                <Link to="/visitor-lookup" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={closeMobileMenu}>
                  Visitor
                </Link>
              </li>
            )}
            {hasAccess('vendor') && (
              <li>
                <Link to="/vendor" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={closeMobileMenu}>
                  Vendor
                </Link>
              </li>
            )}
            {hasAccess('group') && (
              <li>
                <Link to="/group-lookup" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={closeMobileMenu}>
                  Group
                </Link>
              </li>
            )}
            {hasAccess('donation') && (
              <li>
                <Link to="/donation-lookup" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={closeMobileMenu}>
                  Donation
                </Link>
              </li>
            )}
            {hasAccess('donation') && (
              <li>
                <Link to="/donation-types-dropdown" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={closeMobileMenu}>
                  Donation Types
                </Link>
              </li>
            )}
            {hasAccess('expense') && (
              <li>
                <Link to="/expense-categories" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={closeMobileMenu}>
                  Expense
                </Link>
              </li>
            )}
            {hasAccess('charges') && (
              <li>
                <Link to="/charges" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={closeMobileMenu}>
                  Charges
                </Link>
              </li>
            )}
            {hasAccess('checks') && (
              <li>
                <Link to="/reports/check-generator" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={closeMobileMenu}>
                  Checks
                </Link>
              </li>
            )}
            {hasAccess('deposit') && (
              <li>
                <Link to="/deposit-dropdown" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={closeMobileMenu}>
                  Deposit
                </Link>
              </li>
            )}
            {hasAccess('bank') && (
              <li>
                <Link to="/bank-dropdown" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={closeMobileMenu}>
                  Bank
                </Link>
              </li>
            )}
            {hasAccess('admin') && (
              <li>
                <Link to="/admin/users" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={closeMobileMenu}>
                  Administrator
                </Link>
              </li>
            )}
            {hasAccess('reports') && (
              <li>
                <Link to="/reports" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={closeMobileMenu}>
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
              onClick={closeMobileMenu}
            >
              Login
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navigation;