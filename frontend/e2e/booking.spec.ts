import { test, expect } from '@playwright/test';
import { signIn, completePassengerAndCreateBooking } from './journey';

const owner = '00000000-0000-4000-8000-000000000001';
const date = '2030-12-20';
const query = `origin=SGN&destination=HAN&date=${date}&tripType=one-way&passengers=1`;

test('nearby date requires explicit selection and preserves the round-trip return date', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('skywing.language', 'en'));
  await page.route('https://e2e.supabase.invalid/**', route => route.fulfill({ json: {} }));
  await page.route('http://127.0.0.1:8080/api/**', async route => {
    const url = new URL(route.request().url());
    const flight = { id: 11, flightNumber: 'NEARBY1', origin: 'SGN', destination: 'HAN',
      departureTime: '2030-12-21T10:00:00', arrivalTime: '2030-12-21T12:00:00',
      basePrice: 1000000, availableSeats: 3, status: 'SCHEDULED', prices: { promo: 800000 } };
    if (url.pathname === '/api/fares') {
      await route.fulfill({ json: { success: true, data: [{ id: 1, code: 'PROMO', name: 'Promo', priceMultiplier: 0.8, active: true }] } });
    } else if (url.pathname === '/api/flights') {
      expect(url.searchParams.get('passengers')).toBe('3');
      expect(url.searchParams.get('notAfterDate')).toBe('2030-12-23');
      const data = url.searchParams.get('date') === date ? [
        { ...flight, id: 10, departureTime: `${date}T10:00:00`, availableSeats: 2 },
        flight, { ...flight, id: 12, flightNumber: 'NEARBY2', basePrice: 800000 },
      ] : [flight];
      await route.fulfill({ json: { success: true, data } });
    } else await route.fulfill({ status: 404, json: { success: false } });
  });
  await page.goto(`/flights?origin=SGN&destination=HAN&date=${date}&returnDate=2030-12-23&tripType=round-trip&passengers=3`);
  await expect(page.getByRole('status').filter({ hasText: 'Nearby flights available' })).toBeVisible();
  await expect(page).toHaveURL(/date=2030-12-20/);
  await expect(page.getByRole('button', { name: /View Fares/ })).toHaveCount(0);
  const suggestion = page.getByRole('button', { name: /2 flights.*From/ });
  await expect(suggestion).toContainText('640,000');
  await expect(suggestion).toContainText('/ passenger');
  await suggestion.click();
  await expect(page).toHaveURL(/date=2030-12-21/);
  expect(new URL(page.url()).searchParams.get('returnDate')).toBe('2030-12-23');
  await expect(page.getByRole('button', { name: /View Fares/ })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Nearby flights available' })).toHaveCount(0);
});

for (const outcome of ['SUCCESS', 'FAILED'] as const) {
  test(`sign in → choose First Class → book → payment ${outcome}`, async ({ page }) => {
    let booking: Record<string, unknown> | null = null;
    let creates = 0;
    let payments = 0;
    const unexpected: string[] = [];
    const flight = { id: 11, flightNumber: 'VN-E2E', origin: 'SGN', destination: 'HAN',
      departureTime: `${date}T10:00:00`, arrivalTime: `${date}T12:00:00`,
      basePrice: 1000000, availableSeats: 10, status: 'SCHEDULED', prices: { first_class: 3500000 } };
    await page.addInitScript(() => localStorage.setItem('skywing.language', 'en'));
    await page.route('https://e2e.supabase.invalid/**', async route => {
      if (new URL(route.request().url()).pathname === '/auth/v1/token') {
        expect(route.request().postDataJSON()).toMatchObject({ email: 'e2e@example.com', password: 'Test-only-password1!' });
        const now = Math.floor(Date.now() / 1000);
        const encode = (data: unknown) => Buffer.from(JSON.stringify(data)).toString('base64url');
        await route.fulfill({ json: { access_token: `${encode({ alg: 'HS256' })}.${encode({ sub: owner, exp: now + 3600 })}.e2e`,
          token_type: 'bearer', refresh_token: 'test-refresh', expires_in: 3600,
          user: { id: owner, email: 'e2e@example.com', aud: 'authenticated', role: 'authenticated',
            app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() } } });
      } else await route.fulfill({ status: 200, json: {} });
    });
    await page.route('http://127.0.0.1:8080/api/**', async route => {
      const request = route.request();
      const path = new URL(request.url()).pathname.replace('/api', '');
      let data: unknown;
      if (path === '/profile/me') data = { id: owner, email: 'e2e@example.com', fullName: 'E2E Customer', role: 'CUSTOMER' };
      else if (path === '/flights') data = [flight];
      else if (path === '/fares') data = [{ id: 4, code: 'FIRST_CLASS', name: 'First Class', priceMultiplier: 3.5, active: true }];
      else if (path === '/services') data = [];
      else if (path === '/notifications/unread-count') data = { count: 0 };
      else if (path === '/notifications') {
        await route.fulfill({ json: { success: true, data: [], pagination: { total: 0, limit: 5, offset: 0 } } }); return;
      } else if (path === '/bookings' && request.method() === 'POST') {
        creates++;
        expect(request.headers().authorization).toMatch(/^Bearer /);
        const body = request.postDataJSON();
        expect(body).toMatchObject({ flightId: 11, fareClassId: 4,
          passengers: [{ fullName: 'NGUYEN E2E TEST', dateOfBirth: '1995-01-15', passportNo: 'E2E123456', phone: '0901234567' }], services: [] });
        booking = { id: 42, bookingCode: 'E2E123', status: 'PENDING', flight,
          fareClass: { id: 4, code: 'FIRST_CLASS', name: 'First Class' }, passengers: body.passengers,
          services: [], totalPrice: 3500000, priceBreakdown: { baseFare: 3500000, servicesTotal: 0, total: 3500000 },
          serverTime: new Date().toISOString(), expiresAt: new Date(Date.now() + 900000).toISOString() };
        data = booking;
      } else if (path === '/bookings/42') data = booking;
      else if (path === '/payments' && request.method() === 'POST') {
        payments++;
        expect(request.postDataJSON()).toEqual({ bookingId: 42, paymentMethod: 'MOCK' });
        expect(booking).not.toBeNull();
        booking!.status = outcome === 'SUCCESS' ? 'CONFIRMED' : 'PAYMENT_FAILED';
        data = { id: 7, bookingId: 42, status: outcome, amount: 3500000, paymentMethod: 'MOCK' };
      } else { unexpected.push(`${request.method()} ${path}`); await route.fulfill({ status: 500, json: { success: false } }); return; }
      await route.fulfill({ json: { success: true, data } });
    });

    await signIn(page, 'e2e@example.com', 'Test-only-password1!', query);
    await completePassengerAndCreateBooking(page, 'First Class');
    const pay = page.getByRole('button', { name: /Pay with Mock Gateway/ });
    await expect(pay).toBeEnabled();
    await pay.click();
    if (outcome === 'SUCCESS') {
      await expect(page).toHaveURL(/\/confirmation\/42$/);
      await expect(page.getByRole('heading', { name: /Booking Confirmed/ })).toBeVisible();
      await expect(page.getByText('E2E123', { exact: true }).first()).toBeVisible();
      await page.reload();
      await expect(page.getByRole('heading', { name: /Booking Confirmed/ })).toBeVisible();
    } else {
      await expect(page.getByText(/PAYMENT_FAILED/)).toBeVisible();
      await expect(pay).toHaveCount(0);
      await expect(page).toHaveURL(/\/checkout\?bookingId=42/);
    }
    expect(creates).toBe(1);
    expect(payments).toBe(1);
    expect(unexpected).toEqual([]);
  });
}
