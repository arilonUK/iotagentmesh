
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Download, Copy, Check } from 'lucide-react';
import { apiGatewayService, ApiDocumentation } from '@/services/apiGatewayService';
import { useToast } from '@/hooks/use-toast';

const ApiDocumentationComponent: React.FC = () => {
  const [documentation, setDocumentation] = useState<ApiDocumentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDocumentation();
  }, []);

  const loadDocumentation = async () => {
    try {
      const docs = await apiGatewayService.getDocumentation();
      setDocumentation(docs);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load API documentation",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive API reference for the IoT Platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPostman}>
            <Download className="w-4 h-4 mr-2" />
            Postman Collection
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

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Quick start guide for using the IoT Platform API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Base URL</h3>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="flex-1 text-sm">
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

          <div>
            <h3 className="font-semibold mb-2">Authentication</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Include your API key in the Authorization header:
            </p>
            <div className="p-3 bg-muted rounded-lg">
              <code className="text-sm">
                Authorization: Bearer iot_your_api_key_here
              </code>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Content Type</h3>
            <p className="text-sm text-muted-foreground mb-2">
              All requests should include the JSON content type header:
            </p>
            <div className="p-3 bg-muted rounded-lg">
              <code className="text-sm">
                Content-Type: application/json
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {documentation && (
        <Tabs defaultValue="endpoints" className="space-y-4">
          <TabsList>
            <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
            <TabsTrigger value="schemas">Data Schemas</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-4">
            {Object.entries(documentation.paths).map(([path, pathItem]) => (
              <Card key={path}>
                <CardHeader>
                  <CardTitle className="text-lg">{path}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(pathItem).map(([method, operation]: [string, any]) => {
                      if (method === 'parameters') return null;
                      
                      return (
                        <div key={method} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge 
                              variant="outline" 
                              className={`font-mono ${getMethodColor(method)}`}
                            >
                              {method.toUpperCase()}
                            </Badge>
                            <h4 className="font-semibold">{operation.summary}</h4>
                          </div>
                          
                          {operation.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {operation.description}
                            </p>
                          )}

                          {operation.parameters && (
                            <div className="mb-3">
                              <h5 className="font-medium mb-2">Parameters</h5>
                              <div className="space-y-2">
                                {operation.parameters.map((param: any, index: number) => (
                                  <div key={index} className="text-sm">
                                    <code className="bg-muted px-2 py-1 rounded">
                                      {param.name}
                                    </code>
                                    <span className="ml-2 text-muted-foreground">
                                      ({param.in}) - {param.description}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {operation.requestBody && (
                              <div>
                                <h5 className="font-medium mb-2">Request Body</h5>
                                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                  {JSON.stringify(
                                    operation.requestBody.content?.['application/json']?.schema,
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            )}

                            <div>
                              <h5 className="font-medium mb-2">Responses</h5>
                              <div className="space-y-2">
                                {Object.entries(operation.responses).map(([status, response]: [string, any]) => (
                                  <div key={status} className="text-sm">
                                    <Badge variant={status.startsWith('2') ? 'default' : 'destructive'}>
                                      {status}
                                    </Badge>
                                    <span className="ml-2">{response.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="schemas" className="space-y-4">
            {documentation.components?.schemas && Object.entries(documentation.components.schemas).map(([name, schema]: [string, any]) => (
              <Card key={name}>
                <CardHeader>
                  <CardTitle>{name}</CardTitle>
                  {schema.description && (
                    <CardDescription>{schema.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-muted p-4 rounded overflow-x-auto">
                    {JSON.stringify(schema, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ApiDocumentationComponent;
