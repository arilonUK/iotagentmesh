
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Server, 
  Code, 
  Settings, 
  Key, 
  Webhook, 
  Database, 
  Shield,
  ExternalLink,
  ArrowLeft,
  Zap,
  FileText,
  Globe,
  Lock,
  RefreshCw,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApiIntegrationGuide = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'overview',
      title: 'API Integration Overview',
      icon: Server,
      content: [
        'Our REST API provides comprehensive access to all platform features, enabling seamless integration with external systems and custom applications.',
        'The API follows RESTful principles with predictable URLs, standard HTTP methods, and JSON responses for easy integration.',
        'Authentication is handled through API keys with configurable scopes to ensure secure access to your organization\'s data.'
      ]
    },
    {
      id: 'authentication',
      title: 'API Authentication & Key Management',
      icon: Key,
      content: [
        'API authentication uses bearer tokens generated from your API keys for secure access to protected endpoints.',
        'Each API key can be configured with specific scopes to limit access to only the required functionality.',
        'API keys support expiration dates, proactive refresh capabilities, and comprehensive usage tracking for enhanced security management.'
      ],
      steps: [
        'Navigate to Settings > API Keys in your dashboard',
        'Click "Create API Key" to generate a new key',
        'Enter a descriptive name for the API key',
        'Select the required scopes (read, write, devices, users, analytics)',
        'Choose an expiration date or set to never expire',
        'Copy the generated API key securely',
        'Use the key as a Bearer token in your API requests'
      ],
      keyManagementFeatures: [
        {
          title: 'Proactive Refresh',
          description: 'Refresh API keys before they expire to maintain continuous access',
          details: [
            'Visual expiration warnings appear 30 days before expiry',
            'Quick refresh buttons for keys expiring within 14 days',
            'One-click refresh generates new key and invalidates old one',
            'New keys maintain same permissions and extend expiration period'
          ]
        },
        {
          title: 'Expiration Management',
          description: 'Comprehensive lifecycle management for API keys',
          details: [
            'Color-coded expiration badges (green for never expires, yellow for 30+ days, red for <30 days)',
            'Automatic notifications for keys approaching expiration',
            'Flexible expiration periods: 1, 3, 6, 12 months, or never',
            'Grace period handling for recently expired keys'
          ]
        },
        {
          title: 'Security Features',
          description: 'Enterprise-grade security for API key management',
          details: [
            'SHA-256 hashing for secure key storage',
            'Role-based access control (admin/owner permissions required)',
            'Immediate invalidation of old keys during refresh',
            'Usage tracking and audit logging for all key operations'
          ]
        }
      ]
    },
    {
      id: 'api-endpoints',
      title: 'Core API Endpoints',
      icon: Server,
      content: [
        'The API provides endpoints for all major platform functionality including device management, data operations, and user management.',
        'All endpoints follow consistent patterns with standardized request/response formats.',
        'Comprehensive error handling provides clear feedback for troubleshooting integration issues.'
      ],
      endpointCategories: [
        {
          category: 'Device Management',
          description: 'Create, read, update, and delete devices',
          endpoints: [
            'GET /api/devices - List all devices',
            'POST /api/devices - Create a new device',
            'GET /api/devices/{id} - Get device details',
            'PUT /api/devices/{id} - Update device',
            'DELETE /api/devices/{id} - Delete device'
          ]
        },
        {
          category: 'API Key Management',
          description: 'Manage and refresh API keys programmatically',
          endpoints: [
            'GET /api/keys - List organization API keys',
            'POST /api/keys - Create a new API key',
            'PUT /api/keys/{id} - Update API key settings',
            'POST /api/keys/{id}/refresh - Refresh an existing API key',
            'DELETE /api/keys/{id} - Delete API key',
            'GET /api/keys/usage - Get API usage statistics'
          ]
        },
        {
          category: 'Data Operations',
          description: 'Send and retrieve device data',
          endpoints: [
            'POST /api/data-buckets/{id}/data - Send data to bucket',
            'GET /api/data-buckets/{id}/data - Retrieve bucket data',
            'GET /api/devices/{id}/readings - Get device readings',
            'POST /api/devices/{id}/readings - Send device readings'
          ]
        },
        {
          category: 'Products & Templates',
          description: 'Manage product configurations',
          endpoints: [
            'GET /api/products - List product templates',
            'POST /api/products - Create product template',
            'GET /api/products/{id} - Get product details',
            'PUT /api/products/{id} - Update product template'
          ]
        },
        {
          category: 'User Management',
          description: 'Organization and user operations',
          endpoints: [
            'GET /api/organizations/{id}/users - List organization users',
            'POST /api/organizations/{id}/invitations - Send invitations',
            'GET /api/user/profile - Get user profile',
            'PUT /api/user/profile - Update user profile'
          ]
        }
      ]
    },
    {
      id: 'request-format',
      title: 'Request & Response Format',
      icon: FileText,
      content: [
        'All API requests must include proper authentication headers and follow the expected JSON format.',
        'Responses are consistently formatted with standard HTTP status codes and detailed error messages.',
        'Pagination is supported for list endpoints with configurable page size and cursor-based navigation.'
      ],
      requestExamples: [
        {
          title: 'Authentication Header',
          code: `Authorization: Bearer your-api-key-here
Content-Type: application/json`
        },
        {
          title: 'Create Device Request',
          code: `POST /api/devices
{
  "name": "Temperature Sensor 01",
  "product_id": "product-uuid",
  "description": "Living room temperature monitoring",
  "location": "Living Room",
  "metadata": {
    "room": "living_room",
    "floor": 1
  }
}`
        },
        {
          title: 'Refresh API Key Request',
          code: `POST /api/keys/api-key-uuid/refresh
Authorization: Bearer your-current-api-key

Response:
{
  "success": true,
  "api_key": {
    "id": "api-key-uuid",
    "name": "My API Key",
    "prefix": "iot_12345678...",
    "expires_at": "2024-12-25T00:00:00Z"
  },
  "full_key": "iot_new-refreshed-key-value"
}`
        },
        {
          title: 'Send Data Request',
          code: `POST /api/data-buckets/bucket-id/data
{
  "device_id": "device-uuid",
  "timestamp": "2024-01-15T10:30:00Z",
  "readings": {
    "temperature": 23.5,
    "humidity": 65.2,
    "pressure": 1013.25
  }
}`
        }
      ]
    },
    {
      id: 'key-refresh-workflow',
      title: 'API Key Refresh Workflow',
      icon: RefreshCw,
      content: [
        'The API key refresh system provides seamless key rotation without service interruption.',
        'Proactive refresh capabilities help maintain continuous API access by refreshing keys before expiration.',
        'The refresh process generates a completely new key while preserving all existing permissions and settings.'
      ],
      refreshWorkflow: [
        {
          step: 'Detection',
          description: 'System identifies keys approaching expiration',
          details: [
            'Visual indicators appear 30 days before expiration',
            'Email notifications sent at 30, 14, and 7 days before expiry',
            'Dashboard shows refresh recommendations for expiring keys'
          ]
        },
        {
          step: 'Initiation',
          description: 'Refresh process can be triggered multiple ways',
          details: [
            'Manual refresh via dashboard interface',
            'Programmatic refresh using POST /api/keys/{id}/refresh',
            'Automated refresh workflows (coming soon)'
          ]
        },
        {
          step: 'Generation',
          description: 'New key generation with security measures',
          details: [
            'Cryptographically secure key generation',
            'Same scopes and permissions as original key',
            'Extended expiration based on original key settings',
            'Immediate SHA-256 hashing for secure storage'
          ]
        },
        {
          step: 'Transition',
          description: 'Seamless transition from old to new key',
          details: [
            'Old key remains valid during transition period',
            'New key is immediately active for use',
            'Applications can update to new key at their own pace',
            'Usage tracking continues uninterrupted'
          ]
        },
        {
          step: 'Completion',
          description: 'Finalization and cleanup',
          details: [
            'Old key is invalidated after successful refresh',
            'Audit log records key refresh event',
            'Updated key information shown in dashboard',
            'New expiration date calculated and displayed'
          ]
        }
      ]
    },
    {
      id: 'webhooks',
      title: 'Webhooks & Real-time Integration',
      icon: Webhook,
      content: [
        'Webhooks provide real-time notifications for events like device status changes, alarm triggers, and data updates.',
        'Configure webhook endpoints to receive HTTP callbacks when specific events occur in your IoT infrastructure.',
        'Webhook payloads include comprehensive event data and can be filtered based on device groups or event types.'
      ],
      webhookFeatures: [
        'Real-time event notifications for immediate response',
        'Configurable event filters and device group targeting',
        'Retry logic with exponential backoff for reliability',
        'Signature verification for security validation',
        'Custom headers and authentication support',
        'Event history and delivery status monitoring'
      ]
    },
    {
      id: 'rate-limiting',
      title: 'Rate Limiting & Quotas',
      icon: RefreshCw,
      content: [
        'API rate limiting ensures fair usage and system stability across all users and applications.',
        'Different rate limits apply based on your subscription plan and API key configuration.',
        'Rate limit headers provide real-time information about your current usage and remaining quota.'
      ],
      rateLimits: [
        {
          plan: 'Free Tier',
          limits: ['1,000 requests/hour', '10,000 requests/month', '5 concurrent connections']
        },
        {
          plan: 'Professional',
          limits: ['10,000 requests/hour', '1M requests/month', '50 concurrent connections']
        },
        {
          plan: 'Enterprise',
          limits: ['Custom limits', 'Unlimited requests', 'Unlimited connections']
        }
      ]
    },
    {
      id: 'error-handling',
      title: 'Error Handling & Troubleshooting',
      icon: Shield,
      content: [
        'Comprehensive error responses help identify and resolve integration issues quickly.',
        'Standard HTTP status codes with detailed error messages provide clear feedback.',
        'API logs and monitoring help track usage patterns and identify potential issues.'
      ],
      errorTypes: [
        {
          code: '400 Bad Request',
          description: 'Invalid request format or missing required fields',
          example: 'Missing device_id in data submission'
        },
        {
          code: '401 Unauthorized',
          description: 'Invalid or missing API key',
          example: 'API key expired or has insufficient permissions'
        },
        {
          code: '403 Forbidden',
          description: 'API key lacks required permissions',
          example: 'Attempting to delete device with read-only key'
        },
        {
          code: '404 Not Found',
          description: 'Requested resource does not exist',
          example: 'Device ID not found in organization'
        },
        {
          code: '429 Too Many Requests',
          description: 'Rate limit exceeded',
          example: 'Hourly API quota reached'
        },
        {
          code: '500 Internal Server Error',
          description: 'Server error occurred',
          example: 'Database connection timeout'
        }
      ]
    },
    {
      id: 'sdk-libraries',
      title: 'SDKs & Client Libraries',
      icon: Code,
      content: [
        'Official SDKs and client libraries simplify integration with popular programming languages and frameworks.',
        'Community-maintained libraries extend support to additional platforms and use cases.',
        'All SDKs include comprehensive documentation, examples, and automated testing.'
      ],
      sdks: [
        {
          language: 'JavaScript/TypeScript',
          description: 'Full-featured SDK for Node.js and browser environments',
          features: ['Promise-based API', 'TypeScript definitions', 'Automatic retries', 'WebSocket support']
        },
        {
          language: 'Python',
          description: 'Comprehensive Python library for server-side integration',
          features: ['Async/await support', 'Pandas integration', 'CLI tools', 'Data export utilities']
        },
        {
          language: 'Go',
          description: 'High-performance Go client for scalable applications',
          features: ['Concurrent operations', 'Built-in connection pooling', 'Structured logging', 'Health checks']
        },
        {
          language: 'REST',
          description: 'Direct HTTP integration for any programming language',
          features: ['OpenAPI specification', 'Postman collection', 'cURL examples', 'Interactive docs']
        }
      ]
    },
    {
      id: 'best-practices',
      title: 'Integration Best Practices',
      icon: Settings,
      content: [
        'Follow API integration best practices to ensure reliable, secure, and efficient communication with the platform.',
        'Proper error handling, retry logic, and monitoring are essential for production integrations.',
        'Security considerations include API key management, request validation, and data encryption.'
      ],
      bestPractices: [
        'Store API keys securely using environment variables or secret management',
        'Implement proactive API key refresh before expiration dates',
        'Monitor key expiration dates and set up automated refresh workflows',
        'Implement exponential backoff for retry logic on failed requests',
        'Use appropriate HTTP timeouts for your application requirements',
        'Validate API responses before processing data',
        'Monitor API usage and set up alerts for rate limit approaching',
        'Use webhook signatures to verify authentic event notifications',
        'Implement proper logging for debugging and monitoring',
        'Cache frequently accessed data to reduce API calls',
        'Use bulk operations when available for better performance',
        'Test integrations thoroughly in development environment',
        'Plan for key rotation in production systems',
        'Keep backup keys for emergency access scenarios'
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Create API Key',
      description: 'Generate API keys to start integrating with our platform',
      action: 'Manage API Keys',
      icon: Key,
      link: '/dashboard/settings/api-keys'
    },
    {
      title: 'Configure Webhooks',
      description: 'Set up real-time notifications for your applications',
      action: 'Setup Endpoints',
      icon: Webhook,
      link: '/dashboard/endpoints'
    },
    {
      title: 'Test API Calls',
      description: 'Interactive API documentation and testing tools',
      action: 'API Reference',
      icon: Server,
      link: '/dashboard/documentation'
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
        <Server className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">API Integration Guide</h1>
          <p className="text-muted-foreground">
            Integrate with external services using our REST API
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">Development</Badge>
            <span className="text-sm text-muted-foreground">15 min read</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Jump to common API integration tasks
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

                {section.keyManagementFeatures && (
                  <div>
                    <h4 className="font-semibold mb-3">Key Management Features:</h4>
                    <div className="space-y-4">
                      {section.keyManagementFeatures.map((feature, fIndex) => (
                        <div key={fIndex} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <RefreshCw className="h-4 w-4 text-primary" />
                            <h5 className="font-medium">{feature.title}</h5>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                          <ul className="space-y-1">
                            {feature.details.map((detail, dIndex) => (
                              <li key={dIndex} className="text-xs text-muted-foreground flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.refreshWorkflow && (
                  <div>
                    <h4 className="font-semibold mb-3">API Key Refresh Process:</h4>
                    <div className="space-y-4">
                      {section.refreshWorkflow.map((workflow, wIndex) => (
                        <div key={wIndex} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                              {wIndex + 1}
                            </div>
                            <div>
                              <h5 className="font-medium">{workflow.step}</h5>
                              <p className="text-sm text-muted-foreground">{workflow.description}</p>
                            </div>
                          </div>
                          <ul className="space-y-1 ml-10">
                            {workflow.details.map((detail, dIndex) => (
                              <li key={dIndex} className="text-xs text-muted-foreground flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.endpointCategories && (
                  <div>
                    <h4 className="font-semibold mb-3">API Endpoint Categories:</h4>
                    <div className="space-y-4">
                      {section.endpointCategories.map((category, cIndex) => (
                        <div key={cIndex} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Server className="h-4 w-4 text-primary" />
                            <h5 className="font-medium">{category.category}</h5>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                          <ul className="space-y-1">
                            {category.endpoints.map((endpoint, eIndex) => (
                              <li key={eIndex} className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                {endpoint}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.requestExamples && (
                  <div>
                    <h4 className="font-semibold mb-3">Request Examples:</h4>
                    <div className="space-y-4">
                      {section.requestExamples.map((example, eIndex) => (
                        <div key={eIndex}>
                          <h5 className="text-sm font-medium mb-2">{example.title}</h5>
                          <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                            <code>{example.code}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.webhookFeatures && (
                  <div>
                    <h4 className="font-semibold mb-3">Webhook Features:</h4>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {section.webhookFeatures.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Webhook className="h-3 w-3 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.rateLimits && (
                  <div>
                    <h4 className="font-semibold mb-3">Rate Limits by Plan:</h4>
                    <div className="grid gap-3 md:grid-cols-3">
                      {section.rateLimits.map((plan, pIndex) => (
                        <div key={pIndex} className="border rounded-lg p-3">
                          <h5 className="font-medium mb-2">{plan.plan}</h5>
                          <ul className="space-y-1">
                            {plan.limits.map((limit, lIndex) => (
                              <li key={lIndex} className="text-xs text-muted-foreground">
                                • {limit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.errorTypes && (
                  <div>
                    <h4 className="font-semibold mb-3">Common Error Codes:</h4>
                    <div className="space-y-3">
                      {section.errorTypes.map((error, eIndex) => (
                        <div key={eIndex} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-mono bg-red-100 text-red-800 px-2 py-1 rounded">
                              {error.code}
                            </code>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{error.description}</p>
                          <p className="text-xs text-primary">Example: {error.example}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.sdks && (
                  <div>
                    <h4 className="font-semibold mb-3">Available SDKs:</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {section.sdks.map((sdk, sIndex) => (
                        <div key={sIndex} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Code className="h-4 w-4 text-primary" />
                            <h5 className="font-medium">{sdk.language}</h5>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{sdk.description}</p>
                          <div>
                            <span className="text-xs font-medium">Features:</span>
                            <ul className="text-xs text-muted-foreground mt-1">
                              {sdk.features.map((feature, fIndex) => (
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
                  <div className="font-medium">Security Best Practices</div>
                  <div className="text-xs text-muted-foreground">Secure your IoT infrastructure</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiIntegrationGuide;
