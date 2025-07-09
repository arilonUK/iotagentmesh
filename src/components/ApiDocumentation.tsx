
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Download, Copy, Check, AlertCircle, Clock, Server } from 'lucide-react';
import { apiGatewayService, ApiDocumentation } from '@/services/apiGatewayService';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ApiDocumentationComponent: React.FC = () => {
  const [documentation, setDocumentation] = useState<ApiDocumentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDocumentation();
  }, []);

  const loadDocumentation = async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await apiGatewayService.getDocumentation();
      if (docs) {
        setDocumentation(docs);
      } else {
        setError('No API documentation available');
      }
    } catch (error) {
      const errorMessage = 'Failed to load API documentation';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPostman = async () => {
    try {
      await apiGatewayService.downloadPostmanCollection();
      toast({
        title: "Success",
        description: "Postman collection downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download Postman collection",
        variant: "destructive"
      });
    }
  };

  const copyApiUrl = async () => {
    const url = 'https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-gateway';
    await navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    toast({
      title: "Copied!",
      description: "API base URL copied to clipboard"
    });
  };

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'get': return 'bg-green-100 text-green-800 border-green-200';
      case 'post': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'put': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delete': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusCode = (status: string) => {
    const code = parseInt(status);
    if (code >= 200 && code < 300) return 'default';
    if (code >= 400 && code < 500) return 'destructive';
    if (code >= 500) return 'destructive';
    return 'secondary';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 animate-spin" />
          <span>Loading API documentation...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadDocumentation}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Reference</h1>
          <p className="text-muted-foreground mt-2">
            Complete documentation for our REST API endpoints
          </p>
          {documentation && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">v{documentation.info.version}</Badge>
              <span className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPostman}>
            <Download className="w-4 h-4 mr-2" />
            Postman Collection
          </Button>
          <Button variant="outline" asChild>
            <a 
              href="/api-documentation-v2.md"
              download="api-documentation-v2.md"
            >
              <Download className="w-4 h-4 mr-2" />
              Download API Docs
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a 
              href={apiGatewayService.getDocumentationUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Interactive Docs
            </a>
          </Button>
        </div>
      </div>

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle>API Information</CardTitle>
          <CardDescription>
            Essential information for integrating with our IoT platform API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Server className="h-4 w-4" />
              Base URL
            </h3>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="flex-1 text-sm font-mono">
                https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-gateway
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyApiUrl}
                className="h-8 w-8 p-0"
              >
                {copiedUrl ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Authentication Methods</h3>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="font-medium">API Key Authentication</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    For device-to-device communication and automated systems
                  </div>
                  <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block">
                    Authorization: Bearer iot_your_api_key_here
                  </code>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium">JWT Authentication</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    For user session-based access via web/mobile applications
                  </div>
                  <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block">
                    Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
                  </code>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Rate Limiting</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Free Tier:</span>
                  <span className="font-mono">1,000/hour</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Professional:</span>
                  <span className="font-mono">10,000/hour</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Enterprise:</span>
                  <span className="font-mono">Custom limits</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Rate limit headers included in all responses
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      {documentation && (
        <Tabs defaultValue="endpoints" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
            <TabsTrigger value="schemas">Data Schemas</TabsTrigger>
            <TabsTrigger value="examples">Code Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-4">
            {/* Group endpoints by tags */}
            {documentation.tags?.map((tag: any) => {
              const tagEndpoints = Object.entries(documentation.paths).filter(([path, pathItem]) => 
                Object.values(pathItem).some((operation: any) => 
                  operation.tags?.includes(tag.name)
                )
              );

              if (tagEndpoints.length === 0) return null;

              return (
                <Card key={tag.name}>
                  <CardHeader>
                    <CardTitle className="text-lg">{tag.name}</CardTitle>
                    <CardDescription>{tag.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tagEndpoints.map(([path, pathItem]) => (
                        <div key={path} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-3 text-lg">{path}</h4>
                          <div className="space-y-3">
                            {Object.entries(pathItem).map(([method, operation]: [string, any]) => {
                              if (method === 'parameters') return null;
                              
                              return (
                                <div key={method} className="border-l-4 border-l-primary/20 pl-4">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Badge 
                                      variant="outline" 
                                      className={`font-mono ${getMethodColor(method)}`}
                                    >
                                      {method.toUpperCase()}
                                    </Badge>
                                    <span className="font-medium">{operation.summary}</span>
                                  </div>
                                  
                                  {operation.description && (
                                    <p className="text-sm text-muted-foreground mb-3">
                                      {operation.description}
                                    </p>
                                  )}

                                  <div className="grid gap-4 md:grid-cols-2">
                                    {operation.parameters && (
                                      <div>
                                        <h5 className="font-medium mb-2 text-sm">Parameters</h5>
                                        <div className="space-y-1">
                                          {operation.parameters.map((param: any, index: number) => (
                                            <div key={index} className="text-xs">
                                              <code className="bg-muted px-1 py-0.5 rounded font-mono">
                                                {param.name}
                                              </code>
                                              <span className="ml-2 text-muted-foreground">
                                                ({param.in}) {param.required && <span className="text-red-500">*</span>}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div>
                                      <h5 className="font-medium mb-2 text-sm">Responses</h5>
                                      <div className="space-y-1">
                                        {Object.entries(operation.responses).map(([status, response]: [string, any]) => (
                                          <div key={status} className="flex items-center gap-2 text-xs">
                                            <Badge variant={getStatusCode(status)} className="text-xs">
                                              {status}
                                            </Badge>
                                            <span className="text-muted-foreground">{response.description}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="schemas" className="space-y-4">
            {documentation.components?.schemas && Object.entries(documentation.components.schemas).map(([name, schema]: [string, any]) => (
              <Card key={name}>
                <CardHeader>
                  <CardTitle className="text-lg">{name}</CardTitle>
                  {schema.description && (
                    <CardDescription>{schema.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-muted p-4 rounded overflow-x-auto">
                    <code>{JSON.stringify(schema, null, 2)}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="examples" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Examples</CardTitle>
                <CardDescription>
                  Common API usage patterns and code examples
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* cURL Examples */}
                <div>
                  <h3 className="font-semibold mb-3">cURL Examples</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">List Devices</h4>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        <code>{`curl -X GET "https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-gateway/api/devices" \\
  -H "Authorization: Bearer iot_your_api_key_here" \\
  -H "Content-Type: application/json"`}</code>
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Create Device</h4>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        <code>{`curl -X POST "https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-gateway/api/devices" \\
  -H "Authorization: Bearer iot_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Temperature Sensor 01",
    "type": "sensor",
    "description": "Living room temperature monitoring"
  }'`}</code>
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Send Device Data</h4>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        <code>{`curl -X POST "https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-gateway/api/devices/{device-id}/readings" \\
  -H "Authorization: Bearer iot_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "timestamp": "2024-01-15T10:30:00Z",
    "readings": {
      "temperature": 23.5,
      "humidity": 65.2
    }
  }'`}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* JavaScript Examples */}
                <div>
                  <h3 className="font-semibold mb-3">JavaScript/Node.js Examples</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Fetch Devices</h4>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        <code>{`const response = await fetch('https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-gateway/api/devices', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer iot_your_api_key_here',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log('Devices:', data.devices);`}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Python Examples */}
                <div>
                  <h3 className="font-semibold mb-3">Python Examples</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Send Data with Requests</h4>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        <code>{`import requests
import json
from datetime import datetime

url = "https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-gateway/api/devices/{device_id}/readings"
headers = {
    "Authorization": "Bearer iot_your_api_key_here",
    "Content-Type": "application/json"
}

data = {
    "timestamp": datetime.utcnow().isoformat() + "Z",
    "readings": {
        "temperature": 23.5,
        "humidity": 65.2,
        "pressure": 1013.25
    }
}

response = requests.post(url, headers=headers, json=data)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ApiDocumentationComponent;
