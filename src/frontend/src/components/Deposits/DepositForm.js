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

const DepositForm = ({ deposit, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [banks, setBanks] = useState([]);
  const [accountOptions, setAccountOptions] = useState([]);
  const [formData, setFormData] = useState({
    bank_id: '',
    account_number: '',
    date: new Date(),
    cash_amount: '',
    check_amount: '',
    total_amount: '',
    notes: ''
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        await fetchBanks();
        
        if (deposit) {
          const selectedBank = { 
            value: deposit.bankId, 
            label: deposit.bank?.name || 'Unknown Bank' 
          };
          
          setFormData({
            bank_id: selectedBank,
            account_number: deposit.accountNumber ? { 
              value: deposit.accountNumber, 
              label: deposit.accountNumber 
            } : '',
            date: deposit.date ? new Date(deposit.date) : new Date(),
            cash_amount: deposit.cashAmount || '',
            check_amount: deposit.checkAmount || '',
            total_amount: deposit.totalAmount || '',
            notes: deposit.notes || ''
          });
          
          if (deposit.bankId) {
            await loadAccountNumbers(deposit.bankId);
          }
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setFormLoading(false);
      }
    };
    
    loadFormData();
  }, [deposit]);

  const fetchBanks = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/banks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBanks(response.data.map(bank => ({ 
        value: bank.id, 
        label: bank.name 
      })));
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };

  const loadAccountNumbers = async (bankId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/banks/${bankId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data && response.data.accountNumber) {
        const options = [{
          value: response.data.accountNumber,
          label: response.data.accountNumber
        }];
        setAccountOptions(options);
        setFormData((prevData) => ({
          ...prevData,
          account_number: options[0] // Pre-fill with the account number
        }));
      } else {
        setAccountOptions([]);
      }
    } catch (error) {
      console.error('Error loading account number:', error);
      setAccountOptions([]);
    }
  };

  const handleBankChange = (selected) => {
    setFormData({ 
      ...formData, 
      bank_id: selected,
      account_number: '' // Reset account number when bank changes
    });
    
    if (selected && selected.value) {
      loadAccountNumbers(selected.value);
    } else {
      setAccountOptions([]);
    }
  };

  const handleAccountChange = (selected) => {
    setFormData({ ...formData, account_number: selected });
  };

  const handleAmountChange = (field, value) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    const updatedFormData = { 
      ...formData, 
      [field]: numericValue 
    };
    
    // Calculate total automatically
    const cashAmount = parseFloat(field === 'cash_amount' ? numericValue : formData.cash_amount) || 0;
    const checkAmount = parseFloat(field === 'check_amount' ? numericValue : formData.check_amount) || 0;
    
    updatedFormData.total_amount = (cashAmount + checkAmount).toFixed(2);
    
    setFormData(updatedFormData);
  };

  const formatCurrency = (value) => {
    const number = parseFloat(value);
    if (isNaN(number)) return '';
    return number.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!formData.bank_id || !formData.bank_id.value) {
        alert('Please select a valid bank.');
        setLoading(false);
        return;
      }
      
      if (!formData.account_number || !formData.account_number.value) {
        alert('Please select a valid account number.');
        setLoading(false);
        return;
      }
      
      const depositData = {
        bank_id: formData.bank_id.value,
        account_number: formData.account_number.value,
        date: formData.date,
        cash_amount: parseFloat(formData.cash_amount) || 0,
        check_amount: parseFloat(formData.check_amount) || 0,
        total_amount: parseFloat(formData.total_amount) || 0,
        notes: formData.notes
      };
      
      const url = `${process.env.REACT_APP_API_URL}/deposits${deposit ? `/${deposit.id}` : ''}`;
      const method = deposit ? 'put' : 'post';
      
      const response = await axios[method](url, depositData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!deposit) {
        setShowModal(true);
      } else {
        onSubmit(response.data);
      }
    } catch (error) {
      console.error('Error saving deposit:', error);
      alert('Error saving deposit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAdding = () => {
    setFormData({
      bank_id: '',
      account_number: '',
      date: new Date(),
      cash_amount: '',
      check_amount: '',
      total_amount: '',
      notes: ''
    });
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onSubmit();
  };

  return (
    <div className="px-2 py-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        {deposit ? 'Edit Deposit' : 'Add Deposit Form'}
      </h2>

      {formLoading ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <PageLoader />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-x-4 gap-y-2">
            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Bank Name</label>
            </div>
            <div className="col-span-9">
              <Select
                options={banks}
                value={formData.bank_id}
                onChange={handleBankChange}
                placeholder="Select Bank"
                isSearchable
                styles={customStyles}
                required
              />
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Account #</label>
            </div>
            <div className="col-span-9">
              <Select
                options={accountOptions}
                value={formData.account_number}
                onChange={handleAccountChange}
                placeholder="Select Account Number"
                isSearchable
                styles={customStyles}
                required
                isDisabled={!formData.bank_id}
              />
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Date</label>
            </div>
            <div className="col-span-9">
              <MaskedDateInput
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                required
                className="w-full px-2 py-1 border border-gray-600"
              />
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Cash Amount</label>
            </div>
            <div className="col-span-9">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  value={formData.cash_amount}
                  onChange={(e) => handleAmountChange('cash_amount', e.target.value)}
                  className="w-25 pl-7 px-2 py-1 border border-gray-600"
                  placeholder="0.00"
                  onBlur={() => setFormData({
                    ...formData,
                    cash_amount: formatCurrency(formData.cash_amount)
                  })}
                />
              </div>
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Checks Amount</label>
            </div>
            <div className="col-span-9">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  value={formData.check_amount}
                  onChange={(e) => handleAmountChange('check_amount', e.target.value)}
                  className="w-25 pl-7 px-2 py-1 border border-gray-600"
                  placeholder="0.00"
                  onBlur={() => setFormData({
                    ...formData,
                    check_amount: formatCurrency(formData.check_amount)
                  })}
                />
              </div>
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Total</label>
            </div>
            <div className="col-span-9">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  value={formData.total_amount}
                  className="w-25 pl-7 px-2 py-1 border border-gray-600 bg-gray-100"
                  readOnly
                />
              </div>
            </div>

           
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
              {loading ? <ButtonLoader text={deposit ? "Updating..." : "Saving..."} /> : (deposit ? "Update" : "Save")}
            </button>
          </div>
        </form>
      )}

      {/* Modal for confirmation */}
      {showModal && (
        <Modal onClose={handleCloseModal}>
          <h2 className="text-lg font-bold">Success!</h2>
          <p>Deposit added successfully! Do you want to add another?</p>
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

export default DepositForm; 