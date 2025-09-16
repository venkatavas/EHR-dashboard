export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public details?: unknown
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

export function handleAPIError(error: unknown): APIError {
  if (error instanceof APIError) {
    return error;
  }

  // Type guard for axios errors
  const axiosError = error as {
    response?: {
      status: number;
      data?: {
        resourceType?: string;
        issue?: Array<{
          details?: { text?: string };
          diagnostics?: string;
          code?: string;
        }>;
        error?: string;
        error_description?: string;
      };
    };
    request?: unknown;
    message?: string;
  };

  // Handle Axios errors
  if (axiosError?.response) {
    const status = axiosError.response.status;
    const data = axiosError.response.data;

    // FHIR OperationOutcome handling
    if (data?.resourceType === 'OperationOutcome' && data.issue && data.issue.length > 0) {
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
        return new APIError(`HTTP ${status}: ${axiosError.response?.data || 'Unknown error'}`, status);
    }
  }

  // Handle network errors
  if (axiosError?.request) {
    return new ConnectionError('Network error: Unable to connect to EHR system', error as Error);
  }

  // Handle other errors
  if (error instanceof Error) {
    return new APIError(error.message);
  }

  return new APIError('An unknown error occurred');
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError || error instanceof ValidationError || error instanceof ConnectionError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof APIError) {
    return error.code;
  }
  return undefined;
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof ConnectionError) {
    return true;
  }

  if (error instanceof APIError) {
    const retryableStatuses = [408, 429, 502, 503, 504];
    return error.status ? retryableStatuses.includes(error.status) : false;
  }

  return false;
}

export function logError(error: unknown, context?: string) {
  const errorObj = error as {
    name?: string;
    message?: string;
    status?: number;
    code?: string;
    stack?: string;
  };
  
  console.error(`Error${context ? ` in ${context}` : ''}:`, {
    name: errorObj.name,
    message: errorObj.message,
    status: errorObj.status,
    code: errorObj.code,
    stack: errorObj.stack,
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

    componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
      logError(error, 'React Component');
      console.error('Error Info:', errorInfo);
    }
  };
}

// Async error handler wrapper
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
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