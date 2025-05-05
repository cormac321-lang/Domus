import { useState, useCallback, useEffect } from 'react';
import * as validation from '../utils/validation';

export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    const fieldErrors = [];

    if (rules.required) {
      const result = validation.validateRequired(value);
      if (!result.isValid) fieldErrors.push(result.message);
    }

    if (value && rules.email) {
      const result = validation.validateEmail(value);
      if (!result.isValid) fieldErrors.push(result.message);
    }

    if (value && rules.phone) {
      const result = validation.validatePhone(value);
      if (!result.isValid) fieldErrors.push(result.message);
    }

    if (value && rules.minLength) {
      const result = validation.validateMinLength(value, rules.minLength);
      if (!result.isValid) fieldErrors.push(result.message);
    }

    if (value && rules.maxLength) {
      const result = validation.validateMaxLength(value, rules.maxLength);
      if (!result.isValid) fieldErrors.push(result.message);
    }

    if (value && rules.number) {
      const result = validation.validateNumber(value);
      if (!result.isValid) fieldErrors.push(result.message);
    }

    if (value && rules.date) {
      const result = validation.validateDate(value);
      if (!result.isValid) fieldErrors.push(result.message);
    }

    if (value && rules.amount) {
      const result = validation.validateAmount(value);
      if (!result.isValid) fieldErrors.push(result.message);
    }

    if (value && rules.postcode) {
      const result = validation.validatePostcode(value);
      if (!result.isValid) fieldErrors.push(result.message);
    }

    if (value && rules.password) {
      const result = validation.validatePassword(value);
      if (!result.isValid) fieldErrors.push(result.message);
    }

    if (value && rules.url) {
      const result = validation.validateURL(value);
      if (!result.isValid) fieldErrors.push(result.message);
    }

    if (value && rules.iban) {
      const result = validation.validateIBAN(value);
      if (!result.isValid) fieldErrors.push(result.message);
    }

    if (value && rules.vat) {
      const result = validation.validateVAT(value);
      if (!result.isValid) fieldErrors.push(result.message);
    }

    return fieldErrors.length > 0 ? fieldErrors[0] : null;
  }, [validationRules]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let hasErrors = false;

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setIsValid(!hasErrors);
    return !hasErrors;
  }, [values, validationRules, validateField]);

  useEffect(() => {
    validateForm();
  }, [values, validateForm]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [values, validateField]);

  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (validateForm()) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  }, [validateForm, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    validateField,
    validateForm
  };
}; 