import React, { useState } from 'react';
import QRCodeGenerator from '../common/QRCodeGenerator';

const QRCodeSection = ({ member }) => {
  const [baseUrl] = useState(window.location.origin);
  
  // Generate QR code value linking to a member registration form
  const qrCodeValue = `${baseUrl}/member-form?ref=qr`;
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Member Registration QR Code</h2>
      
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <p className="text-gray-700 mb-4">
            Share this QR code to allow new members to register directly without needing to log in.
            When scanned, this QR code will direct users to a secure registration form where they can
            enter their information.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700 mb-4">
            <p className="font-medium">Instructions:</p>
            <ul className="list-disc list-inside ml-2 mt-2 text-sm">
              <li>Display this QR code at church events or in bulletins</li>
              <li>New members can scan with their smartphone camera</li>
              <li>They'll be directed to a secure registration form</li>
              <li>Submissions will appear in your member database</li>
            </ul>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <QRCodeGenerator 
            value={qrCodeValue}
            size={240}
            title="Member Registration"
            downloadFileName="member-registration-qr"
          />
        </div>
      </div>
    </div>
  );
};

export default QRCodeSection; 