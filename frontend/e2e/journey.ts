import { expect, type Page } from '@playwright/test';

export async function signIn(page: Page, email: string, password: string, flightQuery: string) {
  await page.goto(`/sign-in?returnTo=${encodeURIComponent(`/flights?${flightQuery}`)}`);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/flights\?/);
}

export async function completePassengerAndCreateBooking(page: Page, fareName?: string) {
  await page.getByRole('button', { name: /View Fares/ }).first().click();
  await page.getByRole('button', { name: fareName ? new RegExp(`Select.*${fareName}`, 'i') : /^Select /i }).first().click();
  await page.getByRole('button', { name: /Continue to Passenger Details/ }).click();
  await expect(page).toHaveURL(/\/passenger$/);
  await page.getByPlaceholder('e.g. NGUYEN VAN A').fill('NGUYEN E2E TEST');
  await page.locator('input[type="date"]').fill('1995-01-15');
  await page.getByPlaceholder('e.g. C1234567').fill('E2E123456');
  await page.getByPlaceholder('e.g. 0901234567').fill('0901234567');
  await page.getByRole('button', { name: /Proceed to Services/ }).click();
  await expect(page).toHaveURL(/\/services$/);
  await page.getByRole('button', { name: /Proceed to Secure Payment/ }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByRole('button', { name: /Confirm & Create Booking/ }).click();
  await expect(page).toHaveURL(/\/checkout\?bookingId=\d+/);
}
