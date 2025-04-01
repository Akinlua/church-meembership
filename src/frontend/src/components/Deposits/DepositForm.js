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
    checks: [{ amount: '' }, { amount: '' }],
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
            checks: deposit.checks && deposit.checks.length > 0 
              ? deposit.checks.map(check => ({ amount: check.amount }))
              : [{ amount: '' }, { amount: '' }],
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
    
    // Calculate the total check amount
    const totalCheckAmount = formData.checks.reduce((sum, check) => {
      return sum + (parseFloat(check.amount) || 0);
    }, 0);
    
    updatedFormData.total_amount = (cashAmount + totalCheckAmount).toFixed(2);
    
    setFormData(updatedFormData);
  };

  const handleCheckChange = (index, value) => {
    // Remove non-numeric characters except decimal point
    value = value.replace(/[^0-9.]/g, '');
    
    const updatedChecks = [...formData.checks];
    updatedChecks[index] = {
      ...updatedChecks[index],
      amount: value
    };
    
    const updatedFormData = {
      ...formData,
      checks: updatedChecks
    };
    
    // Calculate the total check amount
    const totalCheckAmount = updatedChecks.reduce((sum, check) => {
      return sum + (parseFloat(check.amount) || 0);
    }, 0);
    
    // Calculate total automatically
    const cashAmount = parseFloat(formData.cash_amount) || 0;
    updatedFormData.total_amount = (cashAmount + totalCheckAmount).toFixed(2);
    
    setFormData(updatedFormData);
  };

  const addCheckField = () => {
    setFormData({
      ...formData,
      checks: [...formData.checks, { amount: '' }]
    });
  };

  const removeCheckField = (index) => {
    if (formData.checks.length === 1) {
      return;
    }
    
    const updatedChecks = formData.checks.filter((_, i) => i !== index);
    
    // Recalculate total
    const totalCheckAmount = updatedChecks.reduce((sum, check) => {
      return sum + (parseFloat(check.amount) || 0);
    }, 0);
    
    const cashAmount = parseFloat(formData.cash_amount) || 0;
    const updatedTotal = (cashAmount + totalCheckAmount).toFixed(2);
    
    setFormData({
      ...formData,
      checks: updatedChecks,
      total_amount: updatedTotal
    });
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
        checks: formData.checks.map(check => ({
          amount: parseFloat(check.amount) || 0
        })),
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
      checks: [{ amount: '' }, { amount: '' }],
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
                onKeyDown={(e) => {
                  // Prevent Enter key from submitting the form
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
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
                  className="w-40 pl-7 px-2 py-1 border border-gray-600 text-right"
                  placeholder="0.00"
                  onBlur={() => setFormData({
                    ...formData,
                    cash_amount: formatCurrency(formData.cash_amount)
                  })}
                />
              </div>
            </div>

            <div className="col-span-3 flex items-center">
              <label className="block text-sm font-medium text-gray-700">Checks</label>
            </div>
            <div className="col-span-9">
              {formData.checks.map((check, index) => (
                <div key={index} className="flex items-center mb-2">
                  <div className="relative" style={{ width: "168px" }}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="text"
                      value={check.amount}
                      onChange={(e) => handleCheckChange(index, e.target.value)}
                      className="w-40 pl-7 px-2 py-1 border border-gray-600 text-right"
                      placeholder="0.00"
                      onBlur={() => {
                        const updatedChecks = [...formData.checks];
                        updatedChecks[index] = {
                          ...updatedChecks[index],
                          amount: formatCurrency(updatedChecks[index].amount)
                        };
                        setFormData({
                          ...formData,
                          checks: updatedChecks
                        });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCheckField(index)}
                    className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    -
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCheckField}
                className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                + Add Check
              </button>
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
                  className="w-40 pl-7 px-2 py-1 border border-gray-600 bg-gray-100 text-right"
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