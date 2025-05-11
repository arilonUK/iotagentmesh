
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Permission, hasPermission } from '@/lib/permissions';

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders content based on user permissions
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { userRole } = useAuth();
  
  if (hasPermission(userRole, permission)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

export default PermissionGuard;
