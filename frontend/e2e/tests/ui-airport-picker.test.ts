import { test, expect } from '@playwright/test';

test.describe('AirportPicker Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('airport picker trigger is visible', async ({ page }) => {
    await expect(page.getByText('From').first()).toBeVisible();
  });

  test('modal opens on click', async ({ page }) => {
    await page.getByText('From').first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3000 });
    await expect(page.getByPlaceholder('Search city or airport')).toBeVisible();
  });

  test('Escape key closes modal', async ({ page }) => {
    await page.getByText('From').first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3000 });

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 });
  });

  test('search filters airports', async ({ page }) => {
    await page.getByText('From').first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3000 });

    const searchInput = page.getByPlaceholder('Search city or airport');
    await searchInput.fill('HAN');
    await page.waitForTimeout(500);

    await expect(page.getByText(/Noi Bai/i).first()).toBeVisible();
  });

  test('selects airport and closes modal', async ({ page }) => {
    await page.getByText('From').first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3000 });

    const searchInput = page.getByPlaceholder('Search city or airport');
    await searchInput.fill('SGN');
    await page.waitForTimeout(500);

    await page.getByText(/Tan Son Nhat/i).first().click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 });
  });
});
