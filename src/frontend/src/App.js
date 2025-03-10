import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/members" element={<PrivateRoute><Members /></PrivateRoute>} />
          <Route path="/member-lookup" element={<PrivateRoute><MemberDropdown /></PrivateRoute>} />
          <Route path="/groups" element={<PrivateRoute><Groups /></PrivateRoute>} />
          <Route path="/group-lookup" element={<PrivateRoute><GroupDropdown /></PrivateRoute>} />
          <Route path="/donations" element={<PrivateRoute><Donations /></PrivateRoute>} />
          <Route path="/donation-lookup" element={<PrivateRoute><DonationDropdown /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
          <Route path="/visitors" element={<PrivateRoute><Visitors /></PrivateRoute>} />
          <Route path="/visitor-lookup" element={<PrivateRoute><VisitorDropdown /></PrivateRoute>} />
          <Route path="/vendor" element={<PrivateRoute><VendorDropdown /></PrivateRoute>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/donation-types" element={<PrivateRoute><DonationTypeList /></PrivateRoute>} />
          <Route path="/expense-categories" element={<PrivateRoute><ExpenseCategoryDropdown /></PrivateRoute>} />
          <Route path="/charges" element={<PrivateRoute><ChargeDropdown /></PrivateRoute>} />
          <Route path="/donation-types-dropdown" element={<PrivateRoute><DonationTypeDropdown /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default App; 