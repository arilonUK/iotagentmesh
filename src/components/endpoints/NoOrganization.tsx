
import React from 'react';
import { useAuth } from '@/contexts/auth';

export const NoOrganization = () => {
  const { currentOrganization, userOrganizations, loading } = useAuth();
  
  console.log('NoOrganization - currentOrganization:', currentOrganization);
  console.log('NoOrganization - userOrganizations:', userOrganizations);
  console.log('NoOrganization - loading:', loading);
  
  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mt-4">
      <p className="text-amber-800 mb-2">No organization selected. Please select an organization to manage endpoints.</p>
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-amber-600 mt-2">
          <p>Debug info:</p>
          <p>Current org: {currentOrganization?.id || 'none'}</p>
          <p>Available orgs: {userOrganizations?.length || 0}</p>
          <p>Loading: {loading.toString()}</p>
        </div>
      )}
    </div>
  );
};
