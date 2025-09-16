// Using proper TypeScript types for FHIR resources
// Simplified interfaces for EHR Dashboard

// Common FHIR types
export interface CodeableConcept {
  coding?: Array<{
    system?: string;
    code?: string;
    display?: string;
  }>;
  text?: string;
}

export interface Reference {
  reference?: string;
  display?: string;
}

export interface Period {
  start?: string;
  end?: string;
}

export interface HumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
}

export interface ContactPoint {
  system?: string;
  value?: string;
  use?: string;
}

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
  name?: Array<HumanName>;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  telecom?: Array<ContactPoint>;
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
  category?: Array<CodeableConcept>;
  code?: CodeableConcept;
  subject?: Reference;
  effectiveDateTime?: string;
  valueQuantity?: {
    value?: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  component?: Array<{
    code?: CodeableConcept;
    valueQuantity?: {
      value?: number;
      unit?: string;
    };
  }>;
}

export interface Condition {
  resourceType: 'Condition';
  id?: string;
  clinicalStatus?: CodeableConcept;
  verificationStatus?: CodeableConcept;
  code?: CodeableConcept;
  subject?: Reference;
  onsetDateTime?: string;
}

export interface MedicationRequest {
  resourceType: 'MedicationRequest';
  id?: string;
  status?: string;
  intent?: string;
  medicationCodeableConcept?: CodeableConcept;
  subject?: Reference;
  authoredOn?: string;
  dosageInstruction?: Array<{
    text?: string;
    timing?: {
      repeat?: {
        frequency?: number;
        period?: number;
        periodUnit?: string;
      };
    };
    route?: CodeableConcept;
  }>;
}

export interface DiagnosticReport {
  resourceType: 'DiagnosticReport';
  id?: string;
  status?: string;
  code?: CodeableConcept;
  subject?: Reference;
  effectiveDateTime?: string;
  result?: Array<Reference>;
}

export interface Encounter {
  resourceType: 'Encounter';
  id?: string;
  status?: string;
  class?: CodeableConcept;
  subject?: Reference;
  period?: Period;
}

export interface AllergyIntolerance {
  resourceType: 'AllergyIntolerance';
  id?: string;
  clinicalStatus?: CodeableConcept;
  verificationStatus?: CodeableConcept;
  code?: CodeableConcept;
  patient?: Reference;
  criticality?: string;
  reaction?: Array<{
    substance?: CodeableConcept;
    manifestation?: Array<CodeableConcept>;
    severity?: string;
  }>;
}

export interface Immunization {
  resourceType: 'Immunization';
  id?: string;
  status?: string;
  vaccineCode?: CodeableConcept;
  patient?: Reference;
  occurrenceDateTime?: string;
  lotNumber?: string;
  route?: CodeableConcept;
  site?: CodeableConcept;
}

export interface Practitioner {
  resourceType: 'Practitioner';
  id?: string;
  active?: boolean;
  name?: Array<HumanName>;
  telecom?: Array<ContactPoint>;
  qualification?: Array<{
    code?: CodeableConcept;
    period?: Period;
    issuer?: Reference;
  }>;
}

export interface Coverage {
  resourceType: 'Coverage';
  id?: string;
  status?: string;
  beneficiary?: Reference;
  payor?: Array<Reference>;
  class?: Array<{
    type?: CodeableConcept;
    value?: string;
    name?: string;
  }>;
}

export interface Claim {
  resourceType: 'Claim';
  id?: string;
  status?: string;
  type?: CodeableConcept;
  patient?: Reference;
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