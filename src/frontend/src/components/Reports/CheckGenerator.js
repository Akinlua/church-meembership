import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import CheckTemplate from './CheckTemplate';
import MaskedDateInput from '../common/MaskedDateInput';
import SignaturePad from '../common/SignaturePad';

const CheckGenerator = () => {
  const [checkData, setCheckData] = useState({
    checkNumber: '1736',
    date: new Date(),
    payTo: '',
    amount: '',
    memo: '',
    bankName: 'Fifth Third Bank',
    bankAddress: '',
    companyName: 'Eastside Outpatient Services, PLLC',
    companyAddress: '445 E Sherman Blvd, Muskegon, MI 49441',
    signature: null
  });
  
  const checkRef = useRef(null);
  
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
    alert('Check data would be saved to database. This functionality is not yet implemented.');
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
              <input
                type="text"
                name="payTo"
                value={checkData.payTo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
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
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Save Check
              </button>
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