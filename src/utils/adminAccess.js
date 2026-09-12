export const adminRoles = ['super_admin', 'admin', 'staff_catalog', 'staff_orders']

export function hasAdminPermission(user, permission) {
  return user?.role === 'super_admin' || user?.role === 'admin' || user?.permissions?.[permission] === true
}

export function getAllowedAdminTabs(user) {
  return [
    hasAdminPermission(user, 'manage_orders') && 'analytics',
    hasAdminPermission(user, 'manage_orders') && 'orders',
    hasAdminPermission(user, 'manage_products') && 'inventory',
    hasAdminPermission(user, 'manage_products') && ['super_admin', 'admin'].includes(user?.role) && 'taxonomies',
    hasAdminPermission(user, 'manage_appointments') && 'appointments',
    hasAdminPermission(user, 'manage_settings') && 'settings',
    ['super_admin', 'admin'].includes(user?.role) && 'staff',
  ].filter(Boolean)
}

export function getPrimaryAdminWorkspace(user) {
  if (user?.role === 'staff_catalog' && hasAdminPermission(user, 'manage_products')) return 'inventory'
  if (user?.role === 'staff_orders' && hasAdminPermission(user, 'manage_orders')) return 'orders'
  if (hasAdminPermission(user, 'manage_appointments') && !hasAdminPermission(user, 'manage_orders') && !hasAdminPermission(user, 'manage_products')) return 'appointments'
  return getAllowedAdminTabs(user)[0] || null
}
