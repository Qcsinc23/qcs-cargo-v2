type MaybeUser = {
  role?: unknown;
  id?: unknown;
} | null | undefined;

export const STAFF_ROLES = ['admin', 'staff'] as const;

export function hasRole(user: MaybeUser, roles: readonly string[]): boolean {
  if (!user || typeof user.role !== 'string') return false;
  return roles.includes(user.role);
}

export function isAdminOrStaff(user: MaybeUser): boolean {
  return hasRole(user, STAFF_ROLES);
}
