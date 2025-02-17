import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePickerField from '../common/DatePickerField';
import { PageLoader } from '../common/Loader';


const DonationReport = () => {
  const [donations, setDonations] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);
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
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Donation Report</h2>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <DatePickerField
            label="Start Date"
            value={dateRange.startDate}
            onChange={(date) => handleDateChange('startDate', date)}
            dateFormat="MM/dd/yyyy"
          />
          <DatePickerField
            label="End Date"
            value={dateRange.endDate}
            onChange={(date) => handleDateChange('endDate', date)}
            dateFormat="MM/dd/yyyy"
          />
          <button 
            onClick={fetchReport}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Generate Report
          </button>
        </div>
        <button 
          onClick={generatePDF} 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Download PDF
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <PageLoader />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData?.donations.map((donation) => (
                  <tr key={donation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(donation.donationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {`${donation.member.firstName} ${donation.member.lastName}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {donation.donationType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {formatCurrency(donation.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={3} className="px-6 py-4 text-right">
                    Total:
                  </td>
                  <td className="px-6 py-4 text-right">
                    {formatCurrency(reportData?.total || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Summary by Donation Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(reportData?.totals || {}).map(([type, amount]) => (
                <div key={type} className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-500">{type}</div>
                  <div className="text-lg font-semibold">{formatCurrency(amount)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DonationReport; 