import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DonationReport from './DonationReport';
import MembershipReport from './MembershipReport';
import GroupReport from './GroupReport';
import TotalDonationReport from './TotalDonationReport';
import DonationTypeSummaryReport from './DonationTypeSummaryReport';
import MaskedDateInput from '../common/MaskedDateInput';
import { PageLoader } from '../common/Loader';
import VendorsReport from './VendorsReport';
import ExpensesReport from './ExpensesReport';
import ChargesReport from './ChargesReport';
import DepositReport from './DepositReport';
import Select from 'react-select';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('donations');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [reportData, setReportData] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberStatus, setMemberStatus] = useState('all');
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loadingVendors, setLoadingVendors] = useState(false);

  const reportOptions = [
    { value: 'donations', label: 'Donations', hasMemberFilter: true },
    { value: 'membership', label: 'Membership', hasMemberFilter: false },
    { value: 'groups', label: 'Groups', hasMemberFilter: false },
    // { value: 'totalDonations', label: 'Total Donations', hasMemberFilter: true },
    { value: 'donationTypeSummary', label: 'Donation Type Summary', hasMemberFilter: false },
    { value: 'vendors', label: 'Vendors', hasVendorFilter: true },
    { value: 'expenses', label: 'Expenses', hasMemberFilter: false },
    { value: 'charges', label: 'Charges', hasMemberFilter: false },
    { value: 'deposits', label: 'Deposits', hasMemberFilter: false }
  ];

  // Check if current report type supports member filtering
  const currentReportType = reportOptions.find(option => option.value === activeReport);
  const showMemberFilter = currentReportType?.hasMemberFilter || false;
  const showVendorFilter = currentReportType?.hasVendorFilter || false;

  const handleReportChange = (e) => {
    setActiveReport(e.target.value);
    setSelectedMember(null); // Reset member selection when report type changes
    setSelectedVendor(null); // Reset vendor selection when report type changes
  };

  const handleDateChange = (type, date) => {
    setDateRange(prev => ({
      ...prev,
      [type]: date
    }));
  };

  const clearDates = () => {
    setDateRange({
      startDate: null,
      endDate: null
    });
    generateReport();
  };

  const fetchMembers = async () => {
    if (members.length > 0) return; // Don't fetch if we already have members
    
    try {
      setLoadingMembers(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setMembers(response.data.map(member => ({
        value: member.id,
        label: `${member.lastName}, ${member.firstName}`
      })));
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Fetch members when needed
  useEffect(() => {
    if (showMemberFilter) {
      fetchMembers();
    }
  }, [showMemberFilter]);

  const handleMemberStatusChange = (e) => {
    setMemberStatus(e.target.value);
  };

  const fetchVendors = async () => {
    if (vendors.length > 0) return; // Don't fetch if we already have vendors
    
    try {
      setLoadingVendors(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/vendors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setVendors(response.data.map(vendor => ({
        value: vendor.id,
        label: vendor.lastName
      })));
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoadingVendors(false);
    }
  };

  // Fetch vendors when needed
  useEffect(() => {
    if (showVendorFilter) {
      fetchVendors();
    }
  }, [showVendorFilter]);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Different API endpoints based on report type
      const endpoint = `/reports/${activeReport}`;
      
      // Build query parameters
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (selectedMember) params.append('memberId', selectedMember.value);
      if (selectedVendor) params.append('vendorId', selectedVendor.value);
      
      // Add member status for membership reports
      if (activeReport === 'membership') {
        params.append('memberStatus', memberStatus);
      }
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}${endpoint}?${params}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      setReportData(response.data);
    } catch (error) {
      console.error(`Error generating ${activeReport} report:`, error);
    } finally {
      setLoading(false);
    }
  };

  const printReport = async () => {
    try {
      setLoading(true);
      const endpoint = `/reports/${activeReport}/pdf`;
      
      const requestData = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      
      if (selectedMember) {
        requestData.memberId = selectedMember.value;
      }
      
      if (selectedVendor) {
        requestData.vendorId = selectedVendor.value;
      }
      
      // Add member status for membership reports
      if (activeReport === 'membership') {
        requestData.memberStatus = memberStatus;
      }
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}${endpoint}`,
        requestData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeReport}-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Error printing ${activeReport} report:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Generate report when report type changes
  useEffect(() => {
    if (activeReport) {
      generateReport();
    }
  }, [activeReport]);

  const renderReportContent = () => {
    switch (activeReport) {
      case 'donations':
        return <DonationReport reportData={reportData} />;
      case 'membership':
        return <MembershipReport reportData={reportData} />;
      case 'groups':
        return <GroupReport reportData={reportData} />;
      case 'totalDonations':
        return <TotalDonationReport reportData={reportData} />;
      case 'donationTypeSummary':
        return <DonationTypeSummaryReport reportData={reportData} />;
      case 'vendors':
        return <VendorsReport reportData={reportData} />;
      case 'expenses':
        return <ExpensesReport reportData={reportData} />;
      case 'charges':
        return <ChargesReport reportData={reportData} />;
      case 'deposits':
        return <DepositReport reportData={reportData} />;
      default:
        return <div className="p-6 text-center text-gray-500">Select a report type</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Reports</h1>
      
      {/* Compact layout with dates and buttons in a single row */}
      <div className="mb-6">
        <div className="flex flex-wrap items-end gap-2 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <MaskedDateInput
              value={dateRange.startDate}
              onChange={(date) => handleDateChange('startDate', date)}
              inputClassName="rounded-md px-3 py-2"
              useCurrentDateAsDefault={false}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <MaskedDateInput
              value={dateRange.endDate}
              onChange={(date) => handleDateChange('endDate', date)}
              inputClassName="rounded-md px-3 py-2"
              useCurrentDateAsDefault={false}
            />
          </div>
          
          <button
            onClick={clearDates}
            className="h-10 px-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={generateReport}
            className="h-10 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View
          </button>
          
          <button
            onClick={printReport}
            className="h-10 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Print
          </button>
        </div>
        
        <div className="flex flex-wrap items-end gap-2 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={activeReport}
              onChange={handleReportChange}
              className="border border-gray-300 rounded-md px-3 py-2 h-10"
            >
              {reportOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {showMemberFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member (Optional)</label>
              <Select
                options={members}
                value={selectedMember}
                onChange={setSelectedMember}
                placeholder="Select Member"
                isClearable
                isSearchable
                isLoading={loadingMembers}
                className="w-64"
                styles={{
                  control: (base) => ({
                    ...base,
                    height: '40px',
                    minHeight: '40px'
                  })
                }}
              />
            </div>
          )}
          
          {activeReport === 'membership' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Status</label>
              <select
                value={memberStatus}
                onChange={handleMemberStatusChange}
                className="border border-gray-300 rounded-md px-3 py-2 h-10"
              >
                <option value="all">All Members</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          )}
          
          {showVendorFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor (Optional)</label>
              <Select
                options={vendors}
                value={selectedVendor}
                onChange={setSelectedVendor}
                placeholder="Select Vendor"
                isClearable
                isSearchable
                isLoading={loadingVendors}
                className="w-64"
                styles={{
                  control: (base) => ({
                    ...base,
                    height: '40px',
                    minHeight: '40px'
                  })
                }}
              />
            </div>
          )}
          
        </div>
      </div>
      
      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {reportOptions.find(option => option.value === activeReport)?.label || 'Report'}
          </h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <PageLoader />
          </div>
        ) : (
          renderReportContent()
        )}
      </div>
    </div>
  );
};

export default Reports; 