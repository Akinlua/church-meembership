import React, { useState } from 'react';
import ResizableTh from '../common/ResizableTh';

const MembershipReport = ({ reportData, sortOrder = 'desc' }) => {
  const [colWidths, setColWidths] = useState({ name: 160, phone: 120, address: 200, date: 130, email: 170, groups: 140 });
  const setCol = (key) => (w) => setColWidths(prev => ({ ...prev, [key]: w }));

  if (!reportData || !reportData.members) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }

  const { members } = reportData;

  const multiplier = sortOrder === 'asc' ? 1 : -1;

  const rows = [...(members || [])].sort((a, b) => {
    const ad = a.membershipDate ? new Date(a.membershipDate).getTime() : 0;
    const bd = b.membershipDate ? new Date(b.membershipDate).getTime() : 0;
    if (bd !== ad) return (bd - ad) * multiplier;
    const an = `${a.lastName || ''} ${a.firstName || ''}`.trim().toLowerCase();
    const bn = `${b.lastName || ''} ${b.firstName || ''}`.trim().toLowerCase();
    return an.localeCompare(bn);
  });

  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-gray-50">
            <tr>
              <ResizableTh width={colWidths.name} onResize={setCol('name')}>Name</ResizableTh>
              <ResizableTh width={colWidths.phone} onResize={setCol('phone')}>Phone</ResizableTh>
              <ResizableTh width={colWidths.address} onResize={setCol('address')}>Address</ResizableTh>
              <ResizableTh width={colWidths.date} onResize={setCol('date')}>Membership Date</ResizableTh>
              <ResizableTh width={colWidths.email} onResize={setCol('email')}>Email</ResizableTh>
              <ResizableTh width={colWidths.groups} onResize={setCol('groups')}>Groups</ResizableTh>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map(member => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.name }}>
                  {member.lastName && member.firstName ? `${member.lastName}, ${member.firstName}` : 'N/A'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.phone }}>
                  {member.cellPhone || 'N/A'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.address }}>
                  {[member.address, member.city, member.state, member.zipCode].filter(Boolean).join(', ') || 'N/A'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.date }}>
                  {member.membershipDate ? new Date(member.membershipDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.email }}>
                  {member.email || 'N/A'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500" style={{ width: colWidths.groups }}>
                  {member.groups && member.groups.length > 0 ? member.groups.join(', ') : 'None'}
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
