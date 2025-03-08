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

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {isAuthenticated && <Navigation />}
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/members" element={<PrivateRoute><Members /></PrivateRoute>} />
          <Route path="/member-lookup" element={<PrivateRoute><MemberDropdown /></PrivateRoute>} />
          <Route path="/groups" element={<PrivateRoute><Groups /></PrivateRoute>} />
          <Route path="/donations" element={<PrivateRoute><Donations /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/donation-types" element={<DonationTypeList />} />
        </Routes>
      </div>
    </div>
  );
}

export default App; 