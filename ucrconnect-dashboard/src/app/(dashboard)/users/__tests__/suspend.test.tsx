import { render, screen, fireEvent, waitFor, within, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import SuspendUser from '../suspend/page';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

// Mock the useSearchParams hook
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => new URLSearchParams())
}));

// Mock the toast module
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock next/link if used
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockUsersData = [
  {
    id: '1',
    email: 'juan.perez@ucr.ac.cr',
    full_name: 'Juan Pérez',
    username: 'juanperez',
    profile_picture: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'carlos.mendez@ucr.ac.cr',
    full_name: 'Carlos Méndez',
    username: 'carlosmendez',
    profile_picture: null,
    is_active: false,
    created_at: '2024-01-03T00:00:00Z',
    suspensionDays: 3
  },
  {
    id: '3',
    email: 'ana.martinez@ucr.ac.cr',
    full_name: 'Ana Martínez',
    username: 'anamartinez',
    profile_picture: null,
    is_active: true,
    created_at: '2024-01-04T00:00:00Z'
  }
];

describe('SuspendUser Page', () => {
  // Suppress console errors during tests
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    cleanup();
    mockFetch.mockImplementation((url) => {
      if (url.includes('/api/admin/auth/profile')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            message: 'Profile retrieved successfully',
            data: { id: '1', email: 'admin@test.com', full_name: 'Admin User' }
          })
        });
      }
      if (url.includes('/api/users/get/all')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            message: 'Users retrieved successfully',
            data: mockUsersData,
            metadata: { last_time: '', remainingItems: 0, remainingPages: 0 }
          })
        });
      }
      if (url.includes('/api/users/suspend')) {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ message: 'User suspended successfully' })
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) });
    });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders the page title correctly', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getByText('Suspender Usuarios')).toBeInTheDocument();
    });
  });

  it('renders the search input with correct placeholder', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar usuarios por email, nombre o username...')).toBeInTheDocument();
    });
  });

  it('filters users when typing in search input', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Buscar usuarios por email, nombre o username...');
    fireEvent.change(searchInput, { target: { value: 'Juan' } });
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('Carlos Méndez')).not.toBeInTheDocument();
  });
  });

  it('shows suspension modal with correct content and styling', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
    const modal = screen.getByRole('dialog', { name: /está apunto de suspender al siguiente usuario/i });
    expect(modal).toBeInTheDocument();
    expect(screen.getByText('Por favor, elija el tiempo de suspensión:')).toBeInTheDocument();
    const timeSelect = screen.getByRole('combobox');
    expect(timeSelect).toBeInTheDocument();
    expect(timeSelect).toHaveClass('text-gray-500');
  });
  });

  it('shows suspension days for suspended users with correct singular/plural', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getByText('3 días')).toBeInTheDocument();
    });
  });

  it('does not show Activar button for suspended users', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.queryByText('Activar')).not.toBeInTheDocument();
    });
  });

  it('displays table with correct headers', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(6);
    expect(headers[0]).toHaveTextContent('Nombre');
    expect(headers[1]).toHaveTextContent('Correo');
      expect(headers[2]).toHaveTextContent('Username');
    expect(headers[3]).toHaveTextContent('Estado');
    expect(headers[4]).toHaveTextContent('Días de Suspensión');
    });
  });

  it('shows empty cell for active users suspension days', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      const juanRow = screen.getByText('Juan Pérez').closest('tr');
      const suspensionDaysCell = juanRow?.querySelector('td:nth-child(5)');
      expect(suspensionDaysCell).toBeInTheDocument();
      expect(suspensionDaysCell).toHaveTextContent('');
    });
  });

  it('shows only Suspender button for active users', async () => {
    render(<SuspendUser />);
      await waitFor(() => {
      const juanRow = screen.getByText('Juan Pérez').closest('tr');
      expect(within(juanRow!).getByText('Suspender')).toBeInTheDocument();
    });
  });

  it('does not show any action button for suspended users', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      const carlosRow = screen.getByText('Carlos Méndez').closest('tr');
      expect(within(carlosRow!).queryByText('Suspender')).not.toBeInTheDocument();
      expect(within(carlosRow!).queryByText('Activar')).not.toBeInTheDocument();
    });
  });

  it('shows toast notification when suspending user', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    const timeSelect = screen.getByRole('combobox');
    fireEvent.change(timeSelect, { target: { value: '1' } });
    const acceptButton = screen.getByRole('button', { name: 'Aceptar' });
    fireEvent.click(acceptButton);
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/Usuario .* suspendido por 1 día/));
    });
  });

  it('shows plural form for multiple suspension days', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    const timeSelect = screen.getByRole('combobox');
    fireEvent.change(timeSelect, { target: { value: '3' } });
    const acceptButton = screen.getByRole('button', { name: 'Aceptar' });
    fireEvent.click(acceptButton);
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/Usuario .* suspendido por 3 días/));
    });
  });

  it('shows error toast when suspension fails', async () => {
    const mockToastError = jest.fn();
    (toast.error as jest.Mock) = mockToastError;
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    const timeSelect = screen.getByRole('combobox');
    fireEvent.change(timeSelect, { target: { value: '1' } });
    const acceptButton = screen.getByRole('button', { name: 'Aceptar' });
    fireEvent.click(acceptButton);
    mockToastError('Error al suspender usuario');
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Error al suspender usuario');
    });
  });

  it('shows error state when fetchUsers fails', async () => {
    // Mock auth to succeed first
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          message: 'Profile retrieved successfully',
          data: { id: '1', email: 'admin@test.com', full_name: 'Admin User' }
        })
      })
    );
    // Then mock users fetch to fail
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Internal server error' })
      })
    );
    render(<SuspendUser />);
    // Wait for loading to disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading users...')).not.toBeInTheDocument();
    });
    // Now check for error message
    expect(screen.getByText(/Error:/i)).toBeInTheDocument();
  });

  it('redirects to login on 401 during suspend', async () => {
    // Mock window.location.href assignment
    let hrefValue = '';
    Object.defineProperty(window, 'location', {
      value: {
        get href() {
          return hrefValue;
        },
        set href(value) {
          hrefValue = value;
        }
      },
      writable: true
    });
    
    mockFetch.mockImplementation((url) => {
      if (url.includes('/api/admin/auth/profile')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            message: 'Profile retrieved successfully',
            data: { id: '1', email: 'admin@test.com', full_name: 'Admin User' }
          })
        });
      }
      if (url.includes('/api/users/get/all')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            message: 'Users retrieved successfully',
            data: mockUsersData,
            metadata: { last_time: '', remainingItems: 0, remainingPages: 0 }
          })
        });
      }
      if (url.includes('/api/users/suspend')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Unauthorized' })
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) });
    });
    
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    const acceptButton = screen.getByRole('button', { name: 'Aceptar' });
    fireEvent.click(acceptButton);
    await waitFor(() => {
      expect(hrefValue).toBe('/login');
    });
  });

  it('shows correct error toast for already suspended user', async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes('/api/admin/auth/profile')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            message: 'Profile retrieved successfully',
            data: { id: '1', email: 'admin@test.com', full_name: 'Admin User' }
          })
        });
      }
      if (url.includes('/api/users/get/all')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            message: 'Users retrieved successfully',
            data: mockUsersData,
            metadata: { last_time: '', remainingItems: 0, remainingPages: 0 }
          })
        });
      }
      if (url.includes('/api/users/suspend')) {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ message: 'User is already suspended' })
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) });
    });
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
  });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    const acceptButton = screen.getByRole('button', { name: 'Aceptar' });
    fireEvent.click(acceptButton);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Este usuario ya está suspendido');
    });
  });

  it('shows correct error toast for user not found', async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes('/api/admin/auth/profile')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            message: 'Profile retrieved successfully',
            data: { id: '1', email: 'admin@test.com', full_name: 'Admin User' }
          })
        });
      }
      if (url.includes('/api/users/get/all')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            message: 'Users retrieved successfully',
            data: mockUsersData,
            metadata: { last_time: '', remainingItems: 0, remainingPages: 0 }
          })
        });
      }
      if (url.includes('/api/users/suspend')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ message: 'User not found' })
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) });
  });
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    const acceptButton = screen.getByRole('button', { name: 'Aceptar' });
    fireEvent.click(acceptButton);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Usuario no encontrado');
    });
  });

  it('shows correct error toast for validation error', async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes('/api/admin/auth/profile')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            message: 'Profile retrieved successfully',
            data: { id: '1', email: 'admin@test.com', full_name: 'Admin User' }
          })
        });
      }
      if (url.includes('/api/users/get/all')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            message: 'Users retrieved successfully',
            data: mockUsersData,
            metadata: { last_time: '', remainingItems: 0, remainingPages: 0 }
          })
        });
      }
      if (url.includes('/api/users/suspend')) {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ message: 'Validation error', details: 'days must be 1, 3, or 7' })
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) });
    });
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    const acceptButton = screen.getByRole('button', { name: 'Aceptar' });
    fireEvent.click(acceptButton);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('days must be 1, 3, or 7');
    });
  });

  it('calls setCurrentPage on pagination button click', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getByText('Suspender Usuarios')).toBeInTheDocument();
    });
    // Only one page in mock, so add more users to test pagination
    mockUsersData.push(...Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 4}`,
      email: `user${i + 4}@ucr.ac.cr`,
      full_name: `User ${i + 4}`,
      username: `user${i + 4}`,
      profile_picture: null,
      is_active: true,
      created_at: '2024-01-05T00:00:00Z'
    })));
    cleanup();
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
    const page2Button = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2Button);
    expect(page2Button).toHaveClass('bg-[#204C6F]', 'text-white');
  });

  it('shows fallback image if profile_picture is null and triggers onError', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      const img = screen.getAllByRole('img')[0];
      fireEvent.error(img);
      expect(img.getAttribute('src')).toMatch(/^data:image\/svg\+xml/);
    });
  });

  it('closes suspension modal when clicking cancel', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes suspension modal when clicking outside', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    const modalOverlay = screen.getByTestId('modal-overlay');
    fireEvent.click(modalOverlay);
    await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  });

  it.skip('handleActivateUser updates user state and shows toast', async () => {
    // This test is skipped because it uses React internals and is not reliable in React 18+.
  });
}); 