import { test, expect } from '@playwright/test';

test.describe('DatePicker Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('opens calendar modal on click', async ({ page }) => {
    // Click on Departure date picker
    await page.getByText('Departure').first().click();

    // Calendar modal should appear
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('closes modal on backdrop click', async ({ page }) => {
    // Open modal
    await page.getByText('Departure').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Close by clicking backdrop
    await page.mouse.click(10, 10);
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('closes modal on Escape key', async ({ page }) => {
    // Open modal
    await page.getByText('Departure').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('displays month navigation', async ({ page }) => {
    // Open modal
    await page.getByText('Departure').first().click();

    // Should have navigation buttons
    const navButtons = page.locator('button[class*="nav_button"]');
    await expect(navButtons.first()).toBeVisible();
  });
});
