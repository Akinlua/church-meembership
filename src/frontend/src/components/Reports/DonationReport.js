import React, { useState } from 'react';
import ResizableTh from '../common/ResizableTh';

const DonationReport = ({ reportData, sortOrder = 'desc' }) => {
  const [colWidths, setColWidths] = useState({ date: 140, person: 200, type: 160, amount: 120 });

  const setCol = (key) => (w) => setColWidths(prev => ({ ...prev, [key]: w }));

  if (!reportData || !reportData.donations) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }

  const { donations, total } = reportData;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
      .format(parseFloat(amount || 0));

  const getSortName = (d) => {
    if (d.member) return `${d.member.lastName || ''} ${d.member.firstName || ''}`;
    if (d.visitor) return `${d.visitor.lastName || ''} ${d.visitor.firstName || ''}`;
    if (d.supporter) return `${d.supporter.lastName || ''} ${d.supporter.firstName || ''}`;
    return '';
  };

  const multiplier = sortOrder === 'asc' ? 1 : -1;

  const sortedDonations = [...(donations || [])].sort((a, b) => {
    const ad = a.donationDate ? new Date(a.donationDate).getTime() : 0;
    const bd = b.donationDate ? new Date(b.donationDate).getTime() : 0;
    if (bd !== ad) return (bd - ad) * multiplier;
    return getSortName(a).toLowerCase().localeCompare(getSortName(b).toLowerCase());
  });

  const donationsByType = sortedDonations.reduce((acc, d) => {
    const type = d.donationType || 'N/A';
    if (!acc[type]) acc[type] = [];
    acc[type].push(d);
    return acc;
  }, {});

  const typeSubtotals = Object.keys(donationsByType).reduce((acc, type) => {
    acc[type] = donationsByType[type].reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-gray-50">
            <tr>
              <ResizableTh width={colWidths.date} onResize={setCol('date')}>Date</ResizableTh>
              <ResizableTh width={colWidths.person} onResize={setCol('person')}>Person</ResizableTh>
              <ResizableTh width={colWidths.type} onResize={setCol('type')}>Type</ResizableTh>
              <ResizableTh width={colWidths.amount} onResize={setCol('amount')} className="text-right">Amount</ResizableTh>
            </tr>
          </thead>
          <tbody className="bg-white">
            {Object.keys(donationsByType).map((type) => (
              <React.Fragment key={type}>
                {donationsByType[type].map(donation => (
                  <tr key={donation.id} className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.date }}>
                      {donation.donationDate ? new Date(donation.donationDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.person }}>
                      {donation.member
                        ? `${donation.member.lastName}, ${donation.member.firstName}`
                        : donation.visitor
                          ? `${donation.visitor.lastName}, ${donation.visitor.firstName} (Visitor)`
                          : donation.supporter
                            ? `${donation.supporter.lastName}, ${donation.supporter.firstName} (Supporter)`
                            : 'N/A'}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.type }}>
                      {donation.donationType || 'N/A'}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 text-right" style={{ width: colWidths.amount }}>
                      {formatCurrency(donation.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50 border-b-2 border-blue-200">
                  <td colSpan="3" className="px-3 py-3 text-right text-sm font-semibold text-blue-900">
                    {type} Subtotal:
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-semibold text-blue-900">
                    {formatCurrency(typeSubtotals[type])}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan="3" className="px-3 py-4 text-right text-sm font-medium text-gray-900">Total:</td>
              <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">{formatCurrency(total || 0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DonationReport;
