import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import axios from 'axios';
import Select from 'react-select';
import CheckTemplate from './CheckTemplate';
import MaskedDateInput from '../common/MaskedDateInput';
import SignaturePad from '../common/SignaturePad';

const CheckGenerator = () => {
  const [checkData, setCheckData] = useState({
    checkNumber: '',
    date: new Date(),
    payTo: '',
    payToAddress: '',
    amount: '',
    memo: '',
    bankName: '',
    bankAddress: '',
    companyName: '',
    companyAddress: '',
    signature: null,
    routingNumber: '',
    accountNumber: ''
  });
  
  const [vendors, setVendors] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const checkRef = useRef(null);
  
  // Fetch vendors and banks on component mount
  useEffect(() => {
    fetchVendors();
    fetchBanks();
  }, []);
  
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/vendors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Transform vendors for react-select
      const vendorOptions = response.data.map(vendor => ({
        value: vendor.id,
        label: vendor.lastName,
        vendor: vendor
      }));
      
      setVendors(vendorOptions);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/banks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Transform banks for react-select
      const bankOptions = response.data.map(bank => ({
        value: bank.id,
        label: bank.name,
        bank: bank
      }));
      
      setBanks(bankOptions);
    } catch (error) {
      console.error('Error fetching banks:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBankDetails = async (bankId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/banks/${bankId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const bank = response.data;
      
      setCheckData(prevData => ({
        ...prevData,
        bankName: bank.name,
        bankAddress: `${bank.address || ''}, ${bank.city || ''}, ${bank.state || ''} ${bank.zipCode || ''}`,
        routingNumber: bank.routingNumber || '',
        accountNumber: bank.accountNumber || ''
      }));
      
    } catch (error) {
      console.error('Error fetching bank details:', error);
    }
  };
  
  const handlePrint = useReactToPrint({
    contentRef: checkRef,
    documentTitle: `Check-${checkData.checkNumber}`,
    onAfterPrint: () => console.log('Printing completed'),
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCheckData({
      ...checkData,
      [name]: value
    });
  };
  
  const handleVendorChange = (selectedOption) => {
    if (selectedOption) {
      const vendor = selectedOption.vendor;
      
      // Format vendor address
      const vendorAddress = [
        vendor.address,
        vendor.city,
        vendor.state,
        vendor.zipCode
      ].filter(Boolean).join(', ');
      
      setCheckData({
        ...checkData,
        payTo: selectedOption.label,
        payToAddress: vendorAddress
      });
    }
  };
  
  const handleBankChange = (selectedOption) => {
    if (selectedOption) {
      setCheckData({
        ...checkData,
        bankName: selectedOption.label
      });
      
      // Fetch bank details to get routing and account numbers
      fetchBankDetails(selectedOption.value);
    }
  };
  
  const handleDateChange = (date) => {
    setCheckData({
      ...checkData,
      date: date
    });
  };
  
  const handleSignatureChange = (signatureData) => {
    setCheckData({
      ...checkData,
      signature: signatureData
    });
  };
  
  const clearSignature = () => {
    setCheckData({
      ...checkData,
      signature: null
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // You could save the check data to your database here
    // alert('Check data would be saved to database. This functionality is not yet implemented.');
  };
  
  // Custom styles for react-select
  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: '#d1d5db',
      borderRadius: '0.375rem',
      minHeight: '38px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#9ca3af'
      }
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999
    })
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Check Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Check Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check Number
                </label>
                <input
                  type="text"
                  name="checkNumber"
                  value={checkData.checkNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <MaskedDateInput
                  value={checkData.date}
                  onChange={handleDateChange}
                  inputClassName="w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay To
              </label>
              <Select
                options={vendors}
                onChange={handleVendorChange}
                placeholder="Select a vendor..."
                isSearchable
                styles={customStyles}
                className="w-full"
              />
              {checkData.payToAddress && (
                <div className="mt-1 text-sm text-gray-500">
                  {checkData.payToAddress}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={checkData.amount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Memo
              </label>
              <input
                type="text"
                name="memo"
                value={checkData.memo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank
              </label>
              <Select
                options={banks}
                onChange={handleBankChange}
                placeholder="Select a bank..."
                isSearchable
                styles={customStyles}
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Routing Number
                </label>
                <input
                  type="text"
                  name="routingNumber"
                  value={checkData.routingNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={checkData.accountNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  readOnly
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Church Name
              </label>
              <input
                type="text"
                name="companyName"
                value={checkData.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Church Address
              </label>
              <input
                type="text"
                name="companyAddress"
                value={checkData.companyAddress}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signature
              </label>
              <div className="border border-gray-300 rounded-md p-2">
                <SignaturePad 
                  value={checkData.signature}
                  onChange={handleSignatureChange}
                  width={300}
                  height={100}
                />
                <button
                  type="button"
                  onClick={clearSignature}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Clear Signature
                </button>
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="button"
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Print Check
              </button>
              {/* <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Save Check
              </button> */}
            </div>
          </form>
        </div>
        
        <div>
          <div ref={checkRef}>
            <CheckTemplate 
              checkData={checkData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckGenerator; 