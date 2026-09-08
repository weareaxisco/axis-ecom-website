import { expect, test } from '@playwright/test'

test('registration validates Moroccan phone format and CNDP consent', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel('First name').fill('Amine')
  await page.getByLabel('Last name').fill('El Idrissi')
  const form = page.locator('main form')
  await form.getByLabel('Email').fill('amine@example.com')
  await form.getByLabel('Phone').fill('0600000000')
  await form.locator('input[type="password"]').fill('secure-password')
  await page.getByRole('button', { name: /create account/i }).click()
  await expect(page.getByText('Use +212 6XX-XXXXXX or +212 7XX-XXXXXX.', { exact: true })).toBeVisible()
  await form.getByLabel('Phone').fill('+212 600-000000')
  const consent = page.locator('input[type="checkbox"]').first()
  await expect(consent).not.toBeChecked()
  await consent.check()
  await expect(consent).toBeChecked()
})
