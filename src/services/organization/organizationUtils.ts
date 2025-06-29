
// Check if organization ID is a fallback (not a real UUID)
export function isFallbackOrganization(orgId: string): boolean {
  return orgId.startsWith('default-org-');
}
