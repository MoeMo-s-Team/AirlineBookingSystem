import { useEffect, useMemo, useState } from 'react';

/** Anchor the server's remaining duration locally, so client timezone/clock skew is irrelevant. */
export function useBookingCountdown(expiresAt?: string, serverTime?: string) {
  const deadline = useMemo(() => {
    if (!expiresAt) return null;
    const expiry = Date.parse(expiresAt);
    const server = serverTime ? Date.parse(serverTime) : Date.now();
    if (!Number.isFinite(expiry) || !Number.isFinite(server)) return null;
    return Date.now() + Math.max(0, expiry - server);
  }, [expiresAt, serverTime]);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    setNow(Date.now());
    if (deadline === null) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const refresh = () => setNow(Date.now());
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [deadline]);
  const secondsLeft = deadline === null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));
  return { secondsLeft, isExpired: secondsLeft === 0,
    // Check again on click, even if a background tab has delayed the timer.
    canPay: () => deadline !== null && Date.now() < deadline };
}
