import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import MaskedDateInput from '../common/MaskedDateInput';
import { ButtonLoader, PageLoader } from '../common/Loader';
import Modal from '../../common/Modal';

const customStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: 'black',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'black',
    },
    width: '250px',
  }),
};

const ChargeForm = ({ charge, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [formData, setFormData] = useState({
    vendorId: charge?.vendorId || '',
    expenseCategoryId: charge?.expenseCategoryId || '',
    amount: charge?.amount || '',
    dueDate: charge?.dueDate ? new Date(charge.dueDate) : new Date(),
    description: charge?.description || '',
    receiptImg: charge?.receiptImg || '',
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        await Promise.all([
          fetchVendors(),
          fetchExpenseCategories()
        ]);
        
        if (charge) {
          setFormData({
            vendorId: charge.vendorId || '',
            expenseCategoryId: charge.expenseCategoryId || '',
            amount: charge.amount || '',
            dueDate: charge.dueDate ? new Date(charge.dueDate) : new Date(),
            description: charge.description || '',
            receiptImg: charge.receiptImg || '',
          });
        }
      } finally {
        setFormLoading(false);
      }
    };
    
    loadFormData();
  }, [charge]);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/vendors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVendors(response.data.map(vendor => ({ value: vendor.id, label: `${vendor.lastName}` })));
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchExpenseCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/expense-categories`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setExpenseCategories(response.data.map(category => ({ value: category.id, label: category.name })));
    } catch (error) {
      console.error('Error fetching expense categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_API_URL}/charges${charge ? `/${charge.id}` : ''}`;
      const method = charge ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setShowModal(true);
    } catch (error) {
      console.error('Error saving charge:', error);
      alert('Error saving charge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAdding = () => {
    setFormData({
      vendorId: '',
      expenseCategoryId: '',
      amount: '',
      dueDate: new Date(),
      description: '',
      receiptImg: ''
    });
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onClose();
  };

  const formatCurrency = (value) => {
    const number = parseFloat(value);
    if (isNaN(number)) return value;
    return number.toFixed(2);
  };

  return (
    <div className="px-2 py-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        {charge ? 'Edit' : 'Add'} Charge
      </h2>

      {formLoading ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <PageLoader />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-x-4 gap-y-2">
            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Vendor</label>
            </div>
            <div className="col-span-9">
              <Select
                name="vendorId"
                options={vendors}
                value={formData.vendorId}
                onChange={(selected) => setFormData({ ...formData, vendorId: selected })}
                placeholder="Select Vendor"
                isSearchable
                styles={customStyles}
                required
              />
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Expense Category</label>
            </div>
            <div className="col-span-9">
              <Select
                name="expenseCategoryId"
                options={expenseCategories}
                value={formData.expenseCategoryId}
                onChange={(selected) => setFormData({ ...formData, expenseCategoryId: selected })}
                placeholder="Select Expense Category"
                isSearchable
                styles={customStyles}
                required
              />
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Amount</label>
            </div>
            <div className="col-span-9">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  onBlur={() => setFormData({ ...formData, amount: formatCurrency(formData.amount) })}
                  placeholder="0.00"
                  step="0.01"
                  required
                  className="w-34 px-2 py-1 pl-7 border border-gray-600"
                />
              </div>
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
            </div>
            <div className="col-span-3">
              <MaskedDateInput
                value={formData.dueDate}
                onChange={(date) => setFormData({ ...formData, dueDate: date })}
                required
                inputClassName="w-full px-2 py-1 border-gray-600"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? <ButtonLoader text={charge ? "Updating..." : "Saving..."} /> : (charge ? "Update" : "Save")}
            </button>
          </div>
        </form>
      )}

      {showModal && (
        <Modal onClose={handleCloseModal}>
          <h2 className="text-lg font-bold">Success!</h2>
          <p>Charge added successfully! Do you want to add another?</p>
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

export default ChargeForm; 