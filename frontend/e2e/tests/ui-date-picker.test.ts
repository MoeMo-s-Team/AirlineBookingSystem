import { test, expect } from '@playwright/test';

test.describe('DatePicker Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('date picker label is visible on home page', async ({ page }) => {
    // Verify DatePicker is rendered via SearchConsole on home page
    // Look for the "Departure" label in the search form
    await expect(page.getByText('Departure').first()).toBeVisible();
  });
});
