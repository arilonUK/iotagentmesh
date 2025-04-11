import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { EndpointFormData, EndpointType } from '@/types/endpoint';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Form schema with validation
const endpointFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().optional(),
  type: z.enum(['email', 'telegram', 'webhook', 'device_action', 'ifttt', 'whatsapp']),
  enabled: z.boolean().default(true),
  configuration: z.record(z.any())
});

type EndpointFormProps = {
  initialData?: Partial<EndpointFormData>;
  onSubmit: (data: EndpointFormData) => void;
  isSubmitting?: boolean;
};

export default function EndpointForm({ initialData, onSubmit, isSubmitting = false }: EndpointFormProps) {
  const [selectedType, setSelectedType] = useState<EndpointType>(
    initialData?.type || 'webhook'
  );

  // Initialize form with defaults or initial data
  const form = useForm<EndpointFormData>({
    resolver: zodResolver(endpointFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      type: initialData?.type || 'webhook',
      enabled: initialData?.enabled !== undefined ? initialData.enabled : true,
      configuration: initialData?.configuration || {},
    },
  });

  // Handle form submission
  const handleSubmit = (data: EndpointFormData) => {
    onSubmit(data);
  };

  // Handle endpoint type change
  const handleTypeChange = (type: EndpointType) => {
    setSelectedType(type);
    form.setValue('type', type);
    
    // Reset configuration when type changes
    form.setValue('configuration', {});
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Endpoint Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter endpoint name" {...field} />
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
                      <Textarea placeholder="Describe what this endpoint does" {...field} />
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
                    <FormLabel>Endpoint Type</FormLabel>
                    <Select
                      onValueChange={(value) => handleTypeChange(value as EndpointType)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select endpoint type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                        <SelectItem value="webhook">Webhook / REST API</SelectItem>
                        <SelectItem value="device_action">Device Action</SelectItem>
                        <SelectItem value="ifttt">IFTTT</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
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
                      <FormLabel className="text-base">Enabled</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        When disabled, this endpoint won't be triggered
                      </div>
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

            {/* Type-specific configuration */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-sm">Endpoint Configuration</h3>

              {selectedType === 'email' && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="configuration.to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipients (comma-separated)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="email@example.com, otheremail@example.com" 
                            value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                            onChange={(e) => {
                              const emails = e.target.value.split(',').map(email => email.trim());
                              field.onChange(emails);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="configuration.subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Alert from IoT Device" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="configuration.body_template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Body Template</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Device {{device_name}} reported value: {{value}}" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {selectedType === 'telegram' && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="configuration.bot_token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bot Token</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789:ABCDEF..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="configuration.chat_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chat ID</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="configuration.message_template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message Template</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="🚨 Alert from device {{device_name}}: {{value}}" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {selectedType === 'webhook' && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="configuration.url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Webhook URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/api/webhook" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="configuration.method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HTTP Method</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || 'POST'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select HTTP method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="configuration.headers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headers (JSON)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={'{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer token"\n}'}
                            className="min-h-[100px] font-mono"
                            value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value || ''}
                            onChange={(e) => {
                              try {
                                const headers = e.target.value ? JSON.parse(e.target.value) : {};
                                field.onChange(headers);
                              } catch {
                                field.onChange(e.target.value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="configuration.body_template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Template (JSON)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={'{\n  "device": "{{device_id}}",\n  "value": {{value}},\n  "timestamp": "{{timestamp}}"\n}'}
                            className="min-h-[100px] font-mono"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {selectedType === 'device_action' && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="configuration.target_device_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Device ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Device ID to control" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="configuration.action"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action</FormLabel>
                        <FormControl>
                          <Input placeholder="toggle_switch" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="configuration.parameters"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parameters (JSON)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={'{\n  "value": true\n}'}
                            className="min-h-[100px] font-mono"
                            value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value || ''}
                            onChange={(e) => {
                              try {
                                const params = e.target.value ? JSON.parse(e.target.value) : {};
                                field.onChange(params);
                              } catch {
                                field.onChange(e.target.value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {selectedType === 'ifttt' && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="configuration.webhook_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Webhook Key</FormLabel>
                        <FormControl>
                          <Input placeholder="Your IFTTT webhook key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="configuration.event_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Name</FormLabel>
                        <FormControl>
                          <Input placeholder="iot_alert" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="configuration.value1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value 1 Template</FormLabel>
                        <FormControl>
                          <Input placeholder="{{device_name}}" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="configuration.value2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value 2 Template</FormLabel>
                        <FormControl>
                          <Input placeholder="{{value}}" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="configuration.value3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value 3 Template</FormLabel>
                        <FormControl>
                          <Input placeholder="{{timestamp}}" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {selectedType === 'whatsapp' && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="configuration.phone_number_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Your WhatsApp Business Phone Number ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="configuration.access_token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Token</FormLabel>
                        <FormControl>
                          <Input placeholder="Your WhatsApp Business API access token" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="configuration.to_phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number with country code (e.g., +1234567890)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="configuration.message_template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message Template</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="🚨 Alert from device {{device_name}}: {{value}}" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Endpoint'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
