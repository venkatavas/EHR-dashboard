'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEHR } from '@/lib/context/ehr-context';
import type {
  Patient,
  Appointment,
  Observation,
  Condition,
  MedicationRequest,
  DiagnosticReport,
  AllergyIntolerance,
  Immunization,
  Coverage,
  Claim,
  Practitioner,
  PatientSearchParams,
  AppointmentSearchParams
} from '@/lib/types/fhir';

// Patient hooks
export function usePatients(params: PatientSearchParams = {}) {
  const { client } = useEHR();

  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => client?.searchPatients(params),
    enabled: !!client,
  });
}

export function usePatient(id: string) {
  const { client } = useEHR();

  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => client?.getPatient(id),
    enabled: !!client && !!id,
  });
}

export function useCreatePatient() {
  const { client } = useEHR();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patient: Patient) => client!.createPatient(patient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useUpdatePatient() {
  const { client } = useEHR();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patient }: { id: string; patient: Patient }) =>
      client!.updatePatient(id, patient),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useDeletePatient() {
  const { client } = useEHR();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client!.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Appointment hooks
export function useAppointments(params: AppointmentSearchParams = {}) {
  const { client } = useEHR();

  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => client?.searchAppointments(params),
    enabled: !!client,
  });
}

export function useAppointment(id: string) {
  const { client } = useEHR();

  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => client?.getAppointment(id),
    enabled: !!client && !!id,
  });
}

export function useCreateAppointment() {
  const { client } = useEHR();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointment: Appointment) => client!.createAppointment(appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useUpdateAppointment() {
  const { client } = useEHR();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, appointment }: { id: string; appointment: Appointment }) =>
      client!.updateAppointment(id, appointment),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useDeleteAppointment() {
  const { client } = useEHR();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client!.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

// Clinical hooks
export function useObservations(patientId: string) {
  const { client } = useEHR();

  return useQuery({
    queryKey: ['observations', patientId],
    queryFn: () => client?.getObservations(patientId),
    enabled: !!client && !!patientId,
  });
}

export function useCreateObservation() {
  const { client } = useEHR();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (observation: Observation) => client!.createObservation(observation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] });
    },
  });
}

export function useConditions(patientId: string) {
  const { client } = useEHR();

  return useQuery({
    queryKey: ['conditions', patientId],
    queryFn: () => client?.getConditions(patientId),
    enabled: !!client && !!patientId,
  });
}

export function useCreateCondition() {
  const { client } = useEHR();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (condition: Condition) => client!.createCondition(condition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conditions'] });
    },
  });
}

export function useMedicationRequests(patientId: string) {
  const { client } = useEHR();

  return useQuery({
    queryKey: ['medicationRequests', patientId],
    queryFn: () => client?.getMedicationRequests(patientId),
    enabled: !!client && !!patientId,
  });
}

export function useCreateMedicationRequest() {
  const { client } = useEHR();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (medicationRequest: MedicationRequest) =>
      client!.createMedicationRequest(medicationRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicationRequests'] });
    },
  });
}

export function useDiagnosticReports(patientId: string) {
  const { client } = useEHR();

  return useQuery({
    queryKey: ['diagnosticReports', patientId],
    queryFn: () => client?.getDiagnosticReports(patientId),
    enabled: !!client && !!patientId,
  });
}

export function useAllergies(patientId: string) {
  const { client } = useEHR();

  return useQuery({
    queryKey: ['allergies', patientId],
    queryFn: () => client?.getAllergies(patientId),
    enabled: !!client && !!patientId,
  });
}

export function useCreateAllergy() {
  const { client } = useEHR();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (allergy: AllergyIntolerance) => client!.createAllergy(allergy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergies'] });
    },
  });
}

export function useImmunizations(patientId: string) {
  const { client } = useEHR();

  return useQuery({
    queryKey: ['immunizations', patientId],
    queryFn: () => client?.getImmunizations(patientId),
    enabled: !!client && !!patientId,
  });
}

// Billing hooks
export function useCoverage(patientId: string) {
  const { client } = useEHR();

  return useQuery({
    queryKey: ['coverage', patientId],
    queryFn: () => client?.getCoverage(patientId),
    enabled: !!client && !!patientId,
  });
}

export function useClaims(patientId: string) {
  const { client } = useEHR();

  return useQuery({
    queryKey: ['claims', patientId],
    queryFn: () => client?.getClaims(patientId),
    enabled: !!client && !!patientId,
  });
}

// Practitioners
export function usePractitioners() {
  const { client } = useEHR();

  return useQuery({
    queryKey: ['practitioners'],
    queryFn: () => client?.searchPractitioners(),
    enabled: !!client,
  });
}