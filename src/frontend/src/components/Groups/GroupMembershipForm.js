import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PageLoader } from '../common/Loader';

const GroupMembershipForm = () => {
    const [members, setMembers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [formData, setFormData] = useState({
        memberId: '',
        groupId: '',
        joinedDate: new Date().toISOString().split('T')[0]
    });
    const [selectedMember, setSelectedMember] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setPageLoading(true);
            try {
                const [membersRes, groupsRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/members`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }),
                    axios.get(`${process.env.REACT_APP_API_URL}/groups`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                ]);
                setMembers(membersRes.data.filter(m => m.isActive));
                setGroups(groupsRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setPageLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleMemberChange = (e) => {
        const memberId = e.target.value;
        setFormData({ ...formData, memberId });
        const member = members.find(m => m.id.toString() === memberId);
        setSelectedMember(member || null);
        setMessage('');
    };

    const handleGroupChange = (e) => {
        setFormData({ ...formData, groupId: e.target.value });
        setMessage('');
    };

    const handleDateChange = (e) => {
        setFormData({ ...formData, joinedDate: e.target.value });
        setMessage('');
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!formData.memberId || !formData.groupId) {
            setMessage('Please select both a member and a group.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/group-members`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMessage('Group membership saved successfully.');
        } catch (error) {
            console.error('Error saving group membership:', error);
            setMessage('Error saving group membership.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!formData.memberId || !formData.groupId) {
            setMessage('Please select both a member and a group to delete.');
            return;
        }

        if (!window.confirm('Are you sure you want to remove this member from the group?')) {
            return;
        }

        setLoading(true);
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/group-members/${formData.groupId}/${formData.memberId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMessage('Group membership deleted successfully.');
            setFormData({
                memberId: '',
                groupId: '',
                joinedDate: new Date().toISOString().split('T')[0]
            });
            setSelectedMember(null);
        } catch (error) {
            console.error('Error deleting group membership:', error);
            setMessage(error.response?.status === 404 ? 'Membership not found.' : 'Error deleting group membership.');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) return <PageLoader />;

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Group Member Form</h2>

            {message && (
                <div className={`p-3 mb-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right font-medium">Member</label>
                    <div className="col-span-3">
                        <select
                            value={formData.memberId}
                            onChange={handleMemberChange}
                            className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Select a member</option>
                            {members.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.lastName}, {member.firstName} {member.middleName || ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right font-medium">Group</label>
                    <div className="col-span-3">
                        <select
                            value={formData.groupId}
                            onChange={handleGroupChange}
                            className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Select a group</option>
                            {groups.map(group => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right font-medium">Date</label>
                    <div className="col-span-3 lg:col-span-1">
                        <input
                            type="date"
                            value={formData.joinedDate}
                            onChange={handleDateChange}
                            className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="flex justify-center mt-8 space-x-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 font-medium"
                    >
                        ADD
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300 font-medium"
                    >
                        SAVE / EDIT
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading || !formData.memberId || !formData.groupId}
                        className="px-6 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 disabled:border-red-300 disabled:text-red-300 font-medium"
                    >
                        DELETE
                    </button>
                </div>

                <div className="mt-8 p-4 border rounded-md min-h-[120px] relative">
                    <span className="absolute -top-3 left-4 bg-white px-2 text-sm text-gray-500">
                        Note ---pulls name, address, phone number and email from member profile
                    </span>
                    {selectedMember ? (
                        <div className="space-y-2 mt-2">
                            <p><strong>Name:</strong> {selectedMember.firstName} {selectedMember.lastName}</p>
                            <p><strong>Address:</strong> {selectedMember.address}, {selectedMember.city}, {selectedMember.state} {selectedMember.zipCode}</p>
                            <p><strong>Phone Number:</strong> {selectedMember.cellPhone}</p>
                            <p><strong>Email:</strong> {selectedMember.email}</p>
                        </div>
                    ) : (
                        <p className="text-gray-400 mt-2 italic">Select a member to view details</p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default GroupMembershipForm;
