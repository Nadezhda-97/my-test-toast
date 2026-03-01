import React, { useState, type ReactNode, createContext, useContext } from 'react';
import type { Toast } from '../types/types';
import { ToastItem } from '../components/ToastItem';

interface ToastContextProps {
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (newToast: Omit<Toast, 'id'>) => {
  setToasts((prev) => {
    const existing = prev.find(
      (t) =>
        t.message === newToast.message &&
        t.type === newToast.type
    );

    if (existing) {
      return prev.map((t) =>
        t.id === existing.id
          ? {
              ...t,
              duration: newToast.duration ?? 5000,
              updatedAt: Date.now(),
            }
          : t
      );
    }

    return [
      ...prev,
      {
        ...newToast,
        id: String(Date.now()),
        updatedAt: Date.now(),
      },
    ];
  });
};

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      <ToastContext.Provider value={{ addToast }}>
        {children}
        <div className="toast-list">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </div>
      </ToastContext.Provider>
    </>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};