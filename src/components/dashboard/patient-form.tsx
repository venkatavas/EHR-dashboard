'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { Patient } from '@/lib/types/fhir';

interface PatientFormProps {
  patient?: Patient | null;
  onSubmit: (patient: Patient) => Promise<void>;
  isLoading?: boolean;
}

interface ContactInfo {
  id: string;
  system: 'phone' | 'email';
  value: string;
  use?: 'home' | 'work' | 'mobile';
}

interface AddressInfo {
  use?: 'home' | 'work' | 'temp';
  line: string[];
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export function PatientForm({ patient, onSubmit, isLoading = false }: PatientFormProps) {
  const [formData, setFormData] = useState({
    givenName: '',
    familyName: '',
    birthDate: '',
    gender: '' as '' | 'male' | 'female' | 'other' | 'unknown',
  });

  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [address, setAddress] = useState<AddressInfo>({
    line: [''],
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });

  const [allergies, setAllergies] = useState<string[]>(['']);
  const [medications, setMedications] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patient) {
      const name = patient.name?.[0];
      setFormData({
        givenName: name?.given?.join(' ') || '',
        familyName: name?.family || '',
        birthDate: patient.birthDate || '',
        gender: patient.gender || '',
      });

      // Load contacts
      const patientContacts = patient.telecom?.map((telecom: any, index: number) => ({
        id: `contact-${index}`,
        system: (telecom.system === 'email' ? 'email' : 'phone') as 'phone' | 'email',
        value: telecom.value || '',
        use: telecom.use as 'home' | 'work' | 'mobile' | undefined,
      })) || [];
      setContacts(patientContacts.length > 0 ? patientContacts : [{ id: 'contact-0', system: 'phone' as const, value: '' }]);

      // Load address
      const patientAddress = patient.address?.[0];
      if (patientAddress) {
        setAddress({
          use: patientAddress.use as 'home' | 'work' | 'temp' | undefined,
          line: patientAddress.line || [''],
          city: patientAddress.city || '',
          state: patientAddress.state || '',
          postalCode: patientAddress.postalCode || '',
          country: patientAddress.country || 'US',
        });
      }
    } else {
      // Reset form for new patient
      setContacts([{ id: 'contact-0', system: 'phone', value: '' }]);
    }
  }, [patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const patientData: Patient = {
        resourceType: 'Patient',
        id: patient?.id,
        name: [
          {
            use: 'official',
            given: formData.givenName.split(' ').filter(Boolean),
            family: formData.familyName,
          },
        ],
        birthDate: formData.birthDate,
        gender: formData.gender || undefined,
        telecom: contacts
          .filter(contact => contact.value.trim())
          .map(contact => ({
            system: contact.system,
            value: contact.value,
            use: contact.use,
          })),
        address: address.line[0] || address.city ? [
          {
            use: address.use || 'home',
            line: address.line.filter(Boolean),
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },
        ] : undefined,
      };

      await onSubmit(patientData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save patient');
    }
  };

  const addContact = () => {
    setContacts([
      ...contacts,
      { id: `contact-${Date.now()}`, system: 'phone', value: '' },
    ]);
  };

  const removeContact = (id: string) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter(contact => contact.id !== id));
    }
  };

  const updateContact = (id: string, field: keyof ContactInfo, value: string) => {
    setContacts(contacts.map(contact =>
      contact.id === id ? { ...contact, [field]: value } : contact
    ));
  };

  const addAddressLine = () => {
    setAddress({ ...address, line: [...address.line, ''] });
  };

  const updateAddressLine = (index: number, value: string) => {
    const newLines = [...address.line];
    newLines[index] = value;
    setAddress({ ...address, line: newLines });
  };

  const removeAddressLine = (index: number) => {
    if (address.line.length > 1) {
      const newLines = address.line.filter((_, i) => i !== index);
      setAddress({ ...address, line: newLines });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Patient's personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="givenName">Given Name *</Label>
              <Input
                id="givenName"
                value={formData.givenName}
                onChange={(e) => setFormData({ ...formData, givenName: e.target.value })}
                required
                placeholder="John Michael"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyName">Family Name *</Label>
              <Input
                id="familyName"
                value={formData.familyName}
                onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                required
                placeholder="Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date *</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Phone numbers and email addresses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {contacts.map((contact, index) => (
            <div key={contact.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  value={contact.system}
                  onChange={(e) => updateContact(contact.id, 'system', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Use</Label>
                <select
                  value={contact.use || ''}
                  onChange={(e) => updateContact(contact.id, 'use', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select use</option>
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type={contact.system === 'email' ? 'email' : 'tel'}
                  value={contact.value}
                  onChange={(e) => updateContact(contact.id, 'value', e.target.value)}
                  placeholder={contact.system === 'email' ? 'john@example.com' : '+1-555-0123'}
                />
              </div>

              <div className="space-y-2">
                <Label>Action</Label>
                <div className="flex gap-2">
                  {index === contacts.length - 1 && (
                    <Button type="button" variant="outline" onClick={addContact}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                  {contacts.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeContact(contact.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
          <CardDescription>Patient's residential address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Address Lines</Label>
            {address.line.map((line, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={line}
                  onChange={(e) => updateAddressLine(index, e.target.value)}
                  placeholder={index === 0 ? 'Street address' : 'Apartment, suite, etc.'}
                />
                {index === address.line.length - 1 && (
                  <Button type="button" variant="outline" onClick={addAddressLine}>
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
                {address.line.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeAddressLine(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                placeholder="New York"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                placeholder="NY"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                placeholder="10001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={address.country}
              onChange={(e) => setAddress({ ...address, country: e.target.value })}
              placeholder="US"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {patient ? 'Update Patient' : 'Create Patient'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}