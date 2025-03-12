import React, { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePickerCustomStyles.css';
import { format } from 'date-fns';

const DatePickerField = ({ 
  label, 
  value, 
  onChange, 
  required = false,
  containerClassName = "",
  inputClassName = "w-full px-2 py-1 border border-gray-300 rounded",
  placeholder = "MM/DD/YYYY"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const datePickerRef = useRef(null);

  const handleCalendarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${containerClassName}`}>
      <div className="relative date-picker-container">
        <DatePicker
          ref={datePickerRef}
          selected={value}
          onChange={onChange}
          dateFormat="MM/dd/yyyy"
          required={required}
          open={isOpen}
          onClickOutside={() => setIsOpen(false)}
          onInputClick={() => setIsOpen(true)}
          placeholderText={placeholder}
          className={`date-input w-full px-2 py-1 border border-gray-300 rounded ${inputClassName}`}
          customInput={
            <input
              style={{ maxWidth: "140px" }}
              readOnly={true}
            />
          }
        />
        <div 
          className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer"
          onClick={handleCalendarClick}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      </div>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}{required && <span className="text-red-500">*</span>}
        </label>
      )}
    </div>
  );
};

export default DatePickerField; 