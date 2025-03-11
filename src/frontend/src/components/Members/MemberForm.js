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
          const groupIds = member.groups?.map(g => {
            return g.group?.id || g.groupId || g.id;
          }).filter(id => id) || [];
          
          setFormData(prev => ({
            ...prev,
            groups: groupIds
          }));
        }
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
        alert('Failed to upload image');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (member) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/members/${member.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/members`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      }
      
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  const formatMemberName = (member) => {
    if (typeof member?.name === 'string') return member.name;
    if (member?.firstName && member?.lastName) {
      return `${member.lastName}, ${member.firstName}`;
    }
    return 'Unknown';
  };

  if (formLoading) {
    return <PageLoader />;
  }

  return (
    <div className="p-2">
      <h2 className="text-xl font-bold mb-4 text-center">
        {member ? 'Edit Member' : 'Add Member'}
      </h2>
      
      {formLoading ? (
        <PageLoader />
      ) : (
        <div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-12 gap-3">
              {/* Left side - Personal info */}
              <div className="col-span-9 grid grid-cols-12 gap-3">
                <div className="col-span-5">
                  <label className="block text-sm font-medium text-gray-700">First Name*</label>
                  <input
                    required
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Middle</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    value={formData.middle_name}
                    onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                  />
                </div>
                
                <div className="col-span-5">
                  <label className="block text-sm font-medium text-gray-700">Last Name*</label>
                  <input
                    required
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
                
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                
                <div className="col-span-5">
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Zip</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  />
                </div>
                
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Cell Phone</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    value={formData.cell_phone}
                    onChange={handlePhoneChange}
                    placeholder="(123) 456-7890"
                  />
                </div>
                
                <div className="col-span-8">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                
                <div className="col-span-4">
                  <DatePickerField
                    label="Birthday"
                    value={formData.birthday}
                    onChange={(date) => setFormData({ ...formData, birthday: date })}
                    className="text-sm"
                  />
                </div>
                
                <div className="col-span-4">
                  <div className="flex items-center h-full mt-6">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                      Active Member
                    </label>
                  </div>
                </div>
                
                <div className="col-span-6">
                  <DatePickerField
                    label="Membership Date"
                    value={formData.membership_date}
                    onChange={(date) => setFormData({ ...formData, membership_date: date })}
                    className="text-sm"
                  />
                </div>
                
                <div className="col-span-6">
                  <DatePickerField
                    label="Baptismal Date"
                    value={formData.baptismal_date}
                    onChange={(date) => setFormData({ ...formData, baptismal_date: date })}
                    className="text-sm"
                  />
                </div>
              </div>
              
              {/* Right side - Image and Groups */}
              <div className="col-span-3 flex flex-col space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Member's Picture</p>
                  <div className="border-2 border-dashed border-gray-300 rounded p-2 flex flex-col items-center justify-center h-40">
                    {formData.profile_image ? (
                      <img 
                        src={formData.profile_image} 
                        alt="Profile" 
                        className="max-h-36 max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-400 text-sm">No image</div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="mt-2 w-full text-sm py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    {formData.profile_image ? 'Change Image' : 'Upload Image'}
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Groups</label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-3 py-1 text-left text-sm cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                    >
                      <span className="block truncate">
                        {formData.groups.length} groups selected
                      </span>
                    </button>

                    {showGroupDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-40 rounded-md py-1 text-sm overflow-auto focus:outline-none">
                        {availableGroups.map((group) => (
                          <div
                            key={group.id}
                            className="flex items-center px-3 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={() => toggleGroup(group.id)}
                          >
                            <input
                              type="checkbox"
                              checked={formData.groups.includes(group.id)}
                              onChange={() => {}}
                              className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-xs text-gray-700">
                              {formatMemberName(group)}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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