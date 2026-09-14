export const adminRoles = ['super_admin', 'admin', 'staff_catalog', 'staff_orders']

export function hasAdminPermission(user, permission) {
  if (user?.role === 'super_admin') return true
  const key = permission === 'manage_products' ? 'can_manage_inventory' : permission.replace(/^manage_/, 'can_manage_')
  return user?.permissions?.[key] === true || user?.permissions?.[permission] === true
}

export function getAllowedAdminTabs(user) {
  return [
    ['super_admin', 'admin'].includes(user?.role) && 'analytics',
    hasAdminPermission(user, 'manage_orders') && 'orders',
    hasAdminPermission(user, 'manage_products') && 'inventory',
    hasAdminPermission(user, 'manage_taxonomies') && 'taxonomies',
    hasAdminPermission(user, 'manage_appointments') && 'appointments',
    hasAdminPermission(user, 'manage_settings') && 'settings',
    hasAdminPermission(user, 'manage_staff') && 'staff',
  ].filter(Boolean)
}

export function getPrimaryAdminWorkspace(user) {
  if (user?.role === 'staff_catalog' && hasAdminPermission(user, 'manage_products')) return 'inventory'
  if (user?.role === 'staff_orders' && hasAdminPermission(user, 'manage_orders')) return 'orders'
  if (hasAdminPermission(user, 'manage_appointments') && !hasAdminPermission(user, 'manage_orders') && !hasAdminPermission(user, 'manage_products')) return 'appointments'
  return getAllowedAdminTabs(user)[0] || null
}
