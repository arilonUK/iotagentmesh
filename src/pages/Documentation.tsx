import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ApiDocumentation from '@/components/documentation/ApiDocumentation';
import DatabaseSchemaChart from '@/components/documentation/DatabaseSchemaChart';
import StoryMap from '@/components/documentation/StoryMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PolicyTestingSection from '@/components/documentation/PolicyTestingSection';

const Documentation = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="api">API Documentation</TabsTrigger>
            <TabsTrigger value="schema">Database Schema</TabsTrigger>
            <TabsTrigger value="security">Security Testing</TabsTrigger>
            <TabsTrigger value="story">Story Map</TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="mt-8">
            <ApiDocumentation />
          </TabsContent>

          <TabsContent value="schema" className="mt-8">
            <DatabaseSchemaChart />
          </TabsContent>

          <TabsContent value="security" className="mt-8">
            <PolicyTestingSection />
          </TabsContent>

          <TabsContent value="story" className="mt-8">
            <StoryMap />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Documentation;
