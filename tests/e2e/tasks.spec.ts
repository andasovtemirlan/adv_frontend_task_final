import { test, expect } from '@playwright/test';

const admin = { email: 'admin@example.com', password: 'admin123' };

async function login(page: any) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(admin.email);
  await page.getByLabel('Password').fill(admin.password);
  await page.getByRole('button', { name: /login/i }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

// Unauthenticated users should be redirected to login
test('tasks route redirects to login when not authenticated', async ({ page }) => {
  await page.goto('/tasks');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
});

// Authenticated users should see the kanban columns
test('tasks page shows kanban columns after login', async ({ page }) => {
  await login(page);
  await page.goto('/tasks');

  await expect(page.getByText('Backlog')).toBeVisible();
  await expect(page.getByText('To Do')).toBeVisible();
  await expect(page.getByText('In Progress')).toBeVisible();
  await expect(page.getByText('Review')).toBeVisible();
  await expect(page.getByText('Done')).toBeVisible();
});
