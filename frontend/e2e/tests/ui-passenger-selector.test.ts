import { test, expect } from '@playwright/test';

test.describe('PassengerSelector Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('passenger selector trigger is visible', async ({ page }) => {
    await expect(page.getByText('Passengers').first()).toBeVisible();
  });

  test('displays default passenger count', async ({ page }) => {
    await expect(page.getByText('1 Passenger')).toBeVisible();
  });

  test('modal opens on click', async ({ page }) => {
    await page.getByText('Passengers').first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('heading', { name: 'Passengers' })).toBeVisible();
  });

  test('Done button closes modal', async ({ page }) => {
    await page.getByText('Passengers').first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3000 });

    await page.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 });
  });
});
