import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import DatePickerField from '../common/DatePickerField';
import { ButtonLoader, PageLoader } from '../common/Loader';
import MaskedDateInput from '../common/MaskedDateInput';


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
    groups: member?.groups?.map(g => g.group?.id || g.groupId || g.id) || [],
    past_church: member?.pastChurch || ''
  });
  
  const [availableGroups, setAvailableGroups] = useState([]);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const fileInputRef = useRef();
  const groupDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(event.target)) {
        setShowGroupDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      
      let response;
      if (member) {
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/members/${member.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        if (onSubmit) onSubmit(member.id);
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/members`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        if (onSubmit) onSubmit(response.data.id);
      }
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
    <div>
      <h2 className="text-xl font-bold mb-4 text-center">
        {member ? 'Edit Member' : 'Add Church Member'}
      </h2>
      
      {formLoading ? (
        <PageLoader />
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-x-4 gap-y-2">
            {/* Left column - Labels */}
            <div className="col-span-2">
              <div className="flex justify-end items-center h-8 mb-3">
                <label className="text-sm font-medium">First Name</label>
              </div>
              <div className="flex justify-end items-center h-8 mb-3">
                <label className="text-sm font-medium">Last Name</label>
              </div>
              <div className="flex justify-end items-center h-8 mb-3">
                <label className="text-sm font-medium">Address</label>
              </div>
              <div className="flex justify-end items-center h-8 mb-3">
                <label className="text-sm font-medium">City</label>
              </div>
              <div className="flex justify-end items-center h-8 mb-3">
                <label className="text-sm font-medium">Cell Phone</label>
              </div>
              <div className="flex justify-end items-center h-8 mb-3">
                <label className="text-sm font-medium">Birth Date</label>
              </div>
              <div className="flex justify-end items-center h-8 mb-3">
                <label className="text-sm font-medium">Membership Date</label>
              </div>
              <div className="flex justify-end items-center h-8 mb-3">
                <label className="text-sm font-medium">Past Church</label>
              </div>
              {/* <div className="flex justify-end items-center h-8 mb-3">
                <label className="text-sm font-medium">Groups</label>
              </div> */}
            </div>
            
            {/* Middle column - Form inputs */}
            <div className="col-span-6">
              <div className="mb-3 flex items-center h-8">
                <input
                  required
                  type="text"
                  className="w-full border border-gray-600 px-2 py-1 text-sm h-8"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
                <span className="mx-2 text-sm font-medium">M.I.</span>
                <input
                  type="text"
                  className="w-12 border border-gray-600 px-2 py-1 text-sm h-8"
                  value={formData.middle_name}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                />
              </div>
              
              <div className="mb-3 h-8">
                <input
                  required
                  type="text"
                  className="w-full border border-gray-600 px-2 py-1 text-sm h-8"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
              
              <div className="mb-3 h-8">
                <input
                  type="text"
                  className="w-full border border-gray-600 px-2 py-1 text-sm h-8"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              
              <div className="mb-3 flex items-center h-8">
                <input
                  type="text"
                  className="w-1/2 border border-gray-600 px-2 py-1 text-sm h-8 mr-3"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <span className="mr-2 text-sm font-medium">State</span>
                <input
                  type="text"
                  className="w-20 border border-gray-600 px-2 py-1 text-sm h-8 mr-3"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
                <span className="mr-2 text-sm font-medium">Zip</span>
                <input
                  type="text"
                  className="w-20 border border-gray-600 px-2 py-1 text-sm h-8"
                  value={formData.zip_code}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setFormData({ ...formData, zip_code: numericValue });
                  }}
                  maxLength={5}
                  pattern="[0-9]{5}"
                  placeholder="12345"
                />
              </div>
              
              <div className="mb-3 flex items-center h-8">
                <input
                  type="text"
                  className="w-1/3 border border-gray-600 px-2 py-1 text-sm h-8 mr-3"
                  value={formData.cell_phone}
                  onChange={handlePhoneChange}
                  placeholder="(123) 456-7890"
                />
                <span className="mr-2 text-sm font-medium">Email</span>
                <input
                  type="email"
                  className="flex-1 border border-gray-600 px-2 py-1 text-sm h-8"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div className="mb-3 flex items-center h-8">
                <MaskedDateInput
                  value={formData.birthday}
                  onChange={(date) => setFormData({ ...formData, birthday: date })}
                  required
                  inputClassName="w-40 mr-5"
                />
                
                <span className="text-sm font-medium mr-1">Sex</span>
                <select
                  className="w-20 border border-gray-600 px-2 py-1 text-sm h-8"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">M/F/NA</option>
                  <option value="Male">M</option>
                  <option value="Female">F</option>
                  <option value="NA">NA</option>
                </select>
              </div>
              
              <div className="mb-3 flex items-center h-8">
                <MaskedDateInput
                  value={formData.membership_date}
                  onChange={(date) => setFormData({ ...formData, membership_date: date })}
                  required
                  inputClassName="w-30 mr-5"
                />                
                
                <span className="text-sm font-medium mr-1">Baptismal Date</span>
                <MaskedDateInput
                  value={formData.baptismal_date}
                  onChange={(date) => setFormData({ ...formData, baptismal_date: date })}
                  required
                  inputClassName="w-24"
                />
              </div>
              
              <div className="mb-3 flex items-center h-8">
                <input
                  type="text"
                  className="flex-1 border border-gray-600 px-2 py-1 text-sm h-8"
                  value={formData.past_church || ''}
                  onChange={(e) => setFormData({ ...formData, past_church: e.target.value })}
                />
              </div>
              
              <div className="mb-3 flex items-center h-8">
                <span className="mr-2 text-sm font-medium">Groups</span>
                <div className="relative flex-1 mr-4" ref={groupDropdownRef}>
                  <button
                    type="button"
                    className="w-full border border-gray-600 px-2 py-1 text-sm h-8 text-left"
                    onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                  >
                    <span className="block truncate">
                      {formData.groups.length} groups selected
                    </span>
                  </button>

                  {showGroupDropdown && (
                    <div className="absolute mt-1 z-10 w-full bg-white shadow border border-gray-600 py-1 text-sm overflow-auto max-h-32">
                      {availableGroups.map((group) => (
                        <div
                          key={group.id}
                          className="flex items-center px-3 py-1 hover:bg-gray-100 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleGroup(group.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.groups.includes(group.id)}
                            onChange={() => {}}
                            className="h-3 w-3"
                          />
                          <label className="ml-2 block text-xs">
                            {formatMemberName(group)}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <span className="mr-2 text-sm font-medium">Active member</span>
                <div className="w-16 border border-gray-600 px-2 py-1 text-sm h-8 flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 mr-1"
                  />
                  <label htmlFor="is_active" className="text-sm">
                    {formData.is_active ? "Y" : "N"}
                  </label>
                </div>
              </div>
            </div>
            
            {/* Right column - Image */}
            <div className="col-span-4">
              <div className="flex flex-col items-center">
                <div className="text-sm font-medium mb-2">Member's Picture</div>
                <div className="border border-gray-300 w-48 h-48 flex items-center justify-center mb-2">
                  {formData.profile_image ? (
                    <img 
                      src={formData.profile_image} 
                      alt="Profile" 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-400 text-sm">No image</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="w-48 text-sm py-1 bg-gray-200 text-gray-700 border border-gray-300 rounded hover:bg-gray-300 mb-4"
                >
                  Upload Image
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <div className="flex space-x-2 mt-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1 border border-transparent rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? <ButtonLoader /> : (member ? 'Update' : 'Add')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default MemberForm; 