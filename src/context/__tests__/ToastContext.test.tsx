import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../ToastContext';

jest.useFakeTimers();

const TestComponent = () => {
  const { addToast } = useToast();

  return (
    <button
      onClick={() =>
        addToast({ message: 'Error', type: 'error', duration: 3000 })
      }
    >
      Show Toast
    </button>
  );
};

describe('ToastContext - Anti-spam / deduplication', () => {
  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('does not create duplicate toasts and resets timer', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByText('Show Toast');

    // Первый вызов
    act(() => {
      fireEvent.click(button);
      jest.advanceTimersByTime(0);
    });

    // Проверяем, что тост появился
    expect(screen.getByText('Error')).toBeInTheDocument();

    // Второй вызов - не должен создавать дубликат, таймер сбрасывается
    act(() => {
      fireEvent.click(button);
      jest.advanceTimersByTime(0);
    });

    const toastElements = screen.getAllByText('Error');
    expect(toastElements).toHaveLength(1);

    // Таймер ещё не истёк - тост должен быть
    act(() => {
      jest.advanceTimersByTime(2999);
    });
    expect(screen.getByText('Error')).toBeInTheDocument();

    // Прокрутка ещё 1 мс - теперь тост удаляется
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });
});
