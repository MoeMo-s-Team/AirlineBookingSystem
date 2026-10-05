import { test, expect } from '@playwright/test';

test.describe('Modal Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Escape key closes modal', async ({ page }) => {
    await page.getByText('From').first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3000 });

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 });
  });

  test('close button works', async ({ page }) => {
    await page.getByText('From').first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3000 });

    await page.getByLabel('Close modal').click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 });
  });

  test('renders children content', async ({ page }) => {
    await page.getByText('From').first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3000 });
    await expect(page.getByPlaceholder('Search city or airport')).toBeVisible();
  });

  test('does not render when isOpen is false', async ({ page }) => {
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
