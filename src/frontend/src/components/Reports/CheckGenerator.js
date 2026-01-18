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

  // Default separator positions (approx pixels)
  const defaultSeparators = {
    stub1Top: 350,   // End of Check / Start of Stub 1
    stub2Top: 700,   // End of Stub 1 / Start of Stub 2
    stub2Bottom: 1050 // End of Stub 2
  };

  const [separators, setSeparators] = useState(defaultSeparators);

  const [vendors, setVendors] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [programOwner, setProgramOwner] = useState(null);

  // Visual Zoom Scale (Screen only)
  const [scale, setScale] = useState(0.65); // Default to 65% to fit standard screens comfortably

  // Initial layout configuration
  const defaultLayout = [
    { id: 'c-name', type: 'data', field: 'companyName', x: 20, y: 20, width: 250, style: { fontWeight: 'bold', fontSize: '18px' } },
    { id: 'c-addr', type: 'data', field: 'companyAddress', x: 20, y: 50, width: 250, style: { fontSize: '14px' } },
    { id: 'b-name', type: 'data', field: 'bankName', x: 300, y: 20, width: 200, style: { fontWeight: 'bold', fontSize: '18px', textAlign: 'center' } },
    { id: 'num', type: 'data', field: 'checkNumber', x: 650, y: 20, width: 100, style: { fontWeight: 'bold', fontSize: '20px', textAlign: 'right' } },
    { id: 'date', type: 'data', field: 'date', x: 650, y: 50, width: 100, style: { fontSize: '14px', textAlign: 'right' } },

    // Middle section
    { id: 'pay-label', type: 'static', text: 'PAY TO THE\nORDER OF', x: 20, y: 120, width: 80, style: { fontSize: '10px', color: '#666' } },
    { id: 'payee', type: 'data', field: 'payTo', x: 110, y: 110, width: 500, style: { fontWeight: 'bold', fontSize: '18px', borderBottom: '1px solid #ccc' } },
    { id: 'amt', type: 'data', field: 'amount', x: 640, y: 110, width: 120, style: { fontWeight: 'bold', fontSize: '18px', border: '1px solid #ddd', padding: '5px' } },

    { id: 'amt-words', type: 'data', field: 'amountInWords', x: 20, y: 160, width: 740, style: { borderBottom: '1px solid #ccc', paddingBottom: '5px' } },

    // Bottom section
    { id: 'b-addr', type: 'data', field: 'bankAddress', x: 20, y: 220, width: 250, style: { fontSize: '12px' } },
    { id: 'memo-lbl', type: 'static', text: 'MEMO', x: 300, y: 220, width: 50, style: { fontSize: '10px', color: '#666' } },
    { id: 'memo', type: 'data', field: 'memo', x: 350, y: 215, width: 200, style: { borderBottom: '1px solid #ccc' } },
    { id: 'sig-lbl', type: 'static', text: 'AUTHORIZED SIGNATURE', x: 550, y: 270, width: 200, style: { borderTop: '1px solid #ccc', fontSize: '12px', textAlign: 'right', paddingTop: '5px' } },
    { id: 'sig', type: 'data', field: 'signature', x: 550, y: 200, width: 200, height: 60 },

    // MICR
    // MICR
    // MICR
    { id: 'micr', type: 'data', field: 'micr', x: 150, y: 320, width: 500, style: { fontFamily: 'monospace', fontSize: '18px', textAlign: 'center' } },

    // --- STUB 1 (Offset Y by +350px) ---
    { id: 's1-c-name', type: 'data', field: 'companyName', x: 20, y: 370, width: 250, style: { fontWeight: 'bold' } },
    { id: 's1-num', type: 'data', field: 'checkNumber', x: 700, y: 370, width: 80, style: { fontWeight: 'bold', textAlign: 'right' } },
    { id: 's1-payee', type: 'data', field: 'payTo', x: 20, y: 410, width: 250, style: {} },
    { id: 's1-addr', type: 'data', field: 'payToAddress', x: 20, y: 430, width: 300, style: { fontSize: '12px', color: '#666' } },
    { id: 's1-date', type: 'data', field: 'date', x: 700, y: 410, width: 80, style: { textAlign: 'right' } },
    { id: 's1-memo-l', type: 'data', field: 'payLabel', x: 20, y: 470, width: 100, style: {} },
    { id: 's1-memo-d', type: 'data', field: 'payDesc', x: 150, y: 470, width: 200, style: {} },
    { id: 's1-amt', type: 'data', field: 'amount', x: 700, y: 470, width: 80, style: { fontWeight: 'bold', textAlign: 'right' } },
    { id: 's1-bank', type: 'data', field: 'bankName', x: 20, y: 510, width: 200, style: {} },
    { id: 's1-total', type: 'data', field: 'amount', x: 700, y: 510, width: 80, style: { fontWeight: 'bold', textAlign: 'right', borderTop: '1px solid #ccc' } },

    // --- STUB 2 (Offset Y by +700px) ---
    { id: 's2-c-name', type: 'data', field: 'companyName', x: 20, y: 720, width: 250, style: { fontWeight: 'bold' } },
    { id: 's2-num', type: 'data', field: 'checkNumber', x: 700, y: 720, width: 80, style: { fontWeight: 'bold', textAlign: 'right' } },
    { id: 's2-payee', type: 'data', field: 'payTo', x: 20, y: 760, width: 250, style: {} },
    { id: 's2-addr', type: 'data', field: 'payToAddress', x: 20, y: 780, width: 300, style: { fontSize: '12px', color: '#666' } },
    { id: 's2-date', type: 'data', field: 'date', x: 700, y: 760, width: 80, style: { textAlign: 'right' } },
    { id: 's2-memo-l', type: 'data', field: 'payLabel', x: 20, y: 820, width: 100, style: {} },
    { id: 's2-memo-d', type: 'data', field: 'payDesc', x: 150, y: 820, width: 200, style: {} },
    { id: 's2-amt', type: 'data', field: 'amount', x: 700, y: 820, width: 80, style: { fontWeight: 'bold', textAlign: 'right' } },
    { id: 's2-bank', type: 'data', field: 'bankName', x: 20, y: 860, width: 200, style: {} },
    { id: 's2-total', type: 'data', field: 'amount', x: 700, y: 860, width: 80, style: { fontWeight: 'bold', textAlign: 'right', borderTop: '1px solid #ccc' } }
  ];

  const [layout, setLayout] = useState(defaultLayout);
  const [selectedElement, setSelectedElement] = useState(null);

  const checkRef = useRef(null);

  const handleLayoutChange = (id, newPosition) => {
    setLayout(prevLayout => prevLayout.map(el =>
      el.id === id ? { ...el, x: newPosition.x, y: newPosition.y } : el
    ));
  };

  const addTextElement = () => {
    const newElement = {
      id: `text-${Date.now()}`,
      type: 'static',
      text: 'New Text',
      x: 50,
      y: 50,
      width: 100,
      style: { fontSize: '14px' }
    };
    setLayout([...layout, newElement]);
  };

  const resetLayout = () => {
    if (window.confirm('Reset layout to default?')) {
      setLayout(defaultLayout);
      setSeparators(defaultSeparators);
    }
  };

  const updateElementStyle = (key, value) => {
    if (!selectedElement) return;
    setLayout(prevLayout => prevLayout.map(el =>
      el.id === selectedElement ? { ...el, style: { ...el.style, [key]: value } } : el
    ));
  };



  const updateElementText = (text) => {
    if (!selectedElement) return;
    setLayout(prevLayout => prevLayout.map(el =>
      el.id === selectedElement && el.type === 'static' ? { ...el, text } : el
    ));
  };

  const deleteElement = () => {
    if (!selectedElement) return;
    if (window.confirm('Delete this element?')) {
      setLayout(prevLayout => prevLayout.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };

  // Helper to get selected element object
  const getSelectedElementObj = () => layout.find(el => el.id === selectedElement);

  // Fetch vendors, banks, and program owner on component mount
  useEffect(() => {
    fetchVendors();
    fetchBanks();
    fetchProgramOwner();
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

  const fetchProgramOwner = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/program-owner`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const ownerData = response.data;

      if (ownerData) {
        setProgramOwner(ownerData);

        // Format full address
        const fullAddress = [
          ownerData.address,
          ownerData.city,
          ownerData.state,
          ownerData.zip
        ].filter(Boolean).join(', ');

        // Update checkData with program owner information
        setCheckData(prevData => ({
          ...prevData,
          companyName: ownerData.church,
          companyAddress: fullAddress
        }));
      }
    } catch (error) {
      console.error('Error fetching program owner:', error);
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Check Information</h2>
          </div>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly={programOwner !== null}
              />
              {!programOwner && (
                <p className="text-sm text-yellow-600 mt-1">
                  No program owner information found. Please add program owner details in Dashboard.
                </p>
              )}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly={programOwner !== null}
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
                type="button"
                onClick={resetLayout}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Reset Layout
              </button>
              <button
                type="button"
                onClick={addTextElement}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded ml-2"
              >
                Add Text
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
          {/* Zoom Control */}
          <div className="mb-4 flex items-center justify-end space-x-2">
            <span className="text-sm text-gray-600">Zoom: {Math.round(scale * 100)}%</span>
            <input
              type="range"
              min="0.3"
              max="1.5"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-32"
            />
          </div>

          <div ref={checkRef} className="check-generator-wrapper">
            <CheckTemplate
              checkData={checkData}
              layout={layout}
              separators={separators}
              scale={scale}
              onSeparatorChange={setSeparators}
              onLayoutChange={handleLayoutChange}
              onElementSelect={setSelectedElement}
              selectedElement={selectedElement}
            />
          </div>
          {selectedElement && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md border border-gray-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Element Properties</h3>
                <button
                  onClick={deleteElement}
                  className="text-red-600 text-sm hover:text-red-800"
                >
                  Delete Element
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {getSelectedElementObj()?.type === 'static' && (
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700">Text Content</label>
                    <input
                      type="text"
                      value={getSelectedElementObj()?.text || ''}
                      onChange={(e) => updateElementText(e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                )}



                <div>
                  <label className="block text-xs font-medium text-gray-700">Font Size</label>
                  <select
                    value={getSelectedElementObj()?.style?.fontSize || '14px'}
                    onChange={(e) => updateElementStyle('fontSize', e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value="10px">Small (10px)</option>
                    <option value="12px">Medium (12px)</option>
                    <option value="14px">Normal (14px)</option>
                    <option value="18px">Large (18px)</option>
                    <option value="24px">Extra Large (24px)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Font Weight</label>
                  <select
                    value={getSelectedElementObj()?.style?.fontWeight || 'normal'}
                    onChange={(e) => updateElementStyle('fontWeight', e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Width (approx px)</label>
                  <input
                    type="number"
                    value={parseInt(getSelectedElementObj()?.width || 100)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setLayout(prev => prev.map(el => el.id === selectedElement ? { ...el, width: val } : el));
                    }}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

export default CheckGenerator; 