
export * from './createAuditLog';
export * from './fetchAuditLogs';
export type * from './types';

// Re-export for backward compatibility
import { createAuditLog } from './createAuditLog';
import { fetchAuditLogs } from './fetchAuditLogs';
import type { AuditLogAction, AuditLogEntry } from './types';

export {
  createAuditLog,
  fetchAuditLogs
};

// Re-export types explicitly with the 'type' keyword
export type {
  AuditLogAction,
  AuditLogEntry
};
