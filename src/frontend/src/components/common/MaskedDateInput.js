import React, { useState, useRef } from 'react';
import { format } from 'date-fns';

const MaskedDateInput = ({ value, onChange, required = false, inputClassName = '' }) => {
  // Format the date into parts
  const getDateParts = () => {
    if (value) {
      try {
        return {
          month: format(new Date(value), 'MM'),
          day: format(new Date(value), 'dd'),
          year: format(new Date(value), 'yyyy')
        };
      } catch (error) {
        return { month: '', day: '', year: '' };
      }
    }
    return { month: '', day: '', year: '' };
  };

  const [dateParts, setDateParts] = useState(getDateParts());
  const [errors, setErrors] = useState({ month: false, day: false, year: false });
  
  const monthRef = useRef(null);
  const dayRef = useRef(null);
  const yearRef = useRef(null);

  // Update date parts when value changes
  React.useEffect(() => {
    setDateParts(getDateParts());
  }, [value]);

  const handleMonthChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 2);
    
    const newDateParts = { ...dateParts, month: val };
    setDateParts(newDateParts);
    
    const isValid = validateMonth(val);
    setErrors(prev => ({ ...prev, month: !isValid }));
    
    if (val.length === 2 && isValid) {
      dayRef.current.focus();
    }
    
    if (isValid) {
      tryToCreateDate(newDateParts);
    }
  };
  
  const handleDayChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 2);
    
    const newDateParts = { ...dateParts, day: val };
    setDateParts(newDateParts);
    
    const isValid = validateDay(val, dateParts.month, dateParts.year);
    setErrors(prev => ({ ...prev, day: !isValid }));
    
    if (val.length === 2 && isValid) {
      yearRef.current.focus();
    }
    
    if (isValid) {
      tryToCreateDate(newDateParts);
    }
  };
  
  const handleYearChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    
    const newDateParts = { ...dateParts, year: val };
    setDateParts(newDateParts);
    
    const isValid = validateYear(val);
    setErrors(prev => ({ ...prev, year: !isValid }));
    
    if (isValid) {
      tryToCreateDate(newDateParts);
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Backspace' && e.target.value.length === 0) {
      if (field === 'day' && monthRef.current) {
        monthRef.current.focus();
      } else if (field === 'year' && dayRef.current) {
        dayRef.current.focus();
      }
    }
  };
  
  // Attempt to create a date from the parts
  const tryToCreateDate = (parts) => {
    // Only try to create a date if we have complete valid data
    if (parts.month && parts.day && parts.year && parts.year.length === 4) {
      if (validateMonth(parts.month) && validateDay(parts.day, parts.month, parts.year) && validateYear(parts.year)) {
        try {
          const month = parseInt(parts.month, 10);
          const day = parseInt(parts.day, 10);
          const year = parseInt(parts.year, 10);
          
          const newDate = new Date(year, month - 1, day);
          if (!isNaN(newDate.getTime())) {
            onChange(newDate);
          }
        } catch (e) {
          console.log("Invalid date", e);
        }
      }
    }
  };

  const validateMonth = (month) => {
    if (!month) return true;
    const monthNum = parseInt(month, 10);
    return monthNum >= 1 && monthNum <= 12;
  };

  const validateDay = (day, month, year) => {
    if (!day) return true;
    const dayNum = parseInt(day, 10);
    if (dayNum < 1 || dayNum > 31) return false;
    
    // Check days in month if we have a month
    if (month) {
      const monthNum = parseInt(month, 10);
      if (monthNum >= 1 && monthNum <= 12) {
        const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
        const lastDayOfMonth = new Date(yearNum, monthNum, 0).getDate();
        return dayNum <= lastDayOfMonth;
      }
    }
    
    return true;
  };

  const validateYear = (year) => {
    if (!year) return true;
    if (year.length < 4) return true; // Allow partial year input
    const yearNum = parseInt(year, 10);
    return yearNum > 0;
  };

  const hasError = errors.month || errors.day || errors.year;

  return (
    <div className={`relative flex items-center ${inputClassName}`}>
      <div className={`flex items-center px-2 py-1 border ${hasError ? 'border-red-500' : 'border-gray-600'} rounded w-40`}>
        <input
          type="text"
          value={dateParts.month}
          placeholder="MM"
          maxLength="2"
          onChange={handleMonthChange}
          onKeyDown={(e) => handleKeyDown(e, 'month')}
          ref={monthRef}
          className="text-center outline-none w-8"
          required={required}
        />
        <span className="px-1">/</span>
        <input
          type="text"
          value={dateParts.day}
          placeholder="DD"
          maxLength="2"
          onChange={handleDayChange}
          onKeyDown={(e) => handleKeyDown(e, 'day')}
          ref={dayRef}
          className="text-center outline-none w-8"
          required={required}
        />
        <span className="px-1">/</span>
        <input
          type="text"
          value={dateParts.year}
          placeholder="YYYY"
          maxLength="4"
          onChange={handleYearChange}
          onKeyDown={(e) => handleKeyDown(e, 'year')}
          ref={yearRef}
          className="text-center outline-none w-12"
          required={required}
        />
      </div>
    </div>
  );
};

export default MaskedDateInput; 