import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute, PasswordChangeRoute } from './components/ProtectedRoute';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Groups from './components/Groups';
import Donations from './components/Donations';
import Reports from './components/Reports';
import Navigation from './components/Navigation';
import PrivateRoute from './components/PrivateRoute';
import Signup from './components/Signup';
import { useAuth } from './contexts/AuthContext';
import DonationTypeList from './components/Donations/DonationTypeList';
import MemberDropdown from './components/Members/MemberDropdown';
import Visitors from './components/Visitors';
import VisitorDropdown from './components/Visitors/VisitorDropdown';
import VendorDropdown from './components/Vendors/VendorDropdown';
import GroupDropdown from './components/Groups/GroupDropdown';
import GroupMembershipForm from './components/Groups/GroupMembershipForm';
import DonationDropdown from './components/Donations/DonationDropdown';
import ExpenseCategoryDropdown from './components/Expenses/ExpenseCategoryDropdown';
import ChargeDropdown from './components/Charges/ChargeDropdown';
import DonationTypeDropdown from './components/Donations/DonationTypeDropdown';
import BankDropdown from './components/Banks/BankDropdown';
import DepositDropdown from './components/Deposits/DepositDropdown';
import Deposits from './components/Deposits';
import ChangePassword from './components/ChangePassword';
import UserManagement from './components/UserManagement';
import CheckGenerator from './components/Reports/CheckGenerator';
import MemberFormPage from './components/Forms/MemberFormPage';
import VisitorFormPage from './components/Forms/VisitorFormPage';
import VisitorDonationEntry from './components/Visitors/VisitorDonationEntry';
import MemberDonationEntry from './components/Members/MemberDonationEntry';
import SupporterDropdown from './components/Supporters/SupporterDropdown';
import SupporterDonationEntry from './components/Supporters/SupporterDonationEntry';
import EventsCalendar from './components/Events/EventsCalendar';
import EmailCompose from './components/Communication/EmailCompose';
import SmsCompose from './components/Communication/SmsCompose';

// Detect if running inside Electron desktop app — Electron always sets its own user agent
const isElectron = navigator.userAgent.toLowerCase().includes('electron');

// Top bar shown only in Electron (no sidebar) with logout
const ElectronTopBar = () => {
  const { logout, currentUser } = useAuth();
  const nav = useNavigate();
  const handleLogout = () => { logout(); nav('/login'); };
  return (
    <div style={{ background: 'transparent', color: '#1f2937', padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontWeight: 600, fontSize: 14 }}>Church Membership</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {currentUser && <span style={{ fontSize: 13, color: '#4b5563' }}>{currentUser.name || currentUser.username}</span>}
        <button
          onClick={handleLogout}
          style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 14px', cursor: 'pointer', fontSize: 13 }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

// Layout component with left sidebar navigation
const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const showHomeCancelButton = location.pathname !== '/';

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Show logout top bar on Electron desktop app */}
      {isElectron && <ElectronTopBar />}
      <div className="flex flex-1">
        {/* Show left nav on web; on desktop the native OS menu replaces it */}
        {!isElectron && <Navigation />}
        <main className="flex-1 p-6 overflow-auto relative">
          {showHomeCancelButton && (
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label="Close and go home"
              className="absolute top-6 right-6 z-20 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 focus:outline-none"
            >
              x
            </button>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    let unlisten = null;

    if (window.electronAPI && window.electronAPI.onNavigate) {
      unlisten = window.electronAPI.onNavigate((route) => {
        if (route && isAuthenticated) {
          navigate(route);
        }
      });
    }

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [isAuthenticated, navigate]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Layout><Signup /></Layout>} />

      {/* Public Form Routes accessed via QR codes */}
      <Route path="/member-form" element={<MemberFormPage />} />
      <Route path="/visitor-form" element={<VisitorFormPage />} />

      {/* Password change route */}
      <Route element={<PasswordChangeRoute />}>
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/members" element={<PrivateRoute><Layout><Members /></Layout></PrivateRoute>} />
        <Route path="/member-lookup" element={<PrivateRoute><Layout><MemberDropdown /></Layout></PrivateRoute>} />
        <Route path="/member-donation-entry" element={<PrivateRoute><Layout><MemberDonationEntry /></Layout></PrivateRoute>} />
        <Route path="/groups" element={<PrivateRoute><Layout><Groups /></Layout></PrivateRoute>} />
        <Route path="/group-lookup" element={<PrivateRoute><Layout><GroupDropdown /></Layout></PrivateRoute>} />
        <Route path="/group-membership-form" element={<PrivateRoute><Layout><GroupMembershipForm /></Layout></PrivateRoute>} />
        <Route path="/events" element={<PrivateRoute><Layout><EventsCalendar /></Layout></PrivateRoute>} />
        <Route path="/communication/email" element={<PrivateRoute><Layout><EmailCompose /></Layout></PrivateRoute>} />
        <Route path="/communication/sms" element={<PrivateRoute><Layout><SmsCompose /></Layout></PrivateRoute>} />
        <Route path="/donations" element={<PrivateRoute><Layout><Donations /></Layout></PrivateRoute>} />
        <Route path="/donation-lookup" element={<PrivateRoute><Layout><DonationDropdown /></Layout></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Layout><Reports /></Layout></PrivateRoute>} />
        <Route path="/reports/member-donations" element={<PrivateRoute><Layout><Reports initialReport="memberDonations" /></Layout></PrivateRoute>} />
        <Route path="/reports/visitor-donations" element={<PrivateRoute><Layout><Reports initialReport="visitorDonations" /></Layout></PrivateRoute>} />
        <Route path="/reports/supporter-donations" element={<PrivateRoute><Layout><Reports initialReport="supporterDonations" /></Layout></PrivateRoute>} />
        <Route path="/reports/donations" element={<PrivateRoute><Layout><Reports initialReport="donations" /></Layout></PrivateRoute>} />
        <Route path="/reports/membership" element={<PrivateRoute><Layout><Reports initialReport="membership" /></Layout></PrivateRoute>} />
        <Route path="/reports/groups" element={<PrivateRoute><Layout><Reports initialReport="groups" /></Layout></PrivateRoute>} />
        <Route path="/reports/groupMembership" element={<PrivateRoute><Layout><Reports initialReport="groupMembership" /></Layout></PrivateRoute>} />
        <Route path="/reports/type-summary" element={<PrivateRoute><Layout><Reports initialReport="donationTypeSummary" /></Layout></PrivateRoute>} />
        <Route path="/reports/vendors" element={<PrivateRoute><Layout><Reports initialReport="vendors" /></Layout></PrivateRoute>} />
        <Route path="/reports/expenses" element={<PrivateRoute><Layout><Reports initialReport="expenses" /></Layout></PrivateRoute>} />
        <Route path="/reports/charges" element={<PrivateRoute><Layout><Reports initialReport="charges" /></Layout></PrivateRoute>} />
        <Route path="/reports/deposits" element={<PrivateRoute><Layout><Reports initialReport="deposits" /></Layout></PrivateRoute>} />
        <Route path="/reports/check-generator" element={
          <PrivateRoute>
            <Layout><CheckGenerator /></Layout>
          </PrivateRoute>
        } />
        <Route path="/visitors" element={<PrivateRoute><Layout><Visitors /></Layout></PrivateRoute>} />
        <Route path="/visitor-lookup" element={<PrivateRoute><Layout><VisitorDropdown /></Layout></PrivateRoute>} />
        <Route path="/visitor-donation-entry" element={<PrivateRoute><Layout><VisitorDonationEntry /></Layout></PrivateRoute>} />
        <Route path="/supporter-lookup" element={<PrivateRoute><Layout><SupporterDropdown /></Layout></PrivateRoute>} />
        <Route path="/supporter-donation-entry" element={<PrivateRoute><Layout><SupporterDonationEntry /></Layout></PrivateRoute>} />
        <Route path="/vendor" element={<PrivateRoute><Layout><VendorDropdown /></Layout></PrivateRoute>} />
        <Route path="/donation-types" element={<PrivateRoute><Layout><DonationTypeList /></Layout></PrivateRoute>} />
        <Route path="/expense-categories" element={<PrivateRoute><Layout><ExpenseCategoryDropdown /></Layout></PrivateRoute>} />
        <Route path="/charges" element={<PrivateRoute><Layout><ChargeDropdown /></Layout></PrivateRoute>} />
        <Route path="/donation-types-dropdown" element={<PrivateRoute><Layout><DonationTypeDropdown /></Layout></PrivateRoute>} />
        <Route path="/bank-dropdown" element={<PrivateRoute><Layout><BankDropdown /></Layout></PrivateRoute>} />
        <Route path="/deposit-dropdown" element={<PrivateRoute><Layout><DepositDropdown /></Layout></PrivateRoute>} />
      </Route>

      {/* Admin routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin/users" element={<Layout><UserManagement /></Layout>} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;