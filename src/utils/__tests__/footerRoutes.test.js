import { describe, expect, it } from 'vitest'
import { footerDestinationRoutes } from '../footerRoutes'

describe('footer destination routes', () => {
  it('keeps every public footer destination mapped to a non-placeholder route', () => {
    expect(footerDestinationRoutes).toHaveLength(11)
    expect(footerDestinationRoutes.every((route) => route.startsWith('/') && route !== '#')).toBe(true)
    expect(new Set(footerDestinationRoutes).size).toBe(footerDestinationRoutes.length)
  })
})
