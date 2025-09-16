'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Plus,
  Search,
  Activity,
  Heart,
  Pill,
  TestTube,
  Stethoscope,
  Thermometer,
  AlertCircle,
  Loader2
} from 'lucide-react';

export function ClinicalOperations() {
  const [activeTab, setActiveTab] = useState<'vitals' | 'notes' | 'labs' | 'medications' | 'diagnoses'>('vitals');
  const [patientId, setPatientId] = useState('');

  const tabs = [
    { id: 'vitals', name: 'Vital Signs', icon: Activity },
    { id: 'notes', name: 'Clinical Notes', icon: FileText },
    { id: 'labs', name: 'Lab Results', icon: TestTube },
    { id: 'medications', name: 'Medications', icon: Pill },
    { id: 'diagnoses', name: 'Diagnoses', icon: Stethoscope },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vitals':
        return <VitalSigns patientId={patientId} />;
      case 'notes':
        return <ClinicalNotes patientId={patientId} />;
      case 'labs':
        return <LabResults patientId={patientId} />;
      case 'medications':
        return <MedicationManagement patientId={patientId} />;
      case 'diagnoses':
        return <DiagnosisManagement patientId={patientId} />;
      default:
        return <VitalSigns patientId={patientId} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Clinical Operations</h2>
      </div>

      {/* Patient Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Patient</CardTitle>
          <CardDescription>Enter a patient ID to view and manage clinical data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                placeholder="Enter patient identifier"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>
            <Button className="mt-6">
              <Search className="w-4 h-4 mr-2" />
              Load Patient
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 inline mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}

function VitalSigns({ patientId }: { patientId: string }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Vital Signs</h3>
        <Button onClick={() => setShowForm(true)} disabled={!patientId}>
          <Plus className="w-4 h-4 mr-2" />
          Record Vitals
        </Button>
      </div>

      {!patientId ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Please select a patient to view vital signs</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Recent Vital Signs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 text-red-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Blood Pressure</p>
                      <p className="text-xl font-semibold">120/80</p>
                      <p className="text-xs text-gray-500">mmHg</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 text-blue-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Heart Rate</p>
                      <p className="text-xl font-semibold">72</p>
                      <p className="text-xs text-gray-500">bpm</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Thermometer className="w-5 h-5 text-green-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Temperature</p>
                      <p className="text-xl font-semibold">98.6</p>
                      <p className="text-xs text-gray-500">°F</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 text-purple-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Oxygen Sat</p>
                      <p className="text-xl font-semibold">98</p>
                      <p className="text-xs text-gray-500">%</p>
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="mt-4">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Demo data shown. Connect to live EHR system to view real vital signs data.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function ClinicalNotes({ patientId }: { patientId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Clinical Notes</h3>
        <Button disabled={!patientId}>
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      {!patientId ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Please select a patient to view clinical notes</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <FileText className="w-4 h-4" />
              <AlertDescription>
                Clinical notes functionality requires live EHR integration. This feature supports:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>SOAP notes creation and editing</li>
                  <li>Progress notes documentation</li>
                  <li>Treatment plan updates</li>
                  <li>Patient encounter summaries</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LabResults({ patientId }: { patientId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Laboratory Results</h3>
        <Button disabled={!patientId}>
          <Plus className="w-4 h-4 mr-2" />
          Order Lab
        </Button>
      </div>

      {!patientId ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Please select a patient to view lab results</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <TestTube className="w-4 h-4" />
              <AlertDescription>
                Laboratory results interface ready for EHR integration. Features include:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>View recent lab results and trends</li>
                  <li>Order new laboratory tests</li>
                  <li>Track pending results</li>
                  <li>Generate reports and summaries</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MedicationManagement({ patientId }: { patientId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Medication Management</h3>
        <Button disabled={!patientId}>
          <Plus className="w-4 h-4 mr-2" />
          Prescribe
        </Button>
      </div>

      {!patientId ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Please select a patient to manage medications</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <Pill className="w-4 h-4" />
              <AlertDescription>
                Medication management system ready for EHR integration. Capabilities include:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>View current medication list</li>
                  <li>Prescribe new medications</li>
                  <li>Modify dosages and instructions</li>
                  <li>Check drug interactions and allergies</li>
                  <li>Track medication adherence</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DiagnosisManagement({ patientId }: { patientId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Diagnosis & Procedures</h3>
        <Button disabled={!patientId}>
          <Plus className="w-4 h-4 mr-2" />
          Add Diagnosis
        </Button>
      </div>

      {!patientId ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Please select a patient to manage diagnoses</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <Stethoscope className="w-4 h-4" />
              <AlertDescription>
                Diagnosis management interface ready for EHR integration. Features include:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Add and modify patient diagnoses</li>
                  <li>ICD-10 code lookup and assignment</li>
                  <li>Document procedure codes</li>
                  <li>Track condition status and progression</li>
                  <li>Generate diagnostic reports</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}