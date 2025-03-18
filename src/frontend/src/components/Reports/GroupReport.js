import React from 'react';

const GroupReport = ({ reportData }) => {
  if (!reportData || !reportData.groups) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }

  const { groups, total } = reportData;

  return (
    <div className="p-6">
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-blue-800">
          Total Groups: {total || 0}
        </h3>
      </div>

      <div className="space-y-8">
        {(groups || []).map(group => (
          <div key={group.id} className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {group.name || 'Unnamed Group'}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {group.description || 'No description available'}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Members ({(group.members || []).length})</h4>
                {group.members && group.members.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {group.members.map((member, index) => (
                      <li key={index} className="py-2">
                        {member.firstName && member.lastName ? `${member.lastName}, ${member.firstName}` : 'Unknown Member'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No members in this group</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupReport;
