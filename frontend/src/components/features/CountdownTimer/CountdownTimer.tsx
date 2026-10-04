import { useState, useEffect, useCallback } from 'react';

export interface CountdownTimerProps {
  endTime: Date;
  onExpire?: () => void;
  className?: string;
}

export function CountdownTimer({ endTime, onExpire, className = '' }: CountdownTimerProps) {
  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const target = endTime.getTime();
    return Math.max(0, Math.floor((target - now) / 1000));
  }, [endTime]);

  const [timeLeft, setTimeLeft] = useState<number>(calculateTimeLeft);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isUrgent = timeLeft < 60;

  return (
    <span 
      className={`
        font-label-md font-bold
        ${isUrgent ? 'text-error' : 'text-primary'}
        ${className}
      `.trim()}
    >
      {formatted}
    </span>
  );
}
