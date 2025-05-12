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

// Mock console.error
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
    // Default mock for useSearchParams
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    // Clear console.error mock
    (console.error as jest.Mock).mockClear();
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
      headers: new Headers(),
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
      expect(screen.getByText('Backend authentication failed')).toBeInTheDocument();
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
      expect(screen.getByText('Unknown error')).toBeInTheDocument();
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
      expect(screen.getByText('unknown error')).toBeInTheDocument();
    });
  });

  it('handles successful login with displayName', async () => {
    // Mock successful Firebase auth with displayName
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

    // Verify backend API call uses displayName
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
  });

  it('formats name from email when displayName is null', async () => {
    // Mock successful Firebase auth with null displayName
    const mockUser = {
      user: {
        email: 'bryan.villegasalvarado@ucr.ac.cr',
        displayName: null,
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

    render(<Login />);

    await act(async () => {
      // Fill form
      fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
        target: { value: 'bryan.villegasalvarado@ucr.ac.cr' },
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: 'password123' },
      });

      // Submit form
      fireEvent.click(screen.getByText('Ingresar'));
    });

    // Verify backend API call uses formatted name from email
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      },
      body: JSON.stringify({
        email: 'bryan.villegasalvarado@ucr.ac.cr',
        full_name: 'Bryan Villegasalvarado',
        auth_id: '123',
        auth_token: 'mock-token',
      }),
    });
  });

  it('handles email with dots and underscores in name formatting', async () => {
    // Mock successful Firebase auth with null displayName
    const mockUser = {
      user: {
        email: 'bryan.villegas.alvarado@ucr.ac.cr',
        displayName: null,
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

    render(<Login />);

    await act(async () => {
      // Fill form
      fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
        target: { value: 'bryan.villegas.alvarado@ucr.ac.cr' },
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: 'password123' },
      });

      // Submit form
      fireEvent.click(screen.getByText('Ingresar'));
    });

    // Verify backend API call uses formatted name from email
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      },
      body: JSON.stringify({
        email: 'bryan.villegas.alvarado@ucr.ac.cr',
        full_name: 'Bryan Villegas Alvarado',
        auth_id: '123',
        auth_token: 'mock-token',
      }),
    });
  });

  it('handles empty email in name formatting', async () => {
    // Mock successful Firebase auth with null displayName and email
    const mockUser = {
      user: {
        email: null,
        displayName: null,
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

    // Verify backend API call uses empty string for name
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      },
      body: JSON.stringify({
        email: null,
        full_name: '',
        auth_id: '123',
        auth_token: 'mock-token',
      }),
    });
  });

  it('handles missing fields error from backend', async () => {
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

    // Mock backend response with missing fields
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ 
        missing_fields: {
          email: true,
          full_name: false,
          auth_id: true,
          auth_token: false
        }
      }),
      headers: new Headers(),
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

  it('handles error message from backend response', async () => {
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

    // Mock backend response with error message
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ 
        message: 'Invalid credentials'
      }),
      headers: new Headers(),
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
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('handles error details from backend response', async () => {
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

    // Mock backend response with error details
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ 
        details: 'Token validation failed'
      }),
      headers: new Headers(),
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
      expect(screen.getByText('Token validation failed')).toBeInTheDocument();
    });
  });

  it('handles default error message when no specific error is provided', async () => {
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

    // Mock backend response with no specific error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
      headers: new Headers(),
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

  it('handles network errors during backend call', async () => {
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

    // Mock network error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

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
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('handles empty response from backend', async () => {
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

    // Mock empty response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
      headers: new Headers(),
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

  it('handles malformed JSON response from backend', async () => {
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

    // Mock malformed JSON response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error('Invalid JSON')),
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
      expect(screen.getByText('Invalid JSON')).toBeInTheDocument();
    });
  });

  it('handles null user from Firebase auth', async () => {
    // Mock Firebase auth with null user
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: null
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
      expect(screen.getByText('Cannot read properties of null (reading \'getIdToken\')')).toBeInTheDocument();
    });
  });
}); 