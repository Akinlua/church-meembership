import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const DatePickerField = ({ value, onChange, label, required = false }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <DatePicker
          selected={value ? new Date(value) : null}
          onChange={onChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          dateFormat="MM/dd/yyyy"
          required={required}
          showYearDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={100}
          placeholderText="Select date"
          isClearable
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DatePickerField; 