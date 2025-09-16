# EHR Integration Dashboard - Implementation Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Getting Started](#getting-started)
3. [Configuration](#configuration)
4. [Authentication Flow](#authentication-flow)
5. [State Management](#state-management)
6. [Error Handling](#error-handling)
7. [Performance Optimizations](#performance-optimizations)
8. [Testing Strategy](#testing-strategy)
9. [Deployment](#deployment)
10. [Maintenance](#maintenance)

## Architecture Overview

### Tech Stack
- **Framework:** Next.js 15 with TypeScript
- **State Management:** React Query (TanStack Query) + Context API
- **Styling:** Tailwind CSS with custom components
- **HTTP Client:** Axios with custom FHIR client wrapper
- **Testing:** Jest + React Testing Library
- **Authentication:** OAuth 2.0 with JWT tokens

### Project Structure
```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Main dashboard page
├── components/
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── dashboard.tsx        # Main dashboard layout
│   │   ├── patient-management.tsx
│   │   ├── appointment-management.tsx
│   │   ├── clinical-operations.tsx
│   │   └── billing-admin.tsx
│   ├── ui/                      # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── connection-setup.tsx
│   └── providers.tsx            # Query client & context providers
├── lib/
│   ├── api/                     # API layer
│   │   └── fhir-client.ts      # FHIR API client
│   ├── context/                 # React contexts
│   │   └── ehr-context.tsx     # EHR connection context
│   ├── hooks/                   # Custom React hooks
│   │   └── use-query.ts        # Data fetching hooks
│   ├── types/                   # TypeScript type definitions
│   │   └── fhir.ts             # FHIR and app types
│   └── utils/                   # Utility functions
│       ├── validation.ts        # Input validation
│       └── error-handler.ts     # Error handling utilities
└── __tests__/                   # Test files
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Practice Fusion developer account (or test credentials)
- Modern web browser with JavaScript enabled

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ehr-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables
Create `.env.local` file:
```env
# Optional: Default EHR configuration
NEXT_PUBLIC_DEFAULT_EHR_BASE_URL=https://api.practicefusion.com/fhir/r4
NEXT_PUBLIC_DEFAULT_CLIENT_ID=your_client_id

# Optional: Analytics and monitoring
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## Configuration

### EHR System Configuration

The application supports dynamic EHR system configuration through the UI. Users can input:

- **Base URL:** EHR FHIR API endpoint
- **Client ID:** OAuth client identifier
- **Client Secret:** OAuth client secret
- **Access Token:** Direct access token (optional)

Configuration is stored in localStorage and can be updated anytime through the settings interface.

### API Client Configuration

The `FHIRClient` class handles all API communication:

```typescript
// lib/api/fhir-client.ts
const client = new FHIRClient({
  baseUrl: 'https://api.practicefusion.com/fhir/r4',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  accessToken: 'optional-access-token'
});
```

Features:
- Automatic token refresh
- Request/response interceptors
- Comprehensive error handling
- Rate limiting protection
- Request timeouts (30s)

## Authentication Flow

### OAuth 2.0 Implementation

1. **Initial Setup:**
   ```typescript
   // User enters credentials in connection setup
   const config = {
     baseUrl: 'https://api.practicefusion.com/fhir/r4',
     clientId: 'your-client-id',
     clientSecret: 'your-client-secret'
   };
   ```

2. **Token Acquisition:**
   ```typescript
   // Automatic token request using client credentials
   POST /oauth/token
   {
     grant_type: 'client_credentials',
     client_id: 'your-client-id',
     client_secret: 'your-client-secret',
     scope: 'patient/*.read patient/*.write'
   }
   ```

3. **Token Usage:**
   ```typescript
   // Automatic inclusion in requests
   Authorization: Bearer <access_token>
   ```

4. **Token Refresh:**
   ```typescript
   // Automatic refresh on 401 responses
   // Uses refresh token if available
   ```

### Context Management

The `EHRContext` manages authentication state:

```typescript
const {
  client,           // FHIRClient instance
  config,           // Current configuration
  isConnected,      // Connection status
  connectionError,  // Last error
  connect,          // Connect function
  disconnect,       // Disconnect function
  testConnection    // Connection test
} = useEHR();
```

## State Management

### React Query Integration

Data fetching uses React Query for:
- Automatic caching
- Background refetching
- Optimistic updates
- Error retry logic
- Loading states

### Custom Hooks

```typescript
// Patient data hooks
const { data: patients, isLoading, error } = usePatients(searchParams);
const createMutation = useCreatePatient();
const updateMutation = useUpdatePatient();
const deleteMutation = useDeletePatient();

// Appointment data hooks
const { data: appointments } = useAppointments(searchParams);
const createAppointment = useCreateAppointment();

// Clinical data hooks
const { data: observations } = useObservations(patientId);
const { data: conditions } = useConditions(patientId);
const { data: medications } = useMedicationRequests(patientId);
```

### Query Configuration

```typescript
// Query client setup with defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      gcTime: 10 * 60 * 1000,      // 10 minutes
      retry: (failureCount, error) => {
        if (error?.response?.status === 401) return false;
        return failureCount < 3;
      },
    },
  },
});
```

## Error Handling

### Error Types

```typescript
// Custom error classes
class APIError extends Error {
  constructor(message: string, status?: number, code?: string) {}
}

class ValidationError extends Error {
  constructor(message: string, field?: string) {}
}

class ConnectionError extends Error {
  constructor(message: string, originalError?: Error) {}
}

class AuthenticationError extends Error {
  constructor(message: string) {}
}
```

### Error Processing

```typescript
// Centralized error handling
export function handleAPIError(error: any): APIError {
  // Handle FHIR OperationOutcome
  if (error?.response?.data?.resourceType === 'OperationOutcome') {
    return new APIError(error.response.data.issue[0].details.text);
  }

  // Handle OAuth errors
  if (error?.response?.data?.error) {
    return new APIError(error.response.data.error_description);
  }

  // Handle HTTP status codes
  switch (error?.response?.status) {
    case 401: return new AuthenticationError('Unauthorized');
    case 422: return new ValidationError('Validation failed');
    default: return new APIError('Unknown error occurred');
  }
}
```

### User-Friendly Error Display

```typescript
// Error boundary and user notifications
{error && (
  <Alert variant="destructive">
    <AlertCircle className="w-4 h-4" />
    <AlertDescription>
      {getErrorMessage(error)}
    </AlertDescription>
  </Alert>
)}
```

## Performance Optimizations

### Caching Strategy

1. **Query Caching:**
   - 5-minute stale time for patient data
   - 10-minute garbage collection time
   - Background refetching for fresh data

2. **Connection Pooling:**
   - Axios instance reuse
   - Keep-alive connections
   - Request/response compression

3. **Code Splitting:**
   - Dynamic imports for dashboard components
   - Lazy loading for heavy features
   - Tree shaking for unused code

### Rate Limiting

```typescript
// Built-in rate limiting
class RateLimiter {
  isAllowed(key: string, maxRequests: number, windowMs: number): boolean;
  getRetryAfter(key: string, maxRequests: number, windowMs: number): number;
}

// Usage in API client
if (!rateLimiter.isAllowed(clientId, 100, 60000)) {
  throw new APIError('Rate limit exceeded', 429);
}
```

### Pagination

```typescript
// Automatic pagination handling
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['patients', searchParams],
  queryFn: ({ pageParam = 0 }) =>
    client.searchPatients({ ...searchParams, _offset: pageParam }),
  getNextPageParam: (lastPage, pages) =>
    lastPage.data?.length === 20 ? pages.length * 20 : undefined,
});
```

## Testing Strategy

### Unit Tests

```typescript
// Validation testing
describe('validatePatient', () => {
  it('should pass validation with valid patient', () => {
    const patient = {
      name: [{ given: ['John'], family: 'Doe' }],
      birthDate: '1990-01-01'
    };
    const result = validatePatient(patient);
    expect(result.isValid).toBe(true);
  });
});

// API client testing
describe('FHIRClient', () => {
  it('should search patients successfully', async () => {
    const mockResponse = { data: { entry: [] } };
    mockAxios.get.mockResolvedValue(mockResponse);

    const result = await client.searchPatients({});
    expect(result.data).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// Component integration testing
describe('PatientManagement', () => {
  it('should display patients and handle CRUD operations', async () => {
    render(<PatientManagement />);

    // Test search functionality
    const searchInput = screen.getByLabelText(/patient name/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Test patient creation
    const addButton = screen.getByRole('button', { name: /add patient/i });
    fireEvent.click(addButton);

    expect(screen.getByRole('form')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- patient-management.test.tsx
```

## Deployment

### Environment Setup

1. **Development:**
   ```bash
   npm run dev
   # Runs on http://localhost:3000
   ```

2. **Production Build:**
   ```bash
   npm run build
   npm run start
   ```

3. **Docker Deployment:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

### Deployment Platforms

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Docker + Cloud Platforms
```bash
# Build image
docker build -t ehr-dashboard .

# Run locally
docker run -p 3000:3000 ehr-dashboard

# Deploy to cloud (AWS, GCP, Azure)
```

### Environment Variables (Production)

```env
# Required for production
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Optional: Monitoring
SENTRY_DSN=your-sentry-dsn
```

### SSL/HTTPS Configuration

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      }
    ];
  }
};
```

## Maintenance

### Monitoring

1. **Error Tracking:**
   - Sentry integration for error monitoring
   - Custom error boundaries for graceful failures
   - Comprehensive logging for debugging

2. **Performance Monitoring:**
   - Web Vitals tracking
   - API response time monitoring
   - Query performance analytics

3. **Health Checks:**
   ```typescript
   // API health check endpoint
   app.get('/api/health', (req, res) => {
     res.json({
       status: 'healthy',
       timestamp: new Date().toISOString(),
       version: process.env.npm_package_version
     });
   });
   ```

### Regular Maintenance Tasks

1. **Dependencies:**
   ```bash
   # Check for outdated packages
   npm outdated

   # Update dependencies
   npm update

   # Security audit
   npm audit
   ```

2. **Performance Optimization:**
   - Monitor bundle size
   - Analyze Core Web Vitals
   - Review API response times
   - Check error rates

3. **Security Updates:**
   - Regular dependency updates
   - Security patch monitoring
   - Access token rotation
   - SSL certificate renewal

### Troubleshooting

#### Common Issues

1. **Authentication Failures:**
   ```typescript
   // Check token validity
   const testResult = await client.testConnection();
   if (testResult.error) {
     // Token expired or invalid credentials
     await client.refreshToken();
   }
   ```

2. **Rate Limiting:**
   ```typescript
   // Handle rate limit errors
   if (error.status === 429) {
     const retryAfter = error.headers['retry-after'];
     setTimeout(() => retryRequest(), retryAfter * 1000);
   }
   ```

3. **Network Issues:**
   ```typescript
   // Implement exponential backoff
   const retryWithBackoff = async (fn, maxRetries = 3) => {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(resolve =>
           setTimeout(resolve, Math.pow(2, i) * 1000)
         );
       }
     }
   };
   ```

### Support and Documentation

- **API Documentation:** Review FHIR R4 specification
- **Community Support:** FHIR community forums
- **Vendor Support:** Practice Fusion developer support
- **Internal Documentation:** Keep implementation guide updated

---

This implementation guide provides comprehensive information for developers working with the EHR Integration Dashboard. For specific technical questions or issues, refer to the API Discovery Document or contact the development team.

**Guide Version:** 1.0
**Last Updated:** January 2024
**Maintained By:** EHR Integration Team