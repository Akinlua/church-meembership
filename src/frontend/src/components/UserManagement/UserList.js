import React from 'react';

const UserList = ({ users, onEdit, onDelete }) => {
  // Helper function to get access count
  const getAccessCount = (user) => {
    const accessFields = [
      'memberAccess', 'visitorAccess', 'vendorAccess', 'groupAccess', 
      'donationAccess', 'adminAccess', 'expenseAccess', 'chargesAccess', 
      'reportsAccess', 'depositAccess', 'bankAccess'
    ];
    
    return accessFields.filter(field => user[field]).length;
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Username
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Permissions
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role === 'admin' ? (
                    <span className="text-blue-600 font-medium">Administrator</span>
                  ) : user.adminAccess ? (
                    <span className="text-blue-600 font-medium">Admin Access</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {getAccessCount(user) > 0 ? (
                        <>
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                            {getAccessCount(user)} Access{getAccessCount(user) > 1 ? 'es' : ''}
                          </span>
                          {user.memberAccess && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">Member</span>
                          )}
                          {user.visitorAccess && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">Visitor</span>
                          )}
                        </>
                      ) : (
                        'No access'
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserList; 