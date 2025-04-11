
// This file re-exports all endpoint services for backward compatibility
// New code should import directly from the endpoints directory

export {
  fetchEndpoints,
  createEndpoint,
  updateEndpoint,
  deleteEndpoint,
  triggerEndpoint
} from './endpoints';
