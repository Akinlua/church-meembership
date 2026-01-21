import React from 'react';
import Draggable from 'react-draggable';
import { format } from 'date-fns';
import ResizeHandles from './ResizeHandles';
import './CheckTemplate.css';

const CheckTemplate = ({ checkData, layout, onLayoutChange, onElementSelect, selectedElement, separators, onSeparatorChange, onElementResize, scale = 1 }) => {
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

  // Destructure separators with defaults if undefined (safe fallback)
  const { stub1Top = 350, stub2Top = 700, stub2Bottom = 1050 } = separators || {};

  // Format helper (reused logic)
  const formattedAmount = parseFloat(amount || 0).toFixed(2);
  const formattedDate = date ? format(new Date(date), 'MM/dd/yyyy') : '';
  const formattedCheckNumber = checkNumber ?
    checkNumber.toString().padStart(6, '0') :
    '000000';
  const amountInWords = convertNumberToWords(amount);

  // Construct a mapping of field names to actual values
  const dataMap = {
    checkNumber: formattedCheckNumber,
    date: formattedDate,
    payTo: payTo || '',
    payToAddress: payToAddress || '',
    amount: formattedAmount,
    amountInWords: amountInWords,
    memo: memo || '',
    bankName: bankName || '',
    bankAddress: bankAddress || '',
    companyName: companyName || '',
    companyAddress: companyAddress || '',
    signature: signature,
    micr: `⑆${formattedCheckNumber} ⑆${routingNumber || '000000000'} ⑆${accountNumber || '0000000'}⑈`,
    // New fields for stubs if needed specific logic
    payLabel: 'IRA',
    payDesc: 'All IRA 2015'
  };

  const handleStop = (id, e, data) => {
    onLayoutChange(id, { x: data.x, y: data.y });
  };

  // Handler for separator lines
  const handleSeparatorDrag = (key, e, data) => {
    // We only care about Y axis
    onSeparatorChange(prev => ({
      ...prev,
      [key]: data.y
    }));
  };

  // Calculate scaled dimensions to occupy correct space in DOM
  const originalWidth = 8.5 * 96; // 8.5in * 96dpi = 816px
  const originalHeight = 11 * 96; // 11in * 96dpi = 1056px

  return (
    <div
      className="check-template-container"
      style={{
        width: `${originalWidth * scale}px`,
        height: `${originalHeight * scale}px`,
        position: 'relative'
      }}
    >
      <div
        className="check-canvas"
        id="canvas-print-area"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${originalWidth}px`, // Force explicitly
          height: `${originalHeight}px`
        }}
      >
        {/* Background Layer for Stubs - Dynamically sized based on separators */}
        <div className="check-page-background">
          {/* Stub 1 Background */}
          {/* Starts at stub1Top, height is difference between stub2Top and stub1Top */}
          <div
            className="stub-background"
            style={{
              top: `${stub1Top}px`,
              height: `${stub2Top - stub1Top}px`
            }}
          ></div>

          {/* Stub 2 Background */}
          {/* Starts at stub2Top, height is difference between stub2Bottom and stub2Top */}
          <div
            className="stub-background"
            style={{
              top: `${stub2Top}px`,
              height: `${stub2Bottom - stub2Top}px`
            }}
          ></div>
        </div>

        {/* Separator Lines Control Layer */}
        {/* Stub 1 Top Separator */}
        <Draggable
          axis="y"
          position={{ x: 0, y: stub1Top }}
          onStop={(e, data) => handleSeparatorDrag('stub1Top', e, data)}
          bounds="parent"
          scale={scale}
        >
          <div className="separator-line" title="Drag to adjust Stub 1 Start"></div>
        </Draggable>

        {/* Stub 2 Top Separator */}
        <Draggable
          axis="y"
          position={{ x: 0, y: stub2Top }}
          onStop={(e, data) => handleSeparatorDrag('stub2Top', e, data)}
          bounds="parent"
          scale={scale}
        >
          <div className="separator-line" title="Drag to adjust Stub 2 Start"></div>
        </Draggable>

        {/* Stub 2 Bottom Separator */}
        <Draggable
          axis="y"
          position={{ x: 0, y: stub2Bottom }}
          onStop={(e, data) => handleSeparatorDrag('stub2Bottom', e, data)}
          bounds="parent"
          scale={scale}
        >
          <div className="separator-line" title="Drag to adjust Page Bottom"></div>
        </Draggable>



        {/* Content Layer */}
        {layout.map((element) => {
          let content = null;
          if (element.type === 'data') {
            if (element.field === 'signature' && dataMap.signature) {
              content = <img src={dataMap.signature} alt="Signature" style={{ maxHeight: '100%', maxWidth: '100%' }} />;
            } else {
              content = dataMap[element.field] || (`[${element.field}]`);
            }
          } else if (element.type === 'static') {
            content = element.text;
          } else if (element.type === 'line') {
            // Render line element
            const isHorizontal = element.orientation === 'horizontal';
            content = (
              <div style={{
                width: isHorizontal ? '100%' : `${element.thickness || 2}px`,
                height: isHorizontal ? `${element.thickness || 2}px` : '100%',
                backgroundColor: element.color || '#000',
              }} />
            );
          }

          const isSelected = selectedElement === element.id;
          const itemClass = `draggable-item ${isSelected ? 'selected' : ''}`;

          const elStyle = {
            width: element.width,
            height: element.height,
            zIndex: isSelected ? 100 : 10, // Ensure content is above bg
            ...element.style
          };

          return (
            <Draggable
              key={element.id}
              position={{ x: element.x, y: element.y }}
              onStop={(e, data) => handleStop(element.id, e, data)}
              onStart={() => onElementSelect(element.id)}
              bounds="parent"
              scale={scale}
            >
              <div className={itemClass} style={elStyle}>
                {content}
                {isSelected && onElementResize && (
                  <ResizeHandles
                    width={element.width}
                    height={element.height}
                    onResize={(newDimensions) => onElementResize(element.id, newDimensions)}
                  />
                )}
              </div>
            </Draggable>
          );
        })}

      </div>
    </div>
  );
};

// Helper function to convert number to words
function convertNumberToWords(number) {
  if (!number) return 'Zero Dollars And 00/100';
  const parts = parseFloat(number).toFixed(2).split('.');
  let dollars = parseInt(parts[0]);
  const cents = parseInt(parts[1]);

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (dollars === 0) return 'Zero Dollars And 00/100';

  let result = '';

  const convertLessThanOneThousand = (n) => {
    if (n === 0) return '';
    let res = '';
    if (n >= 100) {
      res += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      res += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n >= 10) {
      res += teens[n - 10] + ' ';
      n = 0;
    }
    if (n > 0) {
      res += ones[n] + ' ';
    }
    return res.trim();
  };

  if (dollars >= 1000) {
    result += convertLessThanOneThousand(Math.floor(dollars / 1000)) + ' Thousand ';
    dollars %= 1000;
  }
  result += convertLessThanOneThousand(dollars);
  result += ' Dollars';

  if (cents > 0) result += ` And ${cents}/100`;
  else result += ` And 00/100`;

  return result;
}

export default CheckTemplate;