import { Patient, Appointment, Observation, Condition, MedicationRequest, AllergyIntolerance, Immunization } from '@/lib/types/fhir';

// Mock patient data
export const mockPatients: Patient[] = [
  {
    resourceType: 'Patient',
    id: 'patient-001',
    active: true,
    name: [
      {
        use: 'official',
        given: ['John', 'Michael'],
        family: 'Doe'
      }
    ],
    birthDate: '1990-05-15',
    gender: 'male',
    telecom: [
      {
        system: 'phone',
        value: '+1-555-0123',
        use: 'home'
      },
      {
        system: 'email',
        value: 'john.doe@email.com',
        use: 'home'
      }
    ],
    address: [
      {
        use: 'home',
        line: ['123 Main Street', 'Apt 4B'],
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: 'patient-002',
    active: true,
    name: [
      {
        use: 'official',
        given: ['Jane', 'Elizabeth'],
        family: 'Smith'
      }
    ],
    birthDate: '1985-08-22',
    gender: 'female',
    telecom: [
      {
        system: 'phone',
        value: '+1-555-0456',
        use: 'mobile'
      },
      {
        system: 'email',
        value: 'jane.smith@email.com',
        use: 'work'
      }
    ],
    address: [
      {
        use: 'home',
        line: ['456 Oak Avenue'],
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90210',
        country: 'US'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: 'patient-003',
    active: true,
    name: [
      {
        use: 'official',
        given: ['Robert', 'James'],
        family: 'Johnson'
      }
    ],
    birthDate: '1978-12-03',
    gender: 'male',
    telecom: [
      {
        system: 'phone',
        value: '+1-555-0789',
        use: 'work'
      }
    ],
    address: [
      {
        use: 'home',
        line: ['789 Pine Street'],
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'US'
      }
    ]
  }
];

// Mock appointments
export const mockAppointments: Appointment[] = [
  {
    resourceType: 'Appointment',
    id: 'appointment-001',
    status: 'booked',
    start: '2024-01-15T10:00:00Z',
    end: '2024-01-15T11:00:00Z',
    description: 'Annual Physical Exam',
    participant: [
      {
        actor: {
          reference: 'Patient/patient-001',
          display: 'John Doe'
        },
        required: 'required',
        status: 'accepted'
      },
      {
        actor: {
          reference: 'Practitioner/practitioner-001',
          display: 'Dr. Sarah Wilson'
        },
        required: 'required',
        status: 'accepted'
      }
    ]
  },
  {
    resourceType: 'Appointment',
    id: 'appointment-002',
    status: 'arrived',
    start: '2024-01-16T14:30:00Z',
    end: '2024-01-16T15:30:00Z',
    description: 'Follow-up Consultation',
    participant: [
      {
        actor: {
          reference: 'Patient/patient-002',
          display: 'Jane Smith'
        },
        required: 'required',
        status: 'accepted'
      }
    ]
  }
];

// Mock observations (vital signs)
export const mockObservations: Observation[] = [
  {
    resourceType: 'Observation',
    id: 'observation-001',
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '85354-9',
          display: 'Blood pressure panel'
        }
      ],
      text: 'Blood Pressure'
    },
    subject: {
      reference: 'Patient/patient-001'
    },
    effectiveDateTime: '2024-01-15T10:30:00Z',
    valueQuantity: {
      value: 120,
      unit: 'mmHg',
      system: 'http://unitsofmeasure.org',
      code: 'mm[Hg]'
    },
    component: [
      {
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8480-6',
              display: 'Systolic blood pressure'
            }
          ]
        },
        valueQuantity: {
          value: 120,
          unit: 'mmHg',
          system: 'http://unitsofmeasure.org',
          code: 'mm[Hg]'
        }
      },
      {
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8462-4',
              display: 'Diastolic blood pressure'
            }
          ]
        },
        valueQuantity: {
          value: 80,
          unit: 'mmHg',
          system: 'http://unitsofmeasure.org',
          code: 'mm[Hg]'
        }
      }
    ]
  },
  {
    resourceType: 'Observation',
    id: 'observation-002',
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '8867-4',
          display: 'Heart rate'
        }
      ],
      text: 'Heart Rate'
    },
    subject: {
      reference: 'Patient/patient-001'
    },
    effectiveDateTime: '2024-01-15T10:30:00Z',
    valueQuantity: {
      value: 72,
      unit: 'bpm',
      system: 'http://unitsofmeasure.org',
      code: '/min'
    }
  }
];

// Mock conditions
export const mockConditions: Condition[] = [
  {
    resourceType: 'Condition',
    id: 'condition-001',
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active'
        }
      ]
    },
    verificationStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: 'confirmed'
        }
      ]
    },
    code: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '38341003',
          display: 'Hypertensive disorder'
        }
      ],
      text: 'Hypertension'
    },
    subject: {
      reference: 'Patient/patient-001'
    },
    onsetDateTime: '2023-06-01'
  }
];

// Mock medication requests
export const mockMedicationRequests: MedicationRequest[] = [
  {
    resourceType: 'MedicationRequest',
    id: 'medication-001',
    status: 'active',
    intent: 'order',
    medicationCodeableConcept: {
      coding: [
        {
          system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
          code: '197361',
          display: 'Lisinopril 10 MG Oral Tablet'
        }
      ],
      text: 'Lisinopril 10mg'
    },
    subject: {
      reference: 'Patient/patient-001'
    },
    authoredOn: '2024-01-15',
    dosageInstruction: [
      {
        text: 'Take one tablet daily with water',
        timing: {
          repeat: {
            frequency: 1,
            period: 1,
            periodUnit: 'd'
          }
        },
        route: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '26643006',
              display: 'Oral route'
            }
          ]
        },
        doseAndRate: [
          {
            doseQuantity: {
              value: 1,
              unit: 'tablet',
              system: 'http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm',
              code: 'TAB'
            }
          }
        ]
      }
    ]
  }
];

// Mock allergies
export const mockAllergies: AllergyIntolerance[] = [
  {
    resourceType: 'AllergyIntolerance',
    id: 'allergy-001',
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
          code: 'active'
        }
      ]
    },
    verificationStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
          code: 'confirmed'
        }
      ]
    },
    code: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '387406002',
          display: 'Sulfonamide (substance)'
        }
      ],
      text: 'Sulfa drugs'
    },
    patient: {
      reference: 'Patient/patient-001'
    },
    criticality: 'high',
    reaction: [
      {
        manifestation: [
          {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '271807003',
                display: 'Skin rash'
              }
            ],
            text: 'Skin rash'
          }
        ],
        severity: 'moderate'
      }
    ]
  }
];

// Mock immunizations
export const mockImmunizations: Immunization[] = [
  {
    resourceType: 'Immunization',
    id: 'immunization-001',
    status: 'completed',
    vaccineCode: {
      coding: [
        {
          system: 'http://hl7.org/fhir/sid/cvx',
          code: '140',
          display: 'Influenza, seasonal, injectable'
        }
      ],
      text: 'Seasonal Flu Vaccine'
    },
    patient: {
      reference: 'Patient/patient-001'
    },
    occurrenceDateTime: '2023-10-15',
    lotNumber: 'LOT123456',
    route: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration',
          code: 'IM',
          display: 'Intramuscular'
        }
      ]
    },
    site: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActSite',
          code: 'LA',
          display: 'Left arm'
        }
      ]
    }
  }
];

// Helper functions for filtering mock data
export function filterPatientsByName(patients: Patient[], searchName: string): Patient[] {
  if (!searchName) return patients;

  const searchLower = searchName.toLowerCase();
  return patients.filter(patient => {
    const name = patient.name?.[0];
    if (!name) return false;

    const fullName = `${name.given?.join(' ') || ''} ${name.family || ''}`.toLowerCase();
    return fullName.includes(searchLower);
  });
}

export function filterPatientsByIdentifier(patients: Patient[], identifier: string): Patient[] {
  if (!identifier) return patients;
  return patients.filter(patient => patient.id?.includes(identifier));
}

export function filterAppointmentsByDate(appointments: Appointment[], date: string): Appointment[] {
  if (!date) return appointments;
  return appointments.filter(appointment =>
    appointment.start?.startsWith(date)
  );
}

export function getPatientData(patientId: string) {
  return {
    observations: mockObservations.filter(obs => obs.subject?.reference === `Patient/${patientId}`),
    conditions: mockConditions.filter(cond => cond.subject?.reference === `Patient/${patientId}`),
    medications: mockMedicationRequests.filter(med => med.subject?.reference === `Patient/${patientId}`),
    allergies: mockAllergies.filter(allergy => allergy.patient?.reference === `Patient/${patientId}`),
    immunizations: mockImmunizations.filter(imm => imm.patient?.reference === `Patient/${patientId}`)
  };
}