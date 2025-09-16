import {
  APIError,
  ValidationError,
  ConnectionError,
  AuthenticationError,
  handleAPIError,
  getErrorMessage,
  getErrorCode,
  isRetryableError,
  RateLimiter
} from '../error-handler';

describe('Error Classes', () => {
  it('should create APIError correctly', () => {
    const error = new APIError('Test message', 400, 'test_code', { detail: 'test' });
    expect(error.name).toBe('APIError');
    expect(error.message).toBe('Test message');
    expect(error.status).toBe(400);
    expect(error.code).toBe('test_code');
    expect(error.details).toEqual({ detail: 'test' });
  });

  it('should create ValidationError correctly', () => {
    const error = new ValidationError('Validation failed', 'email');
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Validation failed');
    expect(error.field).toBe('email');
  });

  it('should create ConnectionError correctly', () => {
    const originalError = new Error('Network failed');
    const error = new ConnectionError('Connection failed', originalError);
    expect(error.name).toBe('ConnectionError');
    expect(error.message).toBe('Connection failed');
    expect(error.originalError).toBe(originalError);
  });

  it('should create AuthenticationError correctly', () => {
    const error = new AuthenticationError('Auth failed');
    expect(error.name).toBe('AuthenticationError');
    expect(error.message).toBe('Auth failed');
  });
});

describe('handleAPIError', () => {
  it('should return APIError as-is', () => {
    const originalError = new APIError('Test error');
    const result = handleAPIError(originalError);
    expect(result).toBe(originalError);
  });

  it('should handle FHIR OperationOutcome', () => {
    const axiosError = {
      response: {
        status: 422,
        data: {
          resourceType: 'OperationOutcome',
          issue: [{
            code: 'invalid',
            details: { text: 'Invalid patient data' },
            diagnostics: 'Field validation failed'
          }]
        }
      }
    };

    const result = handleAPIError(axiosError);
    expect(result).toBeInstanceOf(APIError);
    expect(result.message).toBe('Invalid patient data');
    expect(result.status).toBe(422);
    expect(result.code).toBe('invalid');
  });

  it('should handle OAuth errors', () => {
    const axiosError = {
      response: {
        status: 401,
        data: {
          error: 'invalid_token',
          error_description: 'Token has expired'
        }
      }
    };

    const result = handleAPIError(axiosError);
    expect(result).toBeInstanceOf(APIError);
    expect(result.message).toBe('Token has expired');
    expect(result.status).toBe(401);
    expect(result.code).toBe('invalid_token');
  });

  it('should handle 401 errors as AuthenticationError', () => {
    const axiosError = {
      response: {
        status: 401,
        statusText: 'Unauthorized'
      }
    };

    const result = handleAPIError(axiosError);
    expect(result).toBeInstanceOf(AuthenticationError);
    expect(result.message).toContain('Unauthorized');
  });

  it('should handle 422 errors as ValidationError', () => {
    const axiosError = {
      response: {
        status: 422,
        statusText: 'Unprocessable Entity'
      }
    };

    const result = handleAPIError(axiosError);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toContain('Validation Error');
  });

  it('should handle network errors', () => {
    const axiosError = {
      request: {},
      message: 'Network Error'
    };

    const result = handleAPIError(axiosError);
    expect(result).toBeInstanceOf(ConnectionError);
    expect(result.message).toContain('Network error: Unable to connect to EHR system');
  });

  it('should handle generic errors', () => {
    const genericError = new Error('Something went wrong');
    const result = handleAPIError(genericError);
    expect(result).toBeInstanceOf(APIError);
    expect(result.message).toBe('Something went wrong');
  });

  it('should handle unknown errors', () => {
    const unknownError = 'string error';
    const result = handleAPIError(unknownError);
    expect(result).toBeInstanceOf(APIError);
    expect(result.message).toBe('An unknown error occurred');
  });
});

describe('getErrorMessage', () => {
  it('should get message from APIError', () => {
    const error = new APIError('API failed');
    const message = getErrorMessage(error);
    expect(message).toBe('API failed');
  });

  it('should get message from ValidationError', () => {
    const error = new ValidationError('Validation failed');
    const message = getErrorMessage(error);
    expect(message).toBe('Validation failed');
  });

  it('should get message from ConnectionError', () => {
    const error = new ConnectionError('Connection failed');
    const message = getErrorMessage(error);
    expect(message).toBe('Connection failed');
  });

  it('should get message from generic Error', () => {
    const error = new Error('Generic error');
    const message = getErrorMessage(error);
    expect(message).toBe('Generic error');
  });

  it('should handle unknown error types', () => {
    const error = 'string error';
    const message = getErrorMessage(error);
    expect(message).toBe('An unexpected error occurred');
  });
});

describe('getErrorCode', () => {
  it('should get code from APIError', () => {
    const error = new APIError('Test', 400, 'test_code');
    const code = getErrorCode(error);
    expect(code).toBe('test_code');
  });

  it('should return undefined for non-APIError', () => {
    const error = new Error('Test');
    const code = getErrorCode(error);
    expect(code).toBeUndefined();
  });
});

describe('isRetryableError', () => {
  it('should return true for ConnectionError', () => {
    const error = new ConnectionError('Connection failed');
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for retryable status codes', () => {
    const error408 = new APIError('Timeout', 408);
    const error429 = new APIError('Rate limit', 429);
    const error502 = new APIError('Bad gateway', 502);
    const error503 = new APIError('Service unavailable', 503);
    const error504 = new APIError('Gateway timeout', 504);

    expect(isRetryableError(error408)).toBe(true);
    expect(isRetryableError(error429)).toBe(true);
    expect(isRetryableError(error502)).toBe(true);
    expect(isRetryableError(error503)).toBe(true);
    expect(isRetryableError(error504)).toBe(true);
  });

  it('should return false for non-retryable errors', () => {
    const error400 = new APIError('Bad request', 400);
    const error401 = new APIError('Unauthorized', 401);
    const error404 = new APIError('Not found', 404);

    expect(isRetryableError(error400)).toBe(false);
    expect(isRetryableError(error401)).toBe(false);
    expect(isRetryableError(error404)).toBe(false);
  });

  it('should return false for non-APIError', () => {
    const error = new Error('Generic error');
    expect(isRetryableError(error)).toBe(false);
  });
});

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should allow requests within limit', () => {
    const key = 'test-key';
    const maxRequests = 3;
    const windowMs = 1000;

    expect(rateLimiter.isAllowed(key, maxRequests, windowMs)).toBe(true);
    expect(rateLimiter.isAllowed(key, maxRequests, windowMs)).toBe(true);
    expect(rateLimiter.isAllowed(key, maxRequests, windowMs)).toBe(true);
  });

  it('should deny requests exceeding limit', () => {
    const key = 'test-key';
    const maxRequests = 2;
    const windowMs = 1000;

    expect(rateLimiter.isAllowed(key, maxRequests, windowMs)).toBe(true);
    expect(rateLimiter.isAllowed(key, maxRequests, windowMs)).toBe(true);
    expect(rateLimiter.isAllowed(key, maxRequests, windowMs)).toBe(false);
  });

  it('should reset window after time passes', () => {
    const key = 'test-key';
    const maxRequests = 2;
    const windowMs = 1000;

    expect(rateLimiter.isAllowed(key, maxRequests, windowMs)).toBe(true);
    expect(rateLimiter.isAllowed(key, maxRequests, windowMs)).toBe(true);
    expect(rateLimiter.isAllowed(key, maxRequests, windowMs)).toBe(false);

    // Advance time beyond window
    jest.advanceTimersByTime(1001);

    expect(rateLimiter.isAllowed(key, maxRequests, windowMs)).toBe(true);
  });

  it('should calculate retry after time', () => {
    const key = 'test-key';
    const maxRequests = 1;
    const windowMs = 1000;

    rateLimiter.isAllowed(key, maxRequests, windowMs);

    const retryAfter = rateLimiter.getRetryAfter(key, maxRequests, windowMs);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(windowMs);
  });

  it('should handle different keys separately', () => {
    const maxRequests = 1;
    const windowMs = 1000;

    expect(rateLimiter.isAllowed('key1', maxRequests, windowMs)).toBe(true);
    expect(rateLimiter.isAllowed('key2', maxRequests, windowMs)).toBe(true);
    expect(rateLimiter.isAllowed('key1', maxRequests, windowMs)).toBe(false);
    expect(rateLimiter.isAllowed('key2', maxRequests, windowMs)).toBe(false);
  });
});