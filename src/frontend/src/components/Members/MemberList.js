import React, { useState } from 'react';

const MemberList = ({ members, onEdit, onDelete }) => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const filteredMembers = members.filter(member => {
    const matchesSearch = (
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memberNumber.toString().includes(searchTerm)
    );
    return showInactive ? !member.isActive && matchesSearch : member.isActive && matchesSearch;
  });

  return (
    <div className="h-screen flex flex-col">
      <div className="flex gap-4 mb-4 p-4">
        <input
          type="text"
          placeholder="Search by name or member number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="mr-2"
          />
          Show Inactive Members
        </label>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMembers.map(member => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">{member.memberNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {`${member.firstName} ${member.lastName}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => onEdit(member)} className="text-blue-600 hover:text-blue-900 mr-4">
                    Edit
                  </button>
                  <button onClick={() => onDelete(member.id)} className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberList; 