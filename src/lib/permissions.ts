
import { RoleType } from "@/types/organization";

// Define permission levels for common operations
export enum PermissionLevel {
  VIEWER = 0,
  MEMBER = 1,
  ADMIN = 2,
  OWNER = 3,
}

// Map roles to permission levels
export const roleToPermissionLevel: Record<string, PermissionLevel> = {
  'viewer': PermissionLevel.VIEWER,
  'member': PermissionLevel.MEMBER,
  'admin': PermissionLevel.ADMIN,
  'owner': PermissionLevel.OWNER,
};

// Define specific permissions
export interface Permission {
  name: string;
  description: string;
  minimumRole: PermissionLevel;
}

// Define all available permissions
export const PERMISSIONS = {
  // Organization permissions
  MANAGE_ORGANIZATION: {
    name: 'manage_organization',
    description: 'Manage organization settings',
    minimumRole: PermissionLevel.OWNER,
  },
  MANAGE_TEAM: {
    name: 'manage_team',
    description: 'Manage team members',
    minimumRole: PermissionLevel.ADMIN,
  },
  INVITE_MEMBERS: {
    name: 'invite_members',
    description: 'Invite new members',
    minimumRole: PermissionLevel.ADMIN,
  },
  
  // Device permissions
  MANAGE_DEVICES: {
    name: 'manage_devices',
    description: 'Create and manage devices',
    minimumRole: PermissionLevel.MEMBER,
  },
  VIEW_DEVICES: {
    name: 'view_devices',
    description: 'View devices',
    minimumRole: PermissionLevel.VIEWER,
  },
  
  // Product permissions
  MANAGE_PRODUCTS: {
    name: 'manage_products',
    description: 'Create and manage product templates',
    minimumRole: PermissionLevel.ADMIN,
  },
  VIEW_PRODUCTS: {
    name: 'view_products',
    description: 'View product templates',
    minimumRole: PermissionLevel.VIEWER,
  },
  
  // Alarm permissions
  MANAGE_ALARMS: {
    name: 'manage_alarms',
    description: 'Create and manage alarms',
    minimumRole: PermissionLevel.MEMBER,
  },
  ACKNOWLEDGE_ALARMS: {
    name: 'acknowledge_alarms',
    description: 'Acknowledge alarms',
    minimumRole: PermissionLevel.VIEWER,
  },
  
  // Data permissions
  MANAGE_DATA_BUCKETS: {
    name: 'manage_data_buckets',
    description: 'Create and manage data buckets',
    minimumRole: PermissionLevel.ADMIN,
  },
  VIEW_DATA: {
    name: 'view_data',
    description: 'View device data',
    minimumRole: PermissionLevel.VIEWER,
  },
  
  // Integration permissions
  MANAGE_ENDPOINTS: {
    name: 'manage_endpoints',
    description: 'Create and manage endpoints',
    minimumRole: PermissionLevel.ADMIN,
  },
  TRIGGER_ENDPOINTS: {
    name: 'trigger_endpoints',
    description: 'Trigger endpoints manually',
    minimumRole: PermissionLevel.MEMBER,
  },
  
  // File permissions
  MANAGE_FILES: {
    name: 'manage_files',
    description: 'Upload and manage files',
    minimumRole: PermissionLevel.MEMBER,
  },
  VIEW_FILES: {
    name: 'view_files',
    description: 'View files',
    minimumRole: PermissionLevel.VIEWER,
  },
} as const;

// Helper function to check if a user has permission
export const hasPermission = (
  userRole: string | null, 
  requiredPermission: Permission
): boolean => {
  // If no user role is provided, deny access
  if (!userRole) return false;
  
  // Get the user's permission level based on their role
  const userPermissionLevel = roleToPermissionLevel[userRole] ?? PermissionLevel.VIEWER;
  
  // Check if the user's permission level is sufficient
  return userPermissionLevel >= requiredPermission.minimumRole;
};

// Custom hook for permission checking components
export const usePermission = (
  userRole: string | null
) => {
  const can = (permission: Permission): boolean => {
    return hasPermission(userRole, permission);
  };
  
  return { can };
};
