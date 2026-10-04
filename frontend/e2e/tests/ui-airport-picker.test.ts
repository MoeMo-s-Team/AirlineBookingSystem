import { test, expect } from '@playwright/test';

test.describe('AirportPicker Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('opens modal on click', async ({ page }) => {
    // Click on From airport picker
    await page.getByText('From').first().click();

    // Modal should appear
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Search city or airport')).toBeVisible();
  });

  test('closes modal on backdrop click', async ({ page }) => {
    // Open modal
    await page.getByText('From').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Close by clicking backdrop (outside modal)
    await page.mouse.click(10, 10);
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('search filters airports', async ({ page }) => {
    // Open modal
    await page.getByText('From').first().click();

    // Type in search
    const searchInput = page.getByPlaceholder('Search city or airport');
    await searchInput.fill('HAN');

    // Wait for debounced search (300ms + render)
    await page.waitForTimeout(500);

    // Should show Noi Bai
    await expect(page.getByText(/Noi Bai/i)).toBeVisible();
  });

  test('selects airport and closes modal', async ({ page }) => {
    // Open modal
    await page.getByText('From').first().click();

    // Search and select
    const searchInput = page.getByPlaceholder('Search city or airport');
    await searchInput.fill('SGN');
    await page.waitForTimeout(500);

    // Click on first result
    await page.getByText(/Tan Son Nhat/i).click();

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
