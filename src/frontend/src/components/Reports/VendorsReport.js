import React from 'react';

const VendorsReport = ({ reportData }) => {
  if (!reportData || !reportData.vendors) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }

  const { vendors, total } = reportData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  return (
    <div className="p-6">

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Charges
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(vendors || []).map(vendor => (
              <tr key={vendor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {`${vendor.lastName}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vendor.email || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(vendor.totalCharges || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorsReport;