import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DonationTypeSummaryReport = () => {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonationTypeSummary = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/reports/donations/type-summary`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSummary(response.data.summary);
      } catch (error) {
        console.error('Error fetching donation type summary report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonationTypeSummary();
  }, []);

  const downloadPDF = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/reports/donations/type-summary/pdf`,
        {},
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
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <div>
      <h2>Donation Type Summary</h2>
      <button onClick={downloadPDF} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Download Type Report PDF
      </button>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(summary).map(([type, amount]) => (
            <tr key={type}>
              <td>{type}</td>
              <td>{amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DonationTypeSummaryReport;
