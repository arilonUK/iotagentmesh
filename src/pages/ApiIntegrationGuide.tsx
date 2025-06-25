import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Server, 
  ArrowLeft,
  Key,
  Webhook,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import the new section components
import { ApiOverviewSection } from '@/components/documentation/api/ApiOverviewSection';
import { ApiKeyManagementSection } from '@/components/documentation/api/ApiKeyManagementSection';
import { ApiEndpointsSection } from '@/components/documentation/api/ApiEndpointsSection';
import { RequestResponseFormatSection } from '@/components/documentation/api/RequestResponseFormatSection';
import { ApiKeyRefreshWorkflowSection } from '@/components/documentation/api/ApiKeyRefreshWorkflowSection';
import { WebhooksSection } from '@/components/documentation/api/WebhooksSection';
import { RateLimitingSection } from '@/components/documentation/api/RateLimitingSection';
import { ErrorHandlingSection } from '@/components/documentation/api/ErrorHandlingSection';
import { SdkLibrariesSection } from '@/components/documentation/api/SdkLibrariesSection';
import { BestPracticesSection } from '@/components/documentation/api/BestPracticesSection';
import { QuickActionsCard } from '@/components/documentation/api/QuickActionsCard';
import { NextStepsCard } from '@/components/documentation/api/NextStepsCard';
import { FileText, Globe, Lock, RefreshCw, AlertTriangle, Clock, Code, Settings, Shield, Database, Zap, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
      <QuickActionsCard quickActions={quickActions} />

      {/* Guide Sections */}
      <div className="space-y-8">
        <ApiOverviewSection content={sections[0].content} />
        <Separator />
        
        <ApiKeyManagementSection 
          content={sections[1].content}
          steps={sections[1].steps}
          keyManagementFeatures={sections[1].keyManagementFeatures}
        />
        <Separator />

        <ApiEndpointsSection
          content={sections[2].content}
          endpointCategories={sections[2].endpointCategories}
        />
        <Separator />

        <RequestResponseFormatSection
          content={sections[3].content}
          requestExamples={sections[3].requestExamples}
        />
        <Separator />

        <ApiKeyRefreshWorkflowSection
          content={sections[4].content}
          refreshWorkflow={sections[4].refreshWorkflow}
        />
        <Separator />

        <WebhooksSection
          content={sections[5].content}
          webhookFeatures={sections[5].webhookFeatures}
        />
        <Separator />

        <RateLimitingSection
          content={sections[6].content}
          rateLimits={sections[6].rateLimits}
        />
        <Separator />

        <ErrorHandlingSection
          content={sections[7].content}
          errorTypes={sections[7].errorTypes}
        />
        <Separator />

        <SdkLibrariesSection
          content={sections[8].content}
          sdks={sections[8].sdks}
        />
        <Separator />

        <BestPracticesSection
          content={sections[9].content}
          bestPractices={sections[9].bestPractices}
        />
      </div>

      {/* Next Steps */}
      <NextStepsCard />
    </div>
  );
};

export default ApiIntegrationGuide;
