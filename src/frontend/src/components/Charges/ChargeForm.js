import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ButtonLoader, PageLoader } from '../common/Loader';
import { format } from 'date-fns';

const ChargeForm = ({ charge, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [formData, setFormData] = useState({
    vendorId: '',
    expenseCategoryId: '',
    amount: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    isPaid: false,
    notes: ''
  });

  useEffect(() => {
    // Fetch vendors and expense categories
    const fetchFormData = async () => {
      try {
        const [vendorsResponse, categoriesResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/vendors`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/expense-categories`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);
        
        setVendors(vendorsResponse.data);
        setExpenseCategories(categoriesResponse.data);
        
        // If editing, set form data from charge
        if (charge) {
          setFormData({
            vendorId: charge.vendorId ? charge.vendorId.toString() : '',
            expenseCategoryId: charge.expenseCategoryId ? charge.expenseCategoryId.toString() : '',
            amount: charge.amount ? charge.amount.toString() : '',
            dueDate: charge.dueDate ? format(new Date(charge.dueDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            isPaid: charge.isPaid || false,
            notes: charge.notes || ''
          });
        }
        
        setFormLoading(false);
      } catch (error) {
        console.error('Error fetching form data:', error);
        setFormLoading(false);
      }
    };
    
    fetchFormData();
  }, [charge]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      
      if (charge) {
        // Update existing charge
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/charges/${charge.id}`,
          formData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
      } else {
        // Create new charge
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/charges`,
          formData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
      }

      if (onSubmit) {
        onSubmit(response.data.id);
      }
    } catch (error) {
      console.error('Error saving charge:', error);
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
          <h2 className="text-2xl font-bold mb-6">{charge ? 'Edit' : 'Add'} Charge</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vendor</label>
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Expense Category</label>
                <select
                  name="expenseCategoryId"
                  value={formData.expenseCategoryId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* <div className="flex items-center h-full mt-8">
                <input
                  type="checkbox"
                  name="isPaid"
                  checked={formData.isPaid}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm font-medium text-gray-700">
                  Paid
                </label>
              </div> */}
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div> */}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                disabled={loading}
              >
                {loading ? <ButtonLoader text={charge ? "Updating..." : "Saving..."} /> : (charge ? "Update" : "Save")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChargeForm; 