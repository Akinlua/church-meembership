import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import DatePickerField from '../common/DatePickerField';
import { ButtonLoader, PageLoader } from '../common/Loader';
import MaskedDateInput from '../common/MaskedDateInput';
import Modal from '../../common/Modal';


const MemberForm = ({ member, onClose, onSubmit, isPublicForm = false }) => {
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
    past_church: member?.pastChurch || '',
    source: isPublicForm ? 'qr_code' : 'admin'  // Track the source of submission
  });
  
  const [availableGroups, setAvailableGroups] = useState([]);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const fileInputRef = useRef();
  const groupDropdownRef = useRef(null);
  const groupButtonRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

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
    if (isPublicForm) {
      setFormLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAvailableGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setFormLoading(false);
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
        
        // Handle the public form case differently
        const headers = {
          'Content-Type': 'multipart/form-data'
        };
        
        if (!isPublicForm) {
          headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
        }
        
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/upload-image`, 
          formData, 
          { headers }
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
    setLoading(true);

    try {
      const url = `${process.env.REACT_APP_API_URL}/members${member ? `/${member.id}` : ''}`;
      const method = member ? 'put' : 'post';
      
      let headers = {};
      if (!isPublicForm) {
        headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
      }
      
      // For public form, we're using a special public endpoint
      const apiUrl = isPublicForm 
        ? `${process.env.REACT_APP_API_URL}/public/members` 
        : url;
      
      const response = await axios[isPublicForm ? 'post' : method](apiUrl, formData, { headers });
      
      // Call the provided onSubmit callback with the new member ID
      if (onSubmit) {
        onSubmit(response.data.id);
      }

      // Show modal only when adding a new member and not in public form mode
      if (!member && !isPublicForm) {
        setShowModal(true);
      } else if (!isPublicForm) {
        onClose(); // Close the form if updating
      }
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Failed to save member information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAdding = () => {
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      is_active: true,
      address: '',
      city: '',
      state: '',
      zip_code: '',
      birthday: null,
      gender: '',
      cell_phone: '',
      email: '',
      membership_date: null,
      baptismal_date: null,
      profile_image: '',
      groups: [],
      past_church: '',
      source: 'admin'  // Reset source to admin
    });
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onClose();
  };

  const formatMemberName = (member) => {
    if (typeof member?.name === 'string') return member.name;
    if (member?.firstName && member?.lastName) {
      return `${member.lastName}, ${member.firstName}`;
    }
    return 'Unknown';
  };

  const toggleGroupDropdown = () => {
    if (!showGroupDropdown && groupButtonRef.current) {
      const rect = groupButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setShowGroupDropdown(!showGroupDropdown);
  };

  if (formLoading) {
    return <PageLoader />;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-center">
        {isPublicForm 
          ? 'Church Membership Registration' 
          : (member ? 'Edit Member' : 'Add Church Member')}
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
              <div className="flex justify-end items-center h-8 mb-3">
                <label className="text-sm font-medium">Groups</label>
              </div>
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
                  className="w-2/3 border border-gray-600 px-2 py-1 text-sm h-8 mr-3"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <span className="mr-2 text-sm font-medium">State</span>
                <input
                  type="text"
                  className="w-12 border border-gray-600 px-2 py-1 text-sm h-8 mr-3"
                  value={formData.state}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().slice(0, 2);
                    setFormData({ ...formData, state: value });
                  }}
                />
                <span className="mr-2 text-sm font-medium">Zip</span>
                <input
                  type="text"
                  className="w-16 border border-gray-600 px-2 py-1 text-sm h-8"
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
                
                <span className="text-sm font-medium mr-1">Baptismal</span>
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
                {/* <span className="mr-2 text-sm font-medium">Groups</span> */}
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
                    <div className="absolute left-0 right-0 mt-1 z-50 bg-white shadow-lg border-2 border-blue-500 py-2 text-sm overflow-y-auto" style={{maxHeight: "200px", top: "100%"}}>
                      {availableGroups.length > 0 ? (
                        availableGroups.map((group) => (
                          <div
                            key={group.id}
                            className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGroup(group.id);
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={formData.groups.includes(group.id)}
                              onChange={() => {}}
                              className="h-4 w-4"
                            />
                            <label className="ml-2 block text-sm">
                              {formatMemberName(group)}
                            </label>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500">No groups available</div>
                      )}
                    </div>
                  )}
                </div>

                <span className="mr-2 text-sm font-medium">Active</span>
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
            <div className="col-span-4 flex flex-col justify-between">
              <div className="flex flex-col items-center">
                <div className="text-sm font-medium mb-2">Member's Picture</div>
                <div
                  className="border border-gray-300 w-48 h-48 flex items-center justify-center mb-2 cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
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
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {/* Member ID Field */}
                
                  <div className="mt-2">
                    <label className="text-sm font-medium">Member ID: {member ? member.memberNumber : "" }</label>
                  </div>
              </div>

              {/* Push buttons to the bottom */}
              <div className="flex space-x-2 mt-auto" style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
                  style={{ marginLeft: '34px', marginBottom: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1 border border-transparent rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  style={{ marginBottom: '12px' }}
                >
                  {loading ? <ButtonLoader /> : (member ? 'Update' : 'Submit')}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {showModal && !isPublicForm && (
        <Modal onClose={handleCloseModal}>
          <h2 className="text-lg font-bold">Success!</h2>
          <p>Member added successfully! Do you want to add another?</p>
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

export default MemberForm; 