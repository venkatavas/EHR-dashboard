'use client';

import { useState, useEffect } from 'react';
import { useEHR } from '@/lib/context/ehr-context';
import { EHRConfig } from '@/lib/types/fhir';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Alert, AlertDescription } from './alert';
import { Loader2, CheckCircle, XCircle, Settings } from 'lucide-react';

export function ConnectionSetup() {
  const { connect, disconnect, isConnected, connectionError, config, testConnection, switchToDemo, isDemo } = useEHR();

  const [formConfig, setFormConfig] = useState<EHRConfig>({
    baseUrl: 'https://api.practicefusion.com/fhir/r4',
    clientId: '',
    clientSecret: '',
    accessToken: '',
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(!isConnected);

  useEffect(() => {
    // Try to load saved config from localStorage on mount
    const savedConfig = localStorage.getItem('ehrConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setFormConfig(parsedConfig);
      } catch (error) {
        console.error('Failed to parse saved config:', error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof EHRConfig) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormConfig(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Start OAuth flow for real EHR connection
      const authUrl = `${process.env.NEXT_PUBLIC_EHR_AUTH_URL}?` +
        `client_id=${formConfig.clientId}&` +
        `response_type=code&` +
        `scope=patient/*.read launch/patient&` +
        `redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/auth/callback&` +
        `aud=${formConfig.baseUrl}`;

      // Redirect to EHR OAuth page
      window.location.href = authUrl;

    } catch (error) {
      console.error('Connection failed:', error);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowCredentials(true);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await testConnection();
    } finally {
      setIsTesting(false);
    }
  };

  if (isConnected && !showCredentials) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              {isDemo ? 'Demo Mode Active' : 'Connected to EHR System'}
            </CardTitle>
            <CardDescription>
              {isDemo ? 'Using demo data for testing' : `Successfully connected to ${config?.baseUrl}`}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowCredentials(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={handleTestConnection}
              disabled={isTesting}
              variant="outline"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            <Button onClick={handleDisconnect} variant="destructive">
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          EHR System Configuration
        </CardTitle>
        <CardDescription>
          Enter your EHR system credentials to connect and start managing health records.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionError && (
          <Alert variant="destructive">
            <XCircle className="w-4 h-4" />
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              type="url"
              placeholder="https://api.practicefusion.com/fhir/r4"
              value={formConfig.baseUrl}
              onChange={handleInputChange('baseUrl')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              type="text"
              placeholder="Enter your client ID"
              value={formConfig.clientId}
              onChange={handleInputChange('clientId')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientSecret">Client Secret</Label>
            <Input
              id="clientSecret"
              type="password"
              placeholder="Enter your client secret"
              value={formConfig.clientSecret}
              onChange={handleInputChange('clientSecret')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken">Access Token (Optional)</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="Enter your access token if available"
              value={formConfig.accessToken}
              onChange={handleInputChange('accessToken')}
            />
            <p className="text-sm text-gray-600">
              Leave empty if using OAuth2 flow with client credentials
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleConnect}
            disabled={isConnecting || !formConfig.baseUrl || !formConfig.clientId}
            className="flex-1"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect to EHR'
            )}
          </Button>

          <Button
            onClick={switchToDemo}
            variant="secondary"
            className="flex-1"
          >
            Try Demo Mode
          </Button>

          {isConnected && (
            <Button
              onClick={() => setShowCredentials(false)}
              variant="outline"
            >
              Cancel
            </Button>
          )}
        </div>

        <Alert>
          <AlertDescription>
            <strong>Quick Start:</strong> Click "Try Demo Mode" to explore the dashboard with sample healthcare data, or enter your Practice Fusion FHIR API credentials above to connect to real data.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}