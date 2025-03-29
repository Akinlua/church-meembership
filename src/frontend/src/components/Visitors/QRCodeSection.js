import React, { useState } from 'react';
import QRCodeGenerator from '../common/QRCodeGenerator';

const QRCodeSection = ({ visitor }) => {
  const [baseUrl] = useState(window.location.origin);
  
  // Generate QR code value linking to a visitor registration form
  const qrCodeValue = `${baseUrl}/visitor-form?ref=qr`;
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Visitor Registration QR Code</h2>
      
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <p className="text-gray-700 mb-4">
            Share this QR code to allow visitors to register directly without needing to log in.
            When scanned, this QR code will direct users to a secure visitor registration form where they can
            enter their information.
          </p>
          
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 text-purple-700 mb-4">
            <p className="font-medium">Instructions:</p>
            <ul className="list-disc list-inside ml-2 mt-2 text-sm">
              <li>Display this QR code in your welcome area or church bulletin</li>
              <li>Visitors can scan with their smartphone camera</li>
              <li>They'll be directed to a visitor information form</li>
              <li>Submissions will appear in your visitor database</li>
            </ul>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <QRCodeGenerator 
            value={qrCodeValue}
            size={240}
            title="Visitor Registration"
            downloadFileName="visitor-registration-qr"
          />
        </div>
      </div>
    </div>
  );
};

export default QRCodeSection; 