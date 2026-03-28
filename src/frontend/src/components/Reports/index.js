import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DonationReport from './DonationReport';
import MembershipReport from './MembershipReport';
import GroupReport from './GroupReport';
import GroupMembershipReport from './GroupMembershipReport';
import TotalDonationReport from './TotalDonationReport';
import DonationTypeSummaryReport from './DonationTypeSummaryReport';
import VisitorDonationReport from './VisitorDonationReport';
import SupporterDonationReport from './SupporterDonationReport';
import MaskedDateInput from '../common/MaskedDateInput';
import { PageLoader } from '../common/Loader';
import VendorsReport from './VendorsReport';
import ExpensesReport from './ExpensesReport';
import ChargesReport from './ChargesReport';
import DepositReport from './DepositReport';
import Select from 'react-select';

const Reports = ({ initialReport }) => {
  // ── All state declarations first ──
  const [activeReport, setActiveReport] = useState('');
  const [activeReport2, setActiveReport2] = useState('');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [reportData, setReportData] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberStatus, setMemberStatus] = useState('all');
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [supporters, setSupporters] = useState([]);
  const [selectedSupporter, setSelectedSupporter] = useState(null);
  const [loadingSupporters, setLoadingSupporters] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedRightOption, setSelectedRightOption] = useState('');

  // ── Static option lists ──
  // LEFT dropdown: report category
  const leftOptions = [
    { value: 'donationTypeSummary', label: 'Donation Type' },
    { value: 'groupMembership', label: 'Group Type' },
    { value: 'expenses', label: 'Expenses Type' },
    { value: 'deposits', label: 'Deposits' },
  ];

  // Full list used by renderReportContent
  const reportOptions = [
    { value: 'donationTypeSummary', label: 'Donation Type' },
    { value: 'groupMembership', label: 'Group Type' },
    { value: 'expenses', label: 'Expenses Type' },
    { value: 'deposits', label: 'Deposits' },
    { value: 'membership', label: 'Members' },
    { value: 'visitorDonations', label: 'Visitors', hasVisitorFilter: true },
    { value: 'supporterDonations', label: 'Supporters', hasSupporterFilter: true },
    { value: 'vendors', label: 'Vendors', hasVendorFilter: true },
    { value: 'memberDonations', label: 'Member Donations', hasMemberFilter: true },
    { value: 'groups', label: 'Groups', hasMemberFilter: false },
    { value: 'charges', label: 'Charges', hasMemberFilter: false },
  ];

  // MIDDLE dropdown: Members/Visitors/Vendors/Banks report types
  const middleOptions = [
    { value: 'membership', label: 'Members' },
    { value: 'supporterDonations', label: 'Supporters' },
    { value: 'visitorDonations', label: 'Visitors' },
    { value: 'vendors', label: 'Vendors' },
    { value: 'bankReport', label: 'Banks' },
  ];

  // Resolve active report: prefer whichever dropdown has a selection
  const effectiveReport = activeReport || activeReport2;

  const currentReportType = reportOptions.find(option => option.value === effectiveReport) || {};
  const showMemberFilter = !!currentReportType.hasMemberFilter;
  const showVendorFilter = !!currentReportType.hasVendorFilter;
  const showVisitorFilter = !!currentReportType.hasVisitorFilter;
  const showSupporterFilter = !!currentReportType.hasSupporterFilter;
  const showGroupFilter = false;

  const handleReportChange = (e) => {
    setActiveReport(e.target.value);
    if (e.target.value) setActiveReport2(''); // clear other report type
    setSelectedMember(null);
    setSelectedVendor(null);
    setSelectedVisitor(null);
    setSelectedSupporter(null);
    setSelectedGroup(null);
  };

  const handleReport2Change = (e) => {
    setActiveReport2(e.target.value);
    if (e.target.value) setActiveReport(''); // clear other report type
    setSelectedMember(null);
    setSelectedVendor(null);
    setSelectedVisitor(null);
    setSelectedSupporter(null);
    setSelectedGroup(null);
  };

  const handleRightOptionChange = (e) => {
    setSelectedRightOption(e.target.value);
    setSelectedMember(null);
    setSelectedVendor(null);
    setSelectedVisitor(null);
    setSelectedSupporter(null);
    setSelectedGroup(null);
  };

  // Sync when initialReport prop changes (navigation)
  useEffect(() => {
    if (initialReport && initialReport !== activeReport) {
      setActiveReport(initialReport);
      setSelectedMember(null);
      setSelectedVisitor(null);
      setSelectedSupporter(null);
      setSelectedVendor(null);
      setSelectedGroup(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReport]);

  // Check if current report type supports filters (now handled above)

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
    setReportData(null);
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

  const fetchVisitors = async () => {
    if (visitors.length > 0) return;
    try {
      setLoadingVisitors(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/visitors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVisitors(response.data.map(v => ({
        value: v.id,
        label: `${v.lastName}, ${v.firstName}`
      })));
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoadingVisitors(false);
    }
  };

  useEffect(() => {
    if (showVisitorFilter) {
      fetchVisitors();
    }
  }, [showVisitorFilter]);

  const fetchSupporters = async () => {
    if (supporters.length > 0) return;
    try {
      setLoadingSupporters(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/supporters`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSupporters(response.data.map(s => ({
        value: s.id,
        label: `${s.lastName}, ${s.firstName}`
      })));
    } catch (error) {
      console.error('Error fetching supporters:', error);
    } finally {
      setLoadingSupporters(false);
    }
  };

  useEffect(() => {
    if (showSupporterFilter) {
      fetchSupporters();
    }
  }, [showSupporterFilter]);

  const fetchGroups = async () => {
    if (groups.length > 0) return;
    try {
      setLoadingGroups(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGroups(response.data.map(g => ({
        value: g.id,
        label: g.name
      })));
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (showGroupFilter) {
      fetchGroups();
    }
  }, [showGroupFilter]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const endpoint = `/reports/${effectiveReport}`;
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (selectedMember) params.append('memberId', selectedMember.value);
      if (selectedVendor) params.append('vendorId', selectedVendor.value);
      if (selectedVisitor) params.append('visitorId', selectedVisitor.value);
      if (selectedSupporter) params.append('supporterId', selectedSupporter.value);
      if (selectedGroup) params.append('groupId', selectedGroup.value);
      if (effectiveReport === 'membership') {
        params.append('memberStatus', memberStatus);
      }
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}${endpoint}?${params}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setReportData(response.data);
    } catch (error) {
      console.error(`Error generating ${effectiveReport} report:`, error);
    } finally {
      setLoading(false);
    }
  };

  const printReport = async () => {
    try {
      setLoading(true);
      const endpoint = `/reports/${effectiveReport}/pdf`;
      const requestData = { startDate: dateRange.startDate, endDate: dateRange.endDate };
      if (selectedMember) requestData.memberId = selectedMember.value;
      if (selectedVendor) requestData.vendorId = selectedVendor.value;
      if (selectedVisitor) requestData.visitorId = selectedVisitor.value;
      if (selectedSupporter) requestData.supporterId = selectedSupporter.value;
      if (selectedGroup) requestData.groupId = selectedGroup.value;
      if (effectiveReport === 'membership') requestData.memberStatus = memberStatus;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}${endpoint}`,
        requestData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow.print();
      };
    } catch (error) {
      console.error(`Error printing ${effectiveReport} report:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Clear report data when either report type changes
  useEffect(() => { setReportData(null); }, [activeReport, activeReport2]);

  const renderReportContent = () => {
    switch (effectiveReport) {
      case 'memberDonations':
        return <DonationReport reportData={reportData} />;
      case 'visitorDonations':
        return <VisitorDonationReport reportData={reportData} />;
      case 'supporterDonations':
        return <SupporterDonationReport reportData={reportData} />;
      case 'donations':
        return <DonationReport reportData={reportData} />;
      case 'membership':
        return <MembershipReport reportData={reportData} />;
      case 'groups':
        return <GroupReport reportData={reportData} />;
      case 'groupMembership':
        return <GroupMembershipReport reportData={reportData} />;
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
    <div className="container reports-container mx-auto px-4 py-6">
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
              useCurrentDateAsDefault={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <MaskedDateInput
              value={dateRange.endDate}
              onChange={(date) => handleDateChange('endDate', date)}
              inputClassName="rounded-md px-3 py-2"
              useCurrentDateAsDefault={true}
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
            <Select
              options={leftOptions}
              value={leftOptions.find(o => o.value === activeReport) || null}
              onChange={(selected) => handleReportChange({ target: { value: selected ? selected.value : '' } })}
              placeholder=""
              isSearchable
              className="w-48"
              styles={{
                control: (base) => ({
                  ...base,
                  height: '40px',
                  minHeight: '40px'
                })
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <Select
              options={middleOptions}
              value={middleOptions.find(o => o.value === activeReport2) || null}
              onChange={(selected) => handleReport2Change({ target: { value: selected ? selected.value : '' } })}
              placeholder=""
              isSearchable
              className="w-48"
              styles={{
                control: (base) => ({
                  ...base,
                  height: '40px',
                  minHeight: '40px'
                })
              }}
            />
          </div>



          {showMemberFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member (Optional)</label>
              <Select
                options={members}
                value={selectedMember}
                onChange={setSelectedMember}
                placeholder=""
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
              <Select
                options={[
                  { value: 'all', label: 'All Members' },
                  { value: 'active', label: 'Active Only' },
                  { value: 'inactive', label: 'Inactive Only' }
                ]}
                value={[
                  { value: 'all', label: 'All Members' },
                  { value: 'active', label: 'Active Only' },
                  { value: 'inactive', label: 'Inactive Only' }
                ].find(o => o.value === memberStatus) || { value: 'all', label: 'All Members' }}
                onChange={(selected) => handleMemberStatusChange({ target: { value: selected.value } })}
                placeholder=""
                isSearchable={false}
                className="w-48"
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

          {showVendorFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor (Optional)</label>
              <Select
                options={vendors}
                value={selectedVendor}
                onChange={setSelectedVendor}
                placeholder=""
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

          {showVisitorFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visitor (Optional)</label>
              <Select
                options={visitors}
                value={selectedVisitor}
                onChange={setSelectedVisitor}
                placeholder=""
                isClearable
                isSearchable
                isLoading={loadingVisitors}
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

          {showSupporterFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supporter (Optional)</label>
              <Select
                options={supporters}
                value={selectedSupporter}
                onChange={setSelectedSupporter}
                placeholder=""
                isClearable
                isSearchable
                isLoading={loadingSupporters}
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

          {showGroupFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group (Optional)</label>
              <Select
                options={groups}
                value={selectedGroup}
                onChange={setSelectedGroup}
                placeholder=""
                isClearable
                isSearchable
                isLoading={loadingGroups}
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
            {reportOptions.find(option => option.value === effectiveReport)?.label || 'Report'}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <PageLoader />
          </div>
        ) : reportData ? (
          renderReportContent()
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-lg font-medium">No Report Generated</p>
            <p className="text-sm mt-1">Select your filters and click &quot;View&quot; to display the report.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;