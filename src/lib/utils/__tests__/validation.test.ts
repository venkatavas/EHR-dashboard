import {
  validateEHRConfig,
  validatePatient,
  validateSearchParams,
  sanitizeInput,
  formatValidationErrors
} from '../validation';
import { Patient, EHRConfig } from '@/lib/types/fhir';

describe('validateEHRConfig', () => {
  it('should pass validation with valid config', () => {
    const config: EHRConfig = {
      baseUrl: 'https://api.practicefusion.com/fhir/r4',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret'
    };

    const result = validateEHRConfig(config);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail validation with missing baseUrl', () => {
    const config: Partial<EHRConfig> = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret'
    };

    const result = validateEHRConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('baseUrl');
    expect(result.errors[0].message).toBe('Base URL is required');
  });

  it('should fail validation with invalid URL', () => {
    const config: Partial<EHRConfig> = {
      baseUrl: 'not-a-valid-url',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret'
    };

    const result = validateEHRConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('baseUrl');
    expect(result.errors[0].message).toBe('Please enter a valid URL');
  });

  it('should fail validation with missing clientId', () => {
    const config: Partial<EHRConfig> = {
      baseUrl: 'https://api.practicefusion.com/fhir/r4',
      clientSecret: 'test-client-secret'
    };

    const result = validateEHRConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].field).toBe('clientId');
  });

  it('should fail validation with short clientId', () => {
    const config: Partial<EHRConfig> = {
      baseUrl: 'https://api.practicefusion.com/fhir/r4',
      clientId: 'ab',
      clientSecret: 'test-client-secret'
    };

    const result = validateEHRConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].message).toBe('Client ID must be at least 3 characters');
  });

  it('should pass validation with access token instead of client secret', () => {
    const config: EHRConfig = {
      baseUrl: 'https://api.practicefusion.com/fhir/r4',
      clientId: 'test-client-id',
      clientSecret: '',
      accessToken: 'test-access-token'
    };

    const result = validateEHRConfig(config);
    expect(result.isValid).toBe(true);
  });
});

describe('validatePatient', () => {
  it('should pass validation with valid patient', () => {
    const patient: Partial<Patient> = {
      resourceType: 'Patient',
      name: [{
        use: 'official',
        given: ['John'],
        family: 'Doe'
      }],
      birthDate: '1990-01-01',
      gender: 'male',
      telecom: [{
        system: 'email',
        value: 'john.doe@example.com'
      }, {
        system: 'phone',
        value: '+1-555-0123'
      }]
    };

    const result = validatePatient(patient);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail validation with missing name', () => {
    const patient: Partial<Patient> = {
      resourceType: 'Patient',
      birthDate: '1990-01-01',
      gender: 'male'
    };

    const result = validatePatient(patient);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'name')).toBe(true);
  });

  it('should fail validation with missing family name', () => {
    const patient: Partial<Patient> = {
      resourceType: 'Patient',
      name: [{
        use: 'official',
        given: ['John']
      }],
      birthDate: '1990-01-01',
      gender: 'male'
    };

    const result = validatePatient(patient);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'familyName')).toBe(true);
  });

  it('should fail validation with missing given name', () => {
    const patient: Partial<Patient> = {
      resourceType: 'Patient',
      name: [{
        use: 'official',
        family: 'Doe'
      }],
      birthDate: '1990-01-01',
      gender: 'male'
    };

    const result = validatePatient(patient);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'givenName')).toBe(true);
  });

  it('should fail validation with missing birth date', () => {
    const patient: Partial<Patient> = {
      resourceType: 'Patient',
      name: [{
        use: 'official',
        given: ['John'],
        family: 'Doe'
      }],
      gender: 'male'
    };

    const result = validatePatient(patient);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'birthDate')).toBe(true);
  });

  it('should fail validation with invalid birth date', () => {
    const patient: Partial<Patient> = {
      resourceType: 'Patient',
      name: [{
        use: 'official',
        given: ['John'],
        family: 'Doe'
      }],
      birthDate: 'invalid-date',
      gender: 'male'
    };

    const result = validatePatient(patient);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.message === 'Please enter a valid birth date')).toBe(true);
  });

  it('should fail validation with future birth date', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const patient: Partial<Patient> = {
      resourceType: 'Patient',
      name: [{
        use: 'official',
        given: ['John'],
        family: 'Doe'
      }],
      birthDate: futureDate.toISOString().split('T')[0],
      gender: 'male'
    };

    const result = validatePatient(patient);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.message === 'Birth date cannot be in the future')).toBe(true);
  });

  it('should fail validation with invalid gender', () => {
    const patient: Partial<Patient> = {
      resourceType: 'Patient',
      name: [{
        use: 'official',
        given: ['John'],
        family: 'Doe'
      }],
      birthDate: '1990-01-01',
      gender: 'invalid-gender' as any
    };

    const result = validatePatient(patient);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'gender')).toBe(true);
  });

  it('should fail validation with invalid email', () => {
    const patient: Partial<Patient> = {
      resourceType: 'Patient',
      name: [{
        use: 'official',
        given: ['John'],
        family: 'Doe'
      }],
      birthDate: '1990-01-01',
      telecom: [{
        system: 'email',
        value: 'invalid-email'
      }]
    };

    const result = validatePatient(patient);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.message === 'Please enter a valid email address')).toBe(true);
  });
});

describe('validateSearchParams', () => {
  it('should pass validation with valid params', () => {
    const params = {
      date: '2024-01-01',
      _count: 20,
      _offset: 0
    };

    const result = validateSearchParams(params);
    expect(result.isValid).toBe(true);
  });

  it('should fail validation with invalid date', () => {
    const params = {
      date: 'invalid-date'
    };

    const result = validateSearchParams(params);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'date')).toBe(true);
  });

  it('should fail validation with invalid count', () => {
    const params = {
      _count: 'invalid-count'
    };

    const result = validateSearchParams(params);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === '_count')).toBe(true);
  });

  it('should fail validation with negative offset', () => {
    const params = {
      _offset: -1
    };

    const result = validateSearchParams(params);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === '_offset')).toBe(true);
  });
});

describe('sanitizeInput', () => {
  it('should remove HTML tags', () => {
    const input = '<script>alert("xss")</script>Hello World';
    const result = sanitizeInput(input);
    expect(result).toBe('scriptalert("xss")/scriptHello World');
  });

  it('should trim whitespace', () => {
    const input = '  Hello World  ';
    const result = sanitizeInput(input);
    expect(result).toBe('Hello World');
  });

  it('should handle empty string', () => {
    const input = '';
    const result = sanitizeInput(input);
    expect(result).toBe('');
  });
});

describe('formatValidationErrors', () => {
  it('should return empty string for no errors', () => {
    const result = formatValidationErrors([]);
    expect(result).toBe('');
  });

  it('should return single error message', () => {
    const errors = [{ field: 'name', message: 'Name is required' }];
    const result = formatValidationErrors(errors);
    expect(result).toBe('Name is required');
  });

  it('should format multiple errors', () => {
    const errors = [
      { field: 'name', message: 'Name is required' },
      { field: 'email', message: 'Email is invalid' }
    ];
    const result = formatValidationErrors(errors);
    expect(result).toBe('Multiple errors: Name is required, Email is invalid');
  });
});