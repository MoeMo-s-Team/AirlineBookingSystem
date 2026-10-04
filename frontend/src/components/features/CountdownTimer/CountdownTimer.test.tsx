import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CountdownTimer } from './CountdownTimer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders time in MM:SS format', () => {
    const now = new Date(2026, 0, 1, 12, 0, 0);
    vi.setSystemTime(now);

    const endTime = new Date(now.getTime() + 125 * 1000); // 2m 5s

    render(<CountdownTimer endTime={endTime} />);
    expect(screen.getByText('02:05')).toBeInTheDocument();
  });

  it('updates every second and triggers onExpire on countdown end', () => {
    const now = new Date(2026, 0, 1, 12, 0, 0);
    vi.setSystemTime(now);

    const endTime = new Date(now.getTime() + 2 * 1000);
    const handleExpire = vi.fn();

    render(<CountdownTimer endTime={endTime} onExpire={handleExpire} />);
    expect(screen.getByText('00:02')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('00:01')).toBeInTheDocument();
    expect(handleExpire).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(handleExpire).toHaveBeenCalledTimes(1);
  });

  it('applies urgent style when remaining time is under 60 seconds', () => {
    const now = new Date(2026, 0, 1, 12, 0, 0);
    vi.setSystemTime(now);

    const endTime = new Date(now.getTime() + 45 * 1000);

    render(<CountdownTimer endTime={endTime} />);
    const timerElem = screen.getByText('00:45');
    expect(timerElem).toHaveClass('text-error');
  });

  it('applies custom className', () => {
    const now = new Date(2026, 0, 1, 12, 0, 0);
    vi.setSystemTime(now);

    const endTime = new Date(now.getTime() + 100 * 1000);

    render(<CountdownTimer endTime={endTime} className="custom-timer-class" />);
    expect(screen.getByText('01:40')).toHaveClass('custom-timer-class');
  });
});
