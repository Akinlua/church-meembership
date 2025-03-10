import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ButtonLoader } from '../common/Loader';

const GroupForm = ({ group, onClose, onSubmit }) => {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    member_ids: []
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      setFormLoading(true);
      await fetchMembers();
      
      // Properly set the member IDs if editing a group
      if (group && group.members) {
        // Extract member IDs from the group members array
        const memberIds = group.members.map(member => {
          // Handle different possible member structures
          if (typeof member === 'object') {
            return (member.id || member.memberId).toString();
          }
          return member.toString();
        });
        
        console.log('Setting member IDs:', memberIds);
        
        setFormData(prev => ({
          ...prev,
          name: group.name || '',
          description: group.description || '',
          member_ids: memberIds
        }));
      }
      
      setFormLoading(false);
    };
    
    initialize();
  }, [group]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Include all members, even those in other groups
      setMembers(response.data.filter(member => member.isActive));
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const toggleMember = (memberId) => {
    const memberIdStr = memberId.toString();
    setFormData(prev => ({
      ...prev,
      member_ids: prev.member_ids.includes(memberIdStr)
        ? prev.member_ids.filter(id => id !== memberIdStr)
        : [...prev.member_ids, memberIdStr]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Submitting group data:', formData); // Debug log
      const url = `${process.env.REACT_APP_API_URL}/groups${group ? `/${group.id}` : ''}`;
      const method = group ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      await onSubmit();
    } catch (error) {
      console.error('Error saving group:', error);
      alert('Error saving group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debug output to check member IDs
  console.log('Current formData.member_ids:', formData.member_ids);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {formLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6">{group ? 'Edit' : 'Add'} Group</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Members</label>
              <div className="max-h-60 overflow-y-auto border rounded-md">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center p-3 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.member_ids.includes(member.id.toString())}
                      onChange={() => toggleMember(member.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 block text-sm text-gray-700">
                      {member.firstName} {member.lastName}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <ButtonLoader /> : group ? 'Update' : 'Create'} Group
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default GroupForm; 