
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ApiDocumentationComponent from '@/components/ApiDocumentation';
import DatabaseSchemaChart from '@/components/documentation/DatabaseSchemaChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PolicyTestingSection from '@/components/documentation/PolicyTestingSection';

const Documentation = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api">API Documentation</TabsTrigger>
            <TabsTrigger value="schema">Database Schema</TabsTrigger>
            <TabsTrigger value="security">Security Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="mt-8">
            <ApiDocumentationComponent />
          </TabsContent>

          <TabsContent value="schema" className="mt-8">
            <DatabaseSchemaChart />
          </TabsContent>

          <TabsContent value="security" className="mt-8">
            <PolicyTestingSection />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Documentation;
