import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePickerField from '../common/DatePickerField';
import { ButtonLoader, PageLoader } from '../common/Loader';

const ChargeForm = ({ charge, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [formData, setFormData] = useState({
    vendorId: charge?.vendorId || '',
    expenseCategoryId: charge?.expenseCategoryId || '',
    amount: charge?.amount || '',
    chargeDate: charge?.chargeDate ? new Date(charge.chargeDate) : new Date(),
    description: charge?.description || '',
    receiptImg: charge?.receiptImg || '',
  });

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
            chargeDate: charge.chargeDate ? new Date(charge.chargeDate) : new Date(),
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
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchExpenseCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/expense-categories`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setExpenseCategories(response.data);
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
      
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error('Error saving charge:', error);
      alert('Error saving charge. Please try again.');
    } finally {
      setLoading(false);
    }
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
              <select
                name="vendorId"
                value={formData.vendorId}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-gray-300 rounded"
                required
              >
                <option value="">Select Vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Expense Category</label>
            </div>
            <div className="col-span-9">
              <select
                name="expenseCategoryId"
                value={formData.expenseCategoryId}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-gray-300 rounded"
                required
              >
                <option value="">Select Expense Category</option>
                {expenseCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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
                  className="w-full px-2 py-1 pl-7 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Charge Date</label>
            </div>
            <div className="col-span-9">
              <DatePickerField
                value={formData.chargeDate}
                onChange={(date) => setFormData({ ...formData, chargeDate: date })}
                required
                containerClassName="w-full"
                inputClassName="w-full px-2 py-1 border border-gray-300 rounded"
              />
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Description</label>
            </div>
            <div className="col-span-9">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-gray-300 rounded"
                rows="2"
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
              {loading ? <ButtonLoader text={charge ? "Updating..." : "Saving..."} /> : (charge ? "Update" : "Add") + " Charge"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ChargeForm; 