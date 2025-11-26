import React from 'react';

const MembershipReport = ({ reportData }) => {
  if (!reportData || !reportData.members) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }

  const { members, total } = reportData;

  const rows = [...(members || [])].sort((a, b) => {
    const an = `${a.lastName || ''} ${a.firstName || ''}`.trim().toLowerCase();
    const bn = `${b.lastName || ''} ${b.firstName || ''}`.trim().toLowerCase();
    if (an !== bn) return an.localeCompare(bn);
    const ad = a.membershipDate ? new Date(a.membershipDate).getTime() : 0;
    const bd = b.membershipDate ? new Date(b.membershipDate).getTime() : 0;
    return bd - ad;
  });

  return (
    <div className="p-6">

      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 w-3/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>              
              <th scope="col" className="px-6 py-3 w-2/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-6 py-3 w-3/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th scope="col" className="px-6 py-3 w-2/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Membership Date
              </th>
              <th scope="col" className="px-6 py-3 w-2/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 w-2/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Groups
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map(member => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap w-3/12 text-sm text-gray-500">
                  {member.lastName && member.firstName ? `${member.lastName}, ${member.firstName}` : 'N/A'}
                </td>                
                <td className="px-6 py-4 whitespace-nowrap w-2/12 text-sm text-gray-500">
                  {member.cellPhone || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-3/12 text-sm text-gray-500">
                  {[member.address, member.city, member.state, member.zipCode]
                    .filter(Boolean)
                    .join(', ') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-2/12 text-sm text-gray-500">
                  {member.membershipDate ? new Date(member.membershipDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-2/12 text-sm text-gray-500">
                  {member.email || 'N/A'}
                </td>
                <td className="px-6 py-4 w-2/12 text-sm text-gray-500">
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
