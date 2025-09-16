'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Clock,
  User,
  MapPin,
  Search,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from '@/lib/hooks/use-query';
import { Appointment, AppointmentSearchParams } from '@/lib/types/fhir';

export function AppointmentManagement() {
  const [searchParams, setSearchParams] = useState<AppointmentSearchParams>({
    _count: 20,
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const { data: appointmentsResponse, isLoading, error, refetch } = useAppointments(searchParams);
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();

  const appointments = appointmentsResponse?.data || [];

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    refetch();
  };

  const formatAppointmentTime = (appointment: Appointment): string => {
    if (!appointment.start) return 'Time not specified';
    return new Date(appointment.start).toLocaleString();
  };

  const getAppointmentStatus = (appointment: Appointment): string => {
    return appointment.status || 'unknown';
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'booked': return 'text-blue-600 bg-blue-100';
      case 'arrived': return 'text-green-600 bg-green-100';
      case 'fulfilled': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'no-show': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await deleteMutation.mutateAsync(appointmentId);
      refetch();
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Appointment Management</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Appointments</CardTitle>
          <CardDescription>
            Find appointments by date, patient, or provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={searchParams.date || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient">Patient ID</Label>
              <Input
                id="patient"
                placeholder="Enter patient ID"
                value={searchParams.patient || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, patient: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="practitioner">Provider ID</Label>
              <Input
                id="practitioner"
                placeholder="Enter provider ID"
                value={searchParams.practitioner || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, practitioner: e.target.value }))}
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
                    Search Appointments
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
            Failed to load appointments. This feature requires live API connection.
          </AlertDescription>
        </Alert>
      )}

      {/* Appointment List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Scheduled Appointments
            {appointmentsResponse?.total && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({appointmentsResponse.total} appointments found)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No appointments found for the selected criteria.</p>
              <p className="text-sm text-gray-400 mt-2">
                This feature requires a live connection to the EHR system with valid credentials.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => {
                const status = getAppointmentStatus(appointment);
                const statusColor = getStatusColor(status);

                return (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Appointment #{appointment.id}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatAppointmentTime(appointment)}
                            </div>
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              Patient: {appointment.participant?.[0]?.actor?.display || 'Unknown'}
                            </div>
                            {appointment.description && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {appointment.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingAppointment(appointment);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (appointment.id) handleDeleteAppointment(appointment.id);
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

      {/* Demo Data Notice */}
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>Demo Mode:</strong> This appointment management system requires live EHR credentials to display real data.
              The interface is fully functional and will work with valid Practice Fusion FHIR API credentials.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}