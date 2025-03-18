import React from 'react';

const MembershipReport = ({ reportData }) => {
  if (!reportData || !reportData.members) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }

  const { members, total } = reportData;

  return (
    <div className="p-6">
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-blue-800">
          Total Members: {total || 0}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>              
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Membership Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Groups
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(members || []).map(member => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.lastName && member.firstName ? `${member.lastName}, ${member.firstName}` : 'N/A'}
                </td>                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.cellPhone || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {[member.address, member.city, member.state, member.zipCode]
                    .filter(Boolean)
                    .join(', ') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.membershipDate ? new Date(member.membershipDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.email || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {member.groups && member.groups.length > 0 
                    ? member.groups.join(', ') 
                    : 'None'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MembershipReport;
