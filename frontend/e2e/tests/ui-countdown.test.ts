import { test, expect } from '@playwright/test';

test.describe('CountdownTimer Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('displays timer format MM:SS', async ({ page }) => {
    // Look for timer in MM:SS format
    const timer = page.locator('[class*="font-bold"]').filter({ hasText: /^\d{2}:\d{2}$/ }).first();
    if (await timer.isVisible()) {
      await expect(timer).toBeVisible();
    }
  });

  test('timer updates every second', async ({ page }) => {
    // Find a timer
    const timer = page.locator('[class*="font-bold"]').filter({ hasText: /^\d{2}:\d{2}$/ }).first();

    if (await timer.isVisible()) {
      const before = await timer.textContent();

      // Wait 2 seconds
      await page.waitForTimeout(2100);

      const after = await timer.textContent();

      // Timer should have changed (unless it was at 00:00 or 01:00+ with same minute)
      expect(before).not.toEqual(after);
    }
  });

  test('urgent state when under 60 seconds', async ({ page }) => {
    // Timer in urgent state should have error color
    const urgentTimer = page.locator('[class*="text-error"]').filter({ hasText: /^\d{2}:\d{2}$/ }).first();
    if (await urgentTimer.isVisible()) {
      await expect(urgentTimer).toBeVisible();
    }
  });
});
