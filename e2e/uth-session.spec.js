import { test, expect } from '@playwright/test'

const email = process.env.E2E_EMAIL
const password = process.env.E2E_PASSWORD
const apiUrl = process.env.E2E_API_URL

test.skip(
  !process.env.E2E_APP_URL || !apiUrl || !email || !password,
  'Set E2E_APP_URL, E2E_API_URL, E2E_EMAIL, and E2E_PASSWORD for staging tests.'
)

test('login survives a reload and logout ends the session', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()

  await page.waitForURL('**/home')
  await page.reload()
  await expect(page).toHaveURL(/\/home$/)

  const logoutStatus = await page.evaluate(async (url) => {
    const response = await fetch(`${url}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
    return response.status
  }, apiUrl)

  expect(logoutStatus).toBe(200)
  await page.goto('/home')
  await expect(page).toHaveURL(/\/login$/)
})
