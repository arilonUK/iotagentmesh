
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { Loader2 } from 'lucide-react';

export function NotificationSettings() {
  const { preferences, preferencesLoading, updatePreferences } = useNotifications();
  const [formState, setFormState] = useState({
    notify_device_alerts: true,
    notify_system_events: true,
    notify_new_devices: true,
    email_notifications: false
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // When preferences load, update the form state
  useEffect(() => {
    if (preferences) {
      setFormState(preferences);
    }
  }, [preferences]);
  
  const handleChange = (field: string) => (checked: boolean) => {
    setFormState(prev => ({
      ...prev,
      [field]: checked
    }));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreferences(formState);
    } finally {
      setIsSaving(false);
    }
  };
  
  const hasChanges = preferences && (
    preferences.notify_device_alerts !== formState.notify_device_alerts ||
    preferences.notify_system_events !== formState.notify_system_events ||
    preferences.notify_new_devices !== formState.notify_new_devices ||
    preferences.email_notifications !== formState.email_notifications
  );
  
  if (preferencesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Configure how you want to be notified</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="device-alerts" className="font-medium">Device Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your devices trigger alarms
              </p>
            </div>
            <Switch 
              id="device-alerts" 
              checked={formState.notify_device_alerts} 
              onCheckedChange={handleChange('notify_device_alerts')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="system-events" className="font-medium">System Events</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about important system events
              </p>
            </div>
            <Switch 
              id="system-events" 
              checked={formState.notify_system_events} 
              onCheckedChange={handleChange('notify_system_events')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="new-devices" className="font-medium">New Devices</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new devices are added
              </p>
            </div>
            <Switch 
              id="new-devices" 
              checked={formState.notify_new_devices} 
              onCheckedChange={handleChange('notify_new_devices')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch 
              id="email-notifications" 
              checked={formState.email_notifications} 
              onCheckedChange={handleChange('email_notifications')} 
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || isSaving} 
          className="ml-auto"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
