import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PageLoader } from '../common/Loader';
import VisitorForm from './VisitorForm';
import { useAuth } from '../../contexts/AuthContext';

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { hasDeleteAccess, hasAddAccess, currentUser, shouldSeeOnlyOwnData } = useAuth();

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/visitors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: {
          ownDataOnly: shouldSeeOnlyOwnData('visitor') ? 'true' : 'false',
          userId: currentUser?.id
        }
      });
      setVisitors(response.data);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVisitor = () => {
    setSelectedVisitor(null);
    setShowForm(true);
  };

  const handleEditVisitor = async (visitor) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/visitors/${visitor.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedVisitor(response.data);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching visitor details:', error);
    }
  };

  const handleDeleteVisitor = async (id) => {
    if (window.confirm('Are you sure you want to delete this visitor?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/visitors/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        await fetchVisitors();
      } catch (error) {
        console.error('Error deleting visitor:', error);
      }
    }
  };

  const filteredVisitors = visitors.filter(visitor => {
    const fullName = `${visitor.firstName} ${visitor.lastName}`.toLowerCase();
    const visitorNumber = visitor.visitorNumber?.toString() || '';
    return fullName.includes(searchTerm.toLowerCase()) || visitorNumber.includes(searchTerm);
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Visitors</h1>
          {hasAddAccess('visitor') && (
            <button
              onClick={handleAddVisitor}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Visitor
            </button>
          )}
        </div>

        {shouldSeeOnlyOwnData('visitor') && (
          <div className="mb-4 bg-purple-50 border-l-4 border-purple-500 p-4 text-purple-700">
            <p>You are viewing your visitor data only. Contact an administrator if you need access to other records.</p>
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search visitors by name or visitor number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {loading ? (
          <PageLoader />
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitor #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visit Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Home Church
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No visitors found
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <tr key={visitor.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {visitor.visitorNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={visitor.profileImage || '/default.jpg'}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {visitor.firstName} {visitor.middleInitial ? visitor.middleInitial + '.' : ''} {visitor.lastName}
                              {currentUser && currentUser.visitorId === visitor.id && (
                                <span className="ml-2 text-xs text-green-600 font-medium">(Your record)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{visitor.email || 'N/A'}</div>
                        <div>{visitor.cellPhone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(visitor.visitDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {visitor.homeChurch || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditVisitor(visitor)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        {(hasDeleteAccess('visitor') || (currentUser && currentUser.visitorId === visitor.id)) && (
                          <button
                            onClick={() => handleDeleteVisitor(visitor.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-8 border shadow-lg rounded-md bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <VisitorForm
              visitor={selectedVisitor}
              onClose={() => {
                setShowForm(false);
                setSelectedVisitor(null);
              }}
              onSubmit={() => {
                setShowForm(false);
                fetchVisitors();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Visitors; 