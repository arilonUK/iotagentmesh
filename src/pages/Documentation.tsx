
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Code, Settings, Zap, Shield, Database, FileText, ExternalLink } from 'lucide-react';

const Documentation = () => {
  const quickStartSteps = [
    {
      title: "Create Your Organization",
      description: "Set up your organization and invite team members",
      icon: Settings
    },
    {
      title: "Add Your First Device",
      description: "Connect and register your IoT devices",
      icon: Zap
    },
    {
      title: "Configure Products",
      description: "Define product templates and properties",
      icon: Code
    },
    {
      title: "Set Up Data Management",
      description: "Create data buckets and configure storage",
      icon: Database
    }
  ];

  const apiEndpoints = [
    {
      method: "GET",
      endpoint: "/api/devices",
      description: "Retrieve all devices for your organization"
    },
    {
      method: "POST",
      endpoint: "/api/devices",
      description: "Create a new device"
    },
    {
      method: "GET",
      endpoint: "/api/products",
      description: "List all product templates"
    },
    {
      method: "POST",
      endpoint: "/api/data-buckets/{id}/data",
      description: "Send data to a specific bucket"
    }
  ];

  const guides = [
    {
      title: "Device Management",
      description: "Learn how to manage, monitor, and control your IoT devices",
      category: "Core Features",
      readTime: "5 min"
    },
    {
      title: "Data Buckets & Analytics",
      description: "Store, analyze, and visualize your IoT data effectively",
      category: "Data Management",
      readTime: "8 min"
    },
    {
      title: "Alarm Configuration",
      description: "Set up alerts and notifications for your devices",
      category: "Monitoring",
      readTime: "6 min"
    },
    {
      title: "API Integration",
      description: "Integrate with external services using our REST API",
      category: "Development",
      readTime: "10 min"
    },
    {
      title: "Security Best Practices",
      description: "Secure your IoT infrastructure and data",
      category: "Security",
      readTime: "12 min"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Documentation</h1>
          <p className="text-muted-foreground">
            Everything you need to know about our IoT platform
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Getting Started
                </CardTitle>
                <CardDescription>
                  New to our platform? Start here for a quick introduction.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Quick Start Guide
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API Documentation
                </CardTitle>
                <CardDescription>
                  Complete reference for our REST API endpoints.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Explore API
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Guide
                </CardTitle>
                <CardDescription>
                  Best practices for securing your IoT infrastructure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Security Docs
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>
                Our IoT platform provides comprehensive device management, data analytics, and integration capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Core Features</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Device registration and management</li>
                    <li>• Real-time data collection and storage</li>
                    <li>• Customizable dashboards and analytics</li>
                    <li>• Alert and notification system</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Integration Options</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• REST API for custom applications</li>
                    <li>• Webhook endpoints for real-time updates</li>
                    <li>• Third-party service integrations</li>
                    <li>• Data export and backup options</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quickstart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
              <CardDescription>
                Get up and running with our IoT platform in just a few steps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {quickStartSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <step.icon className="h-4 w-4" />
                        <h4 className="font-semibold">{step.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides" className="space-y-6">
          <div className="grid gap-4">
            {guides.map((guide, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      <CardDescription className="mt-1">{guide.description}</CardDescription>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{guide.category}</Badge>
                    <span className="text-xs text-muted-foreground">{guide.readTime} read</span>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>
                Complete documentation for our REST API endpoints.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2">Base URL</h4>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    https://api.iotagentmesh.com/v1
                  </code>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Endpoints</h4>
                  {apiEndpoints.map((endpoint, index) => (
                    <div key={index} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={endpoint.method === 'GET' ? 'default' : 'destructive'}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm">{endpoint.endpoint}</code>
                      </div>
                      <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>
                Sample code and integration examples to get you started quickly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Send Device Data</h4>
                  <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                    <pre>{`curl -X POST https://api.iotagentmesh.com/v1/data-buckets/bucket-id/data \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "device_id": "device-123",
    "timestamp": "2024-01-15T10:30:00Z",
    "data": {
      "temperature": 23.5,
      "humidity": 65.2
    }
  }'`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">JavaScript SDK</h4>
                  <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                    <pre>{`import { IoTAgentMesh } from '@iotagentmesh/sdk';

const client = new IoTAgentMesh({
  apiKey: 'your-api-key'
});

// Send device data
await client.sendData('bucket-id', {
  device_id: 'device-123',
  data: {
    temperature: 23.5,
    humidity: 65.2
  }
});`}</pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documentation;
