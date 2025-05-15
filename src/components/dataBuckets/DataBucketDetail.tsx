
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { DataBucketConfig } from '@/types/dataBucket';
import { DataRetentionSettings } from './DataRetentionSettings';
import { useDataRetention } from '@/hooks/useDataRetention';
import { DataExportMenu } from '../exports/DataExportMenu';
import { ReportScheduler } from './ReportScheduler';

interface DataBucketDetailProps {
  bucket: DataBucketConfig;
  onBack: () => void;
  sampleData?: any[];
}

export function DataBucketDetail({ bucket, onBack, sampleData = [] }: DataBucketDetailProps) {
  const { updateRetentionDays, isUpdating } = useDataRetention();
  const [activeTab, setActiveTab] = useState('overview');
  
  const handleRetentionUpdate = async (retentionDays: number) => {
    await updateRetentionDays(bucket.id, retentionDays);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{bucket.name}</h3>
          <p className="text-muted-foreground">{bucket.description || `Data bucket for ${bucket.readingType} readings`}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Buckets
          </Button>
          
          <DataExportMenu 
            data={sampleData} 
            fileName={`${bucket.name}-data`}
          />
          
          <ReportScheduler 
            deviceId={bucket.deviceId} 
            readingType={bucket.readingType} 
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="retention">Data Retention</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Bucket Details</CardTitle>
              <CardDescription>Information about this data bucket</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Reading Type</p>
                  <p className="text-sm">{bucket.readingType}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Storage Backend</p>
                  <p className="text-sm capitalize">{bucket.storageBackend}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Retention Period</p>
                  <p className="text-sm">{bucket.retentionDays} days</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Sampling Interval</p>
                  <p className="text-sm">
                    {bucket.samplingInterval ? `${bucket.samplingInterval} seconds` : 'No downsampling'}
                  </p>
                </div>
              </div>
              
              {bucket.s3Config && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="font-medium">S3 Configuration</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Bucket: {bucket.s3Config.bucketName}</p>
                    <p>Region: {bucket.s3Config.region}</p>
                    {bucket.s3Config.path && <p>Path: {bucket.s3Config.path}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="retention" className="mt-4">
          <DataRetentionSettings 
            bucketId={bucket.id}
            initialRetentionDays={bucket.retentionDays}
            onSave={handleRetentionUpdate}
          />
        </TabsContent>
        
        <TabsContent value="access" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>Manage who can access data from this bucket</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access control settings will be coming in a future update. Currently, data access follows your organization's permission model.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
