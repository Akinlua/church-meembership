import React from 'react';
import { format } from 'date-fns';
import './CheckTemplate.css'; // Create this CSS file for the styles

const CheckTemplate = ({ checkData }) => {
  const {
    checkNumber,
    date,
    payTo,
    amount,
    memo,
    bankName,
    bankAddress,
    companyName,
    companyAddress,
    signature
  } = checkData;

  // Format the amount in words
  const amountInWords = convertNumberToWords(amount);
  
  // Format the amount with 2 decimal places
  const formattedAmount = parseFloat(amount || 0).toFixed(2);

  return (
    <div className="check-template">
      <div className="check-wrapper" id="check-to-print">
        {/* Top section of check */}
        <div className="check-top p-4 border-b border-gray-300 bg-blue-50">
          <div className="flex justify-between">
            <div className="company-info">
              <div className="font-bold text-lg">{companyName}</div>
              <div className="text-sm">{companyAddress}</div>
            </div>
            <div className="check-number-date">
              <div className="font-bold text-lg">{checkNumber}</div>
              <div className="text-sm">{date ? format(new Date(date), 'MM/dd/yyyy') : ''}</div>
            </div>
          </div>
        </div>

        {/* Middle section of check */}
        <div className="check-middle p-4">
          <div className="pay-to-section mb-2">
            <div className="text-sm text-gray-600">PAY TO THE</div>
            <div className="text-sm text-gray-600">ORDER OF</div>
          </div>
          
          <div className="payee-name font-bold text-lg mb-2">{payTo}</div>
          
          <div className="amount-in-words mb-2">
            {amountInWords}
          </div>
          
          <div className="flex justify-end">
            <div className="amount-box border border-gray-400 px-2 py-1">
              <span className="font-bold">${formattedAmount}</span>
            </div>
          </div>
          
          <div className="payee-address mb-4">
            {payTo}
          </div>
          
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
                    top: '-30px'  // Adjust this to position the signature on the line
                  }} 
                />
              </div>
            ) : (
              <div className="text-right text-sm text-gray-600">AUTHORIZED SIGNATURE</div>
            )}
          </div>
        </div>

        {/* Bottom section of check (stub) */}
        <div className="check-stub p-4 bg-blue-50">
          <div className="flex justify-between mb-2">
            <div className="font-bold">{companyName}</div>
            <div className="font-bold">{checkNumber}</div>
          </div>
          
          <div className="flex justify-between mb-2">
            <div>{payTo}</div>
            <div>{date ? format(new Date(date), 'MM/dd/yyyy') : ''}</div>
          </div>
          
          <div className="flex justify-between mb-2">
            <div>{memo || 'Memo'}</div>
            <div className="font-bold">${formattedAmount}</div>
          </div>
          
          <div className="border-t border-gray-300 mt-4 pt-2">
            <div className="flex justify-between">
              <div>{bankName}</div>
              <div className="font-bold">${formattedAmount}</div>
            </div>
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