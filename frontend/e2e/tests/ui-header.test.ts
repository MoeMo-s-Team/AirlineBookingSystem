import { test, expect } from '@playwright/test';

test.describe('Header Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('displays SkyWing logo in header', async ({ page }) => {
    // Use banner role which is more specific
    const header = page.getByRole('banner');
    await expect(header.getByText('SkyWing').first()).toBeVisible();
  });

  test('displays navigation links', async ({ page }) => {
    const header = page.getByRole('banner');

    // Use .first() to avoid strict mode violation
    await expect(header.getByRole('link', { name: 'Book Flight' }).first()).toBeVisible();
    await expect(header.getByRole('link', { name: 'Manage Booking' }).first()).toBeVisible();
    await expect(header.getByRole('link', { name: 'Check-in' }).first()).toBeVisible();
    await expect(header.getByRole('link', { name: 'Flight Status' }).first()).toBeVisible();
  });

  test('shows Sign In button when not logged in', async ({ page }) => {
    const header = page.getByRole('banner');
    await expect(header.getByRole('link', { name: 'Sign In' }).first()).toBeVisible();
  });

  test('notification bell is visible', async ({ page }) => {
    const header = page.getByRole('banner');
    const notificationButton = header.getByLabel('Notifications');
    await expect(notificationButton).toBeVisible();
  });

  test('navigation links navigate correctly', async ({ page }) => {
    const header = page.getByRole('banner');
    await header.getByRole('link', { name: 'Book Flight' }).first().click();
    await expect(page).toHaveURL('/');
  });
});
