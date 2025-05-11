
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ServiceType } from '@/types/product';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface ServiceConfigFieldsProps {
  serviceType: ServiceType;
  form: UseFormReturn<any>;
}

export function ServiceConfigFields({ serviceType, form }: ServiceConfigFieldsProps) {
  // Helper to render different config sections based on service type
  const renderConfigFields = () => {
    switch (serviceType) {
      case 'mqtt':
        return renderMqttFields();
      case 'http':
        return renderHttpFields();
      case 'data_processing':
        return renderDataProcessingFields();
      case 'notification':
        return renderNotificationFields();
      case 'storage':
        return renderStorageFields();
      case 'analytics':
        return renderAnalyticsFields();
      case 'custom':
        return renderCustomFields();
      default:
        return <p className="text-sm text-muted-foreground">No configuration needed for this service type.</p>;
    }
  };

  // MQTT config fields
  const renderMqttFields = () => (
    <Card>
      <CardHeader>
        <CardTitle>MQTT Configuration</CardTitle>
        <CardDescription>Configure MQTT broker connection settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="config.endpoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Broker URL *</FormLabel>
              <FormControl>
                <Input placeholder="mqtt://example.com:1883" {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>MQTT broker URL with port</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="config.topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Topic</FormLabel>
                <FormControl>
                  <Input placeholder="devices/{device_id}" {...field} value={field.value || ''} />
                </FormControl>
                <FormDescription>The base topic pattern</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="config.qos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>QoS Level</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value?.toString() || '0'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select QoS level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">0 - At most once</SelectItem>
                    <SelectItem value="1">1 - At least once</SelectItem>
                    <SelectItem value="2">2 - Exactly once</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="config.auth_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authentication Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select authentication type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No Authentication</SelectItem>
                  <SelectItem value="basic">Username/Password</SelectItem>
                  <SelectItem value="token">Token</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('config.auth_type') === 'basic' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="config.credentials.username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="config.credentials.password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {form.watch('config.auth_type') === 'token' && (
          <FormField
            control={form.control}
            name="config.credentials.token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access Token</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );

  // HTTP config fields
  const renderHttpFields = () => {
    const headers = form.watch('config.headers') || {};
    const headerKeys = Object.keys(headers);

    const addHeader = () => {
      const newHeaders = { ...headers, '': '' };
      form.setValue('config.headers', newHeaders);
    };

    const removeHeader = (key: string) => {
      const { [key]: _, ...rest } = headers;
      form.setValue('config.headers', rest);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>HTTP API Configuration</CardTitle>
          <CardDescription>Configure HTTP API integration settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="config.endpoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Endpoint URL *</FormLabel>
                <FormControl>
                  <Input placeholder="https://api.example.com/v1" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="config.method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HTTP Method</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || 'POST'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select HTTP method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="config.auth_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Authentication Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || 'none'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select authentication type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No Authentication</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="token">API Key/Token</SelectItem>
                    <SelectItem value="oauth">OAuth 2.0</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Authentication fields based on type */}
          {form.watch('config.auth_type') === 'basic' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="config.credentials.username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="config.credentials.password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {form.watch('config.auth_type') === 'token' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="config.credentials.header_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Header Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Authorization" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="config.credentials.token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key/Token</FormLabel>
                    <FormControl>
                      <Input placeholder="Bearer token" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <FormLabel>HTTP Headers</FormLabel>
              <Button type="button" size="sm" variant="outline" onClick={addHeader}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add Header
              </Button>
            </div>

            {headerKeys.length > 0 ? (
              headerKeys.map((key) => (
                <div key={key} className="grid grid-cols-5 gap-2 items-start">
                  <FormField
                    control={form.control}
                    name={`config.headers.${key === '' ? 'newKey' : key}.key`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormControl>
                          <Input 
                            placeholder="Header name" 
                            value={key} 
                            onChange={(e) => {
                              if (key !== e.target.value && e.target.value) {
                                const value = headers[key];
                                const { [key]: _, ...restHeaders } = headers;
                                form.setValue('config.headers', { ...restHeaders, [e.target.value]: value });
                              }
                            }} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`config.headers.${key}`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormControl>
                          <Input 
                            placeholder="Value" 
                            value={field.value} 
                            onChange={(e) => {
                              form.setValue(`config.headers.${key}`, e.target.value);
                            }} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="ghost" 
                    className="mt-0" 
                    onClick={() => removeHeader(key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No headers added</div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Data Processing config fields
  const renderDataProcessingFields = () => (
    <Card>
      <CardHeader>
        <CardTitle>Data Processing Configuration</CardTitle>
        <CardDescription>Configure data processing rules</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="config.processing_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processing Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || 'transform'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select processing type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="transform">Transform</SelectItem>
                  <SelectItem value="filter">Filter</SelectItem>
                  <SelectItem value="aggregate">Aggregate</SelectItem>
                  <SelectItem value="enrich">Enrich</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="config.script"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processing Script</FormLabel>
              <FormControl>
                <Textarea 
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="// JavaScript processing function
function process(data) {
  // Transform the data
  return {
    ...data,
    temperature: (data.temperature * 9/5) + 32 // Convert C to F
  };
}" 
                  {...field}
                  value={field.value || ''} 
                />
              </FormControl>
              <FormDescription>
                JavaScript code to process device data
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  // Notification config fields
  const renderNotificationFields = () => (
    <Card>
      <CardHeader>
        <CardTitle>Notification Configuration</CardTitle>
        <CardDescription>Configure notification service settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="config.notification_channels"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notification Channels</FormLabel>
              <Select 
                onValueChange={(value) => {
                  const channels = field.value || [];
                  if (!channels.includes(value)) {
                    field.onChange([...channels, value]);
                  }
                }} 
                value=""
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Add notification channel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="push">Push Notification</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select notification channels
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Show selected channels */}
        <div className="space-y-2">
          <FormLabel>Selected Channels</FormLabel>
          <div className="flex flex-wrap gap-2">
            {(form.watch('config.notification_channels') || []).map((channel: string) => (
              <div 
                key={channel} 
                className="bg-primary-100 text-primary-800 rounded-md px-2 py-1 text-sm flex items-center gap-1"
              >
                {channel}
                <button 
                  type="button" 
                  className="text-primary-600 hover:text-primary-900"
                  onClick={() => {
                    const channels = form.watch('config.notification_channels') || [];
                    form.setValue(
                      'config.notification_channels', 
                      channels.filter((c: string) => c !== channel)
                    );
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            {!(form.watch('config.notification_channels') || []).length && (
              <div className="text-sm text-muted-foreground">No channels selected</div>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="config.template"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notification Template</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Device {{device_id}} reported {{value}} at {{timestamp}}" 
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ''} 
                />
              </FormControl>
              <FormDescription>
                Template with variables in double curly braces
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  // Storage config fields
  const renderStorageFields = () => (
    <Card>
      <CardHeader>
        <CardTitle>Storage Configuration</CardTitle>
        <CardDescription>Configure data storage settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="config.storage_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || 'database'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select storage type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="time_series">Time Series DB</SelectItem>
                  <SelectItem value="s3">Object Storage (S3)</SelectItem>
                  <SelectItem value="file">File System</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="config.retention_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retention Period (days)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}  
                />
              </FormControl>
              <FormDescription>
                Number of days to retain data (0 for indefinite)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="config.compression"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Compression</FormLabel>
                <FormDescription>
                  Enable data compression
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="config.sampling_interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sampling Interval (seconds)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}  
                />
              </FormControl>
              <FormDescription>
                How often to sample data (0 for every data point)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  // Analytics config fields
  const renderAnalyticsFields = () => (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Configuration</CardTitle>
        <CardDescription>Configure analytics service settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="config.analytics_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Analytics Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || 'basic'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select analytics type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="basic">Basic Statistics</SelectItem>
                  <SelectItem value="trend">Trend Analysis</SelectItem>
                  <SelectItem value="anomaly">Anomaly Detection</SelectItem>
                  <SelectItem value="predictive">Predictive Analytics</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="config.window_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Analysis Window (minutes)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}  
                />
              </FormControl>
              <FormDescription>
                Time window for analysis in minutes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="config.alert_threshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alert Threshold</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}  
                />
              </FormControl>
              <FormDescription>
                Threshold for generating alerts
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="config.generate_alerts"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Generate Alerts</FormLabel>
                <FormDescription>
                  Create alerts when thresholds are exceeded
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  // Custom service config fields
  const renderCustomFields = () => (
    <Card>
      <CardHeader>
        <CardTitle>Custom Service Configuration</CardTitle>
        <CardDescription>Configure your custom service</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="config.custom_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Service Type</FormLabel>
              <FormControl>
                <Input placeholder="Enter service type identifier" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="config.configuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Configuration</FormLabel>
              <FormControl>
                <Textarea 
                  className="min-h-[200px] font-mono text-sm"
                  placeholder='{
  "key1": "value1",
  "key2": "value2"
}' 
                  {...field}
                  value={field.value || ''} 
                />
              </FormControl>
              <FormDescription>
                JSON configuration for your custom service
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {renderConfigFields()}
    </div>
  );
}
