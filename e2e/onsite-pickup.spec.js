import { expect, test } from '@playwright/test'

test('onsite-only creations force boutique pickup at checkout', async ({ page }) => {
  await page.goto('/product/mock-ice-cube-ring')
  await page.evaluate(() => localStorage.setItem('maison_cart_items', JSON.stringify([{ id: 'onsite-test', cartKey: 'onsite-test', name: 'Private Creation', price: 500000, quantity: 1, onsite_only: true }])))
  await page.goto('/checkout')
  await expect(page.getByText(/private boutique pickup/i).first()).toBeVisible()
  await expect(page.getByText(/Onsite Boutique Pickup — 0 DH/i)).toBeVisible()
  await expect(page.getByText(/Ameex delivery across Morocco/i)).not.toBeVisible()
})
