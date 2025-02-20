import React, { useState } from 'react';
import DonationReport from './DonationReport';
import MembershipReport from './MembershipReport';
import GroupReport from './GroupReport';
import TotalDonationReport from './TotalDonationReport';
import DonationTypeSummaryReport from './DonationTypeSummaryReport';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('donations');
  const [loading, setLoading] = useState(false);

  const handleDownload = async (reportType) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="space-x-2">
          <button
            onClick={() => { setActiveReport('donations'); handleDownload('donation'); }}
            className={`px-4 py-2 rounded ${activeReport === 'donations' ? 'bg-blue-500 text-white' : 'bg-gray-200'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Donations'}
          </button>
          <button
            onClick={() => { setActiveReport('membership'); handleDownload('membership'); }}
            className={`px-4 py-2 rounded ${activeReport === 'membership' ? 'bg-blue-500 text-white' : 'bg-gray-200'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Membership'}
          </button>
          <button
            onClick={() => { setActiveReport('groups'); handleDownload('groups'); }}
            className={`px-4 py-2 rounded ${activeReport === 'groups' ? 'bg-blue-500 text-white' : 'bg-gray-200'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Groups'}
          </button>
          {/* <button
            onClick={() => setActiveReport('totalDonations')}
            className={`px-4 py-2 rounded ${
              activeReport === 'totalDonations' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Total Donations
          </button>
          <button
            onClick={() => setActiveReport('donationTypeSummary')}
            className={`px-4 py-2 rounded ${
              activeReport === 'donationTypeSummary' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Donation Type Summary
          </button> */}
        </div>
      </div>

      {activeReport === 'donations' && <DonationReport />}
      {activeReport === 'membership' && <MembershipReport />}
      {activeReport === 'groups' && <GroupReport />}
      {activeReport === 'totalDonations' && <TotalDonationReport />}
      {activeReport === 'donationTypeSummary' && <DonationTypeSummaryReport />}
    </div>
  );
};

export default Reports; 