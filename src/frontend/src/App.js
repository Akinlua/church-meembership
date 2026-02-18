import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

// Layout component with left sidebar navigation
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <Navigation />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <AuthProvider>
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
          <Route path="/groups" element={<PrivateRoute><Layout><Groups /></Layout></PrivateRoute>} />
          <Route path="/group-lookup" element={<PrivateRoute><Layout><GroupDropdown /></Layout></PrivateRoute>} />
          <Route path="/donations" element={<PrivateRoute><Layout><Donations /></Layout></PrivateRoute>} />
          <Route path="/donation-lookup" element={<PrivateRoute><Layout><DonationDropdown /></Layout></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Layout><Reports /></Layout></PrivateRoute>} />
          <Route path="/reports/member-donations"  element={<PrivateRoute><Layout><Reports initialReport="memberDonations" /></Layout></PrivateRoute>} />
          <Route path="/reports/visitor-donations" element={<PrivateRoute><Layout><Reports initialReport="visitorDonations" /></Layout></PrivateRoute>} />
          <Route path="/reports/donations"         element={<PrivateRoute><Layout><Reports initialReport="donations" /></Layout></PrivateRoute>} />
          <Route path="/reports/membership"        element={<PrivateRoute><Layout><Reports initialReport="membership" /></Layout></PrivateRoute>} />
          <Route path="/reports/groups"            element={<PrivateRoute><Layout><Reports initialReport="groups" /></Layout></PrivateRoute>} />
          <Route path="/reports/type-summary"      element={<PrivateRoute><Layout><Reports initialReport="donationTypeSummary" /></Layout></PrivateRoute>} />
          <Route path="/reports/vendors"           element={<PrivateRoute><Layout><Reports initialReport="vendors" /></Layout></PrivateRoute>} />
          <Route path="/reports/expenses"          element={<PrivateRoute><Layout><Reports initialReport="expenses" /></Layout></PrivateRoute>} />
          <Route path="/reports/charges"           element={<PrivateRoute><Layout><Reports initialReport="charges" /></Layout></PrivateRoute>} />
          <Route path="/reports/deposits"          element={<PrivateRoute><Layout><Reports initialReport="deposits" /></Layout></PrivateRoute>} />
          <Route path="/reports/check-generator" element={
            <PrivateRoute>
              <Layout><CheckGenerator /></Layout>
            </PrivateRoute>
          } />
          <Route path="/visitors" element={<PrivateRoute><Layout><Visitors /></Layout></PrivateRoute>} />
          <Route path="/visitor-lookup" element={<PrivateRoute><Layout><VisitorDropdown /></Layout></PrivateRoute>} />
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
    </AuthProvider>
  );
}

export default App;