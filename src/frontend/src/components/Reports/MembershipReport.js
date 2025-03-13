import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MaskedDateInput from '../common/MaskedDateInput';

const MembershipReport = () => {
  const [members, setMembers] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/members?${params}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setMembers(response.data.members);
      setTotalMembers(response.data.total);
    } catch (error) {
      console.error('Error fetching membership report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewDetails = (member) => {
    setSelectedMember(member);
  };

  useEffect(() => {
    fetchMembers();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      {/* <div className="grid grid-cols-2 gap-4 print:hidden">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Start Date</label>
          <MaskedDateInput
            value={dateRange.startDate}
            onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
            inputClassName="border border-gray-300 rounded px-2 py-1"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">End Date</label>
          <MaskedDateInput
            value={dateRange.endDate}
            onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
            inputClassName="border border-gray-300 rounded px-2 py-1"
          />
        </div>
      </div> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Membership Report</h1>
              <div className="flex space-x-4">
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
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profile
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membership Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Groups
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded-full object-cover"
                            src={member.profileImage || '/default.jpg'} 
                            alt=""
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {`${member.firstName} ${member.lastName}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.email}<br />
                      {member.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(member.membershipDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {member.groups.map((group, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {group}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(member)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Total Members: <span className="font-medium text-gray-900">{totalMembers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex flex-col items-center">
              <img 
                src={selectedMember.profileImage || '/default.jpg'}
                alt=""
                className="h-32 w-32 rounded-full object-cover mb-4"
              />
              <h3 className="text-lg font-bold mb-4">
                {`${selectedMember.firstName} ${selectedMember.lastName}`}
              </h3>
              <div className="w-full space-y-2">
                <p><span className="font-semibold">Email:</span> {selectedMember.email}</p>
                <p><span className="font-semibold">Phone:</span> {selectedMember.phone}</p>
                <p><span className="font-semibold">Address:</span> {selectedMember.address}</p>
                <p><span className="font-semibold">Membership Date:</span> {new Date(selectedMember.membershipDate).toLocaleDateString()}</p>
                <div>
                  <span className="font-semibold">Groups:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedMember.groups.map((group, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="mt-6 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipReport; 