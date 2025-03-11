import React, { useState } from 'react';
import DonationReport from './DonationReport';
import MembershipReport from './MembershipReport';
import GroupReport from './GroupReport';
import TotalDonationReport from './TotalDonationReport';
import DonationTypeSummaryReport from './DonationTypeSummaryReport';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('donations');
  const [loading, setLoading] = useState(false);
  const [loadingTypeReport, setLoadingTypeReport] = useState(false);

  const handleReportChange = (reportType) => {
    setActiveReport(reportType);
  };

  const handleDownload = async (reportType) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  const handleDownloadTypeReport = async () => {
    setLoadingTypeReport(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoadingTypeReport(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Reports</h1>
        
        {/* Report Type Selection */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700">Select Report Type</h2>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleReportChange('donations')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeReport === 'donations' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Donations
              </button>
              
              <button
                onClick={() => handleReportChange('membership')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeReport === 'membership' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Membership
              </button>
              
              <button
                onClick={() => handleReportChange('groups')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeReport === 'groups' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Groups
              </button>
              
              {/* <button
                onClick={() => handleReportChange('totalDonations')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeReport === 'totalDonations' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Total Donations
              </button>
              
              <button
                onClick={() => handleReportChange('donationTypeSummary')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeReport === 'donationTypeSummary' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Donation Type Summary
              </button> */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Report Content */}
      {/* <div className="bg-white rounded-lg shadow-md"> */}
        {/* <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {activeReport === 'donations' && 'Donation Report'}
            {activeReport === 'membership' && 'Membership Report'}
            {activeReport === 'groups' && 'Group Report'}
            {activeReport === 'totalDonations' && 'Total Donations Report'}
            {activeReport === 'donationTypeSummary' && 'Donation Type Summary Report'}
          </h2>
        </div> */}
        
        <div className="p-5">
          {activeReport === 'donations' && <DonationReport />}
          {activeReport === 'membership' && <MembershipReport />}
          {activeReport === 'groups' && <GroupReport />}
          {/* {activeReport === 'totalDonations' && <TotalDonationReport />}
          {activeReport === 'donationTypeSummary' && <DonationTypeSummaryReport />} */}
        </div>
      </div>
    // </div>
  );
};

export default Reports; 