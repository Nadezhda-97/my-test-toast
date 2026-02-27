import React, { useEffect, useRef, useState } from 'react';
import type { Toast } from '../types/types';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const duration = toast.duration ?? 5000;

  const [remaining, setRemaining] = useState(duration);
  const [progress, setProgress] = useState(100);

  const remainingRef = useRef(duration);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isHoveredRef = useRef(false);
  const onRemoveRef = useRef(onRemove);
  const toastIdRef = useRef(toast.id);

  // Обновляем ref при изменении пропсов
  useEffect(() => {
    onRemoveRef.current = onRemove;
    toastIdRef.current = toast.id;
  }, [onRemove, toast.id]);

  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const updateProgress = () => {
    if (isHoveredRef.current) return;
    
    const elapsed = Date.now() - startTimeRef.current;
    const newRemaining = Math.max(0, remainingRef.current - elapsed);
    const newProgress = (newRemaining / duration) * 100;
    
    setRemaining(newRemaining);
    setProgress(newProgress);
    
    if (newRemaining > 0) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const startTimer = () => {
    clearTimers();
    
    startTimeRef.current = Date.now();
    
    animationFrameRef.current = requestAnimationFrame(updateProgress);
    
    timerRef.current = setTimeout(() => {
      if (!isHoveredRef.current) {
        onRemoveRef.current(toastIdRef.current);
      }
    }, remainingRef.current);
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    clearTimers();
    
    const elapsed = Date.now() - startTimeRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    setRemaining(remainingRef.current);
    setProgress((remainingRef.current / duration) * 100);
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (remainingRef.current > 0) {
      startTimer();
    }
  };

  // Инициализация
  useEffect(() => {
    remainingRef.current = duration;
    setRemaining(duration);
    setProgress(100);
    startTimer();

    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}с`;
  };

  return (
    <div
      className={`toast toast-${toast.type}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative' }}
    >
      {/* Контент уведомления (используем существующие стили из CSS) */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        <span>{toast.message}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {duration > 0 && (
            <span style={{ fontSize: '12px', opacity: 0.7 }}>
              {formatTime(remaining)}
            </span>
          )}
          <button onClick={() => onRemove(toast.id)}>×</button>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          width: `${progress}%`,
          background: 'rgba(255, 255, 255, 0.5)',
          transition: isHoveredRef.current ? 'none' : 'width 0.1s linear',
          borderBottomLeftRadius: '6px',
        }}
      />
    </div>
  );
};