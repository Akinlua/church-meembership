import React from 'react';

const ProgramOwnerDetails = ({ programOwner, onEdit }) => {
  if (!programOwner) {
    return (
      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Program Owner Details</h3>
          <button
            onClick={onEdit}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Add Details
          </button>
        </div>
        <p className="text-gray-500 italic">No program owner details have been added yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Program Owner Details</h3>
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          Edit
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-medium">{programOwner.church}</p>
          <p>{programOwner.address}</p>
          <p>{programOwner.city}, {programOwner.state} {programOwner.zip}</p>
        </div>
        
        <div>
          <p>
            <span className="font-medium">Phone: </span>
            {programOwner.phone}
          </p>
          {programOwner.webAddress && (
            <p>
              <span className="font-medium">Web: </span>
              <a 
                href={programOwner.webAddress.startsWith('http') ? programOwner.webAddress : `https://${programOwner.webAddress}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {programOwner.webAddress}
              </a>
            </p>
          )}
          <p>
            <span className="font-medium">Pastor: </span>
            {programOwner.pastor}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgramOwnerDetails; 