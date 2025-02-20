import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TotalDonationReport = () => {
  const [totalAmount, setTotalAmount] = useState(0);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalDonations = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/reports/donations/total`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTotalAmount(response.data.totalAmount);
        setDonations(response.data.donations);
      } catch (error) {
        console.error('Error fetching total donation report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalDonations();
  }, []);

  return (
    <div>
      <h2>Total Donations: {totalAmount}</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Member</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {donations.map(donation => (
            <tr key={donation.id}>
              <td>{new Date(donation.donationDate).toLocaleDateString()}</td>
              <td>{`${donation.member.firstName} ${donation.member.lastName}`}</td>
              <td>{donation.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TotalDonationReport;
