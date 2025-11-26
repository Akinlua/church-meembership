import React from 'react';

const DepositReport = ({ reportData }) => {
  if (!reportData || !reportData.deposits) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }

  const { deposits, total } = reportData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(parseFloat(amount || 0));
  };

  // Calculate the total check amount from the checks array
  const getCheckAmount = (deposit) => {
    if (!deposit.checks || deposit.checks.length === 0) {
      return 0;
    }
    return deposit.checks.reduce((sum, check) => sum + parseFloat(check.amount || 0), 0);
  };

  const rows = [...(deposits || [])].sort((a, b) => {
    const ad = a.date ? new Date(a.date).getTime() : 0;
    const bd = b.date ? new Date(b.date).getTime() : 0;
    if (bd !== ad) return bd - ad;
    const aa = parseFloat(a.totalAmount || 0);
    const ba = parseFloat(b.totalAmount || 0);
    return ba - aa;
  });

  return (
    <div className="p-6">

      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 w-2/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 w-3/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bank
              </th>
              <th scope="col" className="px-6 py-3 w-3/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account #
              </th>
              <th scope="col" className="px-6 py-3 w-2/12 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cash
              </th>
              <th scope="col" className="px-6 py-3 w-2/12 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check
              </th>
              <th scope="col" className="px-6 py-3 w-2/12 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map(deposit => (
              <tr key={deposit.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap w-2/12 text-sm text-gray-500">
                  {deposit.date ? new Date(deposit.date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-3/12 text-sm text-gray-500">
                  {deposit.bank?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-3/12 text-sm text-gray-500">
                  {deposit.accountNumber || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-2/12 text-sm text-gray-500 text-right">
                  {formatCurrency(deposit.cashAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-2/12 text-sm text-gray-500 text-right">
                  {formatCurrency(getCheckAmount(deposit))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-2/12 text-sm text-gray-500 text-right">
                  {formatCurrency(deposit.totalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan="5" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
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

export default DepositReport;