import React from 'react';

const DonationReport = ({ reportData }) => {
  if (!reportData || !reportData.donations) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }

  const { donations, total } = reportData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(parseFloat(amount || 0));
  };

  const rows = [...(donations || [])].sort((a, b) => {
    const ad = a.donationDate ? new Date(a.donationDate).getTime() : 0;
    const bd = b.donationDate ? new Date(b.donationDate).getTime() : 0;
    if (bd !== ad) return bd - ad;
    const an = a.member ? `${a.member.lastName || ''} ${a.member.firstName || ''}`.trim().toLowerCase() : '';
    const bn = b.member ? `${b.member.lastName || ''} ${b.member.firstName || ''}`.trim().toLowerCase() : '';
    if (an !== bn) return an.localeCompare(bn);
    const aa = parseFloat(a.amount || 0);
    const ba = parseFloat(b.amount || 0);
    return ba - aa;
  });

  return (
    <div className="p-6">

      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 w-3/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 w-4/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th scope="col" className="px-6 py-3 w-3/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 w-2/12 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map(donation => (
              <tr key={donation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap w-3/12 text-sm text-gray-500">
                  {donation.donationDate ? new Date(donation.donationDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-4/12 text-sm text-gray-500">
                  {donation.member ? `${donation.member.lastName}, ${donation.member.firstName}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-3/12 text-sm text-gray-500">
                  {donation.donationType || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-2/12 text-sm text-gray-500 text-right">
                  {formatCurrency(donation.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                Total:
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                {formatCurrency(total || 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DonationReport;
