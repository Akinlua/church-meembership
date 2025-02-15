import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GroupReport = () => {
  const [groups, setGroups] = useState([]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/groups`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching group report:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Print Report
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Group Summary</h2>
        <p className="text-lg mb-4">
          Total Groups: {groups.length}
        </p>
        {groups.map((group) => (
          <div key={group.id} className="mb-8">
            <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
            <p className="text-gray-600 mb-4">{group.description}</p>
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Member Name</th>
                  <th className="px-4 py-2">Contact</th>
                  <th className="px-4 py-2">Join Date</th>
                </tr>
              </thead>
              <tbody>
                {group.members?.map((member) => (
                  <tr key={member.id} className="border-b">
                    <td className="px-4 py-2">
                      {`${member.first_name} ${member.last_name}`}
                    </td>
                    <td className="px-4 py-2">
                      {member.email}<br/>
                      {member.cell_phone}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(member.joined_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupReport; 