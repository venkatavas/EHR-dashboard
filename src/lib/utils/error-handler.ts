export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ConnectionError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'ConnectionError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export function handleAPIError(error: any): APIError {
  if (error instanceof APIError) {
    return error;
  }

  // Handle Axios errors
  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data;

    // FHIR OperationOutcome handling
    if (data?.resourceType === 'OperationOutcome' && data.issue?.length > 0) {
      const issue = data.issue[0];
      return new APIError(
        issue.details?.text || issue.diagnostics || 'FHIR operation failed',
        status,
        issue.code,
        data
      );
    }

    // OAuth error handling
    if (data?.error) {
      return new APIError(
        data.error_description || data.error,
        status,
        data.error,
        data
      );
    }

    // Generic HTTP error handling
    switch (status) {
      case 400:
        return new APIError('Bad Request: Invalid parameters or data format', status);
      case 401:
        return new AuthenticationError('Unauthorized: Invalid credentials or expired token');
      case 403:
        return new APIError('Forbidden: Insufficient permissions', status);
      case 404:
        return new APIError('Not Found: The requested resource was not found', status);
      case 409:
        return new APIError('Conflict: Resource already exists or version conflict', status);
      case 422:
        return new ValidationError('Validation Error: Invalid data provided');
      case 429:
        return new APIError('Too Many Requests: Rate limit exceeded', status);
      case 500:
        return new APIError('Internal Server Error: EHR system error', status);
      case 503:
        return new APIError('Service Unavailable: EHR system temporarily unavailable', status);
      default:
        return new APIError(`HTTP ${status}: ${error.response.statusText || 'Unknown error'}`, status);
    }
  }

  // Handle network errors
  if (error?.request) {
    return new ConnectionError('Network Error: Unable to connect to EHR system', error);
  }

  // Handle other errors
  if (error instanceof Error) {
    return new APIError(error.message);
  }

  return new APIError('An unknown error occurred');
}

export function getErrorMessage(error: any): string {
  if (error instanceof APIError || error instanceof ValidationError || error instanceof ConnectionError) {
    return error.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

export function getErrorCode(error: any): string | undefined {
  if (error instanceof APIError) {
    return error.code;
  }
  return undefined;
}

export function isRetryableError(error: any): boolean {
  if (error instanceof ConnectionError) {
    return true;
  }

  if (error instanceof APIError) {
    const retryableStatuses = [408, 429, 502, 503, 504];
    return error.status ? retryableStatuses.includes(error.status) : false;
  }

  return false;
}

export function logError(error: any, context?: string) {
  console.error(`Error${context ? ` in ${context}` : ''}:`, {
    name: error.name,
    message: error.message,
    status: error.status,
    code: error.code,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
}

// Error boundary helper
export function createErrorBoundary() {
  return {
    getDerivedStateFromError(error: Error) {
      logError(error, 'React Error Boundary');
      return { hasError: true };
    },

    componentDidCatch(error: Error, errorInfo: any) {
      logError(error, 'React Component');
      console.error('Error Info:', errorInfo);
    }
  };
}

// Async error handler wrapper
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      const handledError = handleAPIError(error);
      logError(handledError, context);
      throw handledError;
    }
  }) as T;
}

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = this.requests.get(key) || [];
    timestamps = timestamps.filter(t => t > windowStart);

    if (timestamps.length >= maxRequests) {
      return false;
    }

    timestamps.push(now);
    this.requests.set(key, timestamps);
    return true;
  }

  getRetryAfter(key: string, maxRequests: number, windowMs: number): number {
    const timestamps = this.requests.get(key) || [];
    if (timestamps.length === 0) return 0;

    const oldestRequest = Math.min(...timestamps);
    const retryAfter = (oldestRequest + windowMs) - Date.now();
    return Math.max(0, retryAfter);
  }
}