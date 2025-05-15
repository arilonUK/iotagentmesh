import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CalendarClock } from 'lucide-react';

interface DataRetentionSettingsProps {
  bucketId: string;
  initialRetentionDays: number;
  onSave: (retentionDays: number) => Promise<void>;
}

export function DataRetentionSettings({
  bucketId,
  initialRetentionDays,
  onSave
}: DataRetentionSettingsProps) {
  const [retentionDays, setRetentionDays] = React.useState(initialRetentionDays);
  const [presetValue, setPresetValue] = React.useState<string>('custom');
  const [isSaving, setIsSaving] = React.useState(false);

  // Set preset based on initial value
  React.useEffect(() => {
    if (initialRetentionDays === 7) setPresetValue('1-week');
    else if (initialRetentionDays === 30) setPresetValue('1-month');
    else if (initialRetentionDays === 90) setPresetValue('3-months');
    else if (initialRetentionDays === 365) setPresetValue('1-year');
    else setPresetValue('custom');
  }, [initialRetentionDays]);

  const handlePresetChange = (value: string) => {
    setPresetValue(value);
    
    switch (value) {
      case '1-week':
        setRetentionDays(7);
        break;
      case '1-month':
        setRetentionDays(30);
        break;
      case '3-months':
        setRetentionDays(90);
        break;
      case '1-year':
        setRetentionDays(365);
        break;
      case 'custom':
        // Keep current value
        break;
      default:
        break;
    }
  };

  const handleSliderChange = (value: number[]) => {
    setRetentionDays(value[0]);
    setPresetValue('custom');
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(retentionDays);
      toast.success('Data retention settings updated successfully');
    } catch (error) {
      console.error('Error updating retention settings:', error);
      toast.error('Failed to update data retention settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarClock className="mr-2 h-5 w-5" />
          Data Retention Settings
        </CardTitle>
        <CardDescription>
          Configure how long your data is stored before automatic deletion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="preset">Retention period preset</Label>
          <Select value={presetValue} onValueChange={handlePresetChange}>
            <SelectTrigger id="preset">
              <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-week">1 Week</SelectItem>
              <SelectItem value="1-month">1 Month</SelectItem>
              <SelectItem value="3-months">3 Months</SelectItem>
              <SelectItem value="1-year">1 Year</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <Label htmlFor="retention-days">Custom retention period (days)</Label>
            <span className="text-sm font-medium">{retentionDays} days</span>
          </div>
          <Slider
            id="retention-days"
            value={[retentionDays]}
            min={1}
            max={730}
            step={1}
            onValueChange={handleSliderChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 day</span>
            <span>2 years (730 days)</span>
          </div>
        </div>

        <div className="rounded-md bg-muted p-3">
          <p className="text-sm">
            Data older than <span className="font-semibold">{retentionDays} days</span> will be automatically deleted.
            This helps manage storage costs and comply with data minimization best practices.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
}
