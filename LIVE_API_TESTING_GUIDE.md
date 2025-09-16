# Live FHIR API Testing Guide for Recruiters

## Overview
Your EHR Integration Dashboard supports both **demo mode** (with mock data) and **live FHIR API integration**. This guide provides recruiters with live FHIR API endpoints and credentials to test the application with real healthcare data.

## 🚀 Quick Start - No Authentication Required

### Oracle Health Open Sandbox (Recommended)
**Perfect for immediate testing without any credentials setup**

- **Base URL**: `https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d`
- **Authentication**: None required (open sandbox)
- **Data**: Real anonymized healthcare data
- **Limitations**: Read-only access

#### How to Test:
1. Start the EHR Dashboard application
2. On the connection setup screen, enter:
   - **Base URL**: `https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d`
   - **Client ID**: Leave empty
   - **Client Secret**: Leave empty
   - **Access Token**: Leave empty
3. Click "Test Connection" - should succeed immediately
4. Click "Connect" to start using live data

## 🔐 Authenticated FHIR APIs (For Full Testing)

### Oracle Health Secure Sandbox
For testing with full authentication and write capabilities:

#### Non-Patient Access:
- **Base URL**: `https://fhir-ehr-code.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d`
- **Authentication**: OAuth 2.0 required
- **Capabilities**: Full CRUD operations

#### Patient Access:
- **Base URL**: `https://fhir-myrecord.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d`
- **Authentication**: OAuth 2.0 required
- **Capabilities**: Patient-specific data access

### Getting OAuth Credentials
To obtain credentials for authenticated testing:
1. Visit: https://www.oracle.com/health/developer/api/
2. Register for a developer account
3. Create a new application
4. Obtain Client ID and Client Secret

## 📋 Testing Scenarios

### 1. Patient Management
- Search for patients by name, ID, or demographics
- View patient details and medical history
- Create new patient records (authenticated APIs only)

### 2. Appointment Scheduling
- View existing appointments
- Search appointments by date, patient, or status
- Schedule new appointments (authenticated APIs only)

### 3. Clinical Operations
- View observations (lab results, vital signs)
- Access medical conditions and diagnoses
- Review medication requests and allergies
- Check immunization records

### 4. Billing & Administrative
- Access coverage information
- View claims and billing data
- Generate reports

## 🔍 Sample Test Data

### Available Patient IDs (Oracle Open Sandbox):
- `12742400` - Adult patient with comprehensive medical history
- `12724066` - Pediatric patient
- `4342008` - Patient with multiple conditions

### Sample API Calls:
```bash
# Get patient by ID
GET https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d/Patient/12742400

# Search patients by name
GET https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d/Patient?name=Smart

# Get appointments for a patient
GET https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d/Appointment?patient=12742400
```

## 🛠️ Troubleshooting

### Connection Issues:
1. **CORS Errors**: The application handles CORS properly for supported APIs
2. **Network Timeouts**: APIs have 30-second timeout configured
3. **Rate Limiting**: Built-in rate limiting and retry logic

### Authentication Issues:
1. **Invalid Credentials**: Verify Client ID and Secret are correct
2. **Token Expiry**: Application automatically refreshes tokens
3. **Scope Issues**: Ensure proper FHIR scopes are configured

## 📊 Expected Results

### Demo Mode vs Live API:
- **Demo Mode**: Consistent mock data, instant responses
- **Live API**: Real healthcare data, network-dependent responses
- **Both Support**: All dashboard features and workflows

### Performance:
- **Initial Load**: 2-5 seconds for live API connection
- **Data Fetching**: 1-3 seconds per API call
- **Caching**: Intelligent caching reduces subsequent load times

## 🔒 Security & Compliance

### Data Protection:
- All API communications use HTTPS/TLS
- OAuth 2.0 with JWT tokens for authentication
- Automatic token refresh and secure storage
- No sensitive data stored in browser localStorage

### HIPAA Considerations:
- Sandbox data is anonymized and de-identified
- Production use requires proper BAA agreements
- Audit logging available for compliance

## 📞 Support

If you encounter any issues during testing:
1. Check browser console for detailed error messages
2. Verify network connectivity to FHIR endpoints
3. Ensure proper API credentials (for authenticated endpoints)
4. Review the Implementation Guide for detailed architecture

## 🎯 Key Differentiators

This EHR Dashboard demonstrates:
1. **Dual Integration**: Both mock and live API support
2. **Production Ready**: Proper error handling, authentication, caching
3. **FHIR Compliance**: Full R4 standard implementation
4. **Modern Architecture**: React 19, TypeScript, TanStack Query
5. **Comprehensive Testing**: 65+ unit tests with 100% pass rate

---

**Note**: The Oracle Health Open Sandbox is the fastest way to demonstrate live API integration without any credential setup. For full feature testing with write operations, use the authenticated endpoints with proper OAuth credentials.
