
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlarmFormData, AlarmSeverity, ConditionOperator } from "@/types/alarm";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useDevices } from "@/hooks/useDevices";
import { useEndpoints } from "@/hooks/useEndpoints";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  description: z.string().optional(),
  device_id: z.string().nullable(),
  enabled: z.boolean().default(true),
  reading_type: z.string().min(1, { message: "Reading type is required" }),
  condition_operator: z.enum(["gt", "lt", "gte", "lte", "eq", "neq", "between", "outside"]),
  condition_value: z.any(),
  severity: z.enum(["info", "warning", "critical"]),
  cooldown_minutes: z.number().int().positive().default(15),
  endpoints: z.array(z.string()).default([]),
});

interface AlarmFormProps {
  organizationId: string;
  initialData?: Partial<AlarmFormData>;
  onSubmit: (data: AlarmFormData) => void;
  isSubmitting?: boolean;
}

export default function AlarmForm({ organizationId, initialData, onSubmit, isSubmitting = false }: AlarmFormProps) {
  const { devices = [] } = useDevices(organizationId);
  const { endpoints = [] } = useEndpoints(organizationId);
  
  const [conditionType, setConditionType] = React.useState<ConditionOperator>(
    initialData?.condition_operator || "gt"
  );

  const form = useForm<AlarmFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      device_id: initialData?.device_id || null,
      enabled: initialData?.enabled ?? true,
      reading_type: initialData?.reading_type || "",
      condition_operator: initialData?.condition_operator || "gt",
      condition_value: initialData?.condition_value || { threshold: 0 },
      severity: initialData?.severity || "warning",
      cooldown_minutes: initialData?.cooldown_minutes || 15,
      endpoints: initialData?.endpoints || [],
    },
  });

  React.useEffect(() => {
    if (conditionType === "between" || conditionType === "outside") {
      form.setValue("condition_value", { min: 0, max: 100 });
    } else {
      form.setValue("condition_value", { threshold: 0 });
    }
  }, [conditionType, form]);

  const handleOperatorChange = (value: ConditionOperator) => {
    setConditionType(value);
    form.setValue("condition_operator", value);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{initialData?.id ? "Edit Alarm" : "Create Alarm"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Temperature High Alert" {...field} />
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
                      <Input placeholder="Triggers when temperature exceeds threshold" {...field} />
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
                      <FormLabel className="text-base">Enabled</FormLabel>
                      <FormDescription>
                        When disabled, this alarm won't trigger any notifications
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
            
            <Separator />
            
            {/* Trigger Conditions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Trigger Conditions</h3>
              
              <FormField
                control={form.control}
                name="device_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "null"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a device or leave empty for all devices" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Apply to all devices</SelectItem>
                        {devices.map((device) => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.name} ({device.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      If no device is selected, the alarm will apply to readings from all devices
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
                    <FormControl>
                      <Input placeholder="temperature" {...field} />
                    </FormControl>
                    <FormDescription>
                      The type of reading this alarm should monitor (e.g., temperature, humidity, pressure)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="condition_operator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition Type</FormLabel>
                      <Select
                        onValueChange={(value) => handleOperatorChange(value as ConditionOperator)}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gt">Greater than (&gt;)</SelectItem>
                          <SelectItem value="lt">Less than (&lt;)</SelectItem>
                          <SelectItem value="gte">Greater than or equal (≥)</SelectItem>
                          <SelectItem value="lte">Less than or equal (≤)</SelectItem>
                          <SelectItem value="eq">Equal to (=)</SelectItem>
                          <SelectItem value="neq">Not equal to (≠)</SelectItem>
                          <SelectItem value="between">Between range</SelectItem>
                          <SelectItem value="outside">Outside range</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {conditionType === "between" || conditionType === "outside" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="condition_value.min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Value</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
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
                      name="condition_value.max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Value</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="condition_value.threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Threshold Value</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
            
            <Separator />
            
            {/* Alarm Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Alarm Settings</h3>
              
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cooldown_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cooldown Period (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))} 
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum time between repeated alarm notifications
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            {/* Notification Endpoints */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Endpoints</h3>
              
              <FormField
                control={form.control}
                name="endpoints"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Select Endpoints</FormLabel>
                      <FormDescription>
                        Choose which endpoints should be notified when this alarm triggers
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div className="grid gap-2">
                        {endpoints.length > 0 ? endpoints.map((endpoint) => (
                          <div key={endpoint.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`endpoint-${endpoint.id}`}
                              checked={field.value.includes(endpoint.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...field.value, endpoint.id]);
                                } else {
                                  field.onChange(field.value.filter((id) => id !== endpoint.id));
                                }
                              }}
                              className="form-checkbox rounded border-gray-300"
                            />
                            <label htmlFor={`endpoint-${endpoint.id}`} className="text-sm">
                              {endpoint.name} ({endpoint.type})
                            </label>
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground">
                            No endpoints available. Create endpoints first to use for alarm notifications.
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData?.id ? "Update Alarm" : "Create Alarm"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
