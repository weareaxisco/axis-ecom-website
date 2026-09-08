import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('maison_language', 'en'))
})

test('customer can open the bag, choose Ameex city pricing, and select COD', async ({ page }) => {
  await page.goto('/product/mock-ice-cube-ring')
  await page.getByRole('button', { name: /add to shopping bag/i }).click()
  await expect(page.getByRole('heading', { name: /your bag/i })).toBeVisible()
  await page.getByRole('button', { name: /proceed to checkout/i }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  await page.getByLabel('City').selectOption({ value: 'Marrakech' })
  await expect(page.locator('main').getByText(/45 DH.*day delivery/)).toBeVisible()
  await page.getByLabel('Phone (+212)').fill('+212 600-000000')
  await page.getByRole('button', { name: /continue to payment/i }).click()
  await expect(page.getByText(/cash on delivery/i)).toBeVisible()
  await page.getByLabel(/cash on delivery/i).check()
  await page.getByRole('button', { name: /review order/i }).click()
  await expect(page.getByText(/your journey with the maison/i)).toBeVisible()
})
