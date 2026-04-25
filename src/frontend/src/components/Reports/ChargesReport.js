import React, { useState } from 'react';
import ResizableTh from '../common/ResizableTh';

const ChargesReport = ({ reportData, sortOrder = 'desc' }) => {
  const [colWidths, setColWidths] = useState({ date: 130, vendor: 160, category: 160, amount: 120 });
  const setCol = (key) => (w) => setColWidths(prev => ({ ...prev, [key]: w }));

  if (!reportData || !reportData.charges) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }

  const { charges, total, categorySummary } = reportData;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
      .format(parseFloat(amount || 0));

  const multiplier = sortOrder === 'asc' ? 1 : -1;

  const rows = [...(charges || [])].sort((a, b) => {
    const ad = a.dueDate ? new Date(a.dueDate).getTime() : 0;
    const bd = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    if (bd !== ad) return (bd - ad) * multiplier;
    const an = a.vendor ? `${a.vendor.lastName || ''}`.toLowerCase() : '';
    const bn = b.vendor ? `${b.vendor.lastName || ''}`.toLowerCase() : '';
    return an.localeCompare(bn);
  });

  const sortedCategorySummary = categorySummary
    ? Object.entries(categorySummary).sort((a, b) => parseFloat(b[1] || 0) - parseFloat(a[1] || 0))
    : [];

  return (
    <div className="p-6">
      {sortedCategorySummary.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-3 text-gray-700">Category Summary</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ width: 300 }}>Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase" style={{ width: 160 }}>Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCategorySummary.map(([category, amount]) => (
                  <tr key={category} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{category}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">{formatCurrency(amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h4 className="text-lg font-semibold mb-3 text-gray-700">Charges List</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
            <thead className="bg-gray-50">
              <tr>
                <ResizableTh width={colWidths.date} onResize={setCol('date')}>Due Date</ResizableTh>
                <ResizableTh width={colWidths.vendor} onResize={setCol('vendor')}>Vendor</ResizableTh>
                <ResizableTh width={colWidths.category} onResize={setCol('category')}>Category</ResizableTh>
                <ResizableTh width={colWidths.amount} onResize={setCol('amount')} className="text-right">Amount</ResizableTh>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map(charge => (
                <tr key={charge.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.date }}>
                    {charge.dueDate ? new Date(charge.dueDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.vendor }}>
                    {charge.vendor ? `${charge.vendor.lastName}` : 'N/A'}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.category }}>
                    {charge.expenseCategory?.name || 'N/A'}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 text-right" style={{ width: colWidths.amount }}>
                    {formatCurrency(charge.amount)}
                  </td>
                </tr>
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
    </div>
  );
};

export default ChargesReport;