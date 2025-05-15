
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Switch } from '@/components/ui/switch';
import { 
  ArrowDownUp, 
  ArrowUpDown, 
  Code, 
  Edit, 
  Plus, 
  Trash2, 
  Zap 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Condition {
  id: string;
  name: string;
  description?: string;
  device_type?: string;
  reading_type: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'outside';
  threshold?: number;
  min_value?: number;
  max_value?: number;
  actions: ActionReference[];
  enabled: boolean;
  created_at: string;
  last_triggered?: string;
}

interface ActionReference {
  id: string;
  name: string;
  type: string;
}

const conditionSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  device_type: z.string().optional(),
  reading_type: z.string().min(1, 'Reading type is required'),
  operator: z.enum(['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'between', 'outside']),
  threshold: z.number().optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  action_ids: z.array(z.string()).min(1, 'At least one action is required'),
  enabled: z.boolean().default(true),
  condition_code: z.string().optional()
});

export function ConditionalTriggers() {
  const [conditions, setConditions] = useState<Condition[]>([
    {
      id: '1',
      name: 'High Temperature Alert',
      description: 'Trigger when temperature exceeds 80°F',
      reading_type: 'temperature',
      operator: 'gt',
      threshold: 80,
      actions: [
        { id: '1', name: 'Send Email Alert', type: 'notification' },
        { id: '2', name: 'Turn On AC', type: 'device_control' }
      ],
      enabled: true,
      created_at: new Date().toISOString(),
      last_triggered: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString()
    },
    {
      id: '2',
      name: 'Humidity Range Monitor',
      description: 'Trigger when humidity is outside optimal range',
      reading_type: 'humidity',
      operator: 'outside',
      min_value: 30,
      max_value: 60,
      actions: [
        { id: '3', name: 'Adjust Humidifier', type: 'device_control' }
      ],
      enabled: true,
      created_at: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()
    },
    {
      id: '3',
      name: 'Power Consumption Spike',
      description: 'Detect abnormal power usage',
      reading_type: 'power',
      operator: 'gt',
      threshold: 5000,
      actions: [
        { id: '4', name: 'Send SMS Alert', type: 'notification' }
      ],
      enabled: false,
      created_at: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
      last_triggered: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString()
    }
  ]);
  
  const [availableActions, setAvailableActions] = useState([
    { id: '1', name: 'Send Email Alert', type: 'notification' },
    { id: '2', name: 'Turn On AC', type: 'device_control' },
    { id: '3', name: 'Adjust Humidifier', type: 'device_control' },
    { id: '4', name: 'Send SMS Alert', type: 'notification' },
    { id: '5', name: 'Post to Slack', type: 'integration' },
    { id: '6', name: 'Record Event', type: 'endpoint' }
  ]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const form = useForm<z.infer<typeof conditionSchema>>({
    resolver: zodResolver(conditionSchema),
    defaultValues: {
      name: '',
      description: '',
      reading_type: '',
      operator: 'gt',
      action_ids: [],
      enabled: true
    }
  });
  
  const watchOperator = form.watch('operator');
  
  const handleCreateCondition = (data: z.infer<typeof conditionSchema>) => {
    // Validate that we have either threshold or min/max based on operator
    if (['gt', 'lt', 'gte', 'lte', 'eq', 'neq'].includes(data.operator) && data.threshold === undefined) {
      form.setError('threshold', {
        type: 'manual',
        message: 'Threshold is required for this operator'
      });
      return;
    }
    
    if (['between', 'outside'].includes(data.operator) && 
        (data.min_value === undefined || data.max_value === undefined)) {
      form.setError('min_value', {
        type: 'manual',
        message: 'Min and max values are required for this operator'
      });
      return;
    }
    
    const conditionActions = data.action_ids.map(id => 
      availableActions.find(a => a.id === id)!
    );
    
    const newCondition: Condition = {
      id: isEditing || Math.random().toString(),
      name: data.name,
      description: data.description,
      device_type: data.device_type,
      reading_type: data.reading_type,
      operator: data.operator,
      threshold: data.threshold,
      min_value: data.min_value,
      max_value: data.max_value,
      actions: conditionActions,
      enabled: data.enabled,
      created_at: isEditing 
        ? conditions.find(c => c.id === isEditing)?.created_at || new Date().toISOString()
        : new Date().toISOString()
    };
    
    if (isEditing) {
      setConditions(conditions.map(condition => 
        condition.id === isEditing ? newCondition : condition
      ));
      toast.success('Condition updated successfully');
    } else {
      setConditions([...conditions, newCondition]);
      toast.success('Condition created successfully');
    }
    
    resetForm();
  };
  
  const handleEditCondition = (id: string) => {
    const condition = conditions.find(c => c.id === id);
    if (!condition) return;
    
    setIsEditing(id);
    setIsAdding(true);
    
    form.reset({
      name: condition.name,
      description: condition.description,
      device_type: condition.device_type,
      reading_type: condition.reading_type,
      operator: condition.operator,
      threshold: condition.threshold,
      min_value: condition.min_value,
      max_value: condition.max_value,
      action_ids: condition.actions.map(a => a.id),
      enabled: condition.enabled
    });
  };
  
  const handleDeleteCondition = (id: string) => {
    setConditions(conditions.filter(condition => condition.id !== id));
    toast.success('Condition deleted successfully');
  };
  
  const handleToggleCondition = (id: string, enabled: boolean) => {
    setConditions(conditions.map(condition => 
      condition.id === id ? { ...condition, enabled } : condition
    ));
    
    toast.success(`Condition ${enabled ? 'enabled' : 'disabled'}`);
  };
  
  const handleTestCondition = (id: string) => {
    toast.success('Condition test triggered');
    
    // In a real app, we would call an API to test the condition
    setConditions(conditions.map(condition => 
      condition.id === id ? { 
        ...condition, 
        last_triggered: new Date().toISOString() 
      } : condition
    ));
  };
  
  const resetForm = () => {
    setIsAdding(false);
    setIsEditing(null);
    setShowAdvanced(false);
    form.reset();
  };
  
  const getOperatorLabel = (operator: string) => {
    switch (operator) {
      case 'eq': return 'equals (=)';
      case 'neq': return 'not equals (≠)';
      case 'gt': return 'greater than (>)';
      case 'lt': return 'less than (<)';
      case 'gte': return 'greater than or equal (≥)';
      case 'lte': return 'less than or equal (≤)';
      case 'between': return 'between range';
      case 'outside': return 'outside range';
      default: return operator;
    }
  };
  
  const getConditionSummary = (condition: Condition) => {
    switch (condition.operator) {
      case 'eq':
        return `${condition.reading_type} = ${condition.threshold}`;
      case 'neq':
        return `${condition.reading_type} ≠ ${condition.threshold}`;
      case 'gt':
        return `${condition.reading_type} > ${condition.threshold}`;
      case 'lt':
        return `${condition.reading_type} < ${condition.threshold}`;
      case 'gte':
        return `${condition.reading_type} ≥ ${condition.threshold}`;
      case 'lte':
        return `${condition.reading_type} ≤ ${condition.threshold}`;
      case 'between':
        return `${condition.min_value} ≤ ${condition.reading_type} ≤ ${condition.max_value}`;
      case 'outside':
        return `${condition.reading_type} < ${condition.min_value} or > ${condition.max_value}`;
      default:
        return 'Custom condition';
    }
  };
  
  const getOperatorIcon = (operator: string) => {
    switch (operator) {
      case 'eq':
      case 'neq':
        return '=';
      case 'gt':
      case 'gte':
        return '>';
      case 'lt':
      case 'lte':
        return '<';
      case 'between':
        return <ArrowDownUp className="h-4 w-4" />;
      case 'outside':
        return <ArrowUpDown className="h-4 w-4" />;
      default:
        return operator;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Conditional Triggers</h2>
          <p className="text-muted-foreground">
            Create triggers that activate when certain conditions are met
          </p>
        </div>
        
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> New Condition</>}
        </Button>
      </div>
      
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Condition' : 'Create New Condition'}</CardTitle>
            <CardDescription>
              Configure when this trigger will activate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateCondition)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter condition name" {...field} />
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
                      name="enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Condition Enabled
                            </FormLabel>
                            <FormDescription>
                              Enable to activate this trigger
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
                  
                  {/* Condition Configuration */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="device_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Type (Optional)</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Any device type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Any device type</SelectItem>
                              <SelectItem value="thermostat">Thermostat</SelectItem>
                              <SelectItem value="sensor">Sensor</SelectItem>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="plug">Smart Plug</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Limit this condition to specific device types
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="reading_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reading Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reading type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="temperature">Temperature</SelectItem>
                              <SelectItem value="humidity">Humidity</SelectItem>
                              <SelectItem value="pressure">Pressure</SelectItem>
                              <SelectItem value="light">Light Level</SelectItem>
                              <SelectItem value="motion">Motion</SelectItem>
                              <SelectItem value="battery">Battery Level</SelectItem>
                              <SelectItem value="power">Power Usage</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="operator"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition Operator</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select operator" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="eq">equals (=)</SelectItem>
                              <SelectItem value="neq">not equals (≠)</SelectItem>
                              <SelectItem value="gt">greater than (&gt;)</SelectItem>
                              <SelectItem value="lt">less than (&lt;)</SelectItem>
                              <SelectItem value="gte">greater than or equal (≥)</SelectItem>
                              <SelectItem value="lte">less than or equal (≤)</SelectItem>
                              <SelectItem value="between">between range</SelectItem>
                              <SelectItem value="outside">outside range</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {['eq', 'neq', 'gt', 'lt', 'gte', 'lte'].includes(watchOperator) && (
                      <FormField
                        control={form.control}
                        name="threshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Threshold Value</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter threshold value"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {['between', 'outside'].includes(watchOperator) && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="min_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Value</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Min value"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="max_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Value</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Max value"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Actions to Trigger</h3>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      <Code className="mr-2 h-4 w-4" />
                      {showAdvanced ? 'Hide Advanced' : 'Advanced Mode'}
                    </Button>
                  </div>
                  
                  {!showAdvanced ? (
                    <FormField
                      control={form.control}
                      name="action_ids"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {availableActions.map((action) => (
                              <div 
                                key={action.id}
                                className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors ${
                                  field.value.includes(action.id) 
                                    ? 'border-primary bg-primary/5' 
                                    : 'hover:bg-muted/50'
                                }`}
                                onClick={() => {
                                  const newValue = field.value.includes(action.id)
                                    ? field.value.filter(id => id !== action.id)
                                    : [...field.value, action.id];
                                  field.onChange(newValue);
                                }}
                              >
                                <input
                                  type="checkbox"
                                  id={action.id}
                                  checked={field.value.includes(action.id)}
                                  onChange={() => {}}
                                  className="h-4 w-4"
                                />
                                <div className="flex-1">
                                  <label htmlFor={action.id} className="font-medium cursor-pointer">
                                    {action.name}
                                  </label>
                                  <p className="text-xs text-muted-foreground">
                                    {action.type}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <FormDescription>
                            Select one or more actions to trigger when this condition is met
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="condition_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Condition Logic (JavaScript)</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="font-mono text-sm"
                              placeholder={`
// Example: Custom condition using JavaScript
function evaluateCondition(reading) {
  // reading is the current device reading object
  // Example: { type: 'temperature', value: 75, timestamp: '2023-01-01T00:00:00Z' }
  
  // Custom logic here
  if (reading.type === 'temperature' && reading.value > 80) {
    return true;
  }
  
  return false;
}`}
                              rows={10}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Advanced: Write custom JavaScript logic to evaluate conditions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
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
                    {isEditing ? 'Update Condition' : 'Create Condition'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Condition Triggers</CardTitle>
          <CardDescription>
            When these conditions are met, the associated actions will trigger
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Last Triggered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conditions.length > 0 ? (
                conditions.map((condition) => (
                  <TableRow key={condition.id}>
                    <TableCell className="font-medium">
                      <div>
                        {condition.name}
                        {condition.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {condition.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs"
                        >
                          {getConditionSummary(condition)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {condition.actions.map(action => (
                          <Badge key={action.id} variant="outline">
                            {action.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {condition.last_triggered ? (
                        format(new Date(condition.last_triggered), 'MMM d, yyyy h:mm a')
                      ) : (
                        <span className="text-muted-foreground">Never triggered</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={condition.enabled}
                        onCheckedChange={(checked) => handleToggleCondition(condition.id, checked)}
                        aria-label={`Toggle ${condition.name}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCondition(condition.id)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTestCondition(condition.id)}
                          title="Test trigger"
                          disabled={!condition.enabled}
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
                              <AlertDialogTitle>Delete Condition</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this condition trigger? 
                                This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCondition(condition.id)}
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
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No conditions found. Create your first condition to get started.
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
