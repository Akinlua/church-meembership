import React from 'react';

const ChargesReport = ({ reportData }) => {
  if (!reportData || !reportData.charges) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }

  const { charges, total, categorySummary } = reportData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(parseFloat(amount || 0));
  };

  const rows = [...(charges || [])].sort((a, b) => {
    const ad = a.dueDate ? new Date(a.dueDate).getTime() : 0;
    const bd = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    if (bd !== ad) return bd - ad;
    const an = a.vendor ? `${a.vendor.lastName || ''}`.trim().toLowerCase() : '';
    const bn = b.vendor ? `${b.vendor.lastName || ''}`.trim().toLowerCase() : '';
    if (an !== bn) return an.localeCompare(bn);
    const aa = parseFloat(a.amount || 0);
    const ba = parseFloat(b.amount || 0);
    return ba - aa;
  });

  const sortedCategorySummary = categorySummary
    ? Object.entries(categorySummary).sort((a, b) => parseFloat(b[1] || 0) - parseFloat(a[1] || 0))
    : [];

  return (
    <div className="p-6">

      {/* Category Summary */}
      {sortedCategorySummary.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-3 text-gray-700">Category Summary</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 w-8/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 w-4/12 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCategorySummary.map(([category, amount]) => (
                  <tr key={category} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap w-8/12 text-sm text-gray-500">
                      {category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-4/12 text-sm text-gray-500 text-right">
                      {formatCurrency(amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Charges List */}
      <div>
        <h4 className="text-lg font-semibold mb-3 text-gray-700">Charges List</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 w-3/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 w-3/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th scope="col" className="px-6 py-3 w-3/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 w-3/12 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map(charge => (
                <tr key={charge.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap w-3/12 text-sm text-gray-500">
                    {charge.dueDate ? new Date(charge.dueDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap w-3/12 text-sm text-gray-500">
                    {charge.vendor ? `${charge.vendor.lastName}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap w-3/12 text-sm text-gray-500">
                    {charge.expenseCategory?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap w-3/12 text-sm text-gray-500 text-right">
                    {formatCurrency(charge.amount)}
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
    </div>
  );
};

export default ChargesReport;