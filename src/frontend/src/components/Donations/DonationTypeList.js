import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DonationTypeForm from './DonationTypeForm';

const DonationTypeList = () => {
  const [donationTypes, setDonationTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [message, setMessage] = useState('');

  const fetchDonationTypes = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/donation-types`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDonationTypes(response.data);
      setMessage(''); // Clear message on fetch
    } catch (error) {
      console.error('Error fetching donation types:', error);
      setMessage('Error fetching donation types.');
    }
  };

  const handleEdit = (type) => {
    setSelectedType(type);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (selectedType && window.confirm('Are you sure you want to delete this donation type?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/donation-types/${selectedType.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setMessage('Donation type deleted successfully.');
        setSelectedType(null); // Clear selection after deletion
        fetchDonationTypes(); // Refresh the list
      } catch (error) {
        console.error('Error deleting donation type:', error);
        setMessage('Error deleting donation type.');
      }
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/donation-types/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob' // Important for handling binary data
      });

      // Create a URL for the PDF blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'donation_types_report.pdf'); // Set the file name
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading donation types report:', error);
    }
  };

  const handleSelect = (type) => {
    if (selectedType && selectedType.id === type.id) {
      setSelectedType(null); // Deselect if already selected
    } else {
      setSelectedType(type); // Select the donation type
    }
  };

  useEffect(() => {
    fetchDonationTypes();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Donation Types</h2>
      <button 
        onClick={handleDownload} 
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200"
      >
        Download Donation Types Report (PDF)
      </button>
      <button 
        onClick={() => { setShowForm(true); setSelectedType(null); }} 
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
      >
        Add Donation Type
      </button>
      {message && <div className="mb-4 text-green-600">{message}</div>}
      {showForm ? (
        <DonationTypeForm
          onClose={() => setShowForm(false)}
          onSubmit={fetchDonationTypes}
          initialData={selectedType}
        />
      ) : (
        <table className="min-w-full divide-y divide-gray-200 mt-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody>
            {donationTypes.map(type => (
              <tr 
                key={type.id} 
                className={`hover:bg-gray-100 transition duration-200 ${selectedType && selectedType.id === type.id ? 'bg-gray-200' : ''}`}
                onClick={() => handleSelect(type)} // Select on row click
              >
                <td className="px-6 py-4 whitespace-nowrap">{type.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{type.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selectedType && (
        <div className="mt-4">
          <button 
            onClick={() => handleEdit(selectedType)} 
            className="mr-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
          >
            Edit
          </button>
          <button 
            onClick={handleDelete} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default DonationTypeList;
