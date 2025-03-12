import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';

const MaskedDateInput = ({ value, onChange, required = false }) => {
  const [activeSection, setActiveSection] = useState('month'); // 'month', 'day', or 'year'
  const inputRef = useRef(null);
  
  // Add this effect to focus the input when activeSection changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeSection]);
  
  // Format the date into parts
  const getDateParts = () => {
    if (value) {
      return {
        month: format(value, 'MM'),
        day: format(value, 'dd'),
        year: format(value, 'yyyy')
      };
    }
    return { month: '', day: '', year: '' };
  };

  const dateParts = getDateParts();

  const handleInputChange = (e, section) => {
    // Only accept digits
    const val = e.target.value.replace(/\D/g, '');
    
    // Simple approach: just update the section with whatever was typed
    if (section === 'month' && val.length <= 2) {
      // Update the month section directly
      const newDateParts = { ...dateParts };
      newDateParts.month = val;
      
      // Auto-advance when 2 digits are entered
      if (val.length === 2) {
        setActiveSection('day');
      }
      
      // Only attempt to create a date if we have complete values
      tryToCreateDate(newDateParts);
    } 
    else if (section === 'day' && val.length <= 2) {
      // Update the day section directly
      const newDateParts = { ...dateParts };
      newDateParts.day = val;
      
      // Auto-advance when 2 digits are entered
      if (val.length === 2) {
        setActiveSection('year');
      }
      
      // Only attempt to create a date if we have complete values
      tryToCreateDate(newDateParts);
    } 
    else if (section === 'year' && val.length <= 4) {
      // Update the year section directly
      const newDateParts = { ...dateParts };
      newDateParts.year = val;
      
      // Only attempt to create a date if we have complete values
      tryToCreateDate(newDateParts);
    }
  };
  
  // Separate function to attempt creating a date
  const tryToCreateDate = (parts) => {
    // Update the internal parts state
    let newDate = null;
    
    // Only try to create a date if we have all parts with proper lengths
    if (parts.month && parts.day && parts.year && 
        parts.month.length <= 2 && parts.day.length <= 2 && parts.year.length <= 4) {
      
      try {
        const month = parseInt(parts.month, 10);
        const day = parseInt(parts.day, 10);
        const year = parseInt(parts.year, 10);
        
        // Check for valid ranges
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year > 0) {
          newDate = new Date(year, month - 1, day);
          
          // Only update if it's a valid date
          if (!isNaN(newDate.getTime())) {
            onChange(newDate);
            return;
          }
        }
      } catch (e) {
        console.log("Invalid date", e);
      }
    }
    
    // If we don't have a complete date yet, still update the fields
    if (value) {
      const currentDate = new Date(value);
      if (!isNaN(currentDate.getTime())) {
        onChange(currentDate);
      }
    }
  };

  return (
    <div className="date-input-container">
      <div className="date-picker-field">
        {/* Month section */}
        <div 
          className={`date-section month ${activeSection === 'month' ? 'active' : ''}`}
          onClick={() => setActiveSection('month')}
        >
          <input
            type="text"
            value={dateParts.month}
            placeholder="mm"
            maxLength="2"
            onChange={(e) => handleInputChange(e, 'month')}
            // onKeyDown={(e) => handleKeyDown(e, 'month')}
            ref={activeSection === 'month' ? inputRef : null}
            onFocus={() => setActiveSection('month')}
          />
        </div>
        <span className="date-separator">/</span>
        
        {/* Day section */}
        <div 
          className={`date-section day ${activeSection === 'day' ? 'active' : ''}`}
          onClick={() => setActiveSection('day')}
        >
          <input
            type="text"
            value={dateParts.day}
            placeholder="dd"
            maxLength="2"
            onChange={(e) => handleInputChange(e, 'day')}
            // onKeyDown={(e) => handleKeyDown(e, 'day')}
            ref={activeSection === 'day' ? inputRef : null}
            onFocus={() => setActiveSection('day')}
          />
        </div>
        <span className="date-separator">/</span>
        
        {/* Year section */}
        <div 
          className={`date-section year ${activeSection === 'year' ? 'active' : ''}`}
          onClick={() => setActiveSection('year')}
        >
          <input
            type="text"
            value={dateParts.year}
            placeholder="yyyy"
            maxLength="4"
            onChange={(e) => handleInputChange(e, 'year')}
            // onKeyDown={(e) => handleKeyDown(e, 'year')}
            ref={activeSection === 'year' ? inputRef : null}
            onFocus={() => setActiveSection('year')}
          />
        </div>
        
        {/* Calendar icon */}
        <button
          type="button"
          className="calendar-button"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MaskedDateInput; 