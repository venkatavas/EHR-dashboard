import { Patient, EHRConfig } from '@/lib/types/fhir';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export function validateEHRConfig(config: Partial<EHRConfig>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!config.baseUrl) {
    errors.push({ field: 'baseUrl', message: 'Base URL is required' });
  } else if (!isValidUrl(config.baseUrl)) {
    errors.push({ field: 'baseUrl', message: 'Please enter a valid URL' });
  }

  if (!config.clientId) {
    errors.push({ field: 'clientId', message: 'Client ID is required' });
  } else if (config.clientId.length < 3) {
    errors.push({ field: 'clientId', message: 'Client ID must be at least 3 characters' });
  }

  if (!config.clientSecret && !config.accessToken) {
    errors.push({
      field: 'clientSecret',
      message: 'Either Client Secret or Access Token is required'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validatePatient(patient: Partial<Patient>): ValidationResult {
  const errors: ValidationError[] = [];

  // Name validation
  if (!patient.name || patient.name.length === 0) {
    errors.push({ field: 'name', message: 'Patient name is required' });
  } else {
    const primaryName = patient.name[0];
    if (!primaryName.family) {
      errors.push({ field: 'familyName', message: 'Family name is required' });
    }
    if (!primaryName.given || primaryName.given.length === 0) {
      errors.push({ field: 'givenName', message: 'Given name is required' });
    }
  }

  // Birth date validation
  if (!patient.birthDate) {
    errors.push({ field: 'birthDate', message: 'Birth date is required' });
  } else if (!isValidDate(patient.birthDate)) {
    errors.push({ field: 'birthDate', message: 'Please enter a valid birth date' });
  } else if (new Date(patient.birthDate) > new Date()) {
    errors.push({ field: 'birthDate', message: 'Birth date cannot be in the future' });
  }

  // Gender validation
  if (patient.gender && !['male', 'female', 'other', 'unknown'].includes(patient.gender)) {
    errors.push({ field: 'gender', message: 'Please select a valid gender' });
  }

  // Contact validation
  if (patient.telecom) {
    patient.telecom.forEach((telecom, index) => {
      if (telecom.system === 'email' && telecom.value && !isValidEmail(telecom.value)) {
        errors.push({
          field: `telecom.${index}.value`,
          message: 'Please enter a valid email address'
        });
      }
      if (telecom.system === 'phone' && telecom.value && !isValidPhoneNumber(telecom.value)) {
        errors.push({
          field: `telecom.${index}.value`,
          message: 'Please enter a valid phone number'
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateSearchParams(params: Record<string, any>): ValidationResult {
  const errors: ValidationError[] = [];

  // Date validation
  if (params.date && !isValidDate(params.date)) {
    errors.push({ field: 'date', message: 'Please enter a valid date' });
  }

  if (params.birthdate && !isValidDate(params.birthdate)) {
    errors.push({ field: 'birthdate', message: 'Please enter a valid birth date' });
  }

  // Count validation
  if (params._count !== undefined) {
    const count = parseInt(params._count);
    if (isNaN(count) || count < 1 || count > 1000) {
      errors.push({
        field: '_count',
        message: 'Count must be a number between 1 and 1000'
      });
    }
  }

  // Offset validation
  if (params._offset !== undefined) {
    const offset = parseInt(params._offset);
    if (isNaN(offset) || offset < 0) {
      errors.push({
        field: '_offset',
        message: 'Offset must be a non-negative number'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Utility functions
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhoneNumber(phone: string): boolean {
  // Basic phone number validation - accepts various formats
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0].message;

  return `Multiple errors: ${errors.map(e => e.message).join(', ')}`;
}