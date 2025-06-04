
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DatabaseSchemaChart from '@/components/documentation/DatabaseSchemaChart';

const DatabaseSchema = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <DatabaseSchemaChart />
      </div>
    </DashboardLayout>
  );
};

export default DatabaseSchema;
