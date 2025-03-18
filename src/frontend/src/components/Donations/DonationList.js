import React from 'react';
import { TableLoader } from '../common/Loader';
import { useAuth } from '../../contexts/AuthContext';

const DonationList = ({ donations, onEdit, onDelete, loading, selectedDonation, setSelectedDonation }) => {
  const { hasDeleteAccess } = useAuth();

  if (loading) {
    return <TableLoader />;
  }

  const handleSelect = (donation) => {
    if (selectedDonation && selectedDonation.id === donation.id) {
      setSelectedDonation(null); // Deselect if already selected
    } else {
      setSelectedDonation(donation); // Select the donation
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Member Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {donations.map((donation) => (
            <tr 
              key={donation.id} 
              className={`hover:bg-gray-100 transition duration-200 ${selectedDonation && selectedDonation.id === donation.id ? 'bg-gray-200' : ''}`}
              onClick={() => handleSelect(donation)} // Select on row click
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {`${donation.member?.firstName} ${donation.member?.lastName}`}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {donation.donationType}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  ${parseFloat(donation.amount).toFixed(2)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {new Date(donation.donationDate).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{donation.notes}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {/* Edit and Delete buttons only show when a donation is selected */}
                {selectedDonation && selectedDonation.id === donation.id && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row selection
                        onEdit(donation);
                      }}
                      className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-full transition-colors duration-200 mr-2"
                    >
                      Edit
                    </button>
                    {hasDeleteAccess('donation') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row selection
                          if (window.confirm('Are you sure you want to delete this donation?')) {
                            onDelete(donation.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full transition-colors duration-200"
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DonationList; 