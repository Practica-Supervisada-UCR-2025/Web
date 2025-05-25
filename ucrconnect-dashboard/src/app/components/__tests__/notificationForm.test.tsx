import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import NotificationForm from '@/components/notificationForm';
import "@testing-library/jest-dom";

// Mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('NotificationForm', () => {

  it('renders base component', () => {
    render(<NotificationForm />);

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tópico/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar notificación/i })).toBeDisabled();
  });

  it('shows validation errors on blur', async () => {
    render(<NotificationForm />);

    const titleInput = screen.getByLabelText(/título/i);
    const descriptionInput = screen.getByLabelText(/descripción/i);

    fireEvent.blur(titleInput);
    fireEvent.blur(descriptionInput);

    await waitFor(() => {
      expect(screen.getByText(/al menos 5 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/al menos 10 caracteres/i)).toBeInTheDocument();
      expect(titleInput).toHaveClass('border-red-500');
      expect(descriptionInput).toHaveClass('border-red-500');
    });
  });

  it('shows validation errors on invalid input', async () => {
    render(<NotificationForm />);

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByLabelText(/descripción/i), {
      target: { value: '123' },
    });

    fireEvent.blur(screen.getByLabelText(/título/i));
    fireEvent.blur(screen.getByLabelText(/descripción/i));

    await waitFor(() => {
      expect(screen.getByText(/al menos 5 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/al menos 10 caracteres/i)).toBeInTheDocument();
    });
  });

  it('shows validation errors on long input', async () => {
    render(<NotificationForm />);

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'a'.repeat(101) },
    });
    fireEvent.change(screen.getByLabelText(/descripción/i), {
      target: { value: 'a'.repeat(1001) },
    });

    fireEvent.blur(screen.getByLabelText(/título/i));
    fireEvent.blur(screen.getByLabelText(/descripción/i));

    await waitFor(() => {
      expect(screen.getByText(/no debe superar los 100 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/no debe superar los 1000 caracteres/i)).toBeInTheDocument();
    });
  });

  test('permite seleccionar un tópico en el menú desplegable', () => {
    render(<NotificationForm />);

    const select = screen.getByLabelText(/tópico/i);

    expect(select).toHaveValue('all-users');

    fireEvent.change(select, { target: { value: 'all-users' } });
    fireEvent.blur(select);

    expect(select).toHaveValue('all-users');
  });


  it('enables submit button when form is valid', async () => {
    render(<NotificationForm />);

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Notificación válida' },
    });
    fireEvent.change(screen.getByLabelText(/descripción/i), {
      target: { value: 'Esta es una descripción válida.' },
    });

    fireEvent.blur(screen.getByLabelText(/título/i));
    fireEvent.blur(screen.getByLabelText(/descripción/i));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enviar notificación/i })).toBeEnabled();
    });
  });

  it('submits form and shows success message', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({ ok: true } as Response);
    jest.useFakeTimers()
    render(<NotificationForm />);

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Título válido' },
    });
    fireEvent.change(screen.getByLabelText(/descripción/i), {
      target: { value: 'Descripción suficientemente larga para pasar' },
    });

    fireEvent.blur(screen.getByLabelText(/título/i));
    fireEvent.blur(screen.getByLabelText(/descripción/i));

    const button = screen.getByRole('button', { name: /enviar notificación/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/notificación enviada correctamente/i)).toBeInTheDocument();
    });

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    await waitFor(() =>
      expect(screen.queryByText(/notificación enviada correctamente/i)).not.toBeInTheDocument()
    );

    jest.useRealTimers();
  });

  it('shows error message if request fails', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({ ok: false } as Response);

    render(<NotificationForm />);

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Título válido' },
    });
    fireEvent.change(screen.getByLabelText(/descripción/i), {
      target: { value: 'Descripción suficientemente larga para pasar' },
    });

    const button = screen.getByRole('button', { name: /enviar notificación/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/error al enviar notificación/i)).toBeInTheDocument();
    });
  });

  it('shows error message on invalid form submission', async () => {
    render(<NotificationForm />);

    const titleInput = screen.getByLabelText(/título/i);
    const descriptionInput = screen.getByLabelText(/descripción/i);
    const submitButton = screen.getByRole('button', { name: /enviar notificación/i });

    fireEvent.change(titleInput, { target: { value: '123' } });
    fireEvent.change(descriptionInput, { target: { value: '' } });
    fireEvent.blur(titleInput);
    fireEvent.blur(descriptionInput);

    const form = submitButton.closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText(/Formulario inválido: completa los campos requeridos./i)).toBeInTheDocument();
    });
  });

  it('shows error message on unexpected error', async () => {
    global.fetch = jest.fn(() => {
      return Promise.reject('Error plano');
    }) as jest.Mock;

    render(<NotificationForm />);

    const titleInput = screen.getByLabelText(/título/i);
    const descriptionInput = screen.getByLabelText(/descripción/i);
    const submitButton = screen.getByRole('button', { name: /enviar notificación/i });

    fireEvent.change(titleInput, { target: { value: 'Título válido' } });
    fireEvent.change(descriptionInput, { target: { value: 'Descripción suficientemente larga para pasar' } });
    fireEvent.blur(titleInput);
    fireEvent.blur(descriptionInput);

    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(screen.getByText(/ocurrió un error inesperado/i)).toBeInTheDocument()
    );
  });

});
