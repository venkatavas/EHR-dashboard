'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Edit,
  Heart,
  Pill,
  FileText,
  Activity
} from 'lucide-react';
import { Patient } from '@/lib/types/fhir';
import {
  useObservations,
  useConditions,
  useMedicationRequests,
  useAllergies,
  useImmunizations
} from '@/lib/hooks/use-query';

interface PatientDetailsProps {
  patient: Patient;
  onEdit: () => void;
}

export function PatientDetails({ patient, onEdit }: PatientDetailsProps) {
  const patientId = patient.id || '';

  const { data: observationsResponse } = useObservations(patientId);
  const { data: conditionsResponse } = useConditions(patientId);
  const { data: medicationsResponse } = useMedicationRequests(patientId);
  const { data: allergiesResponse } = useAllergies(patientId);
  const { data: immunizationsResponse } = useImmunizations(patientId);

  const observations = observationsResponse?.data || [];
  const conditions = conditionsResponse?.data || [];
  const medications = medicationsResponse?.data || [];
  const allergies = allergiesResponse?.data || [];
  const immunizations = immunizationsResponse?.data || [];

  const formatPatientName = (): string => {
    const name = patient.name?.[0];
    if (!name) return 'Unknown Patient';

    const given = name.given?.join(' ') || '';
    const family = name.family || '';
    return `${given} ${family}`.trim() || 'Unknown Patient';
  };

  const getContactInfo = () => {
    const phones = patient.telecom?.filter((t: any) => t.system === 'phone') || [];
    const emails = patient.telecom?.filter((t: any) => t.system === 'email') || [];
    return { phones, emails };
  };

  const getAddress = () => {
    const address = patient.address?.[0];
    if (!address) return null;

    const addressLines = address.line?.join(', ') || '';
    const city = address.city || '';
    const state = address.state || '';
    const postalCode = address.postalCode || '';
    const country = address.country || '';

    return `${addressLines}${addressLines ? ', ' : ''}${city}${city ? ', ' : ''}${state} ${postalCode} ${country}`.trim();
  };

  const getAge = (): string => {
    if (!patient.birthDate) return 'Unknown';
    const birthDate = new Date(patient.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return `${age} years`;
  };

  const { phones, emails } = getContactInfo();
  const address = getAddress();

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">{formatPatientName()}</CardTitle>
                <CardDescription className="text-lg">
                  Patient ID: {patient.id || 'Not assigned'}
                </CardDescription>
              </div>
            </div>
            <Button onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Patient
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Demographics */}
      <Card>
        <CardHeader>
          <CardTitle>Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Birth Date</p>
                <p className="font-medium">
                  {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-medium">{getAge()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium capitalize">{patient.gender || 'Unknown'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium">{patient.active !== false ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {phones.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Phone Numbers
                </h4>
                {phones.map((phone: any, index: number) => (
                  <p key={index} className="text-sm text-gray-600">
                    {phone.value} {phone.use && `(${phone.use})`}
                  </p>
                ))}
              </div>
            )}

            {emails.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Addresses
                </h4>
                {emails.map((email: any, index: number) => (
                  <p key={index} className="text-sm text-gray-600">
                    {email.value} {email.use && `(${email.use})`}
                  </p>
                ))}
              </div>
            )}

            {address && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Address
                </h4>
                <p className="text-sm text-gray-600">{address}</p>
              </div>
            )}

            {phones.length === 0 && emails.length === 0 && !address && (
              <p className="text-sm text-gray-500 italic">No contact information available</p>
            )}
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              Allergies & Intolerances
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allergies.length > 0 ? (
              <div className="space-y-2">
                {allergies.map((allergy, index) => (
                  <div key={allergy.id || index} className="p-3 bg-red-50 rounded-lg">
                    <p className="font-medium text-red-900">
                      {allergy.code?.text || allergy.code?.coding?.[0]?.display || 'Unknown Allergen'}
                    </p>
                    {allergy.reaction && allergy.reaction.length > 0 && (
                      <p className="text-sm text-red-700">
                        Reaction: {allergy.reaction[0].manifestation?.[0]?.text || 'Unknown reaction'}
                      </p>
                    )}
                    {allergy.criticality && (
                      <p className="text-sm text-red-700">
                        Criticality: {allergy.criticality}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No known allergies</p>
            )}
          </CardContent>
        </Card>

        {/* Current Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Pill className="w-5 h-5 mr-2 text-blue-500" />
              Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {medications.length > 0 ? (
              <div className="space-y-2">
                {medications.map((medication, index) => (
                  <div key={medication.id || index} className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">
                      {medication.medicationCodeableConcept?.text ||
                       medication.medicationCodeableConcept?.coding?.[0]?.display ||
                       'Unknown Medication'}
                    </p>
                    {medication.dosageInstruction && medication.dosageInstruction.length > 0 && (
                      <p className="text-sm text-blue-700">
                        {medication.dosageInstruction[0].text || 'As directed'}
                      </p>
                    )}
                    <p className="text-sm text-blue-600">
                      Status: {medication.status || 'Unknown'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No current medications</p>
            )}
          </CardContent>
        </Card>

        {/* Medical Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-orange-500" />
              Medical Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {conditions.length > 0 ? (
              <div className="space-y-2">
                {conditions.map((condition, index) => (
                  <div key={condition.id || index} className="p-3 bg-orange-50 rounded-lg">
                    <p className="font-medium text-orange-900">
                      {condition.code?.text || condition.code?.coding?.[0]?.display || 'Unknown Condition'}
                    </p>
                    <p className="text-sm text-orange-700">
                      Status: {condition.clinicalStatus?.coding?.[0]?.code || 'Unknown'}
                    </p>
                    {condition.onsetDateTime && (
                      <p className="text-sm text-orange-600">
                        Onset: {new Date(condition.onsetDateTime).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No medical conditions recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Observations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-500" />
              Recent Vital Signs & Observations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {observations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {observations.slice(0, 6).map((observation, index) => (
                  <div key={observation.id || index} className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">
                      {observation.code?.text || observation.code?.coding?.[0]?.display || 'Unknown Observation'}
                    </p>
                    {observation.valueQuantity && (
                      <p className="text-lg font-semibold text-green-800">
                        {observation.valueQuantity.value} {observation.valueQuantity.unit}
                      </p>
                    )}
                    {observation.effectiveDateTime && (
                      <p className="text-sm text-green-600">
                        {new Date(observation.effectiveDateTime).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No recent observations available</p>
            )}
          </CardContent>
        </Card>

        {/* Immunizations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-500" />
              Immunization History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {immunizations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {immunizations.map((immunization, index) => (
                  <div key={immunization.id || index} className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-900">
                      {immunization.vaccineCode?.text ||
                       immunization.vaccineCode?.coding?.[0]?.display ||
                       'Unknown Vaccine'}
                    </p>
                    <p className="text-sm text-purple-700">
                      Status: {immunization.status || 'Unknown'}
                    </p>
                    {immunization.occurrenceDateTime && (
                      <p className="text-sm text-purple-600">
                        Date: {new Date(immunization.occurrenceDateTime).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No immunization records available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}