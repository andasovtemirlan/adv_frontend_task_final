import { test, expect } from '@playwright/test';

const admin = { email: 'admin@example.com', password: 'admin123' };

// Basic smoke test to ensure the login page renders and key elements exist
// Assumes dev server is running at baseURL (http://localhost:3000 by default)
test('login page renders form inputs and button', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByText('Project Manager')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Login' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
});

test('valid credentials log in and set auth token', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(admin.email);
  await page.getByLabel('Password').fill(admin.password);
  await page.getByRole('button', { name: /login/i }).click();

  // After login we should leave /login and have a token in storage
  await expect(page).not.toHaveURL(/\/login/);
  const token = await page.evaluate(() => localStorage.getItem('auth_token'));
  expect(token).toBeTruthy();
});

test('invalid credentials show an error', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(admin.email);
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: /login/i }).click();

  await expect(page.getByText(/invalid email or password/i)).toBeVisible();
});
