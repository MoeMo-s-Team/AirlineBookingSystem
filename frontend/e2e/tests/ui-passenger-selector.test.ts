import { test, expect } from '@playwright/test';

test.describe('PassengerSelector Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('opens modal on click', async ({ page }) => {
    // Click on Passengers selector
    await page.getByText('Passengers').first().click();

    // Modal should appear with title "Passengers"
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Passengers' })).toBeVisible();
  });

  test('displays default passenger count', async ({ page }) => {
    // Should show 1 Passenger (default)
    await expect(page.getByText('1 Passenger')).toBeVisible();
  });

  test('increment adults count', async ({ page }) => {
    // Open modal
    await page.getByText('Passengers').first().click();

    // Find and click the + button for Adults
    const incrementButton = page.getByRole('button', { name: '+' }).first();
    await incrementButton.click();

    // Should show 2 Passengers
    await expect(page.getByText('2 Passengers')).toBeVisible();
  });

  test('decrement adults count', async ({ page }) => {
    // Open modal
    await page.getByText('Passengers').first().click();

    // First increment to 2
    await page.getByRole('button', { name: '+' }).first().click();
    await expect(page.getByText('2 Passengers')).toBeVisible();

    // Then decrement back to 1
    const decrementButton = page.getByRole('button', { name: '−' }).first();
    await decrementButton.click();

    // Should show 1 Passenger
    await expect(page.getByText('1 Passenger')).toBeVisible();
  });

  test('cannot decrement below 1 adult', async ({ page }) => {
    // Open modal
    await page.getByText('Passengers').first().click();

    // Decrement should be disabled when at 1 adult
    const decrementButton = page.getByRole('button', { name: '−' }).first();
    await expect(decrementButton).toBeDisabled();
  });

  test('close modal with Done button', async ({ page }) => {
    // Open modal
    await page.getByText('Passengers').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click Done
    await page.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
