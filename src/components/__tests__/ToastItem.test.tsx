import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastItem } from '../ToastItem';
import type { Toast } from '../../types/types';

// Мокаем requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

jest.useFakeTimers();

describe('ToastItem Smart Timer', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('pauses timer on mouseEnter and does not remove toast', () => {
    const onRemove = jest.fn();

    const toast: Toast = {
      id: '1',
      message: 'Test message',
      type: 'success',
      duration: 3000,
    };

    render(<ToastItem toast={toast} onRemove={onRemove} />);

    // Находим элемент тоста
    const toastElement = screen.getByText('Test message').closest('.toast') || 
      screen.getByText('Test message').parentElement;
    
    expect(toastElement).toBeInTheDocument();

    // Ждем инициализации
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Наводим курсор
    act(() => {
      fireEvent.mouseEnter(toastElement!);
    });

    // Прокручиваем время больше duration
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    // Проверяем, что удаление НЕ вызвано
    expect(onRemove).not.toHaveBeenCalled();

    // Убираем курсор
    act(() => {
      fireEvent.mouseLeave(toastElement!);
    });

    // Таймер должен продолжиться
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Теперь должно быть вызвано удаление
    expect(onRemove).toHaveBeenCalledWith('1');
  });
});
