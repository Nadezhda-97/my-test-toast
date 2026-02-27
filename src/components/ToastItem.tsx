import React, { useEffect, useRef, useCallback } from 'react';
import type { Toast } from '../types/types';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const duration = toast.duration ?? 5000;

  const remainingRef = useRef(duration);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoveredRef = useRef(false);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      if (!isHoveredRef.current) {
        onRemove(toast.id);
      }
    }, remainingRef.current);
  }, [onRemove, toast.id]);

  useEffect(() => {
    startTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTimer]);

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = remainingRef.current - elapsed;
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (remainingRef.current > 0) {
      startTimer();
    }
  };

  return (
    <div
      className={`toast toast-${toast.type}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span>{toast.message}</span>
      <button onClick={() => onRemove(toast.id)}>x</button>
    </div>
  );
};