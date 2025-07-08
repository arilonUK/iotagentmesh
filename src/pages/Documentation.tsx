
import React from 'react';
import { Link } from 'react-router-dom';
import ApiDocumentationComponent from '@/components/ApiDocumentation';
import DatabaseSchemaChart from '@/components/documentation/DatabaseSchemaChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PolicyTestingSection from '@/components/documentation/PolicyTestingSection';
import { BookOpen, Database, Shield, Cpu, Bell, BarChart3, Zap } from 'lucide-react';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
          <p className="text-lg text-gray-600">Comprehensive guides and API reference for your platform</p>
        </div>
        
        <Tabs defaultValue="guides" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-12">
            <TabsTrigger value="guides" className="text-base font-medium">Guides</TabsTrigger>
            <TabsTrigger value="api" className="text-base font-medium">API Documentation</TabsTrigger>
            <TabsTrigger value="schema" className="text-base font-medium">Database Schema</TabsTrigger>
            <TabsTrigger value="security" className="text-base font-medium">Security Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="guides" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    Device Management Guide
                  </CardTitle>
                  <CardDescription>
                    Learn how to set up, configure, and manage IoT devices in your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    to="/dashboard/documentation/device-management"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    Read Guide
                    <BookOpen className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Data Buckets & Analytics Guide
                  </CardTitle>
                  <CardDescription>
                    Master data collection, storage, and analytics for your IoT infrastructure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    to="/dashboard/documentation/data-buckets-analytics"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    Read Guide
                    <BookOpen className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Alarm Configuration Guide
                  </CardTitle>
                  <CardDescription>
                    Set up intelligent alerts and monitoring for your devices and systems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    to="/dashboard/documentation/alarm-configuration"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    Read Guide
                    <BookOpen className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    API Integration Guide
                  </CardTitle>
                  <CardDescription>
                    Connect external systems and build custom integrations with our REST API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    to="/dashboard/documentation/api-integration"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    Read Guide
                    <BookOpen className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api" className="mt-0">
            <ApiDocumentationComponent />
          </TabsContent>

          <TabsContent value="schema" className="mt-0">
            <DatabaseSchemaChart />
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <PolicyTestingSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Documentation;
