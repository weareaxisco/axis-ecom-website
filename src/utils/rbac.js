export const ROLE_RANKS = {
  super_admin: 30,
  admin: 20,
  staff_catalog: 10,
  staff_orders: 10,
}

export const ASSIGNABLE_ROLES = ['super_admin', 'admin', 'staff_catalog']

export function getRoleRank(role) {
  return ROLE_RANKS[String(role || '').toLowerCase().replace(/[-\s]/g, '_')] || 0
}

export function canModifyTarget(actorRole, targetRole) {
  return getRoleRank(actorRole) > getRoleRank(targetRole)
}

export function getAssignableRoles(actorRole) {
  const actorRank = getRoleRank(actorRole)
  if (String(actorRole || '').toLowerCase().replace(/[-\s]/g, '_') === 'super_admin') return ASSIGNABLE_ROLES
  return ASSIGNABLE_ROLES.filter((role) => getRoleRank(role) < actorRank)
}
