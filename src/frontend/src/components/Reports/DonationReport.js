import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePickerField from '../common/DatePickerField';
import { PageLoader } from '../common/Loader';

const DonationReport = () => {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const handleDateChange = (type, date) => {
    setDateRange(prev => ({
      ...prev,
      [type]: date
    }));
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/donations?${params}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching donation report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadTypeSummaryPDF = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/reports/donations/type-summary/pdf`,
        {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'donation-type-summary-report.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading type summary PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const generatePDF = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/reports/donations/pdf`,
        {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `donation-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Report Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Donation Report</h2>
      </div>

      {/* Filter Controls */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="w-full md:w-auto">
            <DatePickerField
              label="Start Date"
              value={dateRange.startDate}
              onChange={(date) => handleDateChange('startDate', date)}
              dateFormat="MM/dd/yyyy"
              className="w-full"
            />
          </div>
          
          <div className="w-full md:w-auto">
            <DatePickerField
              label="End Date"
              value={dateRange.endDate}
              onChange={(date) => handleDateChange('endDate', date)}
              dateFormat="MM/dd/yyyy"
              className="w-full"
            />
          </div>
          
          <button 
            onClick={fetchReport}
            className="px-4 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Generate Report
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <button 
            onClick={generatePDF} 
            className="px-4 py-2.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Donation Report PDF
          </button>
          
          <button 
            onClick={downloadTypeSummaryPDF} 
            className="px-4 py-2.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Type Report PDF
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <PageLoader />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Member
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData?.donations?.length ? (
                  reportData.donations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(donation.donationDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {`${donation.member.firstName} ${donation.member.lastName}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {donation.donationType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-medium">
                        {formatCurrency(donation.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500">
                      No donation data available
                    </td>
                  </tr>
                )}
                {reportData?.donations?.length > 0 && (
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={3} className="px-6 py-4 text-right text-sm text-gray-800">
                      Total:
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-800 font-bold">
                      {formatCurrency(reportData?.total || 0)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {reportData?.totals && Object.keys(reportData.totals).length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Summary by Donation Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(reportData.totals).map(([type, amount]) => (
                <div key={type} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">{type}</div>
                  <div className="text-lg font-semibold text-gray-800">{formatCurrency(amount)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationReport; 