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

  // Collapsible form state
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

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

  // NEW FEATURES

  // Copy/Paste functionality
  const [copiedElement, setCopiedElement] = useState(null);

  const copyElement = () => {
    if (!selectedElement) return;
    const elementToCopy = layout.find(el => el.id === selectedElement);
    if (elementToCopy) {
      setCopiedElement(elementToCopy);
    }
  };

  const pasteElement = () => {
    if (!copiedElement) return;
    const newElement = {
      ...copiedElement,
      id: `${copiedElement.type}-${Date.now()}`,
      x: copiedElement.x + 20,
      y: copiedElement.y + 20
    };
    setLayout([...layout, newElement]);
    setSelectedElement(newElement.id);
  };

  // Line drawing
  const addLine = (orientation = 'horizontal') => {
    const newLine = {
      id: `line-${Date.now()}`,
      type: 'line',
      orientation: orientation,
      x: 50,
      y: 50,
      width: orientation === 'horizontal' ? 200 : 2,
      height: orientation === 'horizontal' ? 2 : 100,
      thickness: 2,
      color: '#000',
      style: {}
    };
    setLayout([...layout, newLine]);
    setSelectedElement(newLine.id);
  };

  // Element resizing
  const handleElementResize = (id, newDimensions) => {
    setLayout(prevLayout => prevLayout.map(el =>
      el.id === id ? { ...el, width: newDimensions.width, height: newDimensions.height } : el
    ));
  };

  // Update element dimensions
  const updateElementDimension = (key, value) => {
    if (!selectedElement) return;
    setLayout(prevLayout => prevLayout.map(el =>
      el.id === selectedElement ? { ...el, [key]: value } : el
    ));
  };

  // Save/Load layouts
  const [savedLayouts, setSavedLayouts] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [layoutName, setLayoutName] = useState('');

  // Load saved layouts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('checkLayouts');
    if (stored) {
      try {
        setSavedLayouts(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading layouts:', e);
      }
    }

    // Load default layout if set
    const defaultLayoutName = localStorage.getItem('defaultCheckLayout');
    if (defaultLayoutName) {
      loadLayoutByName(defaultLayoutName);
    }
  }, []);

  const saveLayout = () => {
    if (!layoutName.trim()) {
      alert('Please enter a layout name');
      return;
    }

    const layoutData = {
      name: layoutName,
      layout: layout,
      separators: separators,
      version: '1.0',
      createdAt: new Date().toISOString()
    };

    const existingIndex = savedLayouts.findIndex(l => l.name === layoutName);
    let newLayouts;

    if (existingIndex >= 0) {
      // Update existing
      newLayouts = [...savedLayouts];
      newLayouts[existingIndex] = layoutData;
    } else {
      // Add new
      newLayouts = [...savedLayouts, layoutData];
    }

    setSavedLayouts(newLayouts);
    localStorage.setItem('checkLayouts', JSON.stringify(newLayouts));
    setShowSaveModal(false);
    setLayoutName('');
    alert(`Layout "${layoutData.name}" saved successfully!`);
  };

  const loadLayoutByName = (name) => {
    const layoutData = savedLayouts.find(l => l.name === name);
    if (layoutData) {
      setLayout(layoutData.layout);
      setSeparators(layoutData.separators);
      setSelectedElement(null);
    }
  };

  const setAsDefaultLayout = () => {
    if (!layoutName.trim()) {
      alert('Please enter and save a layout first');
      return;
    }
    localStorage.setItem('defaultCheckLayout', layoutName);
    alert(`"${layoutName}" set as default layout`);
  };

  const deleteLayout = (name) => {
    if (window.confirm(`Delete layout "${name}"?`)) {
      const newLayouts = savedLayouts.filter(l => l.name !== name);
      setSavedLayouts(newLayouts);
      localStorage.setItem('checkLayouts', JSON.stringify(newLayouts));

      // Clear default if deleting it
      if (localStorage.getItem('defaultCheckLayout') === name) {
        localStorage.removeItem('defaultCheckLayout');
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Copy (Ctrl/Cmd + C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedElement) {
        e.preventDefault();
        copyElement();
      }
      // Paste (Ctrl/Cmd + V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && copiedElement) {
        e.preventDefault();
        pasteElement();
      }
      // Delete
      if (e.key === 'Delete' && selectedElement) {
        deleteElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, copiedElement]);


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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Check Generator</h1>
        <button
          onClick={() => setIsFormCollapsed(!isFormCollapsed)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
        >
          {isFormCollapsed ? '→ Show Form' : '← Hide Form'}
        </button>
      </div>

      <div className={`grid gap-8 ${isFormCollapsed ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {/* Form Section - Collapsible */}
        {!isFormCollapsed && (
          <div className="bg-white p-6 rounded-lg shadow-md max-h-[85vh] overflow-y-auto">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
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

              <div className="pt-4 space-y-2">
                {/* Action Buttons Row 1 */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
                </div>

                {/* Action Buttons Row 2 - Add Elements */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={addTextElement}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  >
                    + Text
                  </button>
                  <button
                    type="button"
                    onClick={() => addLine('horizontal')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                  >
                    ─ H-Line
                  </button>
                  <button
                    type="button"
                    onClick={() => addLine('vertical')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                  >
                    │ V-Line
                  </button>
                </div>

                {/* Action Buttons Row 3 - Layout Management */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    💾 Save Layout
                  </button>
                  {savedLayouts.length > 0 && (
                    <select
                      onChange={(e) => loadLayoutByName(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md font-medium"
                      defaultValue=""
                    >
                      <option value="" disabled>Load Layout...</option>
                      {savedLayouts.map((saved) => (
                        <option key={saved.name} value={saved.name}>
                          {saved.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Keyboard Shortcuts Info */}
                <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                  <strong>Shortcuts:</strong> Ctrl+C (Copy) | Ctrl+V (Paste) | Delete (Remove)
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Check Preview Section - Always Visible */}
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
              onElementResize={handleElementResize}
            />
          </div>
          {selectedElement && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md border border-gray-300">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold">Element Properties</h3>
                <div className="flex gap-2">
                  <button
                    onClick={copyElement}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={pasteElement}
                    disabled={!copiedElement}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    📄 Paste
                  </button>
                  <button
                    onClick={deleteElement}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
                  >
                    🗑️ Delete
                  </button>
                </div>
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

                {getSelectedElementObj()?.type === 'line' && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700">Line Orientation</label>
                      <select
                        value={getSelectedElementObj()?.orientation || 'horizontal'}
                        onChange={(e) => updateElementDimension('orientation', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      >
                        <option value="horizontal">Horizontal ─</option>
                        <option value="vertical">Vertical │</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Thickness (px)</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={getSelectedElementObj()?.thickness || 2}
                        onChange={(e) => updateElementDimension('thickness', parseInt(e.target.value))}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Color</label>
                      <input
                        type="color"
                        value={getSelectedElementObj()?.color || '#000000'}
                        onChange={(e) => updateElementDimension('color', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm h-8"
                      />
                    </div>
                  </>
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
                  <label className="block text-xs font-medium text-gray-700">Line Height</label>
                  <div className="flex gap-1">
                    <button onClick={() => updateElementStyle('lineHeight', '1')} className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs">1.0x</button>
                    <button onClick={() => updateElementStyle('lineHeight', '1.5')} className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs">1.5x</button>
                    <button onClick={() => updateElementStyle('lineHeight', '2')} className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs">2.0x</button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Width (px)</label>
                  <input
                    type="number"
                    value={parseInt(getSelectedElementObj()?.width || 100)}
                    onChange={(e) => updateElementDimension('width', parseInt(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Height (px)</label>
                  <input
                    type="number"
                    value={parseInt(getSelectedElementObj()?.height || 0)}
                    onChange={(e) => updateElementDimension('height', parseInt(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Layout Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Save Layout</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout Name
              </label>
              <input
                type="text"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                placeholder="My Custom Check Layout"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                autoFocus
              />
            </div>

            {savedLayouts.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saved Layouts
                </label>
                <div className="max-h-32 overflow-y-auto border rounded p-2">
                  {savedLayouts.map((saved) => (
                    <div key={saved.name} className="flex justify-between items-center py-1">
                      <span className="text-sm">{saved.name}</span>
                      <button
                        onClick={() => deleteLayout(saved.name)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setLayoutName('');
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveLayout}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Save
              </button>
              {layoutName && (
                <button
                  onClick={setAsDefaultLayout}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default CheckGenerator; 