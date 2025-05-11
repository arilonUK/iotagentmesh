
// This file is now just a wrapper around the new services for backward compatibility
import { authInvitationService } from '@/services/authInvitationService';
import { invitationService } from '@/services/invitationService';
import { InvitationType, CreateInvitationParams } from '@/types/invitation';

// Re-export the types
export type { InvitationType, CreateInvitationParams };

// Combine all services into one object for backward compatibility
export const invitationServices = {
  // Auth-related services
  signUp: authInvitationService.signUp,
  acceptInvitation: authInvitationService.acceptInvitation,
  
  // Invitation management services
  createInvitation: invitationService.createInvitation,
  getOrganizationInvitations: invitationService.getOrganizationInvitations,
  deleteInvitation: invitationService.deleteInvitation,
  resendInvitation: invitationService.resendInvitation,
};
