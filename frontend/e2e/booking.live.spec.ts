import { test, expect } from '@playwright/test';
import { signIn, completePassengerAndCreateBooking } from './journey';

test('live Supabase login → backend booking → mock payment → confirmed booking', async ({ page }) => {
  test.skip(process.env.E2E_ALLOW_MUTATIONS !== '1', 'Set E2E_ALLOW_MUTATIONS=1 for a dedicated test database.');
  const email = process.env.E2E_CUSTOMER_EMAIL;
  const password = process.env.E2E_CUSTOMER_PASSWORD;
  const date = process.env.E2E_FLIGHT_DATE;
  if (!email || !password || !date) throw new Error('Configure E2E_CUSTOMER_EMAIL, E2E_CUSTOMER_PASSWORD and E2E_FLIGHT_DATE.');
  const query = new URLSearchParams({ origin: process.env.E2E_ORIGIN || 'SGN',
    destination: process.env.E2E_DESTINATION || 'HAN', date, tripType: 'one-way', passengers: '1' });
  await page.addInitScript(() => localStorage.setItem('skywing.language', 'en'));
  await signIn(page, email, password, query.toString());
  const created = page.waitForResponse(r => new URL(r.url()).pathname === '/api/bookings' && r.request().method() === 'POST');
  await completePassengerAndCreateBooking(page, process.env.E2E_FARE_NAME);
  const creation = await created;
  expect(creation.status()).toBe(201);
  const { data: booking } = await creation.json();
  expect(booking.status).toBe('PENDING');
  expect(booking.totalPrice).toBeGreaterThan(0);
  const paymentResponse = page.waitForResponse(r => new URL(r.url()).pathname === '/api/payments' && r.request().method() === 'POST');
  await page.getByRole('button', { name: /Pay with Mock Gateway/ }).click();
  const payment = await paymentResponse;
  expect(payment.ok()).toBeTruthy();
  expect((await payment.json()).data.status).toBe('SUCCESS');
  await expect(page).toHaveURL(new RegExp(`/confirmation/${booking.id}$`));
  await expect(page.getByRole('heading', { name: /Booking Confirmed/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: /Booking Confirmed/ })).toBeVisible();
  await expect(page.getByText(booking.bookingCode, { exact: true }).first()).toBeVisible();
});
