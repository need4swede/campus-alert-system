
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from "@/components/ui/sonner";
import { AppConfig } from '@/types';

const Settings = () => {
  // In a real app, these would be loaded from a database or API
  const [config, setConfig] = useState<AppConfig>({
    evacuationLocation: 'Main Parking Lot',
    shelterHazardType: 'Tornado',
    serverUrl: 'https://ntfy.example.com',
    topicConfig: {
      hold: 'school-hold',
      secure: 'school-secure',
      lockdown: 'school-lockdown',
      evacuate: 'school-evacuate',
      shelter: 'school-shelter',
    },
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof AppConfig
  ) => {
    setConfig({
      ...config,
      [field]: e.target.value,
    });
  };

  const handleTopicChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    alertType: string
  ) => {
    setConfig({
      ...config,
      topicConfig: {
        ...config.topicConfig,
        [alertType]: e.target.value,
      },
    });
  };

  const handleSaveConfig = () => {
    // In a real app, this would save to an API or database
    localStorage.setItem('appConfig', JSON.stringify(config));
    toast.success('Settings saved successfully');
  };

  const handleTestConnection = () => {
    setIsTestingConnection(true);
    // Simulate API call
    setTimeout(() => {
      setIsTestingConnection(false);
      toast.success('Server connection successful');
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">System Settings</h1>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Configuration</CardTitle>
              <CardDescription>
                Configure the basic settings for the emergency response system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="evacLocation">Evacuation Location</Label>
                  <Input
                    id="evacLocation"
                    value={config.evacuationLocation}
                    onChange={(e) => handleChange(e, 'evacuationLocation')}
                    placeholder="e.g., Main Parking Lot"
                  />
                  <p className="text-sm text-muted-foreground">
                    The location where people should evacuate to during an emergency.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shelterHazard">Shelter Hazard Type</Label>
                  <Input
                    id="shelterHazard"
                    value={config.shelterHazardType}
                    onChange={(e) => handleChange(e, 'shelterHazardType')}
                    placeholder="e.g., Tornado"
                  />
                  <p className="text-sm text-muted-foreground">
                    The primary hazard type for shelter alerts.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveConfig}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Notification Server</CardTitle>
              <CardDescription>
                Configure the notification server for sending alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serverUrl">Notification Server URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="serverUrl"
                    value={config.serverUrl}
                    onChange={(e) => handleChange(e, 'serverUrl')}
                    placeholder="https://ntfy.example.com"
                  />
                  <Button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                  >
                    {isTestingConnection ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  The URL of the ntfy server or other notification service.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveConfig}>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Topic Configuration</CardTitle>
              <CardDescription>
                Configure the notification topics for each alert type.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(config.topicConfig).map(([alertType, topic]) => (
                  <div key={alertType} className="space-y-2">
                    <Label htmlFor={`topic-${alertType}`} className="capitalize">
                      {alertType} Topic
                    </Label>
                    <Input
                      id={`topic-${alertType}`}
                      value={topic}
                      onChange={(e) => handleTopicChange(e, alertType)}
                      placeholder={`school-${alertType}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveConfig}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users and their roles in the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-4">
                User management will be implemented with Microsoft OAuth integration.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
