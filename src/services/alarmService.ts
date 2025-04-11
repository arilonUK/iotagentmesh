
// This file re-exports all alarm services for backward compatibility
// New code should import directly from the alarms directory

export {
  fetchAlarms,
  createAlarm,
  updateAlarm,
  deleteAlarm
} from './alarms';
