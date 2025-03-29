import React, { useState, useEffect } from 'react';
import MemberList from './MemberList';
import MemberForm from './MemberForm';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from '../common/Loader';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, hasDeleteAccess, hasAddAccess, shouldSeeOnlyOwnData } = useAuth();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: {
          ownDataOnly: shouldSeeOnlyOwnData('member') ? 'true' : 'false',
          userId: currentUser?.id
        }
      });
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    setShowForm(true);
  };

  const handleEditMember = async (member) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/members/${member.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedMember(response.data);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching member details:', error);
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/members/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        await fetchMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          {hasAddAccess('member') && (
            <button
              onClick={handleAddMember}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Member
            </button>
          )}
        </div>

        {shouldSeeOnlyOwnData('member') && (
          <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700">
            <p>You are viewing your membership data. Only your records are displayed.</p>
          </div>
        )}

        {loading ? (
          <PageLoader />
        ) : (
          <MemberList 
            members={members} 
            onEdit={handleEditMember}
            onDelete={handleDeleteMember}
            selectedMember={selectedMember}
            setSelectedMember={setSelectedMember}
            showDeleteButton={hasDeleteAccess('member')}
          />
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-8 border shadow-lg rounded-md bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <MemberForm
              member={selectedMember}
              onClose={() => {
                setShowForm(false);
                setSelectedMember(null);
              }}
              onSubmit={async () => {
                await fetchMembers();
                setShowForm(false);
                setSelectedMember(null);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Members; 