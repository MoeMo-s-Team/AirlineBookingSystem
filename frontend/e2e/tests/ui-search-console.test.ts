import { test, expect } from '@playwright/test';
import { App } from '../page-objects/App';

test.describe('SearchConsole Component', () => {
  let app: App;

  test.beforeEach(async ({ page }) => {
    app = new App(page);
    await app.goto('/');
    await app.waitForPageLoad();
  });

  test('renders all sub-components', async () => {
    // Trip type toggle
    await expect(app.page.getByRole('button', { name: 'Round Trip' })).toBeVisible();
    await expect(app.page.getByRole('button', { name: 'One Way' })).toBeVisible();

    // Labels
    await expect(app.page.getByText('From').first()).toBeVisible();
    await expect(app.page.getByText('To').first()).toBeVisible();
    await expect(app.page.getByText('Departure').first()).toBeVisible();

    // Search button
    await expect(app.page.getByRole('button', { name: /Search Flights/i })).toBeVisible();
  });

  test('trip type toggle switches correctly', async () => {
    await app.page.getByRole('button', { name: 'One Way' }).click();
    await expect(app.page.getByRole('button', { name: 'One Way' })).toHaveClass(/bg-primary/);

    await app.page.getByRole('button', { name: 'Round Trip' }).click();
    await expect(app.page.getByRole('button', { name: 'Round Trip' })).toHaveClass(/bg-primary/);
  });

  test('swap button is visible', async () => {
    const swapButton = app.page.getByLabel('Swap departure and destination');
    await expect(swapButton).toBeVisible();
  });

  test('validation shows errors on empty submit', async () => {
    await app.page.getByRole('button', { name: /Search Flights/i }).click();

    // Should show validation errors (multiple)
    await expect(app.page.getByText(/Please select/i).first()).toBeVisible();
  });

  test('direct flights checkbox toggles', async () => {
    const checkbox = app.page.getByLabel('Direct flights only');
    await expect(checkbox).toBeVisible();
    await checkbox.click();
  });
});
