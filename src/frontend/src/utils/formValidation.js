// Form validation utilities

// Allows only numeric input for zip codes
export const validateZipCodeInput = (value) => {
  // Remove any non-numeric characters
  return value.replace(/[^0-9]/g, '');
};

// Format phone number as user types
export const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  let cleaned = ('' + phoneNumber).replace(/\D/g, '');
  
  // Limit to 10 digits
  cleaned = cleaned.substring(0, 10);
  
  // Format as (XXX) XXX-XXXX
  let formatted = cleaned;
  if (cleaned.length > 0) {
    if (cleaned.length <= 3) {
      formatted = `(${cleaned}`;
    } else if (cleaned.length <= 6) {
      formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
    } else {
      formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    }
  }
  
  return formatted;
}; 