'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from '@/lib/hooks/use-query';
import { Patient, PatientSearchParams } from '@/lib/types/fhir';
import { PatientForm } from './patient-form';
import { PatientDetails } from './patient-details';

export function PatientManagement() {
  const [searchParams, setSearchParams] = useState<PatientSearchParams>({ _count: 20 });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const { data: patientsResponse, isLoading, error, refetch } = usePatients(searchParams);
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();
  const deleteMutation = useDeletePatient();

  const patients = patientsResponse?.data || [];

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    refetch();
  };

  const handleCreatePatient = async (patientData: Patient) => {
    try {
      await createMutation.mutateAsync(patientData);
      setShowForm(false);
      refetch();
    } catch (error) {
      console.error('Failed to create patient:', error);
    }
  };

  const handleUpdatePatient = async (patientData: Patient) => {
    if (!editingPatient?.id) return;

    try {
      await updateMutation.mutateAsync({
        id: editingPatient.id,
        patient: patientData
      });
      setEditingPatient(null);
      setShowForm(false);
      refetch();
    } catch (error) {
      console.error('Failed to update patient:', error);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(patientId);
      if (selectedPatient?.id === patientId) {
        setSelectedPatient(null);
      }
      refetch();
    } catch (error) {
      console.error('Failed to delete patient:', error);
    }
  };

  const formatPatientName = (patient: Patient): string => {
    const name = patient.name?.[0];
    if (!name) return 'Unknown Patient';

    const given = name.given?.join(' ') || '';
    const family = name.family || '';
    return `${given} ${family}`.trim() || 'Unknown Patient';
  };

  const formatPatientInfo = (patient: Patient) => {
    const birthDate = patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'Unknown';
    const gender = patient.gender || 'Unknown';
    const phone = patient.telecom?.find((t: any) => t.system === 'phone')?.value || 'No phone';
    const email = patient.telecom?.find((t: any) => t.system === 'email')?.value || 'No email';

    return { birthDate, gender, phone, email };
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingPatient ? 'Edit Patient' : 'Add New Patient'}
          </h2>
          <Button variant="outline" onClick={() => {
            setShowForm(false);
            setEditingPatient(null);
          }}>
            Cancel
          </Button>
        </div>

        <PatientForm
          patient={editingPatient}
          onSubmit={editingPatient ? handleUpdatePatient : handleCreatePatient}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    );
  }

  if (selectedPatient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Patient Details
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditingPatient(selectedPatient);
                setShowForm(true);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => setSelectedPatient(null)}>
              Back to List
            </Button>
          </div>
        </div>

        <PatientDetails
          patient={selectedPatient}
          onEdit={() => {
            setEditingPatient(selectedPatient);
            setShowForm(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Patients</CardTitle>
          <CardDescription>
            Search for patients by name, ID, or other criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Patient Name</Label>
              <Input
                id="name"
                placeholder="Enter patient name"
                value={searchParams.name || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="identifier">Patient ID</Label>
              <Input
                id="identifier"
                placeholder="Enter patient identifier"
                value={searchParams.identifier || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, identifier: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate">Birth Date</Label>
              <Input
                id="birthdate"
                type="date"
                value={searchParams.birthdate || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, birthdate: e.target.value }))}
              />
            </div>

            <div className="md:col-span-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search Patients
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            {error.message || 'Failed to load patients. Please check your connection and try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Patient List
            {patientsResponse?.total && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({patientsResponse.total} patients found)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading patients...
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No patients found. Try adjusting your search criteria or add a new patient.
            </div>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => {
                const name = formatPatientName(patient);
                const info = formatPatientInfo(patient);

                return (
                  <div
                    key={patient.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {info.birthDate}
                            </div>
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {info.gender}
                            </div>
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {info.phone}
                            </div>
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {info.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPatient(patient);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (patient.id) handleDeletePatient(patient.id);
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}