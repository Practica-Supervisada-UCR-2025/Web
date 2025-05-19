import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  it('renders form fields', () => {
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
    });
  });

  it('enables submit button when form is valid', async () => {
    render(<NotificationForm />);

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Notificación válida' },
    });
    fireEvent.change(screen.getByLabelText(/descripción/i), {
      target: { value: 'Esta es una descripción válida.' },
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enviar notificación/i })).toBeEnabled();
    });
  });

  it('submits form and shows success message', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({ ok: true } as Response);

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
      expect(screen.getByText(/notificación enviada correctamente/i)).toBeInTheDocument();
    });
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
});
