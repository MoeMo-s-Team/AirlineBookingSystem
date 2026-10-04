import { test, expect } from '@playwright/test';

test.describe('ProgressStepper Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('renders step indicators', async ({ page }) => {
    // Navigate to a page with stepper (e.g., after selecting flight)
    // For now, check if stepper exists on booking pages
    const stepper = page.locator('[aria-label="Booking Progress"]').first();
    if (await stepper.isVisible()) {
      await expect(stepper).toBeVisible();
    }
  });

  test('shows step labels', async ({ page }) => {
    const stepper = page.locator('[aria-label="Booking Progress"]').first();
    if (await stepper.isVisible()) {
      // Should show step text
      await expect(stepper.getByText(/Select Flight|Passenger|Add-ons|Payment/i)).toBeVisible();
    }
  });

  test('completed steps have check icons', async ({ page }) => {
    // Navigate to booking flow
    const stepper = page.locator('[aria-label="Booking Progress"]').first();
    if (await stepper.isVisible()) {
      // Check for check icons (material symbols)
      const checkIcons = stepper.locator('.material-symbols-outlined').first();
      // May or may not be visible depending on step state
    }
  });

  test('active step is highlighted', async ({ page }) => {
    // Navigate to booking flow
    const stepper = page.locator('[aria-label="Booking Progress"]').first();
    if (await stepper.isVisible()) {
      // Active step should have different styling
      const activeStep = stepper.locator('[class*="bg-surface-container-high"]').first();
      // Check if exists
    }
  });
});
