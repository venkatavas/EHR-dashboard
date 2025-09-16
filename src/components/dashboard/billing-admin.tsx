'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  CreditCard,
  FileText,
  Search,
  Plus,
  Download,
  TrendingUp,
  Users,
  Clock,
  AlertCircle,
  Shield
} from 'lucide-react';

export function BillingAdmin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'insurance' | 'claims' | 'payments' | 'reports'>('overview');
  const [patientId, setPatientId] = useState('');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'insurance', name: 'Insurance', icon: Shield },
    { id: 'claims', name: 'Claims', icon: FileText },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'reports', name: 'Reports', icon: Download },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <BillingOverview />;
      case 'insurance':
        return <InsuranceManagement patientId={patientId} />;
      case 'claims':
        return <ClaimsManagement patientId={patientId} />;
      case 'payments':
        return <PaymentManagement patientId={patientId} />;
      case 'reports':
        return <BillingReports />;
      default:
        return <BillingOverview />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Billing & Administration</h2>
      </div>

      {/* Patient Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Billing Lookup</CardTitle>
          <CardDescription>Enter a patient ID to view billing and insurance information</CardDescription>
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
              Load Billing
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

function BillingOverview() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Billing Overview</h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              3 require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-muted-foreground">
              Across 89 accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Claims</CardTitle>
            <CardDescription>Latest insurance claim submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Claim #12345 - Approved</p>
                  <p className="text-sm text-muted-foreground">John Doe - $250.00</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Claim #12346 - Pending</p>
                  <p className="text-sm text-muted-foreground">Jane Smith - $180.00</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Payment Received</p>
                  <p className="text-sm text-muted-foreground">Bob Johnson - $300.00</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Insurance Providers</CardTitle>
            <CardDescription>Claims volume by insurance carrier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Blue Cross Blue Shield</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                    <div className="w-3/4 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-600">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Aetna</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                    <div className="w-1/2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-600">50%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cigna</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                    <div className="w-1/3 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-600">33%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          This billing overview shows demo data. Connect to your EHR system to view real billing analytics and financial data.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function InsuranceManagement({ patientId }: { patientId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Insurance Verification</h3>
        <Button disabled={!patientId}>
          <Shield className="w-4 h-4 mr-2" />
          Verify Coverage
        </Button>
      </div>

      {!patientId ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Please select a patient to view insurance information</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <Shield className="w-4 h-4" />
              <AlertDescription>
                Insurance verification system ready for EHR integration. Features include:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Real-time eligibility verification</li>
                  <li>Coverage details and copay amounts</li>
                  <li>Prior authorization tracking</li>
                  <li>Benefits and deductible information</li>
                  <li>Insurance card image storage</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ClaimsManagement({ patientId }: { patientId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Claims Processing</h3>
        <Button disabled={!patientId}>
          <Plus className="w-4 h-4 mr-2" />
          Submit Claim
        </Button>
      </div>

      {!patientId ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Please select a patient to view claims</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <FileText className="w-4 h-4" />
              <AlertDescription>
                Claims management system ready for EHR integration. Capabilities include:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Electronic claim submission (EDI 837)</li>
                  <li>Claim status tracking and follow-up</li>
                  <li>Denial management and resubmission</li>
                  <li>CPT and ICD-10 code validation</li>
                  <li>ERA (Electronic Remittance Advice) processing</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PaymentManagement({ patientId }: { patientId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Payment Processing</h3>
        <Button disabled={!patientId}>
          <CreditCard className="w-4 h-4 mr-2" />
          Process Payment
        </Button>
      </div>

      {!patientId ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Please select a patient to view payment history</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <CreditCard className="w-4 h-4" />
              <AlertDescription>
                Payment management system ready for EHR integration. Features include:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Patient payment processing and receipts</li>
                  <li>Insurance payment posting</li>
                  <li>Payment plan setup and management</li>
                  <li>Account balance tracking</li>
                  <li>Statement generation and sending</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BillingReports() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Financial Reports</h3>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aging Report</CardTitle>
            <CardDescription>Outstanding balances by age</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Summary</CardTitle>
            <CardDescription>Monthly payment analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Insurance Analytics</CardTitle>
            <CardDescription>Payer performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Cycle</CardTitle>
            <CardDescription>End-to-end billing metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Denial Analysis</CardTitle>
            <CardDescription>Claim denial trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Productivity Report</CardTitle>
            <CardDescription>Provider billing performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          Report generation requires live EHR connection to access billing data and generate accurate financial reports.
        </AlertDescription>
      </Alert>
    </div>
  );
}