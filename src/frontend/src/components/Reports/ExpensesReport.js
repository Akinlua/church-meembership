import React, { useState } from 'react';
import ResizableTh from '../common/ResizableTh';

const ExpensesReport = ({ reportData, sortOrder = 'desc' }) => {
  const [colWidths, setColWidths] = useState({ date: 140, vendor: 160, category: 160, amount: 120 });
  const setCol = (key) => (w) => setColWidths(prev => ({ ...prev, [key]: w }));

  if (!reportData || !reportData.expenses) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }

  const { expenses, total } = reportData;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
      .format(parseFloat(amount || 0));

  const multiplier = sortOrder === 'asc' ? 1 : -1;

  const rows = [...(expenses || [])].sort((a, b) => {
    const ad = a.dueDate ? new Date(a.dueDate).getTime() : 0;
    const bd = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    if (bd !== ad) return (bd - ad) * multiplier;
    const an = a.vendor ? `${a.vendor.lastName || ''}`.toLowerCase() : '';
    const bn = b.vendor ? `${b.vendor.lastName || ''}`.toLowerCase() : '';
    return an.localeCompare(bn);
  });

  return (
    <div className="p-6">
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
            {rows.map(expense => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.date }}>
                  {expense.dueDate ? new Date(expense.dueDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.vendor }}>
                  {expense.vendor ? `${expense.vendor.lastName}` : 'N/A'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.category }}>
                  {expense.expenseCategory?.name || 'N/A'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 text-right" style={{ width: colWidths.amount }}>
                  {formatCurrency(expense.amount)}
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
  );
};

export default ExpensesReport;