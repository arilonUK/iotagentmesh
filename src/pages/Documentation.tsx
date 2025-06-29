
import React from 'react';
import ApiDocumentationComponent from '@/components/ApiDocumentation';
import DatabaseSchemaChart from '@/components/documentation/DatabaseSchemaChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PolicyTestingSection from '@/components/documentation/PolicyTestingSection';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
          <p className="text-lg text-gray-600">Comprehensive guides and API reference for your platform</p>
        </div>
        
        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
            <TabsTrigger value="api" className="text-base font-medium">API Documentation</TabsTrigger>
            <TabsTrigger value="schema" className="text-base font-medium">Database Schema</TabsTrigger>
            <TabsTrigger value="security" className="text-base font-medium">Security Testing</TabsTrigger>
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
    </div>
  );
};

export default Documentation;
