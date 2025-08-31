
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { 
  CalendarDays, 
  CalendarIcon, 
  Clock, 
  Copy, 
  Edit, 
  MoreHorizontal, 
  Repeat, 
  Trash2, 
  Zap 
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';

type ActionType = 'device_control' | 'notification' | 'integration' | 'endpoint';
type TriggerType = 'scheduled' | 'recurring' | 'condition';
type RecurrencePattern = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';

interface ScheduledAction {
  id: string;
  name: string;
  description?: string;
  type: ActionType;
  trigger_type: TriggerType;
  recurrence_pattern?: RecurrencePattern;
  cron_expression?: string;
  target: {
    type: string;
    id: string;
    name: string;
  };
  action_payload: Record<string, unknown>;
  next_execution: string | null;
  last_execution?: string;
  enabled: boolean;
  created_at: string;
}

const scheduledActionSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['device_control', 'notification', 'integration', 'endpoint']),
  trigger_type: z.enum(['scheduled', 'recurring', 'condition']),
  recurrence_pattern: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'custom']).optional(),
  cron_expression: z.string().optional(),
  target_type: z.string().min(1, 'Target type is required'),
  target_id: z.string().min(1, 'Target is required'),
  action_payload: z.string().min(2, 'Action payload is required'),
  execution_date: z.date().optional(),
  execution_time: z.string().optional(),
  enabled: z.boolean().default(true)
});

export function ActionScheduler() {
  const [scheduledActions, setScheduledActions] = useState<ScheduledAction[]>([
    {
      id: '1',
      name: 'Turn on all lights',
      description: 'Turn on all lights in the living room at sunset',
      type: 'device_control',
      trigger_type: 'scheduled',
      target: {
        type: 'device_group',
        id: 'group1',
        name: 'Living Room Lights'
      },
      action_payload: {
        command: 'turn_on',
        brightness: 80
      },
      next_execution: new Date(new Date().setHours(new Date().getHours() + 2)).toISOString(),
      last_execution: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
      enabled: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Daily temperature report',
      description: 'Send a daily email with temperature readings',
      type: 'notification',
      trigger_type: 'recurring',
      recurrence_pattern: 'daily',
      cron_expression: '0 9 * * *',
      target: {
        type: 'endpoint',
        id: 'endpoint1',
        name: 'Email Notifications'
      },
      action_payload: {
        template: 'daily_temperature',
        recipients: ['user@example.com']
      },
      next_execution: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
      last_execution: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
      enabled: true,
      created_at: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
    },
    {
      id: '3',
      name: 'Low battery alert',
      description: 'Send notification when device battery is low',
      type: 'endpoint',
      trigger_type: 'condition',
      target: {
        type: 'endpoint',
        id: 'endpoint2',
        name: 'SMS Notifications'
      },
      action_payload: {
        message: 'Device {device_name} has low battery ({value}%)',
        condition: {
          property: 'battery',
          operator: 'lt',
          value: 20
        }
      },
      next_execution: null,
      enabled: true,
      created_at: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString()
    }
  ]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof scheduledActionSchema>>({
    resolver: zodResolver(scheduledActionSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'device_control',
      trigger_type: 'scheduled',
      target_type: '',
      target_id: '',
      action_payload: '{}',
      enabled: true
    }
  });
  
  const watchTriggerType = form.watch('trigger_type');
  const watchType = form.watch('type');
  
  const handleCreateAction = (data: z.infer<typeof scheduledActionSchema>) => {
    let nextExecution: string | null = null;
    
    if (data.trigger_type === 'scheduled' && data.execution_date) {
      const date = new Date(data.execution_date);
      if (data.execution_time) {
        const [hours, minutes] = data.execution_time.split(':').map(Number);
        date.setHours(hours, minutes);
      }
      nextExecution = date.toISOString();
    } else if (data.trigger_type === 'recurring') {
      // In a real app, we would calculate the next execution based on the recurrence pattern
      nextExecution = new Date(new Date().setHours(new Date().getHours() + 24)).toISOString();
    }
    
    const newAction: ScheduledAction = {
      id: isEditing || Math.random().toString(),
      name: data.name,
      description: data.description,
      type: data.type,
      trigger_type: data.trigger_type,
      recurrence_pattern: data.recurrence_pattern,
      cron_expression: data.cron_expression,
      target: {
        type: data.target_type,
        id: data.target_id,
        name: getTargetName(data.target_type, data.target_id)
      },
      action_payload: JSON.parse(data.action_payload),
      next_execution: nextExecution,
      enabled: data.enabled,
      created_at: isEditing 
        ? scheduledActions.find(a => a.id === isEditing)?.created_at || new Date().toISOString()
        : new Date().toISOString()
    };
    
    if (isEditing) {
      setScheduledActions(scheduledActions.map(action => 
        action.id === isEditing ? newAction : action
      ));
      toast.success('Action updated successfully');
    } else {
      setScheduledActions([...scheduledActions, newAction]);
      toast.success('Action created successfully');
    }
    
    resetForm();
  };
  
  const handleEditAction = (id: string) => {
    const action = scheduledActions.find(a => a.id === id);
    if (!action) return;
    
    setIsEditing(id);
    setIsAdding(true);
    
    form.reset({
      name: action.name,
      description: action.description,
      type: action.type,
      trigger_type: action.trigger_type,
      recurrence_pattern: action.recurrence_pattern,
      cron_expression: action.cron_expression,
      target_type: action.target.type,
      target_id: action.target.id,
      action_payload: JSON.stringify(action.action_payload, null, 2),
      execution_date: action.next_execution ? new Date(action.next_execution) : undefined,
      execution_time: action.next_execution 
        ? format(new Date(action.next_execution), 'HH:mm') 
        : undefined,
      enabled: action.enabled
    });
  };
  
  const handleDeleteAction = (id: string) => {
    setScheduledActions(scheduledActions.filter(action => action.id !== id));
    toast.success('Action deleted successfully');
  };
  
  const handleToggleAction = (id: string, enabled: boolean) => {
    setScheduledActions(scheduledActions.map(action => 
      action.id === id ? { ...action, enabled } : action
    ));
    
    toast.success(`Action ${enabled ? 'enabled' : 'disabled'}`);
  };
  
  const handleExecuteNow = (id: string) => {
    toast.success('Action triggered for immediate execution');
    
    // In a real app, we would call an API to execute the action immediately
    // For now, we'll just update the last_execution timestamp
    setScheduledActions(scheduledActions.map(action => 
      action.id === id ? { 
        ...action, 
        last_execution: new Date().toISOString() 
      } : action
    ));
  };
  
  const handleDuplicateAction = (id: string) => {
    const action = scheduledActions.find(a => a.id === id);
    if (!action) return;
    
    const newAction: ScheduledAction = {
      ...action,
      id: Math.random().toString(),
      name: `${action.name} (Copy)`,
      created_at: new Date().toISOString()
    };
    
    setScheduledActions([...scheduledActions, newAction]);
    toast.success('Action duplicated successfully');
  };
  
  const resetForm = () => {
    setIsAdding(false);
    setIsEditing(null);
    form.reset();
  };
  
  // Helper function to get target names for the UI
  const getTargetName = (type: string, id: string) => {
    // In a real app, we would fetch the name from a database or API
    // For now, we'll just use a predefined mapping
    const targetMap: Record<string, Record<string, string>> = {
      'device': {
        'device1': 'Living Room Thermostat',
        'device2': 'Kitchen Lights'
      },
      'device_group': {
        'group1': 'Living Room Lights',
        'group2': 'Smart Plugs'
      },
      'endpoint': {
        'endpoint1': 'Email Notifications',
        'endpoint2': 'SMS Notifications',
        'endpoint3': 'Webhook Integration'
      }
    };
    
    return targetMap[type]?.[id] || 'Unknown target';
  };
  
  const getActionTypeIcon = (type: ActionType) => {
    switch (type) {
      case 'device_control':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'notification':
        return <CalendarDays className="h-4 w-4 text-blue-500" />;
      case 'integration':
        return <Repeat className="h-4 w-4 text-green-500" />;
      case 'endpoint':
        return <Clock className="h-4 w-4 text-purple-500" />;
    }
  };
  
  const getTargetOptions = (type: ActionType) => {
    switch (type) {
      case 'device_control':
        return (
          <>
            <SelectItem value="device">Device</SelectItem>
            <SelectItem value="device_group">Device Group</SelectItem>
          </>
        );
      case 'notification':
        return (
          <>
            <SelectItem value="endpoint">Notification Endpoint</SelectItem>
            <SelectItem value="device">Device</SelectItem>
          </>
        );
      case 'integration':
        return (
          <>
            <SelectItem value="integration">Service Integration</SelectItem>
          </>
        );
      case 'endpoint':
        return (
          <>
            <SelectItem value="endpoint">Endpoint</SelectItem>
          </>
        );
      default:
        return null;
    }
  };
  
  const getTargetIdOptions = (type: string) => {
    switch (type) {
      case 'device':
        return (
          <>
            <SelectItem value="device1">Living Room Thermostat</SelectItem>
            <SelectItem value="device2">Kitchen Lights</SelectItem>
          </>
        );
      case 'device_group':
        return (
          <>
            <SelectItem value="group1">Living Room Lights</SelectItem>
            <SelectItem value="group2">Smart Plugs</SelectItem>
          </>
        );
      case 'endpoint':
        return (
          <>
            <SelectItem value="endpoint1">Email Notifications</SelectItem>
            <SelectItem value="endpoint2">SMS Notifications</SelectItem>
            <SelectItem value="endpoint3">Webhook Integration</SelectItem>
          </>
        );
      case 'integration':
        return (
          <>
            <SelectItem value="integration1">Google Calendar</SelectItem>
            <SelectItem value="integration2">Spotify</SelectItem>
          </>
        );
      default:
        return null;
    }
  };
  
  const getActionPayloadTemplate = (type: ActionType, targetType: string) => {
    switch (type) {
      case 'device_control':
        return JSON.stringify({
          command: 'turn_on',
          parameters: {
            brightness: 80,
            color: '#ffffff'
          }
        }, null, 2);
      case 'notification':
        return JSON.stringify({
          subject: 'Notification Title',
          message: 'Notification message with {variable} placeholder',
          recipients: ['user@example.com']
        }, null, 2);
      case 'integration':
        return JSON.stringify({
          action: 'create_event',
          parameters: {
            title: 'Event Title',
            description: 'Event description',
            start_time: '2023-01-01T10:00:00Z'
          }
        }, null, 2);
      case 'endpoint':
        return JSON.stringify({
          method: 'POST',
          payload: {
            key: 'value'
          }
        }, null, 2);
      default:
        return '{}';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Action Scheduler</h2>
          <p className="text-muted-foreground">
            Schedule device actions, notifications, and integrations
          </p>
        </div>
        
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ New Scheduled Action'}
        </Button>
      </div>
      
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Scheduled Action' : 'Create New Scheduled Action'}</CardTitle>
            <CardDescription>
              Configure when and how your action should be executed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateAction)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Action Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter action name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Action Type</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue('target_type', '');
                              form.setValue('target_id', '');
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select action type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="device_control">Device Control</SelectItem>
                              <SelectItem value="notification">Notification</SelectItem>
                              <SelectItem value="integration">External Integration</SelectItem>
                              <SelectItem value="endpoint">Endpoint Trigger</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Action Enabled
                            </FormLabel>
                            <FormDescription>
                              Disable to create but not activate this action
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Trigger Configuration */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="trigger_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trigger Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select trigger type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="scheduled">One-Time Schedule</SelectItem>
                              <SelectItem value="recurring">Recurring Schedule</SelectItem>
                              <SelectItem value="condition">Condition-Based</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {watchTriggerType === 'scheduled' && (
                      <>
                        <FormField
                          control={form.control}
                          name="execution_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Execution Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="execution_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Execution Time</FormLabel>
                              <FormControl>
                                <Input 
                                  type="time" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    
                    {watchTriggerType === 'recurring' && (
                      <>
                        <FormField
                          control={form.control}
                          name="recurrence_pattern"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recurrence Pattern</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select pattern" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="hourly">Hourly</SelectItem>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="custom">Custom (Cron)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {form.watch('recurrence_pattern') === 'custom' && (
                          <FormField
                            control={form.control}
                            name="cron_expression"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cron Expression</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="0 9 * * *" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  <a 
                                    href="https://crontab.guru/" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-primary underline"
                                  >
                                    Cron expression reference
                                  </a>
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">Action Configuration</h3>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="target_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Type</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue('target_id', '');
                              
                              if (form.getValues('action_payload') === '{}') {
                                form.setValue(
                                  'action_payload', 
                                  getActionPayloadTemplate(form.getValues('type') as ActionType, value)
                                );
                              }
                            }} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select target type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getTargetOptions(watchType as ActionType)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="target_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={!form.getValues('target_type')}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select target" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getTargetIdOptions(form.getValues('target_type'))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="action_payload"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action Payload (JSON)</FormLabel>
                        <FormControl>
                          <textarea 
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                            placeholder="{}" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the JSON payload for this action
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditing ? 'Update Action' : 'Create Action'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Actions</CardTitle>
          <CardDescription>
            View and manage your automated actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Next Execution</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledActions.length > 0 ? (
                scheduledActions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="font-medium">
                      <div>
                        {action.name}
                        {action.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {action.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {getActionTypeIcon(action.type)}
                        <span className="capitalize">
                          {action.type.replace('_', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {action.trigger_type === 'scheduled' ? (
                        <Badge variant="outline" className="bg-blue-50">
                          One-time
                        </Badge>
                      ) : action.trigger_type === 'recurring' ? (
                        <Badge variant="outline" className="bg-green-50">
                          {action.recurrence_pattern || 'Recurring'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50">
                          Condition
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm capitalize">
                          {action.target.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {action.next_execution ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {isAfter(new Date(action.next_execution), new Date()) ? (
                            <span className="text-sm">
                              {formatDistanceToNow(new Date(action.next_execution), { 
                                addSuffix: true 
                              })}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Execution due
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {action.trigger_type === 'condition' ? 'When triggered' : 'Not scheduled'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={action.enabled}
                        onCheckedChange={(checked) => handleToggleAction(action.id, checked)}
                        aria-label={`Toggle ${action.name}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditAction(action.id)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicateAction(action.id)}
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExecuteNow(action.id)}
                          title="Execute now"
                          disabled={!action.enabled}
                        >
                          <Zap className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Action</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this scheduled action? 
                                This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAction(action.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No scheduled actions found. Create your first action to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
