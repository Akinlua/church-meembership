import React, { useState } from 'react';
import DonationReport from './DonationReport';
import MembershipReport from './MembershipReport';
import GroupReport from './GroupReport';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('donations');

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="space-x-2">
          <button
            onClick={() => setActiveReport('donations')}
            className={`px-4 py-2 rounded ${
              activeReport === 'donations' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Donations
          </button>
          <button
            onClick={() => setActiveReport('membership')}
            className={`px-4 py-2 rounded ${
              activeReport === 'membership' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Membership
          </button>
          <button
            onClick={() => setActiveReport('groups')}
            className={`px-4 py-2 rounded ${
              activeReport === 'groups' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      {activeReport === 'donations' && <DonationReport />}
      {activeReport === 'membership' && <MembershipReport />}
      {activeReport === 'groups' && <GroupReport />}
    </div>
  );
};

export default Reports; 