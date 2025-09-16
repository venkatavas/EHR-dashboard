'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  FileText,
  DollarSign,
  Activity,
  AlertCircle,
  Settings,
  BarChart3
} from 'lucide-react';
import { useEHR } from '@/lib/context/ehr-context';
import { PatientManagement } from './patient-management';
import { AppointmentManagement } from './appointment-management';
import { ClinicalOperations } from './clinical-operations';
import { BillingAdmin } from './billing-admin';

type TabType = 'overview' | 'patients' | 'appointments' | 'clinical' | 'billing';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { config, disconnect } = useEHR();

  const navigation = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'patients', name: 'Patients', icon: Users },
    { id: 'appointments', name: 'Appointments', icon: Calendar },
    { id: 'clinical', name: 'Clinical', icon: FileText },
    { id: 'billing', name: 'Billing', icon: DollarSign },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'patients':
        return <PatientManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'clinical':
        return <ClinicalOperations />;
      case 'billing':
        return <BillingAdmin />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">EHR Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Connected to {new URL(config?.baseUrl || '').hostname}
          </p>
        </div>

        <nav className="mt-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeTab === item.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={disconnect}
            variant="outline"
            className="w-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome to your EHR Integration Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Results</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              -4% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              2 critical, 1 warning
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Patient Activity</CardTitle>
            <CardDescription>Latest patient interactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">New patient registered</p>
                  <p className="text-sm text-muted-foreground">John Doe - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Appointment completed</p>
                  <p className="text-sm text-muted-foreground">Jane Smith - 1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Lab results available</p>
                  <p className="text-sm text-muted-foreground">Bob Johnson - 30 minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>EHR system health and connectivity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Connection</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Sync</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600">Synced</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Update</span>
                <span className="text-sm text-muted-foreground">2 minutes ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response Time</span>
                <span className="text-sm text-muted-foreground">234ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}