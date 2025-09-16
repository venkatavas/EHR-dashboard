import { EHRConfig, APIResponse, PatientSearchParams, AppointmentSearchParams } from '@/lib/types/fhir';
import type {
  Patient,
  Appointment,
  Observation,
  Condition,
  MedicationRequest,
  AllergyIntolerance,
  Immunization,
  Practitioner,
  Coverage,
  Claim
} from '@/lib/types/fhir';
import {
  mockPatients,
  mockAppointments,
  mockObservations,
  mockConditions,
  mockMedicationRequests,
  mockAllergies,
  mockImmunizations,
  filterPatientsByName,
  filterPatientsByIdentifier,
  filterAppointmentsByDate,
  getPatientData
} from './mock-data';

export class MockFHIRClient {
  private config: EHRConfig;
  private patients: Patient[] = [...mockPatients];
  private appointments: Appointment[] = [...mockAppointments];

  constructor(config: EHRConfig) {
    this.config = config;
  }

  // Simulate network delay
  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Patient Management
  async searchPatients(params: PatientSearchParams): Promise<APIResponse<Patient[]>> {
    await this.delay();

    try {
      let filteredPatients = [...this.patients];

      if (params.name) {
        filteredPatients = filterPatientsByName(filteredPatients, params.name);
      }

      if (params.identifier) {
        filteredPatients = filterPatientsByIdentifier(filteredPatients, params.identifier);
      }

      if (params.gender) {
        filteredPatients = filteredPatients.filter(p => p.gender === params.gender);
      }

      if (params.birthdate) {
        filteredPatients = filteredPatients.filter(p => p.birthDate === params.birthdate);
      }

      // Apply pagination
      const count = params._count || 20;
      const offset = params._offset || 0;
      const paginatedPatients = filteredPatients.slice(offset, offset + count);

      return {
        data: paginatedPatients,
        total: filteredPatients.length
      };
    } catch (error) {
      return { error: 'Failed to search patients' };
    }
  }

  async getPatient(id: string): Promise<APIResponse<Patient>> {
    await this.delay();

    const patient = this.patients.find(p => p.id === id);
    if (!patient) {
      return { error: 'Patient not found' };
    }

    return { data: patient };
  }

  async createPatient(patient: Patient): Promise<APIResponse<Patient>> {
    await this.delay();

    try {
      const newPatient = {
        ...patient,
        id: this.generateId(),
        resourceType: 'Patient' as const
      };

      this.patients.push(newPatient);
      return { data: newPatient };
    } catch (error) {
      return { error: 'Failed to create patient' };
    }
  }

  async updatePatient(id: string, patient: Patient): Promise<APIResponse<Patient>> {
    await this.delay();

    try {
      const index = this.patients.findIndex(p => p.id === id);
      if (index === -1) {
        return { error: 'Patient not found' };
      }

      const updatedPatient = { ...patient, id };
      this.patients[index] = updatedPatient;
      return { data: updatedPatient };
    } catch (error) {
      return { error: 'Failed to update patient' };
    }
  }

  async deletePatient(id: string): Promise<APIResponse<void>> {
    await this.delay();

    try {
      const index = this.patients.findIndex(p => p.id === id);
      if (index === -1) {
        return { error: 'Patient not found' };
      }

      this.patients.splice(index, 1);
      return {};
    } catch (error) {
      return { error: 'Failed to delete patient' };
    }
  }

  // Appointment Management
  async searchAppointments(params: AppointmentSearchParams): Promise<APIResponse<Appointment[]>> {
    await this.delay();

    try {
      let filteredAppointments = [...this.appointments];

      if (params.date) {
        filteredAppointments = filterAppointmentsByDate(filteredAppointments, params.date);
      }

      if (params.patient) {
        filteredAppointments = filteredAppointments.filter(apt =>
          apt.participant?.some((p: any) => p.actor?.reference?.includes(params.patient!))
        );
      }

      if (params.status) {
        filteredAppointments = filteredAppointments.filter(apt => apt.status === params.status);
      }

      const count = params._count || 20;
      const offset = params._offset || 0;
      const paginatedAppointments = filteredAppointments.slice(offset, offset + count);

      return {
        data: paginatedAppointments,
        total: filteredAppointments.length
      };
    } catch (error) {
      return { error: 'Failed to search appointments' };
    }
  }

  async getAppointment(id: string): Promise<APIResponse<Appointment>> {
    await this.delay();

    const appointment = this.appointments.find(a => a.id === id);
    if (!appointment) {
      return { error: 'Appointment not found' };
    }

    return { data: appointment };
  }

  async createAppointment(appointment: Appointment): Promise<APIResponse<Appointment>> {
    await this.delay();

    try {
      const newAppointment = {
        ...appointment,
        id: this.generateId(),
        resourceType: 'Appointment' as const
      };

      this.appointments.push(newAppointment);
      return { data: newAppointment };
    } catch (error) {
      return { error: 'Failed to create appointment' };
    }
  }

  async updateAppointment(id: string, appointment: Appointment): Promise<APIResponse<Appointment>> {
    await this.delay();

    try {
      const index = this.appointments.findIndex(a => a.id === id);
      if (index === -1) {
        return { error: 'Appointment not found' };
      }

      const updatedAppointment = { ...appointment, id };
      this.appointments[index] = updatedAppointment;
      return { data: updatedAppointment };
    } catch (error) {
      return { error: 'Failed to update appointment' };
    }
  }

  async deleteAppointment(id: string): Promise<APIResponse<void>> {
    await this.delay();

    try {
      const index = this.appointments.findIndex(a => a.id === id);
      if (index === -1) {
        return { error: 'Appointment not found' };
      }

      this.appointments.splice(index, 1);
      return {};
    } catch (error) {
      return { error: 'Failed to delete appointment' };
    }
  }

  // Clinical Operations
  async getObservations(patientId: string): Promise<APIResponse<Observation[]>> {
    await this.delay();

    try {
      const patientData = getPatientData(patientId);
      return {
        data: patientData.observations,
        total: patientData.observations.length
      };
    } catch (error) {
      return { error: 'Failed to get observations' };
    }
  }

  async createObservation(observation: Observation): Promise<APIResponse<Observation>> {
    await this.delay();

    try {
      const newObservation = {
        ...observation,
        id: this.generateId(),
        resourceType: 'Observation' as const
      };

      return { data: newObservation };
    } catch (error) {
      return { error: 'Failed to create observation' };
    }
  }

  async getConditions(patientId: string): Promise<APIResponse<Condition[]>> {
    await this.delay();

    try {
      const patientData = getPatientData(patientId);
      return {
        data: patientData.conditions,
        total: patientData.conditions.length
      };
    } catch (error) {
      return { error: 'Failed to get conditions' };
    }
  }

  async createCondition(condition: Condition): Promise<APIResponse<Condition>> {
    await this.delay();

    try {
      const newCondition = {
        ...condition,
        id: this.generateId(),
        resourceType: 'Condition' as const
      };

      return { data: newCondition };
    } catch (error) {
      return { error: 'Failed to create condition' };
    }
  }

  async getMedicationRequests(patientId: string): Promise<APIResponse<MedicationRequest[]>> {
    await this.delay();

    try {
      const patientData = getPatientData(patientId);
      return {
        data: patientData.medications,
        total: patientData.medications.length
      };
    } catch (error) {
      return { error: 'Failed to get medications' };
    }
  }

  async createMedicationRequest(medicationRequest: MedicationRequest): Promise<APIResponse<MedicationRequest>> {
    await this.delay();

    try {
      const newMedication = {
        ...medicationRequest,
        id: this.generateId(),
        resourceType: 'MedicationRequest' as const
      };

      return { data: newMedication };
    } catch (error) {
      return { error: 'Failed to create medication request' };
    }
  }

  async getDiagnosticReports(patientId: string): Promise<APIResponse<any[]>> {
    await this.delay();

    try {
      // Mock diagnostic reports
      const reports = [
        {
          resourceType: 'DiagnosticReport',
          id: 'report-001',
          status: 'final',
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '11502-2',
              display: 'Laboratory report'
            }],
            text: 'Complete Blood Count'
          },
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: '2024-01-10',
          result: [
            { reference: 'Observation/obs-hemoglobin', display: 'Hemoglobin 14.2 g/dL' },
            { reference: 'Observation/obs-wbc', display: 'White Blood Cells 7.5 K/uL' }
          ]
        }
      ];

      return {
        data: reports,
        total: reports.length
      };
    } catch (error) {
      return { error: 'Failed to get diagnostic reports' };
    }
  }

  async getAllergies(patientId: string): Promise<APIResponse<AllergyIntolerance[]>> {
    await this.delay();

    try {
      const patientData = getPatientData(patientId);
      return {
        data: patientData.allergies,
        total: patientData.allergies.length
      };
    } catch (error) {
      return { error: 'Failed to get allergies' };
    }
  }

  async createAllergy(allergy: AllergyIntolerance): Promise<APIResponse<AllergyIntolerance>> {
    await this.delay();

    try {
      const newAllergy = {
        ...allergy,
        id: this.generateId(),
        resourceType: 'AllergyIntolerance' as const
      };

      return { data: newAllergy };
    } catch (error) {
      return { error: 'Failed to create allergy' };
    }
  }

  async getImmunizations(patientId: string): Promise<APIResponse<Immunization[]>> {
    await this.delay();

    try {
      const patientData = getPatientData(patientId);
      return {
        data: patientData.immunizations,
        total: patientData.immunizations.length
      };
    } catch (error) {
      return { error: 'Failed to get immunizations' };
    }
  }

  // Billing & Administrative
  async getCoverage(patientId: string): Promise<APIResponse<Coverage[]>> {
    await this.delay();

    try {
      const mockCoverage: Coverage[] = [
        {
          resourceType: 'Coverage',
          id: 'coverage-001',
          status: 'active',
          beneficiary: { reference: `Patient/${patientId}` },
          payor: [{
            display: 'Blue Cross Blue Shield'
          }],
          class: [{
            type: {
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/coverage-class',
                code: 'group',
                display: 'Group'
              }]
            },
            value: 'BCBS-GROUP-001'
          }]
        }
      ];

      return {
        data: mockCoverage,
        total: mockCoverage.length
      };
    } catch (error) {
      return { error: 'Failed to get coverage' };
    }
  }

  async getClaims(patientId: string): Promise<APIResponse<Claim[]>> {
    await this.delay();

    try {
      const mockClaims: Claim[] = [
        {
          resourceType: 'Claim',
          id: 'claim-001',
          status: 'active',
          type: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/claim-type',
              code: 'institutional',
              display: 'Institutional'
            }]
          },
          patient: { reference: `Patient/${patientId}` },
          created: '2024-01-15',
          total: {
            value: 250.00,
            currency: 'USD'
          }
        }
      ];

      return {
        data: mockClaims,
        total: mockClaims.length
      };
    } catch (error) {
      return { error: 'Failed to get claims' };
    }
  }

  async searchPractitioners(): Promise<APIResponse<Practitioner[]>> {
    await this.delay();

    try {
      const mockPractitioners: Practitioner[] = [
        {
          resourceType: 'Practitioner',
          id: 'practitioner-001',
          active: true,
          name: [{
            use: 'official',
            given: ['Sarah'],
            family: 'Wilson',
            prefix: ['Dr.']
          }],
          telecom: [{
            system: 'phone',
            value: '+1-555-0100',
            use: 'work'
          }],
          qualification: [{
            code: {
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
                code: 'MD',
                display: 'Doctor of Medicine'
              }]
            }
          }]
        },
        {
          resourceType: 'Practitioner',
          id: 'practitioner-002',
          active: true,
          name: [{
            use: 'official',
            given: ['Michael'],
            family: 'Brown',
            prefix: ['Dr.']
          }],
          telecom: [{
            system: 'phone',
            value: '+1-555-0200',
            use: 'work'
          }],
          qualification: [{
            code: {
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
                code: 'MD',
                display: 'Doctor of Medicine'
              }]
            }
          }]
        }
      ];

      return {
        data: mockPractitioners,
        total: mockPractitioners.length
      };
    } catch (error) {
      return { error: 'Failed to get practitioners' };
    }
  }
}