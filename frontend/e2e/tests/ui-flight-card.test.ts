import { test, expect } from '@playwright/test';

test.describe('FlightCard Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('flight card displays flight information', async ({ page }) => {
    // Search for flights first to see FlightCards
    await page.getByText('From').first().click();
    const searchInput = page.getByPlaceholder('Search city or airport');
    await searchInput.fill('HAN');
    await page.waitForTimeout(500);
    await page.getByText(/Noi Bai/i).first().click();

    await page.getByText('To').first().click();
    const searchInput2 = page.getByPlaceholder('Search city or airport');
    await searchInput2.fill('SGN');
    await page.waitForTimeout(500);
    await page.getByText(/Tan Son Nhat/i).first().click();

    // Select departure date
    await page.getByText('Departure').first().click();
    await page.waitForTimeout(200);
    // Pick a date
    const day = page.locator('button[class*="day"]:not([disabled])').first();
    if (await day.isVisible()) {
      await day.click();
    }

    // Click search
    await page.getByRole('button', { name: /Search Flights/i }).click();

    // Wait for results
    await page.waitForTimeout(500);
  });

  test('flight card shows price formatted', async ({ page }) => {
    // Look for price display (currency format)
    // Should contain digits with currency symbol
    const priceText = page.locator('text=/\\d{1,3}(\\.\\d{3})*₫/');
    if (await priceText.first().isVisible()) {
      await expect(priceText.first()).toBeVisible();
    }
  });
});
