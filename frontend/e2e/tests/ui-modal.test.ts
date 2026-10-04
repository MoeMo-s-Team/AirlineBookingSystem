import { test, expect } from '@playwright/test';

test.describe('Modal Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('closes on backdrop click', async ({ page }) => {
    // Open a modal (AirportPicker)
    await page.getByText('From').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click on backdrop (modal backdrop)
    const backdrop = page.locator('[data-testid="modal-backdrop"]').first();
    await backdrop.click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('closes on Escape key', async ({ page }) => {
    // Open a modal
    await page.getByText('From').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('close button works', async ({ page }) => {
    // Open a modal
    await page.getByText('From').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click close button
    await page.getByLabel('Close modal').click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('renders with title', async ({ page }) => {
    // Open a modal
    await page.getByText('From').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Should have title "From" or similar
    await expect(page.getByRole('heading', { name: /From|Search/i })).toBeVisible();
  });

  test('renders children content', async ({ page }) => {
    // Open a modal
    await page.getByText('From').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Should have search input inside
    await expect(page.getByPlaceholder('Search city or airport')).toBeVisible();
  });

  test('does not render when isOpen is false', async ({ page }) => {
    // Initially no dialog should be visible
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
