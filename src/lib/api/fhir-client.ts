import axios, { AxiosInstance, AxiosError } from 'axios';
import { EHRConfig, APIResponse, PatientSearchParams, AppointmentSearchParams } from '@/lib/types/fhir';
import type {
  Patient,
  Appointment,
  Observation,
  Condition,
  MedicationRequest,
  DiagnosticReport,
  Encounter,
  AllergyIntolerance,
  Immunization,
  Practitioner,
  Coverage,
  Claim
} from '@/lib/types/fhir';

export class FHIRClient {
  private client: AxiosInstance;
  private config: EHRConfig;

  constructor(config: EHRConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json',
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      if (this.config.accessToken) {
        config.headers.Authorization = `Bearer ${this.config.accessToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401 && this.config.refreshToken) {
          try {
            await this.refreshAccessToken();
            const originalRequest = error.config;
            if (originalRequest) {
              originalRequest.headers.Authorization = `Bearer ${this.config.accessToken}`;
              return this.client.request(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await axios.post(`${this.config.baseUrl}/oauth/token`, {
        grant_type: 'refresh_token',
        refresh_token: this.config.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      });

      this.config.accessToken = response.data.access_token;
      this.config.refreshToken = response.data.refresh_token || this.config.refreshToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }

  // Patient Management
  async searchPatients(params: PatientSearchParams): Promise<APIResponse<Patient[]>> {
    try {
      const response = await this.client.get('/Patient', { params });
      return {
        data: response.data.entry?.map((entry: any) => entry.resource) || [],
        total: response.data.total,
        entry: response.data.entry
      };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async getPatient(id: string): Promise<APIResponse<Patient>> {
    try {
      const response = await this.client.get(`/Patient/${id}`);
      return { data: response.data };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async createPatient(patient: Patient): Promise<APIResponse<Patient>> {
    try {
      const response = await this.client.post('/Patient', patient);
      return { data: response.data };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async updatePatient(id: string, patient: Patient): Promise<APIResponse<Patient>> {
    try {
      const response = await this.client.put(`/Patient/${id}`, patient);
      return { data: response.data };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async deletePatient(id: string): Promise<APIResponse<void>> {
    try {
      await this.client.delete(`/Patient/${id}`);
      return {};
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  // Appointment Management
  async searchAppointments(params: AppointmentSearchParams): Promise<APIResponse<Appointment[]>> {
    try {
      const response = await this.client.get('/Appointment', { params });
      return {
        data: response.data.entry?.map((entry: any) => entry.resource) || [],
        total: response.data.total,
        entry: response.data.entry
      };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async getAppointment(id: string): Promise<APIResponse<Appointment>> {
    try {
      const response = await this.client.get(`/Appointment/${id}`);
      return { data: response.data };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async createAppointment(appointment: Appointment): Promise<APIResponse<Appointment>> {
    try {
      const response = await this.client.post('/Appointment', appointment);
      return { data: response.data };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async updateAppointment(id: string, appointment: Appointment): Promise<APIResponse<Appointment>> {
    try {
      const response = await this.client.put(`/Appointment/${id}`, appointment);
      return { data: response.data };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async deleteAppointment(id: string): Promise<APIResponse<void>> {
    try {
      await this.client.delete(`/Appointment/${id}`);
      return {};
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  // Clinical Operations
  async getObservations(patientId: string): Promise<APIResponse<Observation[]>> {
    try {
      const response = await this.client.get('/Observation', {
        params: { patient: patientId }
      });
      return {
        data: response.data.entry?.map((entry: any) => entry.resource) || [],
        total: response.data.total
      };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async createObservation(observation: Observation): Promise<APIResponse<Observation>> {
    try {
      const response = await this.client.post('/Observation', observation);
      return { data: response.data };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async getConditions(patientId: string): Promise<APIResponse<Condition[]>> {
    try {
      const response = await this.client.get('/Condition', {
        params: { patient: patientId }
      });
      return {
        data: response.data.entry?.map((entry: any) => entry.resource) || [],
        total: response.data.total
      };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async createCondition(condition: Condition): Promise<APIResponse<Condition>> {
    try {
      const response = await this.client.post('/Condition', condition);
      return { data: response.data };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async getMedicationRequests(patientId: string): Promise<APIResponse<MedicationRequest[]>> {
    try {
      const response = await this.client.get('/MedicationRequest', {
        params: { patient: patientId }
      });
      return {
        data: response.data.entry?.map((entry: any) => entry.resource) || [],
        total: response.data.total
      };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async createMedicationRequest(medicationRequest: MedicationRequest): Promise<APIResponse<MedicationRequest>> {
    try {
      const response = await this.client.post('/MedicationRequest', medicationRequest);
      return { data: response.data };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async getDiagnosticReports(patientId: string): Promise<APIResponse<DiagnosticReport[]>> {
    try {
      const response = await this.client.get('/DiagnosticReport', {
        params: { patient: patientId }
      });
      return {
        data: response.data.entry?.map((entry: any) => entry.resource) || [],
        total: response.data.total
      };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async getAllergies(patientId: string): Promise<APIResponse<AllergyIntolerance[]>> {
    try {
      const response = await this.client.get('/AllergyIntolerance', {
        params: { patient: patientId }
      });
      return {
        data: response.data.entry?.map((entry: any) => entry.resource) || [],
        total: response.data.total
      };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async createAllergy(allergy: AllergyIntolerance): Promise<APIResponse<AllergyIntolerance>> {
    try {
      const response = await this.client.post('/AllergyIntolerance', allergy);
      return { data: response.data };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async getImmunizations(patientId: string): Promise<APIResponse<Immunization[]>> {
    try {
      const response = await this.client.get('/Immunization', {
        params: { patient: patientId }
      });
      return {
        data: response.data.entry?.map((entry: any) => entry.resource) || [],
        total: response.data.total
      };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  // Billing & Administrative
  async getCoverage(patientId: string): Promise<APIResponse<Coverage[]>> {
    try {
      const response = await this.client.get('/Coverage', {
        params: { patient: patientId }
      });
      return {
        data: response.data.entry?.map((entry: any) => entry.resource) || [],
        total: response.data.total
      };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async getClaims(patientId: string): Promise<APIResponse<Claim[]>> {
    try {
      const response = await this.client.get('/Claim', {
        params: { patient: patientId }
      });
      return {
        data: response.data.entry?.map((entry: any) => entry.resource) || [],
        total: response.data.total
      };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  // Practitioners
  async searchPractitioners(): Promise<APIResponse<Practitioner[]>> {
    try {
      const response = await this.client.get('/Practitioner');
      return {
        data: response.data.entry?.map((entry: any) => entry.resource) || [],
        total: response.data.total
      };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  private handleError(error: any): string {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.issue?.[0]?.details?.text ||
                     error.response.data?.error_description ||
                     error.response.statusText;
      return `HTTP ${status}: ${message}`;
    } else if (error.request) {
      return 'Network error: Unable to connect to EHR system';
    } else {
      return `Error: ${error.message}`;
    }
  }
}