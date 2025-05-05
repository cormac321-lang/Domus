import Papa from 'papaparse';

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const validatePropertyCSV = (data) => {
  const requiredFields = [
    'address',
    'city',
    'state',
    'zipCode',
    'rent',
    'bedrooms',
    'bathrooms',
  ];

  const errors = [];
  data.forEach((row, index) => {
    requiredFields.forEach((field) => {
      if (!row[field]) {
        errors.push(`Row ${index + 1}: Missing required field "${field}"`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateTenantCSV = (data) => {
  const requiredFields = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'propertyId',
  ];

  const errors = [];
  data.forEach((row, index) => {
    requiredFields.forEach((field) => {
      if (!row[field]) {
        errors.push(`Row ${index + 1}: Missing required field "${field}"`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}; 