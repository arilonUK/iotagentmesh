
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ApiDocumentationComponent from '@/components/ApiDocumentation';
import DatabaseSchemaChart from '@/components/documentation/DatabaseSchemaChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PolicyTestingSection from '@/components/documentation/PolicyTestingSection';

const Documentation = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentation</h1>
          <p className="text-gray-600">Comprehensive guides and API reference for your platform</p>
        </div>
        
        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="api" className="text-sm font-medium">API Documentation</TabsTrigger>
            <TabsTrigger value="schema" className="text-sm font-medium">Database Schema</TabsTrigger>
            <TabsTrigger value="security" className="text-sm font-medium">Security Testing</TabsTrigger>
          </TabsList>

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
    </DashboardLayout>
  );
};

export default Documentation;
