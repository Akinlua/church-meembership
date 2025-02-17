import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PageLoader } from '../common/Loader';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalGroups: 0,
    recentDonations: [],
    upcomingBirthdays: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/dashboard/stats`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {loading ? (
        <PageLoader />
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-2">Total Members</h3>
              <p className="text-3xl">{stats.totalMembers}</p>
              <Link to="/members" className="text-blue-500 text-sm">View all members</Link>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-2">Total Groups</h3>
              <p className="text-3xl">{stats.totalGroups}</p>
              <Link to="/groups" className="text-blue-500 text-sm">View all groups</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Recent Donations</h3>
              <div className="space-y-2">
                {stats.recentDonations.map((donation) => (
                  <div key={donation.id} className="flex justify-between">
                    <span>{donation.member?.first_name} {donation.member?.last_name}</span>
                    <span>${parseFloat(donation.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Link to="/donations" className="text-blue-500 text-sm">View all donations</Link>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Upcoming Birthdays</h3>
              <div className="space-y-2">
                {stats.upcomingBirthdays.map((member) => (
                  <div key={member.id} className="flex justify-between">
                    <span>{member.first_name} {member.last_name}</span>
                    <span>{new Date(member.birthday).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
              <Link to="/members" className="text-blue-500 text-sm">View all members</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 