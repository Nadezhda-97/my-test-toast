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

  it('resumes timer from remaining time after pause (does not reset)', () => {
    const onRemove = jest.fn();

    const toast: Toast = {
      id: '1',
      message: 'Test message',
      type: 'success',
      duration: 3000,
    };

    render(<ToastItem toast={toast} onRemove={onRemove} />);

    const toastElement =
      screen.getByText('Test message').closest('.toast') ||
      screen.getByText('Test message').parentElement;

    expect(toastElement).toBeInTheDocument();

    // Инициализация
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Проходит 2000 мс из 3000
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Ставим на паузу
    act(() => {
      fireEvent.mouseEnter(toastElement!);
    });

    // Прокручиваем время - во время паузы удаление НЕ должно произойти
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onRemove).not.toHaveBeenCalled();

    // Убираем курсор - таймер должен продолжиться
    act(() => {
      fireEvent.mouseLeave(toastElement!);
    });

    // Осталось примерно 1000 мс
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Теперь удаление должно произойти
    expect(onRemove).toHaveBeenCalledWith('1');
  });

  it('automatically removes toast after duration expires', () => {
    const onRemove = jest.fn();

    const toast: Toast = {
      id: '1',
      message: 'Test message',
      type: 'success',
      duration: 3000,
    };

    render(<ToastItem toast={toast} onRemove={onRemove} />);

    // Инициализация
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Прокручиваем полностью duration
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Проверяем, что удаление вызвано
    expect(onRemove).toHaveBeenCalledWith('1');
  });
});
