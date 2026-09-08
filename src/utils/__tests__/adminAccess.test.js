import { describe, expect, it } from 'vitest'
import { getAllowedAdminTabs, getPrimaryAdminWorkspace, hasAdminPermission } from '../adminAccess'

describe('admin workspace access', () => {
  it('locks catalog staff to inventory', () => {
    const user = { role: 'staff_catalog', permissions: { manage_products: true } }
    expect(getPrimaryAdminWorkspace(user)).toBe('inventory')
    expect(getAllowedAdminTabs(user)).toEqual(['inventory'])
    expect(hasAdminPermission(user, 'manage_orders')).toBe(false)
  })

  it('locks order staff to orders and analytics', () => {
    const user = { role: 'staff_orders', permissions: { manage_orders: true } }
    expect(getPrimaryAdminWorkspace(user)).toBe('orders')
    expect(getAllowedAdminTabs(user)).toEqual(['analytics', 'orders'])
  })

  it('gives appointment-only staff only the appointment workspace', () => {
    const user = { role: 'staff_catalog', permissions: { manage_appointments: true } }
    expect(getPrimaryAdminWorkspace(user)).toBe('appointments')
    const appointmentUser = { role: 'admin', permissions: { manage_appointments: true } }
    expect(getAllowedAdminTabs(appointmentUser)).toContain('appointments')
  })
})
