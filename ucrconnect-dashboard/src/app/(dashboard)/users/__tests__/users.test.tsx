import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import Users from '../page';
import { useSearchParams } from 'next/navigation';

// Mock the useSearchParams hook
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => new URLSearchParams())
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock data that matches the new User interface
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
    email: 'maria.rodriguez@ucr.ac.cr',
    full_name: 'María Rodríguez',
    username: 'mariarodriguez',
    profile_picture: null,
    is_active: true,
    created_at: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    email: 'carlos.mendez@ucr.ac.cr',
    full_name: 'Carlos Méndez',
    username: 'carlosmendez',
    profile_picture: null,
    is_active: false,
    created_at: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    email: 'ana.martinez@ucr.ac.cr',
    full_name: 'Ana Martínez',
    username: 'anamartinez',
    profile_picture: null,
    is_active: true,
    created_at: '2024-01-04T00:00:00Z'
  },
  {
    id: '5',
    email: 'luis.gonzalez@ucr.ac.cr',
    full_name: 'Luis González',
    username: 'luisgonzalez',
    profile_picture: null,
    is_active: false,
    created_at: '2024-01-05T00:00:00Z'
  },
  {
    id: '6',
    email: 'sofia.ramirez@ucr.ac.cr',
    full_name: 'Sofía Ramírez',
    username: 'sofiaramirez',
    profile_picture: null,
    is_active: true,
    created_at: '2024-01-06T00:00:00Z'
  },
  {
    id: '7',
    email: 'diego.herrera@ucr.ac.cr',
    full_name: 'Diego Herrera',
    username: 'diegoherrera',
    profile_picture: null,
    is_active: true,
    created_at: '2024-01-07T00:00:00Z'
  },
  {
    id: '8',
    email: 'valeria.mora@ucr.ac.cr',
    full_name: 'Valeria Mora',
    username: 'valeriamora',
    profile_picture: null,
    is_active: false,
    created_at: '2024-01-08T00:00:00Z'
  },
  {
    id: '9',
    email: 'andres.jimenez@ucr.ac.cr',
    full_name: 'Andrés Jiménez',
    username: 'andresjimenez',
    profile_picture: null,
    is_active: true,
    created_at: '2024-01-09T00:00:00Z'
  },
  {
    id: '10',
    email: 'camila.rojas@ucr.ac.cr',
    full_name: 'Camila Rojas',
    username: 'camilarojas',
    profile_picture: null,
    is_active: true,
    created_at: '2024-01-10T00:00:00Z'
  },
  {
    id: '11',
    email: 'javier.vargas@ucr.ac.cr',
    full_name: 'Javier Vargas',
    username: 'javiervargas',
    profile_picture: null,
    is_active: false,
    created_at: '2024-01-11T00:00:00Z'
  },
  {
    id: '12',
    email: 'isabella.soto@ucr.ac.cr',
    full_name: 'Isabella Soto',
    username: 'isabellasoto',
    profile_picture: null,
    is_active: true,
    created_at: '2024-01-12T00:00:00Z'
  },
  {
    id: '13',
    email: 'ricardo.castro@ucr.ac.cr',
    full_name: 'Ricardo Castro',
    username: 'ricardocastro',
    profile_picture: null,
    is_active: true,
    created_at: '2024-01-13T00:00:00Z'
  },
  {
    id: '14',
    email: 'gabriela.navarro@ucr.ac.cr',
    full_name: 'Gabriela Navarro',
    username: 'gabrielanavarro',
    profile_picture: null,
    is_active: false,
    created_at: '2024-01-14T00:00:00Z'
  },
  {
    id: '15',
    email: 'fernando.cordero@ucr.ac.cr',
    full_name: 'Fernando Cordero',
    username: 'fernandocordero',
    profile_picture: null,
    is_active: true,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '16',
    email: 'laura.chaves@ucr.ac.cr',
    full_name: 'Laura Chaves',
    username: 'laurchaves',
    profile_picture: null,
    is_active: true,
    created_at: '2024-01-16T00:00:00Z'
  },
  {
    id: '17',
    email: 'daniel.solis@ucr.ac.cr',
    full_name: 'Daniel Solís',
    username: 'danielsolis',
    profile_picture: null,
    is_active: false,
    created_at: '2024-01-17T00:00:00Z'
  },
  {
    id: '18',
    email: 'mariana.vega@ucr.ac.cr',
    full_name: 'Mariana Vega',
    username: 'marianavega',
    profile_picture: null,
    is_active: true,
    created_at: '2024-01-18T00:00:00Z'
  },
  {
    id: '19',
    email: 'usuario4@example.com',
    full_name: 'Usuario 4',
    username: 'usuario4',
    profile_picture: null,
    is_active: true,
    created_at: '2024-01-19T00:00:00Z'
  }
];

describe('Users Page', () => {
  // Suppress console errors during tests
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    cleanup();
    // Reset the mock implementation before each test
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    
    // Mock successful authentication
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
            metadata: {
              last_time: '2024-01-19T00:00:00Z',
              remainingItems: 0,
              remainingPages: 0
            }
          })
        });
      }
      
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Not found' })
      });
    });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('displays loading state initially', () => {
    render(<Users />);
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('displays dashboard stats correctly after loading', async () => {
    render(<Users />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('19')).toBeInTheDocument();
    });

    // Check if the title is correct
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
  });

  it('dashboard stats card is clickable and has correct link', async () => {
    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText('19')).toBeInTheDocument();
    });

    const statsCard = screen.getByText('19').closest('a');
    expect(statsCard).toHaveAttribute('href', '/users');
  });

  it('displays search input with correct placeholder', async () => {
    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar usuarios...')).toBeInTheDocument();
    });
  });

  it('displays register and suspend user buttons', async () => {
    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText('Registrar nuevo usuario')).toBeInTheDocument();
      expect(screen.getByText('Suspender usuario')).toBeInTheDocument();
    });
  });

  it('displays table headers correctly', async () => {
    render(<Users />);
    
    await waitFor(() => {
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(4);
      expect(headers[0]).toHaveTextContent('Nombre');
      expect(headers[1]).toHaveTextContent('Correo');
      expect(headers[2]).toHaveTextContent('Username');
      expect(headers[3]).toHaveTextContent('Estado');
    });
  });

  it('displays user data correctly', async () => {
    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('juan.perez@ucr.ac.cr')).toBeInTheDocument();
      expect(screen.getByText('juanperez')).toBeInTheDocument();
    });
    
    // Check status badges
    const activeStatuses = screen.getAllByText('Activo');
    const inactiveStatuses = screen.getAllByText('Inactivo');
    expect(activeStatuses.length).toBeGreaterThan(0);
    expect(inactiveStatuses.length).toBeGreaterThan(0);
  });

  it('displays correct user status badges with proper styling', async () => {
    render(<Users />);
    
    await waitFor(() => {
      const activeBadges = screen.getAllByText('Activo');
      const inactiveBadges = screen.getAllByText('Inactivo');

      expect(activeBadges.length).toBeGreaterThan(0);
      activeBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-[#609000]/20', 'text-[#609000]');
      });

      expect(inactiveBadges.length).toBeGreaterThan(0);
      inactiveBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-red-100', 'text-red-700');
      });
    });
  });

  it('displays pagination controls when there are multiple pages', async () => {
    render(<Users />);
    
    await waitFor(() => {
      // With 19 users and 6 per page, we should have 4 pages
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    // Check navigation buttons - look for prev/next buttons specifically
    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('handles search functionality', async () => {
    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar usuarios...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    
    // Search for a specific user by name
    fireEvent.change(searchInput, { target: { value: 'Juan' } });
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    
    // Search for non-existent user
    fireEvent.change(searchInput, { target: { value: 'NonExistentUser' } });
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
  });

  it('handles page changes correctly', async () => {
    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    // Click next page button
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Verify page 2 is active
    await waitFor(() => {
      const page2Button = screen.getByRole('button', { name: '2' });
      expect(page2Button).toHaveClass('bg-[#249dd8]', 'text-white');
    });

    // Click page 3 button if it exists
    const page3Button = screen.queryByRole('button', { name: '3' });
    if (page3Button) {
      fireEvent.click(page3Button);
      
      // Verify page 3 is active
      await waitFor(() => {
        expect(page3Button).toHaveClass('bg-[#249dd8]', 'text-white');
      });
    }
  });

  it('handles search with special characters and spaces', async () => {
    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar usuarios...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    
    // Search with single space
    fireEvent.change(searchInput, { target: { value: 'Juan Pérez' } });
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    
    // Search with special characters
    fireEvent.change(searchInput, { target: { value: 'María' } });
    expect(screen.getByText('María Rodríguez')).toBeInTheDocument();
    
    // Search with multiple spaces (should show no results)
    fireEvent.change(searchInput, { target: { value: 'Juan  Pérez' } });
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
    
    // Search with no results
    fireEvent.change(searchInput, { target: { value: 'NonExistentUser' } });
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
    expect(screen.queryByText('María Rodríguez')).not.toBeInTheDocument();
  });

  it('handles table row hover states', async () => {
    render(<Users />);
    
    await waitFor(() => {
      const rows = screen.getAllByRole('row').slice(1); // Skip header row
      rows.forEach(row => {
        expect(row).toHaveClass('hover:bg-gray-50');
      });
    });
  });

  it('handles search input focus states', async () => {
    render(<Users />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
      
      // Check initial state
      expect(searchInput).toHaveClass('border-gray-300');
      
      // Focus input
      fireEvent.focus(searchInput);
      expect(searchInput).toHaveClass('focus:ring-[#2980B9]', 'focus:border-[#2980B9]');
      
      // Blur input
      fireEvent.blur(searchInput);
      expect(searchInput).toHaveClass('border-gray-300');
    });
  });

  it('sets search query from email URL parameter', async () => {
    cleanup();
    // Mock the useSearchParams hook to return an email parameter
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('email', 'juan.perez@ucr.ac.cr');
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    
    // Re-render with the mock search params
    render(<Users />);

    // Wait for the search input to be populated with the email
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
      expect(searchInput).toHaveValue('juan.perez@ucr.ac.cr');
    });

    // Verify that only the matching user is shown
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('María Rodríguez')).not.toBeInTheDocument();
    expect(screen.queryByText('Carlos Méndez')).not.toBeInTheDocument();
  });

  it('sets search query from search URL parameter when no email is present', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('?search=María'));
    
    render(<Users />);
    
    // Wait for the search input to be populated with the search term
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
      expect(searchInput).toHaveValue('María');
    });
  });

  it('prioritizes email parameter over search parameter', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('?search=María&email=juan.perez@ucr.ac.cr'));
    
    render(<Users />);
    
    // Wait for the search input to be populated with the email
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
      expect(searchInput).toHaveValue('juan.perez@ucr.ac.cr');
    });
  });

  it('handles page change correctly', async () => {
    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    // Click on page 2
    const page2Button = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2Button);

    // Verify page 2 is now active
    expect(page2Button).toHaveClass('bg-[#249dd8]', 'text-white');

    // Click back to page 1
    const page1Button = screen.getByRole('button', { name: '1' });
    fireEvent.click(page1Button);

    // Verify we're back on page 1
    const page1ButtonAfter = screen.getByRole('button', { name: '1' });
    expect(page1ButtonAfter).toHaveClass('bg-[#249dd8]', 'text-white');
  });

  it('shows error state when API fails', async () => {
    // Mock API failure for the users endpoint
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
          ok: false,
          status: 500,
          json: () => Promise.resolve({ message: 'Internal server error' })
        });
      }
      
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Not found' })
      });
    });

    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('redirects to login when authentication fails', async () => {
    // Mock authentication failure
    mockFetch.mockImplementation((url) => {
      if (url.includes('/api/admin/auth/profile')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Unauthorized' })
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Not found' })
      });
    });

    // Mock window.location.href
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' } as any;

    render(<Users />);
    
    await waitFor(() => {
      expect(window.location.href).toBe('/login');
    });

    // Restore original location
    window.location = originalLocation;
  });

  it('displays no users message when search has no results', async () => {
    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar usuarios...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentUser' } });

    await waitFor(() => {
      expect(screen.getByText('No se encontraron usuarios con "NonExistentUser" en email, nombre o username')).toBeInTheDocument();
    });
  });

  it('displays username column correctly', async () => {
    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText('juanperez')).toBeInTheDocument();
      expect(screen.getByText('mariarodriguez')).toBeInTheDocument();
      expect(screen.getByText('carlosmendez')).toBeInTheDocument();
    });
  });

  it('handles search by username', async () => {
    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar usuarios...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'juanperez' } });

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.queryByText('María Rodríguez')).not.toBeInTheDocument();
    });
  });

  it('shows no users available when API returns empty', async () => {
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

    render(<Users />);
    await waitFor(() => {
      expect(screen.getByText('No hay usuarios disponibles')).toBeInTheDocument();
    });
  });

  it('does not show pagination when users fit on one page', async () => {
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
        // 6 users, which is the page size
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            message: 'Users retrieved successfully',
            data: mockUsersData.slice(0, 6),
            metadata: { last_time: '', remainingItems: 0, remainingPages: 0 }
          })
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) });
    });

    render(<Users />);
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
    // Should not find pagination buttons for page 2
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('shows fallback image if profile_picture is null', async () => {
    render(<Users />);
    await waitFor(() => {
      // There should be an <img> with a data:image/svg+xml src (the fallback)
      const fallbackImg = screen.getAllByRole('img').find(img =>
        img.getAttribute('src')?.startsWith('data:image/svg+xml')
      );
      expect(fallbackImg).toBeInTheDocument();
    });
  });

  it('shows loading indicator when fetching users', async () => {
    let resolveFetch: any;
    const usersPromise = new Promise((resolve) => {
      resolveFetch = resolve;
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
        return usersPromise.then(() => ({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            message: 'Users retrieved successfully',
            data: mockUsersData,
            metadata: { last_time: '', remainingItems: 0, remainingPages: 0 }
          })
        }));
      }
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) });
    });

    render(<Users />);
    // While fetch is unresolved, loading should be shown
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
    // Now resolve the fetch
    resolveFetch();
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
  });

  it('shows authentication loading state', async () => {
    // Simulate isAuthenticated === null
    let resolveFetch: any;
    const authPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    mockFetch.mockImplementation((url) => {
      if (url.includes('/api/admin/auth/profile')) {
        return authPromise.then(() => ({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            message: 'Profile retrieved successfully',
            data: { id: '1', email: 'admin@test.com', full_name: 'Admin User' }
          })
        }));
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
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) });
    });

    render(<Users />);
    // While auth fetch is unresolved, should show loading
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
    // Now resolve the fetch
    resolveFetch();
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
  });

  it('handles pagination with ellipsis when many pages exist', async () => {
    // Mock more users to trigger pagination with ellipsis
    const manyUsers = Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      email: `user${i + 1}@ucr.ac.cr`,
      full_name: `User ${i + 1}`,
      username: `user${i + 1}`,
      profile_picture: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z'
    }));

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

    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // Check that ellipsis appears when there are many pages
    const ellipsisElements = screen.getAllByText('...');
    expect(ellipsisElements.length).toBeGreaterThan(0);
    
    // Verify that pagination buttons exist
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('handles image error and shows fallback', async () => {
    // Mock a user with a profile picture that will fail to load
    const userWithImage = {
      ...mockUsersData[0],
      profile_picture: 'https://invalid-url-that-will-fail.com/image.jpg'
    };

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
            data: [userWithImage],
            metadata: { last_time: '', remainingItems: 0, remainingPages: 0 }
          })
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) });
    });

    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    // Find the image and trigger an error
    const images = screen.getAllByRole('img');
    const userImage = images.find(img => img.getAttribute('src')?.includes('invalid-url'));
    
    if (userImage) {
      // Simulate image load error
      fireEvent.error(userImage);
      
      // Should now show fallback image
      const fallbackImages = screen.getAllByRole('img').filter(img =>
        img.getAttribute('src')?.startsWith('data:image/svg+xml')
      );
      expect(fallbackImages.length).toBeGreaterThan(0);
    }
  });

  it('handles 401 unauthorized during users fetch', async () => {
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
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Unauthorized' })
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) });
    });

    // Mock window.location.href
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' } as any;

    render(<Users />);
    
    await waitFor(() => {
      expect(window.location.href).toBe('/login');
    });

    // Restore original location
    window.location = originalLocation;
  });

  it('handles pagination edge case with exactly 7 pages', async () => {
    // Create exactly 42 users (7 pages * 6 per page)
    const exactUsers = Array.from({ length: 42 }, (_, i) => ({
      id: (i + 1).toString(),
      email: `user${i + 1}@test.com`,
      full_name: `User ${i + 1}`,
      username: `user${i + 1}`,
      profile_picture: null,
      is_active: true,
      created_at: new Date(2024, 0, i + 1).toISOString()
    }));

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
            data: exactUsers,
            metadata: { last_time: '', remainingItems: 0, remainingPages: 0 }
          })
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) });
    });

    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // Should show all 7 pages without ellipsis
    for (let i = 1; i <= 7; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
    
    // Should not show ellipsis
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });
});
