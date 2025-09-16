import axios from 'axios';
import { FHIRClient } from '../fhir-client';
import { EHRConfig } from '@/lib/types/fhir';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FHIRClient', () => {
  let client: FHIRClient;
  let config: EHRConfig;

  beforeEach(() => {
    config = {
      baseUrl: 'https://api.test.com/fhir/r4',
      clientId: 'test-client',
      clientSecret: 'test-secret',
      accessToken: 'test-token'
    };

    mockedAxios.create.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    } as any);

    client = new FHIRClient(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Patient Management', () => {
    it('should search patients successfully', async () => {
      const mockResponse = {
        data: {
          resourceType: 'Bundle',
          total: 1,
          entry: [{
            resource: {
              resourceType: 'Patient',
              id: 'patient-123',
              name: [{ given: ['John'], family: 'Doe' }]
            }
          }]
        }
      };

      const mockClient = mockedAxios.create();
      mockClient.get = jest.fn().mockResolvedValue(mockResponse);
      (mockedAxios.create as jest.Mock).mockReturnValue(mockClient);

      client = new FHIRClient(config);
      const result = await client.searchPatients({ name: 'John' });

      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockClient.get).toHaveBeenCalledWith('/Patient', {
        params: { name: 'John' }
      });
    });

    it('should handle search patients error', async () => {
      const mockClient = mockedAxios.create();
      mockClient.get = jest.fn().mockRejectedValue(new Error('Network error'));
      (mockedAxios.create as jest.Mock).mockReturnValue(mockClient);

      client = new FHIRClient(config);
      const result = await client.searchPatients({});

      expect(result.error).toBeDefined();
      expect(result.data).toBeUndefined();
    });

    it('should get patient by ID successfully', async () => {
      const mockResponse = {
        data: {
          resourceType: 'Patient',
          id: 'patient-123',
          name: [{ given: ['John'], family: 'Doe' }]
        }
      };

      const mockClient = mockedAxios.create();
      mockClient.get = jest.fn().mockResolvedValue(mockResponse);
      (mockedAxios.create as jest.Mock).mockReturnValue(mockClient);

      client = new FHIRClient(config);
      const result = await client.getPatient('patient-123');

      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('patient-123');
      expect(mockClient.get).toHaveBeenCalledWith('/Patient/patient-123');
    });

    it('should create patient successfully', async () => {
      const patientData = {
        resourceType: 'Patient' as const,
        name: [{ given: ['John'], family: 'Doe' }],
        birthDate: '1990-01-01'
      };

      const mockResponse = {
        data: {
          ...patientData,
          id: 'patient-123'
        }
      };

      const mockClient = mockedAxios.create();
      mockClient.post = jest.fn().mockResolvedValue(mockResponse);
      (mockedAxios.create as jest.Mock).mockReturnValue(mockClient);

      client = new FHIRClient(config);
      const result = await client.createPatient(patientData);

      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('patient-123');
      expect(mockClient.post).toHaveBeenCalledWith('/Patient', patientData);
    });

    it('should update patient successfully', async () => {
      const patientData = {
        resourceType: 'Patient' as const,
        id: 'patient-123',
        name: [{ given: ['John'], family: 'Smith' }],
        birthDate: '1990-01-01'
      };

      const mockResponse = { data: patientData };

      const mockClient = mockedAxios.create();
      mockClient.put = jest.fn().mockResolvedValue(mockResponse);
      (mockedAxios.create as jest.Mock).mockReturnValue(mockClient);

      client = new FHIRClient(config);
      const result = await client.updatePatient('patient-123', patientData);

      expect(result.data).toBeDefined();
      expect(result.data?.name?.[0]?.family).toBe('Smith');
      expect(mockClient.put).toHaveBeenCalledWith('/Patient/patient-123', patientData);
    });

    it('should delete patient successfully', async () => {
      const mockClient = mockedAxios.create();
      mockClient.delete = jest.fn().mockResolvedValue({});
      (mockedAxios.create as jest.Mock).mockReturnValue(mockClient);

      client = new FHIRClient(config);
      const result = await client.deletePatient('patient-123');

      expect(result.error).toBeUndefined();
      expect(mockClient.delete).toHaveBeenCalledWith('/Patient/patient-123');
    });
  });

  describe('Appointment Management', () => {
    it('should search appointments successfully', async () => {
      const mockResponse = {
        data: {
          resourceType: 'Bundle',
          total: 1,
          entry: [{
            resource: {
              resourceType: 'Appointment',
              id: 'appointment-123',
              status: 'booked'
            }
          }]
        }
      };

      const mockClient = mockedAxios.create();
      mockClient.get = jest.fn().mockResolvedValue(mockResponse);
      (mockedAxios.create as jest.Mock).mockReturnValue(mockClient);

      client = new FHIRClient(config);
      const result = await client.searchAppointments({ date: '2024-01-01' });

      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(mockClient.get).toHaveBeenCalledWith('/Appointment', {
        params: { date: '2024-01-01' }
      });
    });

    it('should create appointment successfully', async () => {
      const appointmentData = {
        resourceType: 'Appointment' as const,
        status: 'booked' as const,
        start: '2024-01-15T10:00:00Z',
        end: '2024-01-15T11:00:00Z'
      };

      const mockResponse = {
        data: {
          ...appointmentData,
          id: 'appointment-123'
        }
      };

      const mockClient = mockedAxios.create();
      mockClient.post = jest.fn().mockResolvedValue(mockResponse);
      (mockedAxios.create as jest.Mock).mockReturnValue(mockClient);

      client = new FHIRClient(config);
      const result = await client.createAppointment(appointmentData);

      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('appointment-123');
      expect(mockClient.post).toHaveBeenCalledWith('/Appointment', appointmentData);
    });
  });

  describe('Clinical Operations', () => {
    it('should get observations for patient', async () => {
      const mockResponse = {
        data: {
          resourceType: 'Bundle',
          total: 2,
          entry: [{
            resource: {
              resourceType: 'Observation',
              id: 'obs-123',
              status: 'final'
            }
          }, {
            resource: {
              resourceType: 'Observation',
              id: 'obs-124',
              status: 'final'
            }
          }]
        }
      };

      const mockClient = mockedAxios.create();
      mockClient.get = jest.fn().mockResolvedValue(mockResponse);
      (mockedAxios.create as jest.Mock).mockReturnValue(mockClient);

      client = new FHIRClient(config);
      const result = await client.getObservations('patient-123');

      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(mockClient.get).toHaveBeenCalledWith('/Observation', {
        params: { patient: 'patient-123' }
      });
    });

    it('should create observation successfully', async () => {
      const observationData = {
        resourceType: 'Observation' as const,
        status: 'final' as const,
        code: {
          coding: [{ system: 'http://loinc.org', code: '8480-6' }]
        },
        subject: { reference: 'Patient/patient-123' }
      };

      const mockResponse = {
        data: {
          ...observationData,
          id: 'obs-123'
        }
      };

      const mockClient = mockedAxios.create();
      mockClient.post = jest.fn().mockResolvedValue(mockResponse);
      (mockedAxios.create as jest.Mock).mockReturnValue(mockClient);

      client = new FHIRClient(config);
      const result = await client.createObservation(observationData);

      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('obs-123');
      expect(mockClient.post).toHaveBeenCalledWith('/Observation', observationData);
    });
  });

  describe('Error Handling', () => {
    it('should handle axios response errors', async () => {
      const mockError = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: {
            resourceType: 'OperationOutcome',
            issue: [{
              severity: 'error',
              code: 'not-found',
              details: { text: 'Patient not found' }
            }]
          }
        }
      };

      const mockClient = mockedAxios.create();
      mockClient.get = jest.fn().mockRejectedValue(mockError);
      (mockedAxios.create as jest.Mock).mockReturnValue(mockClient);

      client = new FHIRClient(config);
      const result = await client.getPatient('invalid-id');

      expect(result.error).toBeDefined();
      expect(result.error).toContain('404');
      expect(result.data).toBeUndefined();
    });

    it('should handle network errors', async () => {
      const mockError = {
        request: {},
        message: 'Network Error'
      };

      const mockClient = mockedAxios.create();
      mockClient.get = jest.fn().mockRejectedValue(mockError);
      (mockedAxios.create as jest.Mock).mockReturnValue(mockClient);

      client = new FHIRClient(config);
      const result = await client.searchPatients({});

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Network error');
    });
  });
});