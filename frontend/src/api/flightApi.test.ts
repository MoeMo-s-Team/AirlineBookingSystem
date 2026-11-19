import { afterEach, expect, it, vi } from 'vitest';
import { searchFlights } from './flightApi';

afterEach(() => vi.unstubAllGlobals());

it('passes party size and round-trip time constraints to the nearby search endpoint', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: [] }), {
    headers: { 'Content-Type': 'application/json' },
  }));
  vi.stubGlobal('fetch', fetchMock);
  await searchFlights({ origin: 'HAN', destination: 'SGN', date: '2030-12-20', passengers: 3,
    notBefore: '2030-12-19T12:00:00', notAfterDate: '2030-12-22' });
  const url = new URL(fetchMock.mock.calls[0][0]);
  expect(url.pathname).toBe('/api/flights');
  expect(Object.fromEntries(url.searchParams)).toEqual({ origin: 'HAN', destination: 'SGN', date: '2030-12-20',
    nearby: 'true', passengers: '3', notBefore: '2030-12-19T12:00:00', notAfterDate: '2030-12-22' });
});
