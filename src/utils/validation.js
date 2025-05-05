export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: re.test(email),
    message: 'Please enter a valid email address',
  };
};

export const validatePhone = (phone) => {
  const re = /^[\d\s-+()]{10,}$/;
  return {
    isValid: re.test(phone),
    message: 'Please enter a valid phone number (minimum 10 digits)',
  };
};

export const validateRequired = (value) => {
  return {
    isValid: value !== null && value !== undefined && value.toString().trim() !== '',
    message: 'This field is required',
  };
};

export const validateMinLength = (value, min) => {
  return {
    isValid: value && value.length >= min,
    message: `Minimum length is ${min} characters`,
  };
};

export const validateMaxLength = (value, max) => {
  return {
    isValid: value && value.length <= max,
    message: `Maximum length is ${max} characters`,
  };
};

export const validateNumber = (value) => {
  return {
    isValid: !isNaN(value) && !isNaN(parseFloat(value)),
    message: 'Must be a valid number',
  };
};

export const validateDate = (date) => {
  const d = new Date(date);
  return {
    isValid: d instanceof Date && !isNaN(d),
    message: 'Must be a valid date',
  };
};

export const validateAmount = (amount) => {
  const isValid = validateNumber(amount).isValid && parseFloat(amount) >= 0;
  return {
    isValid,
    message: 'Must be a valid positive amount',
  };
};

export const validatePostcode = (postcode) => {
  // Basic Irish postcode validation
  const re = /^[A-Z0-9]{3}\s[A-Z0-9]{4}$/;
  return {
    isValid: re.test(postcode.toUpperCase()),
    message: 'Must be a valid Irish postcode (e.g., D01 X4X0)',
  };
};

export const validatePassword = (password) => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  
  let message = 'Password must contain:';
  if (!hasMinLength) message += ' at least 8 characters,';
  if (!hasUpperCase) message += ' an uppercase letter,';
  if (!hasLowerCase) message += ' a lowercase letter,';
  if (!hasNumbers) message += ' a number,';
  if (!hasSpecialChar) message += ' a special character,';
  
  return {
    isValid,
    message: isValid ? '' : message.slice(0, -1),
  };
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return {
      isValid: true,
      message: '',
    };
  } catch {
    return {
      isValid: false,
      message: 'Must be a valid URL',
    };
  }
};

export const validateIBAN = (iban) => {
  // Basic IBAN validation for Irish accounts
  const re = /^IE\d{2}[A-Z]{4}\d{14}$/;
  return {
    isValid: re.test(iban.replace(/\s/g, '')),
    message: 'Must be a valid Irish IBAN',
  };
};

export const validateVAT = (vat) => {
  // Irish VAT number validation
  const re = /^IE\d{7}[A-Z]$/;
  return {
    isValid: re.test(vat.replace(/\s/g, '')),
    message: 'Must be a valid Irish VAT number',
  };
}; 