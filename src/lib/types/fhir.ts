// Using any for FHIR types to avoid complex import issues
// In production, would use proper @types/fhir package

export interface EHRConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface PatientSearchParams {
  name?: string;
  identifier?: string;
  birthdate?: string;
  gender?: string;
  address?: string;
  phone?: string;
  email?: string;
  _count?: number;
  _offset?: number;
}

export interface AppointmentSearchParams {
  date?: string;
  patient?: string;
  practitioner?: string;
  status?: string;
  _count?: number;
  _offset?: number;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
  total?: number;
  entry?: Array<{
    resource: T;
    fullUrl?: string;
  }>;
}

// FHIR Resource Types (simplified for demo)
export interface Patient {
  resourceType: 'Patient';
  id?: string;
  active?: boolean;
  name?: Array<{
    use?: string;
    given?: string[];
    family?: string;
  }>;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  address?: Array<{
    use?: string;
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
}

export interface Appointment {
  resourceType: 'Appointment';
  id?: string;
  status?: string;
  start?: string;
  end?: string;
  description?: string;
  participant?: Array<{
    actor?: {
      reference?: string;
      display?: string;
    };
    required?: string;
    status?: string;
  }>;
}

export interface Observation {
  resourceType: 'Observation';
  id?: string;
  status?: string;
  category?: Array<any>;
  code?: {
    coding?: Array<any>;
    text?: string;
  };
  subject?: {
    reference?: string;
  };
  effectiveDateTime?: string;
  valueQuantity?: {
    value?: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  component?: Array<any>;
}

export interface Condition {
  resourceType: 'Condition';
  id?: string;
  clinicalStatus?: any;
  verificationStatus?: any;
  code?: any;
  subject?: any;
  onsetDateTime?: string;
}

export interface MedicationRequest {
  resourceType: 'MedicationRequest';
  id?: string;
  status?: string;
  intent?: string;
  medicationCodeableConcept?: any;
  subject?: any;
  authoredOn?: string;
  dosageInstruction?: Array<any>;
}

export interface DiagnosticReport {
  resourceType: 'DiagnosticReport';
  id?: string;
  status?: string;
  code?: any;
  subject?: any;
  effectiveDateTime?: string;
  result?: Array<any>;
}

export interface Encounter {
  resourceType: 'Encounter';
  id?: string;
  status?: string;
  class?: any;
  subject?: any;
  period?: any;
}

export interface AllergyIntolerance {
  resourceType: 'AllergyIntolerance';
  id?: string;
  clinicalStatus?: any;
  verificationStatus?: any;
  code?: any;
  patient?: any;
  criticality?: string;
  reaction?: Array<any>;
}

export interface Immunization {
  resourceType: 'Immunization';
  id?: string;
  status?: string;
  vaccineCode?: any;
  patient?: any;
  occurrenceDateTime?: string;
  lotNumber?: string;
  route?: any;
  site?: any;
}

export interface Practitioner {
  resourceType: 'Practitioner';
  id?: string;
  active?: boolean;
  name?: Array<any>;
  telecom?: Array<any>;
  qualification?: Array<any>;
}

export interface Coverage {
  resourceType: 'Coverage';
  id?: string;
  status?: string;
  beneficiary?: any;
  payor?: Array<any>;
  class?: Array<any>;
}

export interface Claim {
  resourceType: 'Claim';
  id?: string;
  status?: string;
  type?: any;
  patient?: any;
  created?: string;
  total?: {
    value?: number;
    currency?: string;
  };
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingResults: number;
  activeAlerts: number;
}