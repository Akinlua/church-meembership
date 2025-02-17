import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import DatePickerField from '../common/DatePickerField';
import { ButtonLoader, PageLoader } from '../common/Loader';

const MemberForm = ({ member, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [formData, setFormData] = useState({
    first_name: member?.firstName || '',
    middle_name: member?.middleName || '',
    last_name: member?.lastName || '',
    is_active: member?.isActive ?? true,
    address: member?.address || '',
    city: member?.city || '',
    state: member?.state || '',
    zip_code: member?.zipCode || '',
    birthday: member?.birthday || null,
    gender: member?.gender || '',
    cell_phone: member?.cellPhone || '',
    email: member?.email || '',
    membership_date: member?.membershipDate || null,
    baptismal_date: member?.baptismalDate || null,
    profile_image: member?.profileImage || '',
    groups: member?.groups?.map(g => g.group?.id || g.groupId || g.id) || []
  });
  
  const [availableGroups, setAvailableGroups] = useState([]);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    const loadFormData = async () => {
      try {
        await fetchGroups();
        if (member) {
          const groupIds = member.groups?.map(g => g.group?.id || g.groupId || g.id) || [];
          setFormData(prev => ({
            ...prev,
            groups: groupIds
          }));
        }
        console.log('Member groups:', member?.groups);
        console.log('Formatted group IDs:', formData.groups);
      } finally {
        setFormLoading(false);
      }
    };
    loadFormData();
  }, [member]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAvailableGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 10) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    }
    return value;
  };

  const validatePhoneNumber = (phone) => {
    const phonePattern = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phonePattern.test(phone);
  };

  const handlePhoneChange = (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, cell_phone: formattedNumber });
  };

  const toggleGroup = (groupId) => {
    const updatedGroups = formData.groups.includes(groupId)
      ? formData.groups.filter(id => id !== groupId)
      : [...formData.groups, groupId];
    setFormData({ ...formData, groups: updatedGroups });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        setLoading(true);
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/upload-image`, 
          formData, 
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setFormData(prev => ({ ...prev, profile_image: response.data.imageUrl }));
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image. Please try again.');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.cell_phone && !validatePhoneNumber(formData.cell_phone)) {
      alert('Please enter a valid phone number in format (123) 456-7890');
      return;
    }
    setLoading(true);
    try {
      console.log('Submitting member data:', formData);
      const url = `${process.env.REACT_APP_API_URL}/members${member ? `/${member.id}` : ''}`;
      const method = member ? 'put' : 'post';
      
      const response = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Server response:', response.data);
      await onSubmit();
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Error saving member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {formLoading ? (
        <div className="min-h-[400px]">
          <PageLoader />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6">{member ? 'Edit' : 'Add'} Member</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.middle_name}
                    onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  />
                </div>
                <DatePickerField
                  label="Birthday"
                  value={formData.birthday}
                  onChange={(date) => setFormData({ ...formData, birthday: date })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cell Phone</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.cell_phone}
                    onChange={handlePhoneChange}
                    placeholder="(123) 456-7890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <DatePickerField
                  label="Membership Date"
                  value={formData.membership_date}
                  onChange={(date) => setFormData({ ...formData, membership_date: date })}
                />
                <DatePickerField
                  label="Baptismal Date"
                  value={formData.baptismal_date}
                  onChange={(date) => setFormData({ ...formData, baptismal_date: date })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-1 block w-full"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Groups</label>
                  <button
                    type="button"
                    className="mt-1 relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                  >
                    <span className="block truncate">
                      {formData.groups.length} groups selected
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>

                  {showGroupDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                      {availableGroups.map((group) => (
                        <div
                          key={group.id}
                          className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => toggleGroup(group.id)}
                        >
                          <input
                            type="checkbox"
                            checked={formData.groups.includes(group.id)}
                            onChange={() => {}}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-3 block text-sm text-gray-700">
                            {group.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
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
                {loading ? <ButtonLoader /> : member ? 'Update' : 'Add'} Member
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MemberForm; 