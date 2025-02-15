import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GroupForm = ({ group, onClose, onSubmit }) => {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    member_ids: []
  });

  useEffect(() => {
    fetchMembers();
    // Update form data when group prop changes
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        member_ids: group.members?.map(member => member.member_id.toString()) || []
      });
    }
  }, [group]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `${process.env.REACT_APP_API_URL}/groups${group ? `/${group.id}` : ''}`;
      const method = group ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      onSubmit();
    } catch (error) {
      console.error('Error saving group:', error);
      alert('Error saving group. Please try again.');
    }
  };

  const handleMemberSelection = (memberId) => {
    const memberIdStr = memberId.toString();
    setFormData(prev => ({
      ...prev,
      member_ids: prev.member_ids.includes(memberIdStr)
        ? prev.member_ids.filter(id => id !== memberIdStr)
        : [...prev.member_ids, memberIdStr]
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{group ? 'Edit' : 'Add'} Group</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Members</label>
          <div className="max-h-60 overflow-y-auto border rounded-md p-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id={`member-${member.id}`}
                  checked={formData.member_ids.includes(member.id.toString())}
                  onChange={() => handleMemberSelection(member.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`member-${member.id}`} className="text-sm text-gray-700">
                  {`${member.firstName} ${member.lastName}`}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {group ? 'Update' : 'Add'} Group
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupForm; 