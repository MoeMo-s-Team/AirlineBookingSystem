import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useBookingCountdown } from './useBookingCountdown';

afterEach(() => vi.useRealTimers());

describe('useBookingCountdown', () => {
  it('counts down from server time despite a skewed browser clock and does not reset on rerender', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01T00:00:00Z'));
    const { result, rerender } = renderHook(() => useBookingCountdown(
      '2026-12-01T10:15:00+07:00', '2026-12-01T10:00:00+07:00'));
    expect(result.current.secondsLeft).toBe(900);
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.secondsLeft).toBe(895);
    rerender();
    expect(result.current.secondsLeft).toBe(895);
    act(() => vi.advanceTimersByTime(895000));
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isExpired).toBe(true);
    expect(result.current.canPay()).toBe(false);
  });

  it('rejects payment at the deadline even before the next timer tick', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBookingCountdown(new Date(Date.now() + 500).toISOString()));
    expect(result.current.canPay()).toBe(true);
    vi.setSystemTime(Date.now() + 500);
    expect(result.current.canPay()).toBe(false);
  });

  it('treats expired holds as expired immediately and invalid deadlines as unpayable', () => {
    const { result, rerender } = renderHook(({ expiresAt }) => useBookingCountdown(expiresAt),
      { initialProps: { expiresAt: new Date(Date.now() - 1000).toISOString() } });
    expect(result.current.isExpired).toBe(true);
    rerender({ expiresAt: 'invalid' });
    expect(result.current.secondsLeft).toBeNull();
    expect(result.current.canPay()).toBe(false);
  });
});
