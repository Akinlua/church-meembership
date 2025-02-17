import React from 'react';
import { PageLoader } from '../common/Loader';


const GroupList = ({ groups, onEdit, onDelete, loading }) => {
  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Group Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Members Count
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {groups.map((group) => (
            <tr key={group.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {group.name}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{group.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {group.members?.length || 0} members
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(group)}
                  className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-full transition-colors duration-200 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this group?')) {
                      onDelete(group.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full transition-colors duration-200"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupList; 