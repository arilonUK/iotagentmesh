
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Laptop, 
  Plus, 
  Settings, 
  Activity, 
  AlertTriangle, 
  Shield, 
  Database,
  Wifi,
  BarChart3,
  Bell,
  Users,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeviceManagementGuide = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'overview',
      title: 'Device Management Overview',
      icon: Laptop,
      content: [
        'Device management is the core functionality of our IoT platform that allows you to register, monitor, and control your connected devices.',
        'The system supports various device types including sensors, actuators, gateways, and custom hardware implementations.',
        'Each device can be configured with specific properties, grouped for easier management, and monitored in real-time.'
      ]
    },
    {
      id: 'registration',
      title: 'Device Registration',
      icon: Plus,
      content: [
        'Before a device can send data to the platform, it must be registered and configured.',
        'During registration, you define the device name, type, and associate it with a product template.',
        'Each device receives unique credentials and connection parameters for secure authentication.'
      ],
      steps: [
        'Navigate to the Devices section in your dashboard',
        'Click "Add Device" to open the registration form',
        'Enter device details: name, type, and description',
        'Select or create a product template that matches your device',
        'Configure device-specific properties and settings',
        'Save the device to generate connection credentials'
      ]
    },
    {
      id: 'configuration',
      title: 'Device Configuration',
      icon: Settings,
      content: [
        'Device configuration allows you to customize how your devices behave and what data they collect.',
        'You can set sampling rates, configure sensors, and define data collection parameters.',
        'Configuration changes can be pushed to devices remotely for dynamic updates.'
      ],
      configOptions: [
        {
          name: 'Sampling Rate',
          description: 'How frequently the device collects and sends data',
          example: 'Every 30 seconds, 5 minutes, or hourly'
        },
        {
          name: 'Data Points',
          description: 'Which sensors or metrics the device should monitor',
          example: 'Temperature, humidity, pressure, motion'
        },
        {
          name: 'Thresholds',
          description: 'Alert conditions for automated monitoring',
          example: 'Temperature > 80°C or battery < 10%'
        },
        {
          name: 'Network Settings',
          description: 'Connection parameters and communication protocols',
          example: 'WiFi credentials, cellular APN, or LoRaWAN keys'
        }
      ]
    },
    {
      id: 'monitoring',
      title: 'Real-time Monitoring',
      icon: Activity,
      content: [
        'Monitor your devices in real-time with live status updates and data visualization.',
        'Track device health, connectivity status, and performance metrics.',
        'Set up automated alerts for device failures or anomalous behavior.'
      ],
      features: [
        'Live device status (online/offline/warning)',
        'Real-time data streaming and visualization',
        'Historical data analysis and trends',
        'Device health metrics and diagnostics',
        'Network connectivity monitoring',
        'Battery level and power consumption tracking'
      ]
    },
    {
      id: 'grouping',
      title: 'Device Grouping',
      icon: Users,
      content: [
        'Organize devices into logical groups for easier management and bulk operations.',
        'Groups can be based on location, function, or any custom criteria.',
        'Apply configuration changes to entire groups simultaneously.'
      ],
      groupTypes: [
        'Location-based (Building A, Floor 2, Room 101)',
        'Function-based (Temperature Sensors, Security Cameras)',
        'Department-based (Manufacturing, Quality Control)',
        'Custom criteria (High Priority, Maintenance Required)'
      ]
    },
    {
      id: 'alarms',
      title: 'Alarm Management',
      icon: AlertTriangle,
      content: [
        'Set up automated alarms to monitor device conditions and trigger notifications.',
        'Configure multiple alarm conditions with different severity levels.',
        'Integrate with endpoints for email, SMS, or webhook notifications.'
      ]
    },
    {
      id: 'security',
      title: 'Device Security',
      icon: Shield,
      content: [
        'Ensure device communications are secure with built-in encryption and authentication.',
        'Manage device credentials and rotate security keys regularly.',
        'Monitor for unauthorized access attempts and security violations.'
      ],
      securityFeatures: [
        'TLS/SSL encrypted communications',
        'Device certificate management',
        'API key rotation and management',
        'Access control and permissions',
        'Audit logging for security events',
        'Intrusion detection and prevention'
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Add Your First Device',
      description: 'Register a new device to start collecting data',
      action: 'Go to Devices',
      icon: Plus,
      link: '/dashboard/devices'
    },
    {
      title: 'View Device Dashboard',
      description: 'Monitor all your devices in one place',
      action: 'Open Dashboard',
      icon: BarChart3,
      link: '/dashboard'
    },
    {
      title: 'Set Up Alarms',
      description: 'Configure automated monitoring and alerts',
      action: 'Manage Alarms',
      icon: Bell,
      link: '/dashboard/alarms'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/documentation')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Documentation
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Laptop className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Device Management Guide</h1>
          <p className="text-muted-foreground">
            Learn how to manage, monitor, and control your IoT devices
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">Core Features</Badge>
            <span className="text-sm text-muted-foreground">5 min read</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Jump to common device management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <action.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm">{action.title}</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(action.link)}
                  >
                    {action.action}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guide Sections */}
      <div className="space-y-8">
        {sections.map((section, index) => (
          <div key={section.id} id={section.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <section.icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}

                {section.steps && (
                  <div>
                    <h4 className="font-semibold mb-3">Step-by-step Process:</h4>
                    <ol className="space-y-2">
                      {section.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold mt-0.5">
                            {stepIndex + 1}
                          </span>
                          <span className="text-sm text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {section.configOptions && (
                  <div>
                    <h4 className="font-semibold mb-3">Configuration Options:</h4>
                    <div className="grid gap-3">
                      {section.configOptions.map((option, optIndex) => (
                        <div key={optIndex} className="border rounded-lg p-3">
                          <div className="font-medium text-sm mb-1">{option.name}</div>
                          <div className="text-xs text-muted-foreground mb-2">{option.description}</div>
                          <div className="text-xs text-primary">Example: {option.example}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.features && (
                  <div>
                    <h4 className="font-semibold mb-3">Key Features:</h4>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {section.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.groupTypes && (
                  <div>
                    <h4 className="font-semibold mb-3">Common Group Types:</h4>
                    <ul className="space-y-2">
                      {section.groupTypes.map((type, tIndex) => (
                        <li key={tIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                          {type}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.securityFeatures && (
                  <div>
                    <h4 className="font-semibold mb-3">Security Features:</h4>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {section.securityFeatures.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="h-3 w-3 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
            {index < sections.length - 1 && <Separator className="my-8" />}
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Continue your journey with these related guides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Data Buckets & Analytics</div>
                  <div className="text-xs text-muted-foreground">Store and analyze device data</div>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Alarm Configuration</div>
                  <div className="text-xs text-muted-foreground">Set up alerts and notifications</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceManagementGuide;
