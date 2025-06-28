import { render, screen, fireEvent, within, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import Users from '../page';
import { mockUsers } from '../mockUsers';
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

describe('Users Page', () => {
  beforeEach(() => {
    cleanup();
    // Reset the mock implementation before each test
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    render(<Users />);
  });

  afterEach(() => {
    cleanup();
  });

  it('displays dashboard stats correctly', () => {
    // Check if the stats card exists with the correct number of users
    const statsCard = screen.getByText(mockUsers.length.toString());
    expect(statsCard).toBeInTheDocument();

    // Check if the title is correct
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
  });

  it('dashboard stats card is clickable and has correct link', () => {
    const statsCard = screen.getByText(mockUsers.length.toString()).closest('a');
    expect(statsCard).toHaveAttribute('href', '/users');
  });

  it('displays search input with correct placeholder', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    expect(searchInput).toBeInTheDocument();
  });

  it('displays register and suspend user buttons', () => {
    expect(screen.getByText('Registrar nuevo usuario')).toBeInTheDocument();
    expect(screen.getByText('Suspender usuario')).toBeInTheDocument();
  });

  it('displays table headers correctly', () => {
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(4);
    expect(headers[0]).toHaveTextContent('Nombre');
    expect(headers[1]).toHaveTextContent('Correo');
    expect(headers[2]).toHaveTextContent('Tipo');
    expect(headers[3]).toHaveTextContent('Estado');
  });

  it('displays user data correctly', () => {
    // Check first page data (6 users)
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('juan.perez@ucr.ac.cr')).toBeInTheDocument();
    
    // Check user types
    const studentTypes = screen.getAllByText('Estudiante');
    const professorTypes = screen.getAllByText('Profesor');
    expect(studentTypes.length).toBeGreaterThan(0);
    expect(professorTypes.length).toBeGreaterThan(0);
    
    // Check status badges
    const activeStatuses = screen.getAllByText('Activo');
    const suspendedStatuses = screen.getAllByText('Suspendido');
    expect(activeStatuses.length).toBeGreaterThan(0);
    expect(suspendedStatuses.length).toBeGreaterThan(0);
  });

  it('displays correct user status badges with proper styling', () => {
    const activeBadges = screen.getAllByText('Activo');
    const suspendedBadges = screen.getAllByText('Suspendido');

    expect(activeBadges.length).toBeGreaterThan(0);
    activeBadges.forEach(badge => {
      expect(badge).toHaveClass('bg-[#609000]/20', 'text-[#609000]');
    });

    expect(suspendedBadges.length).toBeGreaterThan(0);
    suspendedBadges.forEach(badge => {
      expect(badge).toHaveClass('bg-red-100', 'text-red-700');
    });
  });

  it('displays pagination controls', () => {
    const totalPages = Math.ceil(mockUsers.length / 6);
    
    // Check page numbers
    for (let i = 1; i <= Math.min(3, totalPages); i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }

    // Check navigation buttons
    const buttons = screen.getAllByRole('button');
    const paginationButtons = buttons.filter(button => 
      button.className.includes('rounded-lg') && 
      !button.textContent?.includes('Registrar') && 
      !button.textContent?.includes('Suspender')
    );
    
    const prevButton = paginationButtons[0]; // First button is previous
    const nextButton = paginationButtons[paginationButtons.length - 1]; // Last button is next
    
    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('handles search functionality', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    
    // Search for a specific user
    fireEvent.change(searchInput, { target: { value: 'Juan' } });
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    
    // Search for non-existent user
    fireEvent.change(searchInput, { target: { value: 'NonExistentUser' } });
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
  });

  it('handles page changes correctly', () => {
    // Click next page button
    const buttons = screen.getAllByRole('button');
    const paginationButtons = buttons.filter(button => 
      button.className.includes('rounded-lg') && 
      !button.textContent?.includes('Registrar') && 
      !button.textContent?.includes('Suspender')
    );
    const nextButton = paginationButtons[paginationButtons.length - 1];
    fireEvent.click(nextButton);

    // Verify page 2 is active
    expect(screen.getByText('2')).toHaveClass('bg-[#249dd8]', 'text-white');
    expect(screen.getByText('1')).toHaveClass('bg-gray-100', 'text-gray-600');

    // Click page 3 button
    fireEvent.click(screen.getByText('3'));

    // Verify page 3 is active
    expect(screen.getByText('3')).toHaveClass('bg-[#249dd8]', 'text-white');
    expect(screen.getByText('2')).toHaveClass('bg-gray-100', 'text-gray-600');
  });

  it('handles search with special characters and spaces', () => {
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

  it('handles table row hover states', () => {
    const rows = screen.getAllByRole('row').slice(1); // Skip header row
    rows.forEach(row => {
      expect(row).toHaveClass('hover:bg-gray-50');
    });
  });

  it('displays correct user type badges', () => {
    const studentTypes = screen.getAllByText('Estudiante');
    const professorTypes = screen.getAllByText('Profesor');
    
    studentTypes.forEach(type => {
      expect(type).toHaveClass('text-gray-900');
    });
    
    professorTypes.forEach(type => {
      expect(type).toHaveClass('text-gray-900');
    });
  });

  it('handles search input focus states', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    
    // Check initial state
    expect(searchInput).toHaveClass('border-gray-300');
    
    // Focus input
    fireEvent.focus(searchInput);
    expect(searchInput).toHaveClass('focus:ring-[#1b87b9]', 'focus:border-[#1b87b9]');
    
    // Blur input
    fireEvent.blur(searchInput);
    expect(searchInput).toHaveClass('border-gray-300');
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
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    await waitFor(() => {
      expect(searchInput).toHaveValue('juan.perez@ucr.ac.cr');
    });

    // Verify that only the matching user is shown
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('María Rodríguez')).not.toBeInTheDocument();
    expect(screen.queryByText('Carlos Méndez')).not.toBeInTheDocument();
  });

  it('sets search query from search URL parameter when no email is present', async () => {
    cleanup();
    // Mock the useSearchParams hook to return a search parameter
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('search', 'María');
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    
    // Re-render with the mock search params
    render(<Users />);

    // Wait for the search input to be populated with the search term
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    await waitFor(() => {
      expect(searchInput).toHaveValue('María');
    });

    // Verify that only the matching user is shown
    expect(screen.getByText('María Rodríguez')).toBeInTheDocument();
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
    expect(screen.queryByText('Carlos Méndez')).not.toBeInTheDocument();
  });

  it('prioritizes email parameter over search parameter', async () => {
    cleanup();
    // Mock the useSearchParams hook to return both email and search parameters
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('email', 'juan.perez@ucr.ac.cr');
    mockSearchParams.set('search', 'María');
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    
    // Re-render with the mock search params
    render(<Users />);

    // Wait for the search input to be populated with the email
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    await waitFor(() => {
      expect(searchInput).toHaveValue('juan.perez@ucr.ac.cr');
    });

    // Verify that only the email-matched user is shown
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('María Rodríguez')).not.toBeInTheDocument();
    expect(screen.queryByText('Carlos Méndez')).not.toBeInTheDocument();
  });

  it('handles page change correctly', async () => {
    // Get all pagination buttons
    const buttons = screen.getAllByRole('button');
    const paginationButtons = buttons.filter(button => 
      button.className.includes('rounded-lg') && 
      !button.textContent?.includes('Registrar') && 
      !button.textContent?.includes('Suspender')
    );
    
    // First button is previous, last button is next
    const prevButton = paginationButtons[0];
    const nextButton = paginationButtons[paginationButtons.length - 1];
    
    // Click next button
    fireEvent.click(nextButton);

    // Verify we're on page 2
    const page2Button = screen.getByRole('button', { name: '2' });
    expect(page2Button).toHaveClass('bg-[#249dd8]', 'text-white');

    // Click previous button
    fireEvent.click(prevButton);

    // Verify we're back on page 1
    const page1Button = screen.getByRole('button', { name: '1' });
    expect(page1Button).toHaveClass('bg-[#249dd8]', 'text-white');
  });
});
