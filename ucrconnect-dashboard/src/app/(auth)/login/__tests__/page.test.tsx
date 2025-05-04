import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Login from '../page';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  })),
}));

// Mock firebase/app
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
    // Default mock for useSearchParams
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  });

  it('renders login form correctly', () => {
    render(<Login />);
    
    // Check for main elements
    expect(screen.getByText('UCR Connect')).toBeInTheDocument();
    expect(screen.getByText('Inicie sesión en su cuenta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByText('Ingresar')).toBeInTheDocument();
    expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument();
    // Check for password visibility toggle button
    expect(screen.getByRole('button', { name: /toggle password visibility/i })).toBeInTheDocument();
  });

  it('toggles password visibility when clicking the eye icon', () => {
    render(<Login />);
    
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
    
    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click to hide password again
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('shows success toast when logout is successful', () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('logout=success'));
    
    render(<Login />);
    
    expect(toast.success).toHaveBeenCalledWith('Sesión cerrada exitosamente', {
      duration: 2000,
      position: 'top-center',
      style: {
        background: '#333',
        color: '#fff',
      },
    });
  });

  it('shows error toast when logout fails', () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('logout=error'));
    
    render(<Login />);
    
    expect(toast.error).toHaveBeenCalledWith('Error al cerrar sesión', {
      duration: 2000,
      position: 'top-center',
      style: {
        background: '#333',
        color: '#fff',
      },
    });
  });

  it('handles successful login', async () => {
    // Mock successful Firebase auth
    const mockUser = {
      user: {
        email: 'test@example.com',
        displayName: 'Test User',
        uid: '123',
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
      },
    };
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUser);

    // Mock successful backend response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ access_token: 'mock-access-token' }),
    });

    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, href: '' },
      writable: true,
    });

    render(<Login />);

    await act(async () => {
      // Fill form
      fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: 'password123' },
      });

      // Submit form
      fireEvent.click(screen.getByText('Ingresar'));
    });

    // Verify Firebase auth call
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'test@example.com',
        'password123'
      );
    });

    // Verify backend API call
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        full_name: 'Test User',
        auth_id: '123',
        auth_token: 'mock-token',
      }),
    });

    // Verify redirection
    await waitFor(() => {
      expect(window.location.href).toBe('/');
    });

    // Restore window.location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('handles Firebase auth errors', async () => {
    // Mock Firebase auth error
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
      new Error('auth/invalid-credential')
    );

    render(<Login />);

    await act(async () => {
      // Fill form
      fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: 'wrongpassword' },
      });

      // Submit form
      fireEvent.click(screen.getByText('Ingresar'));
    });

    // Check error message
    await waitFor(() => {
      expect(screen.getByText('Nombre de usuario o contraseña incorrectos.')).toBeInTheDocument();
    });
  });

  it('handles Firebase auth errors - user not found', async () => {
    // Mock Firebase auth error
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
      new Error('auth/user-not-found')
    );

    render(<Login />);

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'wrongpassword' },
    });

    // Submit form
    fireEvent.click(screen.getByText('Ingresar'));

    // Check error message
    await waitFor(() => {
      expect(screen.getByText('Nombre de usuario o contraseña incorrectos.')).toBeInTheDocument();
    });
  });

  it('handles Firebase auth errors - wrong password', async () => {
    // Mock Firebase auth error
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
      new Error('auth/wrong-password')
    );

    render(<Login />);

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'wrongpassword' },
    });

    // Submit form
    fireEvent.click(screen.getByText('Ingresar'));

    // Check error message
    await waitFor(() => {
      expect(screen.getByText('Nombre de usuario o contraseña incorrectos.')).toBeInTheDocument();
    });
  });

  it('handles backend API errors', async () => {
    // Mock successful Firebase auth
    const mockUser = {
      user: {
        email: 'test@example.com',
        displayName: 'Test User',
        uid: '123',
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
      },
    };
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUser);

    // Mock failed backend response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Backend authentication failed' }),
    });

    render(<Login />);

    await act(async () => {
      // Fill form
      fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: 'password123' },
      });

      // Submit form
      fireEvent.click(screen.getByText('Ingresar'));
    });

    // Check error message
    await waitFor(() => {
      expect(screen.getByText('Ha ocurrido un error durante el inicio de sesión.')).toBeInTheDocument();
    });
  });

  it('handles unknown errors', async () => {
    // Mock unknown error
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(new Error('Unknown error'));

    render(<Login />);

    await act(async () => {
      // Fill form
      fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: 'password123' },
      });

      // Submit form
      fireEvent.click(screen.getByText('Ingresar'));
    });

    // Check error message
    await waitFor(() => {
      expect(screen.getByText('Ha ocurrido un error durante el inicio de sesión.')).toBeInTheDocument();
    });
  });

  it('handles non-Error type errors', async () => {
    // Mock non-Error type error
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue('string error');

    render(<Login />);

    await act(async () => {
      // Fill form
      fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: 'password123' },
      });

      // Submit form
      fireEvent.click(screen.getByText('Ingresar'));
    });

    // Check error message
    await waitFor(() => {
      expect(screen.getByText('Ha ocurrido un error durante el inicio de sesión.')).toBeInTheDocument();
    });
  });

  it('disables submit button during loading', async () => {
    // Mock a slow response to ensure loading state is visible
    (signInWithEmailAndPassword as jest.Mock).mockImplementation(() => 
      new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<Login />);

    await act(async () => {
      // Fill form
      fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: 'password123' },
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    });

    // Check button is disabled and shows loading text
    const submitButton = screen.getByRole('button', { name: /ingresando/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Ingresando...');
  });

  it('redirects to home page after successful login', async () => {
    // Mock successful Firebase auth
    const mockUser = {
      user: {
        email: 'test@example.com',
        displayName: 'Test User',
        uid: '123',
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
      },
    };
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUser);

    // Mock successful backend response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ access_token: 'mock-access-token' }),
    });

    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, href: '' },
      writable: true,
    });

    render(<Login />);

    await act(async () => {
      // Fill form
      fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: 'password123' },
      });

      // Submit form
      fireEvent.click(screen.getByText('Ingresar'));
    });

    // Wait for the redirect
    await waitFor(() => {
      expect(window.location.href).toBe('/');
    });

    // Restore window.location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('handles error instance check correctly', async () => {
    // Mock successful Firebase auth
    const mockUser = {
      user: {
        email: 'test@example.com',
        displayName: 'Test User',
        uid: '123',
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
      },
    };
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUser);

    // First test: Error instance with specific error message
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('auth/invalid-credential'));

    render(<Login />);

    await act(async () => {
      // Fill form
      fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: 'password123' },
      });

      // Submit form
      fireEvent.click(screen.getByText('Ingresar'));
    });

    // Verify error message for Error instance with specific message
    await waitFor(() => {
      expect(screen.getByText('Nombre de usuario o contraseña incorrectos.')).toBeInTheDocument();
    });

    // Clear the form
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
        target: { value: '' },
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: '' },
      });
    });

    // Second test: Non-Error instance
    (global.fetch as jest.Mock).mockRejectedValueOnce('string error');

    await act(async () => {
      // Fill form again
      fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: 'password123' },
      });

      // Submit form again
      fireEvent.click(screen.getByText('Ingresar'));
    });

    // Verify error message for non-Error instance
    await waitFor(() => {
      expect(screen.getByText('Ha ocurrido un error durante el inicio de sesión.')).toBeInTheDocument();
    });

    // Clear the form again
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
        target: { value: '' },
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: '' },
      });
    });

    // Third test: Error instance with unknown error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('unknown error'));

    await act(async () => {
      // Fill form again
      fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: 'password123' },
      });

      // Submit form again
      fireEvent.click(screen.getByText('Ingresar'));
    });

    // Verify error message for unknown error
    await waitFor(() => {
      expect(screen.getByText('Ha ocurrido un error durante el inicio de sesión.')).toBeInTheDocument();
    });
  });
}); 