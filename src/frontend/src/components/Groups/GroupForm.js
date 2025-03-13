import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ButtonLoader, PageLoader } from '../common/Loader';
import Modal from '../../common/Modal';

const GroupForm = ({ group, onClose, onSubmit }) => {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    member_ids: []
  });
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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
      const url = `${process.env.REACT_APP_API_URL}/groups${group ? `/${group.id}` : ''}`;
      const method = group ? 'put' : 'post';
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Show modal only when adding a new group
      if (!group) {
        setShowModal(true);
      } else {
        onClose(); // Close the form if updating
      }
    } catch (error) {
      console.error('Error saving group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAdding = () => {
    setFormData({
      name: '',
      description: '',
      member_ids: [],
    });
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onClose();
  };

  return (
    <div className="px-2 py-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        {group ? 'Edit' : 'Add'} Group Form
      </h2>
      
      {formLoading ? (
        <div className="min-h-[200px] flex justify-center items-center">
          <PageLoader />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-x-4 gap-y-2">
            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Group Name</label>
            </div>
            <div className="col-span-9">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-2 py-1 border border-gray-600"
                required
              />
            </div>
            
            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Description</label>
            </div>
            <div className="col-span-9">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-2 py-1 border border-gray-600"
                rows="2"
              />
            </div>
            
            {/* <div className="col-span-3 flex items-start pt-1">
              <label className="block text-sm font-medium text-gray-700">Members</label>
            </div>
            <div className="col-span-9">
              <div className="border border-gray-600 max-h-[150px] overflow-y-auto bg-white">
                {members.length === 0 ? (
                  <p className="p-2 text-gray-500 text-sm">No active members found</p>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center px-2 py-1 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        id={`member-${member.id}`}
                        checked={formData.member_ids.includes(member.id.toString())}
                        onChange={() => toggleMember(member.id)}
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label 
                        htmlFor={`member-${member.id}`} 
                        className="ml-2 block text-sm text-gray-700 cursor-pointer"
                      >
                        {member.firstName} {member.lastName}
                      </label>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {formData.member_ids.length} member{formData.member_ids.length !== 1 ? 's' : ''} selected
              </div>
            </div> */}
          </div>
          
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? <ButtonLoader text={group ? "Updating..." : "Saving..."} /> : (group ? "Update" : "Save")}
            </button>
          </div>
        </form>
      )}

      {showModal && (
        <Modal onClose={handleCloseModal}>
          <h2 className="text-lg font-bold">Success!</h2>
          <p>Group added successfully! Do you want to add another?</p>
          <div className="flex justify-end mt-4">
            <button onClick={handleContinueAdding} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Add
            </button>
            <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 ml-2">
              Exit
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default GroupForm;