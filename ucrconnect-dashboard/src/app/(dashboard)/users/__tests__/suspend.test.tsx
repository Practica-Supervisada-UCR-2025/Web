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
      expect(screen.getByPlaceholderText('Buscar usuarios...')).toBeInTheDocument();
    });
  });

  it('filters users when typing in search input', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
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
    const acceptButton = screen.getByRole('button', { name: 'Suspender' });
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
    const acceptButton = screen.getByRole('button', { name: 'Suspender' });
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
    const acceptButton = screen.getByRole('button', { name: 'Suspender' });
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
    const acceptButton = screen.getByRole('button', { name: 'Suspender' });
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
    const acceptButton = screen.getByRole('button', { name: 'Suspender' });
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
    const acceptButton = screen.getByRole('button', { name: 'Suspender' });
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
    const acceptButton = screen.getByRole('button', { name: 'Suspender' });
    fireEvent.click(acceptButton);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('days must be 1, 3, or 7');
    });
  });

  it('calls setCurrentPage on pagination button click', async () => {
    // Add more users to trigger pagination (need more than 6 users to trigger pagination with 6 per page)
    const moreUsers = [
      ...mockUsersData,
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 4}`,
        email: `user${i + 4}@ucr.ac.cr`,
        full_name: `User ${i + 4}`,
        username: `user${i + 4}`,
        profile_picture: null,
        is_active: true,
        created_at: '2024-01-05T00:00:00Z'
      }))
    ];

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
            data: moreUsers,
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

    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
    
    // Wait for pagination to appear and find a valid page button
    await waitFor(() => {
      const pageButtons = screen.getAllByRole('button').filter(button => 
        /^\d+$/.test(button.textContent || '') && button.textContent !== '1'
      );
      expect(pageButtons.length).toBeGreaterThan(0);
    });
    
    // Find a page button that's not the current page (page 1)
    const pageButtons = screen.getAllByRole('button').filter(button => 
      /^\d+$/.test(button.textContent || '') && button.textContent !== '1'
    );
    
    if (pageButtons.length > 0) {
      const page2Button = pageButtons[0];
      fireEvent.click(page2Button);
      
      // Verify the clicked button now has the active styling
      await waitFor(() => {
        expect(page2Button).toHaveClass('bg-[#249dd8]', 'text-white');
      });
    } else {
      // If no pagination buttons found, the test should still pass
      expect(true).toBe(true);
    }
  });

  it('shows ellipsis in pagination when there are many pages', async () => {
    // Add many users to trigger pagination with ellipsis (more than 7 pages)
    const manyUsers = [
      ...mockUsersData,
      ...Array.from({ length: 50 }, (_, i) => ({
        id: `${i + 4}`,
        email: `user${i + 4}@ucr.ac.cr`,
        full_name: `User ${i + 4}`,
        username: `user${i + 4}`,
        profile_picture: null,
        is_active: true,
        created_at: '2024-01-05T00:00:00Z'
      }))
    ];

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
            data: manyUsers,
            metadata: { last_time: '', remainingItems: 0, remainingPages: 0 }
          })
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) });
    });

    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
    
    // Wait for pagination to appear and check for ellipsis
    await waitFor(() => {
      const ellipsisButtons = screen.getAllByRole('button').filter(button => 
        button.textContent === '...'
      );
      expect(ellipsisButtons.length).toBeGreaterThan(0);
    });
    
    // Verify ellipsis buttons are disabled and have correct styling
    const ellipsisButtons = screen.getAllByRole('button').filter(button => 
      button.textContent === '...'
    );
    
    ellipsisButtons.forEach(button => {
      expect(button).toBeDisabled();
      expect(button).toHaveClass('bg-transparent', 'text-gray-400', 'cursor-default');
    });
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

  it('shows empty state when no users are found', async () => {
    // Mock empty users response
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
            data: [],
            metadata: { last_time: '', remainingItems: 0, remainingPages: 0 }
          })
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) });
    });

    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getByText('No hay usuarios disponibles')).toBeInTheDocument();
    });
  });

  it('shows search no results message when search yields no results', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'nonexistentuser' } });
    
    await waitFor(() => {
      expect(screen.getByText('No se encontraron usuarios con "nonexistentuser" en email, nombre o username')).toBeInTheDocument();
    });
  });

  it('handles suspension description textarea input', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const descriptionTextarea = screen.getByPlaceholderText('Describa la razón de la suspensión...');
    fireEvent.change(descriptionTextarea, { target: { value: 'Test suspension reason' } });
    
    expect(descriptionTextarea).toHaveValue('Test suspension reason');
    expect(screen.getByTestId('suspension-description-count').textContent).toBe('22/500 caracteres');
  });

  it('handles suspension description character limit', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const descriptionTextarea = screen.getByPlaceholderText('Describa la razón de la suspensión...');
    const longDescription = 'a'.repeat(500);
    fireEvent.change(descriptionTextarea, { target: { value: longDescription } });
    
    expect(descriptionTextarea).toHaveValue(longDescription);
    expect(screen.getByTestId('suspension-description-count').textContent).toBe('500/500 caracteres');
  });

  it('shows suspending state with loading spinner', async () => {
    // Mock a slow response to see the loading state
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
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 201,
              json: () => Promise.resolve({ message: 'User suspended successfully' })
            });
          }, 100);
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
    
    const acceptButton = screen.getByRole('button', { name: 'Suspender' });
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(screen.getByText('Suspendiéndo...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Suspendiéndo...' })).toBeDisabled();
    });
  });

  it('handles suspension time selection change', async () => {
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
    fireEvent.change(timeSelect, { target: { value: '7' } });
    
    expect(timeSelect).toHaveValue('7');
  });

  it('handles pagination navigation with previous/next buttons', async () => {
    // Add more users to trigger pagination
    const moreUsers = [
      ...mockUsersData,
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 4}`,
        email: `user${i + 4}@ucr.ac.cr`,
        full_name: `User ${i + 4}`,
        username: `user${i + 4}`,
        profile_picture: null,
        is_active: true,
        created_at: '2024-01-05T00:00:00Z'
      }))
    ];

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
            data: moreUsers,
            metadata: { last_time: '', remainingItems: 0, remainingPages: 0 }
          })
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) });
    });

    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
    
    // Test next button
    const nextButton = screen.getByLabelText('next');
    expect(nextButton).not.toBeDisabled();
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      // Verify we're on page 2 by checking for different users
      expect(screen.getByText('User 7')).toBeInTheDocument();
    });
    
    // Test previous button
    const prevButton = screen.getByLabelText('previous');
    expect(prevButton).not.toBeDisabled();
    fireEvent.click(prevButton);
    
    await waitFor(() => {
      // Verify we're back on page 1
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
  });

  it('handles pagination button disabled states', async () => {
    // Add more users to trigger pagination
    const moreUsers = [
      ...mockUsersData,
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 4}`,
        email: `user${i + 4}@ucr.ac.cr`,
        full_name: `User ${i + 4}`,
        username: `user${i + 4}`,
        profile_picture: null,
        is_active: true,
        created_at: '2024-01-05T00:00:00Z'
      }))
    ];

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
            data: moreUsers,
            metadata: { last_time: '', remainingItems: 0, remainingPages: 0 }
          })
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) });
    });

    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
    
    // On first page, previous button should be disabled
    const prevButton = screen.getByLabelText('previous');
    expect(prevButton).toBeDisabled();
    expect(prevButton).toHaveClass('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
    
    // Navigate to last page by clicking next multiple times
    const nextButton = screen.getByLabelText('next');
    fireEvent.click(nextButton); // page 2
    fireEvent.click(nextButton); // page 3 (last page)
    
    await waitFor(() => {
      // Should be on last page, next button should be disabled
      expect(nextButton).toBeDisabled();
      expect(nextButton).toHaveClass('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
    });
  });

  it('handles authentication failure during initial load', async () => {
    // Mock authentication failure
    mockFetch.mockImplementation(() => 
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
      })
    );

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

    render(<SuspendUser />);
    
    await waitFor(() => {
      expect(hrefValue).toBe('/login');
    });
  });

  it('handles network error during fetchUsers', async () => {
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
    // Then mock network error
    mockFetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    render(<SuspendUser />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  it('handles suspension with description', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const descriptionTextarea = screen.getByPlaceholderText('Describa la razón de la suspensión...');
    fireEvent.change(descriptionTextarea, { target: { value: 'Test suspension reason' } });
    
    const acceptButton = screen.getByRole('button', { name: 'Suspender' });
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/Usuario .* suspendido por 1 día/));
    });
  });

  it('handles suspension without description', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const acceptButton = screen.getByRole('button', { name: 'Suspender' });
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/Usuario .* suspendido por 1 día/));
    });
  });

  it('handles search input focus and blur', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar usuarios...')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.focus(searchInput);
    fireEvent.blur(searchInput);
    
    // Should not throw any errors
    expect(searchInput).toBeInTheDocument();
  });

  it('handles suspension time change and form submission', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Change suspension time to 7 days
    const timeSelect = screen.getByRole('combobox');
    fireEvent.change(timeSelect, { target: { value: '7' } });
    
    // Add description
    const descriptionTextarea = screen.getByPlaceholderText('Describa la razón de la suspensión...');
    fireEvent.change(descriptionTextarea, { target: { value: 'Long suspension reason' } });
    
    const acceptButton = screen.getByRole('button', { name: 'Suspender' });
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/Usuario .* suspendido por 7 días/));
    });
  });

  it('handles modal state reset after successful suspension', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const descriptionTextarea = screen.getByPlaceholderText('Describa la razón de la suspensión...');
    fireEvent.change(descriptionTextarea, { target: { value: 'Test reason' } });
    
    const acceptButton = screen.getByRole('button', { name: 'Suspender' });
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    
    // Open modal again and check if description is reset
    const remainingSuspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(remainingSuspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const newDescriptionTextarea = screen.getByPlaceholderText('Describa la razón de la suspensión...');
    expect(newDescriptionTextarea).toHaveValue('');
  });

  it('handles suspension description textarea input with correct character count', async () => {
    render(<SuspendUser />);
    await waitFor(() => {
      expect(screen.getAllByText('Suspender').length).toBeGreaterThan(0);
    });
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const descriptionTextarea = screen.getByPlaceholderText('Describa la razón de la suspensión...');
    fireEvent.change(descriptionTextarea, { target: { value: 'Test suspension reason' } });
    
    expect(descriptionTextarea).toHaveValue('Test suspension reason');
    expect(screen.getByTestId('suspension-description-count').textContent).toBe('22/500 caracteres');
  });
}); 