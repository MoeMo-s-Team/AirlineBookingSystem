import { test, expect } from '@playwright/test';
import { App } from '../page-objects/App';

test.describe('Header Component', () => {
  let app: App;

  test.beforeEach(async ({ page }) => {
    app = new App(page);
    await app.goto('/');
    await app.waitForPageLoad();
  });

  test('displays SkyWing logo in header', async ({ page }) => {
    // Use more specific selector within header
    const header = page.locator('header');
    await expect(header.getByText('SkyWing').first()).toBeVisible();
  });

  test('displays navigation links', async ({ page }) => {
    const header = page.locator('header');

    await expect(header.getByRole('link', { name: 'Book Flight' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Manage Booking' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Check-in' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Flight Status' })).toBeVisible();
  });

  test('shows Sign In button when not logged in', async ({ page }) => {
    const header = page.locator('header');
    await expect(header.getByRole('link', { name: 'Sign In' })).toBeVisible();
  });

  test('notification bell is visible', async ({ page }) => {
    const header = page.locator('header');
    const notificationButton = header.getByLabel('Notifications');
    await expect(notificationButton).toBeVisible();
  });

  test('navigation links navigate correctly', async ({ page }) => {
    const header = page.locator('header');
    await header.getByRole('link', { name: 'Book Flight' }).click();
    await expect(page).toHaveURL('/');
  });
});
