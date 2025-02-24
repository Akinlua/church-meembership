import React, { useState } from 'react';

const MemberList = ({ members, onEdit, onDelete }) => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const filteredMembers = members.filter(member => {
    const matchesSearch = (
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memberNumber.toString().includes(searchTerm)
    );
    return showInactive ? !member.isActive && matchesSearch : member.isActive && matchesSearch;
  });

  const handleSelect = (member) => {
    if (selectedMember && selectedMember.id === member.id) {
      setSelectedMember(null);
    } else {
      setSelectedMember(member);
    }
  };

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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <tr 
                key={member.id} 
                className={`hover:bg-gray-50 transition duration-200 ${selectedMember && selectedMember.id === member.id ? 'bg-gray-200' : ''}`}
                onClick={() => handleSelect(member)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {`${member.firstName} ${member.lastName}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{member.email}</div>
                  <div className="text-sm text-gray-500">{member.cellPhone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {selectedMember && selectedMember.id === member.id && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(member);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-full transition-colors duration-200 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this member?')) {
                            onDelete(member.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </>
                  )}
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