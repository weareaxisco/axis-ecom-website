import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('maison_language', 'en'))
})

test('mobile footer accordion exposes accessible destination links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const footer = page.locator('footer')
  const section = footer.getByRole('button', { name: 'Service & Support' })
  await expect(section).toHaveAttribute('aria-expanded', 'false')
  await section.click()
  await expect(section).toHaveAttribute('aria-expanded', 'true')
  await expect(footer.getByRole('link', { name: 'Care guide' })).toHaveAttribute('href', '/care-guide')
})
