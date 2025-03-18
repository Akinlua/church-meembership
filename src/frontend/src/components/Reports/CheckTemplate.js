import React from 'react';
import { format } from 'date-fns';
import './CheckTemplate.css'; // Create this CSS file for the styles

const CheckTemplate = ({ checkData }) => {
  const {
    checkNumber,
    date,
    payTo,
    payToAddress,
    amount,
    memo,
    bankName,
    bankAddress,
    companyName,
    companyAddress,
    signature,
    routingNumber,
    accountNumber
  } = checkData;

  // Format the amount in words
  const amountInWords = convertNumberToWords(amount);
  
  // Format the amount with 2 decimal places
  const formattedAmount = parseFloat(amount || 0).toFixed(2);
  
  // Format date for display
  const formattedDate = date ? format(new Date(date), 'MM/dd/yyyy') : '';
  
  // Format check number to always be 6 digits with leading zeros
  const formattedCheckNumber = checkNumber ? 
    checkNumber.toString().padStart(6, '0') : 
    '001736';

  return (
    <div className="check-template">
      <div className="check-wrapper" id="check-to-print">
        {/* Main check section (now at the top) */}
        <div className="check-main p-4 border-b border-gray-300">
          {/* Check header */}
          <div className="flex justify-between mb-4">
            <div className="company-info w-1/3">
              <div className="font-bold text-lg">{companyName || 'Eastside Outpatient Services, PLLC'}</div>
              <div className="text-sm">{companyAddress || '123 E. Sample St., Anytown, MI 48001'}</div>
            </div>
            <div className="bank-info-top text-center w-1/3">
              <div className="font-bold text-lg">{bankName || 'Fifth Third Bank'}</div>
            </div>
            <div className="check-number-date w-1/3 text-right">
              <div className="font-bold text-lg">{formattedCheckNumber}</div>
              <div className="text-sm">{formattedDate || '01/29/2016'}</div>
            </div>
          </div>

          {/* Pay to section */}
          <div className="pay-to-section mb-2 flex">
            <div className="text-xs text-gray-600 mr-1">
              <div>PAY TO THE</div>
              <div>ORDER OF</div>
            </div>
            <div className="payee-line flex-grow border-b border-gray-400">
              <span className="payee-name font-bold">{payTo || 'Morgan Stanley'}</span>
            </div>
            <div className="amount-box border border-gray-400 px-2 py-1 ml-2">
              <span className="font-bold">${formattedAmount || '13,239.72'}</span>
            </div>
          </div>
          
          {/* Amount in words */}
          <div className="amount-in-words mb-4 border-b border-gray-400 pb-1">
            {amountInWords || 'Thirteen Thousand Two Hundred Thirty Nine And 72/100'}
          </div>
          
          {/* Bank info and memo */}
          <div className="flex justify-between mb-6">
            <div className="bank-info text-sm">
              <div>{bankAddress || '123 Bank Street, Anytown, MI 48001'}</div>
            </div>
            <div className="memo-line text-sm">
              <div className="text-gray-600">MEMO</div>
              <div>{memo || 'IRA'}</div>
            </div>
          </div>
          
          {/* Signature line */}
          <div className="signature-line border-b border-gray-400 mt-8 mb-2">
            {signature ? (
              <div className="signature-image-container">
                <img 
                  src={signature} 
                  alt="Signature" 
                  className="signature-image"
                  style={{ 
                    maxHeight: '60px', 
                    position: 'relative',
                    top: '-30px'
                  }} 
                />
              </div>
            ) : (
              <div className="text-right text-sm text-gray-600">AUTHORIZED SIGNATURE</div>
            )}
          </div>
          
          {/* MICR line at bottom of check */}
          <div className="micr-line mt-6 font-mono text-center">
            <span className="micr-text">⑆{formattedCheckNumber} ⑆{routingNumber || '071710005'} ⑆{accountNumber || '7167331'}⑈</span>
          </div>
        </div>

        {/* Top stub section (now in the middle) */}
        <div className="check-stub p-4 bg-blue-50 border-b border-gray-300">
          <div className="flex justify-between mb-2">
            <div className="font-bold">{companyName || 'Eastside Outpatient Services, PLLC'}</div>
            <div className="font-bold">{formattedCheckNumber}</div>
          </div>
          
          <div className="flex justify-between mb-2">
            <div>
              <div>{payTo || 'Morgan Stanley'}</div>
              {payToAddress && <div className="text-xs text-gray-600">{payToAddress}</div>}
            </div>
            <div>{formattedDate || '01/29/2016'}</div>
          </div>
          
          <div className="flex justify-between mb-2">
            <div>{'IRA'}</div>
            <div>{'All IRA 2015'}</div>
            <div className="font-bold">${formattedAmount || '13,239.72'}</div>
          </div>
          
          <div className="border-t border-gray-300 mt-4 pt-2">
            <div className="flex justify-between">
              <div>{bankName || 'Fifth Third Bank'}</div>
              <div className="font-bold">${formattedAmount || '13,239.72'}</div>
            </div>
          </div>
        </div>

        {/* Bottom stub section */}
        <div className="check-stub p-4 bg-blue-50">
          <div className="flex justify-between mb-2">
            <div className="font-bold">{companyName || 'Eastside Outpatient Services, PLLC'}</div>
            <div className="font-bold">{formattedCheckNumber}</div>
          </div>
          
          <div className="flex justify-between mb-2">
            <div>
              <div>{payTo || 'Morgan Stanley'}</div>
              {payToAddress && <div className="text-xs text-gray-600">{payToAddress}</div>}
            </div>
            <div>{formattedDate || '01/29/2016'}</div>
          </div>
          
          <div className="flex justify-between mb-2">
            <div>{'IRA'}</div>
            <div>{'All IRA 2015'}</div>
            <div className="font-bold">${formattedAmount || '13,239.72'}</div>
          </div>
          
          <div className="border-t border-gray-300 mt-4 pt-2">
            <div className="flex justify-between">
              <div>{bankName || 'Fifth Third Bank'}</div>
              <div className="font-bold">${formattedAmount || '13,239.72'}</div>
            </div>
          </div>
          <div className="text-xs text-right mt-2 text-gray-500">
            VersaCheck Form 1000 Prestige (#3010)
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to convert number to words
function convertNumberToWords(number) {
  if (!number) return 'Zero Dollars And 00/100';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  // Parse the number and separate dollars and cents
  const parts = parseFloat(number).toFixed(2).split('.');
  let dollars = parseInt(parts[0]);
  const cents = parseInt(parts[1]);
  
  if (dollars === 0) return 'Zero Dollars And 00/100';
  
  let result = '';
  
  // Convert thousands
  if (dollars >= 1000) {
    result += convertLessThanOneThousand(Math.floor(dollars / 1000)) + ' Thousand ';
    dollars = dollars % 1000;
  }
  
  // Convert hundreds
  result += convertLessThanOneThousand(dollars);
  
  // Add dollars
  result += ' Dollars';
  
  // Add cents
  if (cents > 0) {
    result += ' And ' + cents + '/100';
  } else {
    result += ' And 00/100';
  }
  
  return result;
  
  // Helper function for converting numbers less than 1000
  function convertLessThanOneThousand(n) {
    if (n === 0) return '';
    
    let result = '';
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n = n % 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n = n % 10;
    }
    
    if (n >= 10 && n < 20) {
      result += teens[n - 10] + ' ';
      n = 0;
    }
    
    if (n > 0) {
      result += ones[n] + ' ';
    }
    
    return result.trim();
  }
}

export default CheckTemplate; 