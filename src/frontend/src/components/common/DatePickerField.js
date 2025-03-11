import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePickerCustomStyles.css';

const DatePickerField = ({ 
  label, 
  value, 
  onChange, 
  required = false,
  containerClassName = "",
  inputClassName = "w-full px-2 py-1 border border-gray-300 rounded"
}) => {
  return (
    <div className={`date-picker-wrapper ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}{required && <span className="text-red-500">*</span>}
        </label>
      )}
      <DatePicker
        selected={value}
        onChange={onChange}
        className={inputClassName}
        dateFormat="MM/dd/yyyy"
        isClearable
        placeholderText="Select a date"
        required={required}
        popperClassName="date-picker-popper"
        popperModifiers={{
          preventOverflow: {
            enabled: true,
            boundariesElement: 'viewport',
            padding: 20
          },
          flip: {
            behavior: ['bottom', 'top', 'right', 'left']
          },
          offset: {
            enabled: true,
            offset: '0, 10'
          }
        }}
        popperProps={{
          positionFixed: true
        }}
        calendarContainer={({ className, children }) => (
          <div className={`${className} calendar-container`}>
            {children}
          </div>
        )}
      />
    </div>
  );
};

export default DatePickerField; 