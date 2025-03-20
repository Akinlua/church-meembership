import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PageLoader } from '../common/Loader';
import { ProgramOwnerForm, ProgramOwnerDetails } from '../ProgramOwner';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalGroups: 0,
    recentDonations: [],
    upcomingBirthdays: []
  });
  const [programOwner, setProgramOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProgramOwnerForm, setShowProgramOwnerForm] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    fetchProgramOwner();
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

  const fetchProgramOwner = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/program-owner`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setProgramOwner(response.data);
    } catch (error) {
      console.error('Error fetching program owner details:', error);
    }
  };

  const handleSaveProgramOwner = (data) => {
    setProgramOwner(data);
  };

  return (
    <div className="p-4">
      {loading ? (
        <PageLoader />
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
            
            <div className="bg-white p-4 rounded shadow md:col-span-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Program Owner Details</h3>
                <button
                  onClick={() => setShowProgramOwnerForm(true)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  {programOwner ? 'Edit' : 'Add Details'}
                </button>
              </div>
              
              {!programOwner ? (
                <p className="text-gray-500 italic mt-2">No program owner details have been added yet.</p>
              ) : (
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-lg">{programOwner.church}</p>
                    <p>{programOwner.address}</p>
                    <p>{programOwner.city}, {programOwner.state} {programOwner.zip}</p>
                  </div>
                  <div>
                    <p className="mb-1">
                      <span className="font-medium">Phone: </span>
                      {programOwner.phone}
                    </p>
                    {programOwner.webAddress && (
                      <p className="mb-1">
                        <span className="font-medium">Web: </span>
                        <a 
                          href={programOwner.webAddress.startsWith('http') ? programOwner.webAddress : `https://${programOwner.webAddress}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {programOwner.webAddress}
                        </a>
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Pastor: </span>
                      {programOwner.pastor}
                    </p>
                  </div>
                </div>
              )}
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

          {showProgramOwnerForm && (
            <ProgramOwnerForm
              programOwner={programOwner}
              onClose={() => setShowProgramOwnerForm(false)}
              onSave={handleSaveProgramOwner}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard; 