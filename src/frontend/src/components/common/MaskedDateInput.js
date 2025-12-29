import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const MaskedDateInput = ({ value, onChange, required = false, inputClassName = '', useCurrentDateAsDefault = true }) => {
  // Format the date into parts
  const getDateParts = () => {
    // Use current date as default when no value is provided and useCurrentDateAsDefault is true
    const dateToFormat = value ? new Date(value) : (useCurrentDateAsDefault ? new Date() : null);

    try {
      if (!dateToFormat) return { month: '', day: '', year: '' };

      return {
        month: format(dateToFormat, 'MM'),
        day: format(dateToFormat, 'dd'),
        year: format(dateToFormat, 'yyyy')
      };
    } catch (error) {
      return { month: '', day: '', year: '' };
    }
  };

  const [dateParts, setDateParts] = useState(getDateParts());
  const [errors, setErrors] = useState({ month: false, day: false, year: false });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const monthRef = useRef(null);
  const dayRef = useRef(null);
  const yearRef = useRef(null);
  const datePickerRef = useRef(null); // Ref for the date picker

  // Update date parts when value changes
  React.useEffect(() => {
    const newParts = getDateParts();

    setDateParts(currentParts => {
      // Helper to check if two parts are semantically equivalent (e.g. "2" equals "02")
      const isEquivalent = (part1, part2) => {
        if (part1 === part2) return true;
        // If one is empty and other is undefined/null, treat as same (though here we expect strings)
        if (!part1 && !part2) return true;

        // Parse numbers to compare values
        const n1 = parseInt(part1, 10);
        const n2 = parseInt(part2, 10);

        // If both are numbers, compare them
        if (!isNaN(n1) && !isNaN(n2)) {
          return n1 === n2;
        }

        return part1 === part2;
      };

      // If all parts are semantically equivalent, preserve the user's current input (e.g. "2")
      // instead of overwriting with the formatted version (e.g. "02")
      if (
        isEquivalent(newParts.month, currentParts.month) &&
        isEquivalent(newParts.day, currentParts.day) &&
        isEquivalent(newParts.year, currentParts.year)
      ) {
        return currentParts;
      }

      return newParts;
    });
  }, [value]);

  // Hide date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Function to handle date selection from the date picker
  const handleDateChange = (date) => {
    if (date) {
      onChange(date);
      setShowDatePicker(false);
    }
  };

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
        <button onClick={() => setShowDatePicker(!showDatePicker)} className="ml-2">
          📅
        </button>
      </div>
      {showDatePicker && (
        <div ref={datePickerRef} style={{ position: 'absolute', zIndex: 1000 }}>
          <DatePicker
            selected={value ? new Date(value) : (useCurrentDateAsDefault ? new Date() : null)}
            onChange={handleDateChange}
            inline
          />
        </div>
      )}
    </div>
  );
};

export default MaskedDateInput; 