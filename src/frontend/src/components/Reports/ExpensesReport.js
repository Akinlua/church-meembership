import React from 'react';

const ExpensesReport = ({ reportData }) => {
  if (!reportData || !reportData.expenses) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }

  const { expenses, total } = reportData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(parseFloat(amount || 0));
  };

  return (
    <div className="p-6">

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(expenses || []).map(expense => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {expense.dueDate ? new Date(expense.dueDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {expense.vendor ? `${expense.vendor.lastName}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {expense.expenseCategory?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(expense.amount)}
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

export default ExpensesReport;