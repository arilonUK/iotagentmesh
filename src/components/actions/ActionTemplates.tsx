
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { 
  BookCopy,
  Copy, 
  Edit, 
  FileCode, 
  MoreHorizontal, 
  Plus, 
  Tags, 
  Trash2, 
  Zap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ActionTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'device_control' | 'notification' | 'integration' | 'webhook' | 'email';
  template_data: Record<string, unknown>;
  tags: string[];
  usage_count: number;
  created_at: string;
  updated_at: string;
}

const actionTemplateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['device_control', 'notification', 'integration', 'webhook', 'email']),
  template_data: z.string().min(2, 'Template data is required'),
  tags: z.string().optional()
});

export function ActionTemplates() {
  const [templates, setTemplates] = useState<ActionTemplate[]>([
    {
      id: '1',
      name: 'Critical Alert Email',
      description: 'Send a critical alert notification via email',
      type: 'email',
      template_data: {
        subject: 'CRITICAL ALERT: {{alert_title}}',
        body: `<h1>Critical Alert: {{alert_title}}</h1>
<p>Device: {{device_name}}</p>
<p>Time: {{timestamp}}</p>
<p>Value: {{value}} {{unit}}</p>
<p>Please check your device immediately.</p>`,
        recipients_var: 'alert_emails'
      },
      tags: ['alert', 'email', 'critical'],
      usage_count: 24,
      created_at: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
      updated_at: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString()
    },
    {
      id: '2',
      name: 'Toggle All Lights',
      description: 'Turn all lights on or off in a device group',
      type: 'device_control',
      template_data: {
        command: '{{action}}', // on or off
        target_type: 'group',
        target_var: 'group_id',
        parameters: {
          brightness: '{{brightness}}',
          transition: 2
        }
      },
      tags: ['lights', 'control', 'automation'],
      usage_count: 56,
      created_at: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(),
      updated_at: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString()
    },
    {
      id: '3',
      name: 'Slack Notification',
      description: 'Post a message to a Slack channel',
      type: 'integration',
      template_data: {
        service: 'slack',
        action: 'post_message',
        channel: '{{channel}}',
        message: '{{message}}',
        attachments: [
          {
            title: '{{title}}',
            text: '{{details}}',
            color: '{{color}}'
          }
        ]
      },
      tags: ['slack', 'notification', 'integration'],
      usage_count: 18,
      created_at: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Data Webhook',
      description: 'Send device data to external API',
      type: 'webhook',
      template_data: {
        url: '{{webhook_url}}',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {{api_key}}'
        },
        body: {
          device_id: '{{device_id}}',
          readings: '{{readings}}',
          timestamp: '{{timestamp}}'
        }
      },
      tags: ['webhook', 'integration', 'data'],
      usage_count: 42,
      created_at: new Date(new Date().setMonth(new Date().getMonth() - 4)).toISOString(),
      updated_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString()
    }
  ]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof actionTemplateSchema>>({
    resolver: zodResolver(actionTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'device_control',
      template_data: '',
      tags: ''
    }
  });
  
  const watchType = form.watch('type');
  
  const handleCreateTemplate = (data: z.infer<typeof actionTemplateSchema>) => {
    let templateData: Record<string, unknown>;
    try {
      templateData = JSON.parse(data.template_data);
    } catch (error) {
      form.setError('template_data', {
        type: 'manual',
        message: 'Invalid JSON format'
      });
      return;
    }
    
    const tags = data.tags 
      ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) 
      : [];
    
    const newTemplate: ActionTemplate = {
      id: isEditing || Math.random().toString(),
      name: data.name,
      description: data.description,
      type: data.type,
      template_data: templateData,
      tags,
      usage_count: isEditing 
        ? templates.find(t => t.id === isEditing)?.usage_count || 0
        : 0,
      created_at: isEditing 
        ? templates.find(t => t.id === isEditing)?.created_at || new Date().toISOString()
        : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (isEditing) {
      setTemplates(templates.map(template => 
        template.id === isEditing ? newTemplate : template
      ));
      toast.success('Template updated successfully');
    } else {
      setTemplates([...templates, newTemplate]);
      toast.success('Template created successfully');
    }
    
    resetForm();
  };
  
  const handleEditTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;
    
    setIsEditing(id);
    setIsAdding(true);
    
    form.reset({
      name: template.name,
      description: template.description,
      type: template.type,
      template_data: JSON.stringify(template.template_data, null, 2),
      tags: template.tags.join(', ')
    });
  };
  
  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
    toast.success('Template deleted successfully');
  };
  
  const handleDuplicateTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;
    
    const newTemplate: ActionTemplate = {
      ...template,
      id: Math.random().toString(),
      name: `${template.name} (Copy)`,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setTemplates([...templates, newTemplate]);
    toast.success('Template duplicated successfully');
  };
  
  const handleUseTemplate = (id: string) => {
    // In a real app, we would redirect to action creation with this template
    toast.success('Template selected for use');
    
    // Update usage count
    setTemplates(templates.map(template => 
      template.id === id ? { 
        ...template, 
        usage_count: template.usage_count + 1,
        updated_at: new Date().toISOString()
      } : template
    ));
  };
  
  const resetForm = () => {
    setIsAdding(false);
    setIsEditing(null);
    form.reset();
  };
  
  const getTemplateExample = (type: string) => {
    switch (type) {
      case 'device_control':
        return JSON.stringify({
          command: '{{action}}',
          target_type: 'device',
          target_var: 'device_id',
          parameters: {
            value: '{{value}}',
            mode: '{{mode}}'
          }
        }, null, 2);
      case 'notification':
        return JSON.stringify({
          title: '{{title}}',
          message: '{{message}}',
          priority: '{{priority}}',
          recipients: ['{{recipient}}']
        }, null, 2);
      case 'integration':
        return JSON.stringify({
          service: '{{service_name}}',
          action: '{{action_name}}',
          parameters: {
            param1: '{{value1}}',
            param2: '{{value2}}'
          }
        }, null, 2);
      case 'webhook':
        return JSON.stringify({
          url: '{{webhook_url}}',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {{api_key}}'
          },
          body: {
            event: '{{event_name}}',
            data: '{{event_data}}'
          }
        }, null, 2);
      case 'email':
        return JSON.stringify({
          subject: '{{subject}}',
          body: '{{body}}',
          recipients_var: 'email_list',
          include_attachment: '{{include_attachment}}'
        }, null, 2);
      default:
        return '{}';
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'device_control':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'notification':
        return <BookCopy className="h-4 w-4 text-blue-500" />;
      case 'integration':
        return <FileCode className="h-4 w-4 text-green-500" />;
      case 'webhook':
        return <FileCode className="h-4 w-4 text-purple-500" />;
      case 'email':
        return <BookCopy className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'device_control':
        return 'Device Control';
      case 'notification':
        return 'Notification';
      case 'integration':
        return 'Integration';
      case 'webhook':
        return 'Webhook';
      case 'email':
        return 'Email';
      default:
        return type;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Action Templates</h2>
          <p className="text-muted-foreground">
            Create and manage reusable action templates
          </p>
        </div>
        
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> New Template</>}
        </Button>
      </div>
      
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Template' : 'Create New Template'}</CardTitle>
            <CardDescription>
              Configure a reusable template for your actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateTemplate)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter template name" {...field} />
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
                          <FormLabel>Template Type</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              
                              // Set example template data when type changes
                              const currentData = form.getValues('template_data');
                              if (!currentData || currentData === '{}') {
                                form.setValue('template_data', getTemplateExample(value));
                              }
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select template type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="device_control">Device Control</SelectItem>
                              <SelectItem value="notification">Notification</SelectItem>
                              <SelectItem value="integration">Integration</SelectItem>
                              <SelectItem value="webhook">Webhook</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter tags separated by commas" {...field} />
                          </FormControl>
                          <FormDescription>
                            e.g., alert, email, notifications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="template_data"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Data (JSON)</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="min-h-[240px] font-mono text-sm"
                              placeholder="{}"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Use placeholders like <code>{'{{variable_name}}'}</code> for dynamic values.
                            <Button 
                              type="button" 
                              variant="link" 
                              className="p-0 h-auto text-xs"
                              onClick={() => form.setValue('template_data', getTemplateExample(watchType))}
                            >
                              Load example template
                            </Button>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                    {isEditing ? 'Update Template' : 'Create Template'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
          <CardDescription>
            Reusable templates for common actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length > 0 ? (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      <div>
                        {template.name}
                        {template.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {getTypeIcon(template.type)}
                        <span>{getTypeLabel(template.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {template.usage_count} {template.usage_count === 1 ? 'use' : 'uses'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {format(new Date(template.updated_at), 'MMM d, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUseTemplate(template.id)}>
                            <Zap className="mr-2 h-4 w-4" />
                            Use Template
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTemplate(template.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateTemplate(template.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No templates found. Create your first template to get started.
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
