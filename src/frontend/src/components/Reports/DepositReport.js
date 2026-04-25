import React, { useState } from 'react';
import ResizableTh from '../common/ResizableTh';

const DepositReport = ({ reportData, sortOrder = 'desc' }) => {
  const [colWidths, setColWidths] = useState({ date: 120, bank: 160, account: 140, cash: 110, check: 110, total: 110 });
  const setCol = (key) => (w) => setColWidths(prev => ({ ...prev, [key]: w }));

  if (!reportData || !reportData.deposits) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }

  const { deposits, total } = reportData;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
      .format(parseFloat(amount || 0));

  const getCheckAmount = (deposit) => {
    if (!deposit.checks || deposit.checks.length === 0) return 0;
    return deposit.checks.reduce((sum, check) => sum + parseFloat(check.amount || 0), 0);
  };

  const multiplier = sortOrder === 'asc' ? 1 : -1;

  const rows = [...(deposits || [])].sort((a, b) => {
    const ad = a.date ? new Date(a.date).getTime() : 0;
    const bd = b.date ? new Date(b.date).getTime() : 0;
    if (bd !== ad) return (bd - ad) * multiplier;
    return parseFloat(b.totalAmount || 0) - parseFloat(a.totalAmount || 0);
  });

  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-gray-50">
            <tr>
              <ResizableTh width={colWidths.date} onResize={setCol('date')}>Date</ResizableTh>
              <ResizableTh width={colWidths.bank} onResize={setCol('bank')}>Bank</ResizableTh>
              <ResizableTh width={colWidths.account} onResize={setCol('account')}>Account #</ResizableTh>
              <ResizableTh width={colWidths.cash} onResize={setCol('cash')} className="text-right">Cash</ResizableTh>
              <ResizableTh width={colWidths.check} onResize={setCol('check')} className="text-right">Check</ResizableTh>
              <ResizableTh width={colWidths.total} onResize={setCol('total')} className="text-right">Total</ResizableTh>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map(deposit => (
              <tr key={deposit.id} className="hover:bg-gray-50">
                <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.date }}>
                  {deposit.date ? new Date(deposit.date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.bank }}>
                  {deposit.bank?.name || 'N/A'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 truncate" style={{ width: colWidths.account }}>
                  {deposit.accountNumber || 'N/A'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 text-right" style={{ width: colWidths.cash }}>
                  {formatCurrency(deposit.cashAmount)}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 text-right" style={{ width: colWidths.check }}>
                  {formatCurrency(getCheckAmount(deposit))}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 text-right" style={{ width: colWidths.total }}>
                  {formatCurrency(deposit.totalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan="5" className="px-3 py-4 text-right text-sm font-medium text-gray-900">Total:</td>
              <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">{formatCurrency(total || 0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DepositReport;