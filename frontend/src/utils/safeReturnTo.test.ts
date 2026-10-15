import { describe, it, expect } from 'vitest';
import { safeReturnTo } from './safeReturnTo';

describe('safeReturnTo', () => {
  it('safeReturnTo rejects external and protocol-relative targets', () => {
    const fallback = '/my-bookings';

    expect(safeReturnTo('https://example.com', fallback)).toBe(fallback);
    expect(safeReturnTo('http://example.com', fallback)).toBe(fallback);
    expect(safeReturnTo('//example.com', fallback)).toBe(fallback);
    expect(safeReturnTo('//evil.com/path', fallback)).toBe(fallback);
    expect(safeReturnTo('/\\example.com', fallback)).toBe(fallback);
    expect(safeReturnTo('javascript:alert(1)', fallback)).toBe(fallback);
    expect(safeReturnTo(null, fallback)).toBe(fallback);
    expect(safeReturnTo(undefined, fallback)).toBe(fallback);
    expect(safeReturnTo('', fallback)).toBe(fallback);
  });

  it('preserves valid same-origin relative paths and query parameters', () => {
    const fallback = '/my-bookings';

    expect(safeReturnTo('/flights?origin=SGN&destination=HAN', fallback)).toBe(
      '/flights?origin=SGN&destination=HAN'
    );
    expect(safeReturnTo('/passenger', fallback)).toBe('/passenger');
    expect(safeReturnTo('/my-bookings', fallback)).toBe('/my-bookings');
  });
});
