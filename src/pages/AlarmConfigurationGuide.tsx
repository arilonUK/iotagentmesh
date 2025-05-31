
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  AlertTriangle, 
  Settings, 
  Activity, 
  Mail, 
  MessageSquare, 
  Webhook,
  Shield,
  Clock,
  Target,
  Users,
  ExternalLink,
  ArrowLeft,
  Zap,
  Database,
  Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AlarmConfigurationGuide = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'overview',
      title: 'Alarm Configuration Overview',
      icon: Bell,
      content: [
        'Alarm configuration allows you to set up automated monitoring and notifications for your IoT devices and data.',
        'The system monitors device conditions in real-time and triggers alerts when specified thresholds are exceeded.',
        'Alarms can be configured with different severity levels and multiple notification channels for comprehensive monitoring.'
      ]
    },
    {
      id: 'creating-alarms',
      title: 'Creating Alarms',
      icon: Settings,
      content: [
        'Create alarms to monitor specific device conditions and trigger notifications when thresholds are breached.',
        'Each alarm can be configured with custom conditions, severity levels, and notification endpoints.',
        'Alarms support various condition operators including greater than, less than, between, and outside ranges.'
      ],
      steps: [
        'Navigate to the Alarms section in your dashboard',
        'Click "Create Alarm" to open the alarm configuration form',
        'Enter alarm name and description for easy identification',
        'Select the device or device group to monitor',
        'Choose the data reading type (temperature, humidity, etc.)',
        'Set the condition operator and threshold values',
        'Select alarm severity level (info, warning, critical)',
        'Configure notification endpoints and cooldown period',
        'Save the alarm to start monitoring'
      ]
    },
    {
      id: 'condition-types',
      title: 'Alarm Condition Types',
      icon: Target,
      content: [
        'Alarm conditions define when notifications should be triggered based on device data readings.',
        'Multiple condition operators are available to cover different monitoring scenarios.',
        'Conditions can be set for single values or ranges depending on your monitoring needs.'
      ],
      conditionTypes: [
        {
          operator: 'Greater Than (>)',
          description: 'Triggers when value exceeds threshold',
          example: 'Temperature > 80°C'
        },
        {
          operator: 'Less Than (<)',
          description: 'Triggers when value falls below threshold',
          example: 'Battery level < 10%'
        },
        {
          operator: 'Equal To (=)',
          description: 'Triggers when value matches exactly',
          example: 'Status = offline'
        },
        {
          operator: 'Between',
          description: 'Triggers when value is within range',
          example: 'Humidity between 30% and 70%'
        },
        {
          operator: 'Outside',
          description: 'Triggers when value is outside range',
          example: 'Pressure outside 1000-1100 hPa'
        }
      ]
    },
    {
      id: 'severity-levels',
      title: 'Alarm Severity Levels',
      icon: AlertTriangle,
      content: [
        'Severity levels help categorize alarms based on their criticality and urgency.',
        'Different severity levels can trigger different notification behaviors and escalation procedures.',
        'Use appropriate severity levels to ensure critical issues receive immediate attention.'
      ],
      severityLevels: [
        {
          level: 'Info',
          description: 'Informational alerts for general monitoring',
          color: 'blue',
          examples: ['Device came online', 'Scheduled maintenance reminder']
        },
        {
          level: 'Warning',
          description: 'Non-critical issues requiring attention',
          color: 'yellow',
          examples: ['Temperature approaching limits', 'Low battery warning']
        },
        {
          level: 'Critical',
          description: 'Urgent issues requiring immediate action',
          color: 'red',
          examples: ['Device offline', 'Temperature exceeded safe limits']
        }
      ]
    },
    {
      id: 'notification-endpoints',
      title: 'Notification Endpoints',
      icon: MessageSquare,
      content: [
        'Notification endpoints define how and where alarm notifications are delivered.',
        'Multiple endpoint types are supported including email, SMS, webhooks, and messaging platforms.',
        'Configure multiple endpoints for redundancy and different stakeholder groups.'
      ],
      endpointTypes: [
        {
          type: 'Email',
          icon: Mail,
          description: 'Send notifications via email to individuals or groups',
          features: ['HTML formatting', 'Attachment support', 'Group distribution lists']
        },
        {
          type: 'Webhook',
          icon: Webhook,
          description: 'HTTP callbacks to integrate with external systems',
          features: ['Custom payloads', 'Authentication headers', 'Retry logic']
        },
        {
          type: 'SMS',
          icon: Smartphone,
          description: 'Text message notifications for urgent alerts',
          features: ['Global delivery', 'Character optimization', 'Delivery confirmation']
        },
        {
          type: 'Slack/Teams',
          icon: MessageSquare,
          description: 'Team collaboration platform notifications',
          features: ['Channel posting', 'Rich formatting', 'Interactive buttons']
        }
      ]
    },
    {
      id: 'cooldown-periods',
      title: 'Cooldown Periods & Rate Limiting',
      icon: Clock,
      content: [
        'Cooldown periods prevent alarm spam by limiting how frequently notifications are sent.',
        'Configure appropriate cooldown times based on the nature of the monitored condition.',
        'Rate limiting helps maintain notification quality and prevents system overload.'
      ],
      cooldownFeatures: [
        'Configurable cooldown duration (minutes to hours)',
        'Per-alarm cooldown settings for fine-tuned control',
        'Automatic cooldown reset when conditions return to normal',
        'Emergency override for critical severity alarms',
        'Escalation workflows for persistent conditions',
        'Notification batching for multiple simultaneous triggers'
      ]
    },
    {
      id: 'alarm-management',
      title: 'Alarm Management & Monitoring',
      icon: Activity,
      content: [
        'Monitor and manage your alarm configurations through the centralized alarm dashboard.',
        'Track alarm history, acknowledgments, and resolution status for comprehensive oversight.',
        'Bulk operations allow efficient management of multiple alarms simultaneously.'
      ],
      managementFeatures: [
        'Real-time alarm status monitoring',
        'Alarm history and event logging',
        'Acknowledgment and resolution tracking',
        'Bulk enable/disable operations',
        'Alarm performance analytics',
        'Configuration backup and restore'
      ]
    },
    {
      id: 'best-practices',
      title: 'Alarm Best Practices',
      icon: Shield,
      content: [
        'Follow alarm configuration best practices to ensure effective monitoring without alert fatigue.',
        'Properly designed alarm strategies improve response times and reduce false positives.',
        'Regular review and optimization of alarm configurations maintains system effectiveness.'
      ],
      bestPractices: [
        'Set appropriate thresholds based on normal operating ranges',
        'Use graduated severity levels for escalating conditions',
        'Configure meaningful alarm names and descriptions',
        'Test alarm configurations before deployment',
        'Regularly review and update alarm thresholds',
        'Implement alarm acknowledgment workflows',
        'Monitor alarm frequency to identify noise',
        'Document alarm response procedures'
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Create Your First Alarm',
      description: 'Set up monitoring and notifications for your devices',
      action: 'Go to Alarms',
      icon: Bell,
      link: '/dashboard/alarms'
    },
    {
      title: 'Configure Endpoints',
      description: 'Set up notification channels for alarm delivery',
      action: 'Manage Endpoints',
      icon: MessageSquare,
      link: '/dashboard/endpoints'
    },
    {
      title: 'Monitor Devices',
      description: 'View device status and configure monitoring',
      action: 'View Devices',
      icon: Activity,
      link: '/dashboard/devices'
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
        <Bell className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Alarm Configuration Guide</h1>
          <p className="text-muted-foreground">
            Set up alerts and notifications for your devices
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">Monitoring</Badge>
            <span className="text-sm text-muted-foreground">6 min read</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Jump to common alarm configuration tasks
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

                {section.conditionTypes && (
                  <div>
                    <h4 className="font-semibold mb-3">Condition Operators:</h4>
                    <div className="grid gap-3">
                      {section.conditionTypes.map((condition, cIndex) => (
                        <div key={cIndex} className="border rounded-lg p-3">
                          <div className="font-medium text-sm mb-1">{condition.operator}</div>
                          <div className="text-xs text-muted-foreground mb-2">{condition.description}</div>
                          <div className="text-xs text-primary">Example: {condition.example}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.severityLevels && (
                  <div>
                    <h4 className="font-semibold mb-3">Severity Levels:</h4>
                    <div className="grid gap-3">
                      {section.severityLevels.map((severity, sIndex) => (
                        <div key={sIndex} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className={`h-4 w-4 ${
                              severity.color === 'red' ? 'text-red-500' :
                              severity.color === 'yellow' ? 'text-yellow-500' : 'text-blue-500'
                            }`} />
                            <span className="font-medium text-sm">{severity.level}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">{severity.description}</div>
                          <div className="text-xs text-primary">
                            Examples: {severity.examples.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.endpointTypes && (
                  <div>
                    <h4 className="font-semibold mb-3">Endpoint Types:</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {section.endpointTypes.map((endpoint, eIndex) => (
                        <div key={eIndex} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <endpoint.icon className="h-5 w-5 text-primary" />
                            <h5 className="font-medium">{endpoint.type}</h5>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>
                          <div>
                            <span className="text-xs font-medium">Features:</span>
                            <ul className="text-xs text-muted-foreground mt-1">
                              {endpoint.features.map((feature, fIndex) => (
                                <li key={fIndex} className="flex items-center gap-1">
                                  <span className="h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.cooldownFeatures && (
                  <div>
                    <h4 className="font-semibold mb-3">Cooldown Features:</h4>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {section.cooldownFeatures.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.managementFeatures && (
                  <div>
                    <h4 className="font-semibold mb-3">Management Features:</h4>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {section.managementFeatures.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Activity className="h-3 w-3 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.bestPractices && (
                  <div>
                    <h4 className="font-semibold mb-3">Best Practices:</h4>
                    <ul className="grid gap-2">
                      {section.bestPractices.map((practice, pIndex) => (
                        <li key={pIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="h-3 w-3 text-primary flex-shrink-0" />
                          {practice}
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
                <Zap className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Device Management</div>
                  <div className="text-xs text-muted-foreground">Connect and manage your IoT devices</div>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Data Buckets & Analytics</div>
                  <div className="text-xs text-muted-foreground">Store and analyze device data</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlarmConfigurationGuide;
