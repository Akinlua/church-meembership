import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GroupForm = ({ group, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: []
  });
  const [availableMembers, setAvailableMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
    if (group) {
      setFormData(group);
    }
  }, [group]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAvailableMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (group) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/groups/${group.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/groups`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      }
      onSubmit();
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <input
          type="text"
          name="name"
          placeholder="Group Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border p-2 rounded"
          rows="3"
        />
        <div>
          <label className="block mb-2">Select Members</label>
          <select
            multiple
            className="w-full border p-2 rounded"
            value={formData.members}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setFormData({ ...formData, members: selected });
            }}
          >
            {availableMembers.map(member => (
              <option key={member.id} value={member.id}>
                {`${member.firstName} ${member.lastName}`}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {group ? 'Update' : 'Create'} Group
        </button>
      </div>
    </form>
  );
};

export default GroupForm; 