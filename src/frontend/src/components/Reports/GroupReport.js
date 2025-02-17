import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TableLoader } from '../common/Loader';

const GroupReport = () => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [totalGroups, setTotalGroups] = useState(0);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/reports/groups`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setGroups(response.data.groups);
      setTotalGroups(response.data.total);
    } catch (error) {
      console.error('Error fetching group report:', error);
      alert('Error generating group report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <TableLoader />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Group Report</h1>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd"/>
                  </svg>
                  Print Report
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
                <p className="mt-2 text-3xl font-bold text-gray-900">{totalGroups}</p>
                <p className="text-sm text-gray-500">Total Groups</p>
              </div>

              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Group Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Members
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groups.map((group) => (
                      <tr key={group.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {group.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{group.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {group.members.map(member => 
                              `${member.firstName} ${member.lastName}`
                            ).join(', ')}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupReport; 