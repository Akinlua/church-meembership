import React, { useState } from 'react';
import QRCode from 'react-qr-code';

const QRCodeGenerator = ({ value, size = 200, title, downloadFileName = 'qrcode' }) => {
  const [hovered, setHovered] = useState(false);

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    
    // Create high-res canvas for better quality
    const canvas = document.createElement('canvas');
    const pixelRatio = window.devicePixelRatio || 2; // Use higher resolution for better quality
    const scaleFactor = 2; // Additional scaling factor for even higher quality
    
    // Set canvas to a higher resolution
    canvas.width = size * pixelRatio * scaleFactor;
    canvas.height = size * pixelRatio * scaleFactor;
    
    const ctx = canvas.getContext('2d');
    
    // Apply high quality settings
    ctx.imageSmoothingEnabled = false; // Disable anti-aliasing for QR codes
    
    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const img = new Image();
    img.onload = () => {
      // Create padding/margin around the QR code (quiet zone)
      const padding = canvas.width * 0.1; // 10% padding
      
      // Draw the image with padding
      ctx.drawImage(
        img, 
        padding, 
        padding, 
        canvas.width - (padding * 2), 
        canvas.height - (padding * 2)
      );
      
      // Get the high-res PNG
      const pngFile = canvas.toDataURL('image/png');
      
      // Download PNG
      const downloadLink = document.createElement('a');
      downloadLink.download = `${downloadFileName}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    // Fix the SVG to PNG conversion with proper encoding
    const encodedData = encodeURIComponent(svgData);
    img.src = `data:image/svg+xml,${encodedData}`;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      
      <div 
        className="relative bg-white p-4 rounded-lg shadow-md transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <QRCode
          id="qr-code-svg"
          value={value}
          size={size - 32} // Adjust for padding
          level="H" // High error correction
          fgColor="#000000"
          bgColor="#FFFFFF"
        />
        
        {hovered && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
            <button 
              onClick={handleDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator; 