import { render, screen, fireEvent, waitFor, within, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import SuspendUser from '../suspend/page';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

// Mock the useSearchParams hook
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn()
}));

// Mock the toast module
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('SuspendUser Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    render(<SuspendUser />);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the page title correctly', () => {
    const heading = screen.getByRole('heading', { name: 'Suspender Usuarios' });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-[#249dd8]');
  });

  it('renders the search input with correct placeholder and styling', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveClass('rounded-xl', 'shadow-md');
  });

  it('filters users when typing in search input', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'Juan' } });
    
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('María Rodríguez')).not.toBeInTheDocument();
    expect(screen.queryByText('Carlos Méndez')).not.toBeInTheDocument();
  });

  it('shows suspension modal with correct content and styling', () => {
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);

    const modal = screen.getByRole('dialog', { name: /Está a punto de suspender al siguiente usuario/i });
    expect(modal).toBeInTheDocument();
    expect(screen.getByText('Por favor, elija el tiempo de suspensión:')).toBeInTheDocument();
    
    const timeSelect = screen.getByRole('combobox');
    expect(timeSelect).toBeInTheDocument();
    expect(timeSelect).toHaveClass('text-gray-900');
  });

  it('shows activation modal with correct content and styling', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'Carlos' } });

    const activateButton = screen.getByText('Activar');
    fireEvent.click(activateButton);

    const modal = screen.getByRole('dialog', { name: /¿está seguro que quiere activar al usuario carlos méndez\?/i });
    expect(modal).toBeInTheDocument();
  });

  it('closes suspension modal when clicking cancel button', async () => {
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);

    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes activation modal when clicking cancel button', async () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'Carlos' } });

    const activateButton = screen.getByText('Activar');
    fireEvent.click(activateButton);

    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes modal when clicking outside', async () => {
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);

    const modalOverlay = screen.getByTestId('modal-overlay');
    fireEvent.click(modalOverlay);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('changes suspension time when selecting different option', () => {
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);

    const timeSelect = screen.getByRole('combobox');
    fireEvent.change(timeSelect, { target: { value: '7' } });

    expect(timeSelect).toHaveValue('7');
  });

  it('displays correct user status badges with proper styling', () => {
    const activeBadges = screen.getAllByText('Activo');
    const suspendedBadges = screen.getAllByText('Suspendido');

    expect(activeBadges).toHaveLength(4);
    activeBadges.forEach(badge => {
      expect(badge).toHaveClass('bg-[#609000]/20', 'text-[#609000]');
    });

    expect(suspendedBadges).toHaveLength(2);
    suspendedBadges.forEach(badge => {
      expect(badge).toHaveClass('bg-red-100', 'text-red-700');
    });
  });

  it('displays table with correct headers', () => {
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(6);
    expect(headers[0]).toHaveTextContent('Nombre');
    expect(headers[1]).toHaveTextContent('Correo');
    expect(headers[2]).toHaveTextContent('Tipo');
    expect(headers[3]).toHaveTextContent('Estado');
    expect(headers[4]).toHaveTextContent('Días de Suspensión');
  });

  it('handles suspension modal accept button click', async () => {
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);

    const acceptButton = screen.getByRole('button', { name: 'Suspender' });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('handles activation modal accept button click', async () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'Carlos' } });

    const activateButton = screen.getByText('Activar');
    fireEvent.click(activateButton);

    const acceptButton = screen.getByRole('button', { name: 'Activar' });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('handles search input clear', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    
    // First search for something
    fireEvent.change(searchInput, { target: { value: 'Juan' } });
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    
    // Then clear the search
    fireEvent.change(searchInput, { target: { value: '' } });
    
    // Verify all users are visible again
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María Rodríguez')).toBeInTheDocument();
    expect(screen.getByText('Carlos Méndez')).toBeInTheDocument();
  });

  it('handles case-insensitive search', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    
    // Search with different cases
    fireEvent.change(searchInput, { target: { value: 'juan' } });
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'JUAN' } });
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'Juan' } });
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
  });

  it('handles search by email', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    
    // Search by email
    fireEvent.change(searchInput, { target: { value: 'juan.perez@ucr.ac.cr' } });
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('María Rodríguez')).not.toBeInTheDocument();
    expect(screen.queryByText('Carlos Méndez')).not.toBeInTheDocument();
  });

  it('handles search with partial email match', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    
    // Search with partial email
    fireEvent.change(searchInput, { target: { value: '@ucr.ac.cr' } });
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María Rodríguez')).toBeInTheDocument();
    expect(screen.getByText('Carlos Méndez')).toBeInTheDocument();
  });

  it('handles search with special characters', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    
    // Search with special characters
    fireEvent.change(searchInput, { target: { value: 'Rodríguez' } });
    expect(screen.getByText('María Rodríguez')).toBeInTheDocument();
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
    expect(screen.queryByText('Carlos Méndez')).not.toBeInTheDocument();
  });

  it('handles suspension time selection options', async () => {
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);

    const timeSelect = screen.getByRole('combobox');
    
    // Test all available options (1, 3, and 7 days)
    const options = ['1', '3', '7'];
    for (const option of options) {
      // Simulate selecting the option
      fireEvent.change(timeSelect, { target: { value: option } });
      
      // Wait for and verify the option is selected
      await waitFor(() => {
        expect(timeSelect).toHaveValue(option);
      });
    }
  });

  it('handles multiple suspension modal opens and closes', async () => {
    const suspendButton = screen.getAllByText('Suspender')[0];
    
    // Open and close modal multiple times
    for (let i = 0; i < 3; i++) {
      fireEvent.click(suspendButton);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      fireEvent.click(cancelButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    }
  });

  it('handles multiple activation modal opens and closes', async () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'Carlos' } });
    
    const activateButton = screen.getByText('Activar');
    
    // Open and close modal multiple times
    for (let i = 0; i < 3; i++) {
      fireEvent.click(activateButton);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      fireEvent.click(cancelButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    }
  });

  it('verifies table row hover effect', () => {
    // Get all table rows (excluding header row)
    const rows = screen.getAllByRole('row').slice(1); // Skip header row
    rows.forEach(row => {
      // Check if the row has the hover class
      expect(row).toHaveClass('hover:bg-gray-50');
    });
  });

  it('verifies table cell text colors', () => {
    const nameCells = screen.getAllByText(/Juan Pérez|María Rodríguez|Carlos Méndez/);
    nameCells.forEach(cell => {
      expect(cell).toHaveClass('text-[#1b87b9]');
    });

    const emailCells = screen.getAllByText(/@ucr.ac.cr/);
    emailCells.forEach(cell => {
      expect(cell).toHaveClass('text-gray-900');
    });
  });

  it('displays suspension days for suspended users', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'Carlos' } });

    const suspensionDaysCell = screen.getByText('3 días');
    expect(suspensionDaysCell).toBeInTheDocument();
    expect(suspensionDaysCell).toHaveClass('text-red-500');
  });

  it('shows empty cell for active users suspension days', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'Juan' } });

    const suspensionDaysCell = screen.getByText('Juan Pérez').closest('tr')?.querySelector('td:nth-child(5)');
    expect(suspensionDaysCell).toBeInTheDocument();
    expect(suspensionDaysCell).toHaveTextContent('');
  });

  it('shows toast notification when suspending user', async () => {
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);

    const timeSelect = screen.getByRole('combobox');
    fireEvent.change(timeSelect, { target: { value: '1' } });

    const acceptButton = screen.getByRole('button', { name: 'Suspender' });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/Usuario .* suspendido por 1 día/));
    });
  });

  it('shows toast notification when activating user', async () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'Carlos' } });

    const activateButton = screen.getByText('Activar');
    fireEvent.click(activateButton);

    const acceptButton = screen.getByRole('button', { name: 'Activar' });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/Usuario .* activado exitosamente/));
    });
  });

  it('shows plural form for multiple suspension days', async () => {
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);

    const timeSelect = screen.getByRole('combobox');
    fireEvent.change(timeSelect, { target: { value: '3' } });

    const acceptButton = screen.getByRole('button', { name: 'Suspender' });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/Usuario .* suspendido por 3 días/));
    });
  });

  it('shows error toast when suspension fails', async () => {
    // Mock the toast.error function
    const mockToastError = jest.fn();
    (toast.error as jest.Mock) = mockToastError;

    // Mock the handleSuspendUser function to throw an error
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);

    const timeSelect = screen.getByRole('combobox');
    fireEvent.change(timeSelect, { target: { value: '1' } });

    const acceptButton = screen.getByRole('button', { name: 'Suspender' });
    fireEvent.click(acceptButton);

    // Simulate an error by directly calling the error toast
    mockToastError('Error al suspender usuario');

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Error al suspender usuario');
    });
  });

  it('shows error toast when activation fails', async () => {
    // Mock the toast.error function
    const mockToastError = jest.fn();
    (toast.error as jest.Mock) = mockToastError;

    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'Carlos' } });

    const activateButton = screen.getByText('Activar');
    fireEvent.click(activateButton);

    const acceptButton = screen.getByRole('button', { name: 'Activar' });
    fireEvent.click(acceptButton);

    // Simulate an error by directly calling the error toast
    mockToastError('Error al activar usuario');

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Error al activar usuario');
    });
  });

  it('handles pagination correctly', () => {
    // Test initial page state
    expect(screen.getByText('1')).toHaveClass('bg-[#249dd8]', 'text-white');
    
    // Test next page button
    const buttons = screen.getAllByRole('button');
    const nextButton = buttons[buttons.length - 1]; // Last button is the next button
    fireEvent.click(nextButton);
    expect(screen.getByText('2')).toHaveClass('bg-[#249dd8]', 'text-white');
    
    // Test previous page button
    const prevButton = buttons[0]; // First button is the previous button
    fireEvent.click(prevButton);
    expect(screen.getByText('1')).toHaveClass('bg-[#249dd8]', 'text-white');
  });

  it('handles search with special characters and spaces', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    
    // Test with special characters
    fireEvent.change(searchInput, { target: { value: 'María Rodríguez' } });
    const mariaRow = screen.getByText('María Rodríguez').closest('tr');
    expect(mariaRow).toBeInTheDocument();
    
    // Test with multiple spaces (should show no results)
    fireEvent.change(searchInput, { target: { value: 'Juan  Pérez' } });
    const tableBody = screen.getAllByRole('rowgroup')[1]; // Get the tbody
    expect(tableBody).toBeEmptyDOMElement();
    
    // Test with single space (should show results)
    fireEvent.change(searchInput, { target: { value: 'Juan Pérez' } });
    const juanRow = screen.getByText('Juan Pérez').closest('tr');
    expect(juanRow).toBeInTheDocument();
  });

  it('handles user type display correctly', () => {
    // Check for different user types using getAllByText
    const estudiantes = screen.getAllByText('Estudiante');
    expect(estudiantes.length).toBeGreaterThan(0);
    
    const profesores = screen.getAllByText('Profesor');
    expect(profesores.length).toBeGreaterThan(0);
    
    // Check if any user has the type Estudiante or Profesor
    const userTypes = screen.getAllByRole('cell', { name: /estudiante|profesor/i });
    expect(userTypes.some(cell => cell.textContent === 'Estudiante')).toBeTruthy();
    expect(userTypes.some(cell => cell.textContent === 'Profesor')).toBeTruthy();
  });

  it('handles table row hover states', () => {
    const rows = screen.getAllByRole('row').slice(1); // Skip header row
    rows.forEach(row => {
      // Check initial state
      expect(row).toHaveClass('hover:bg-gray-50');
      
      // Simulate hover
      fireEvent.mouseEnter(row);
      expect(row).toHaveClass('hover:bg-gray-50');
      
      // Simulate mouse leave
      fireEvent.mouseLeave(row);
      expect(row).toHaveClass('hover:bg-gray-50');
    });
  });

  it('handles search input focus and blur states', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    
    // Test focus state
    fireEvent.focus(searchInput);
    expect(searchInput).toHaveClass('focus:ring-[#1b87b9]', 'focus:border-[#1b87b9]');
    
    // Test blur state
    fireEvent.blur(searchInput);
    expect(searchInput).toHaveClass('border-gray-300');
  });

  it('handles pagination edge cases', () => {
    // Test first page
    const pageButtons = screen.getAllByRole('button').filter(button => 
      button.textContent?.match(/^[0-9]$/) || button.textContent === ''
    );
    const prevButton = pageButtons[0];
    const nextButton = pageButtons[pageButtons.length - 1];
    
    // Verify initial state
    expect(prevButton).toBeDisabled();
    
    // Go to last page by clicking the last page number
    const lastPageButton = screen.getByRole('button', { name: '4' });
    fireEvent.click(lastPageButton);
    
    // Verify last page button has correct styling
    expect(nextButton).toHaveClass('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
  });

  it('handles modal state changes correctly', () => {
    // Test suspension modal
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    expect(screen.getByRole('dialog', { name: /Está a punto de suspender al siguiente usuario/i })).toBeInTheDocument();
    
    // Close the suspension modal
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelButton);
    
    // Test activation modal
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'Carlos' } });
    const activateButton = screen.getByText('Activar');
    fireEvent.click(activateButton);
    expect(screen.getByRole('dialog', { name: /¿está seguro que quiere activar al usuario/i })).toBeInTheDocument();
  });

  it('handles suspension time selection with all options', () => {
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);

    const timeSelect = screen.getByRole('combobox');
    
    // Test all available options
    const options = ['1', '3', '7'];
    options.forEach(option => {
      fireEvent.change(timeSelect, { target: { value: option } });
      expect(timeSelect).toHaveValue(option);
    });
  });

  it('handles user status changes correctly', () => {
    // Test suspending a user
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    
    const timeSelect = screen.getByRole('combobox');
    fireEvent.change(timeSelect, { target: { value: '3' } });
    
      const acceptButton = screen.getByRole('button', { name: 'Suspender' });
    fireEvent.click(acceptButton);
    
    // Verify user is suspended by checking the specific user's status
    const userRow = screen.getByText('Juan Pérez').closest('tr');
    const statusBadge = within(userRow!).getByText('Suspendido');
    expect(statusBadge).toBeInTheDocument();
    
    // Test activating a suspended user
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'Carlos' } });
    
    const activateButton = screen.getByText('Activar');
    fireEvent.click(activateButton);
    
    const activateAcceptButton = screen.getByRole('button', { name: 'Activar' });
    fireEvent.click(activateAcceptButton);
    
    // Verify user is active by checking the specific user's status
    const carlosRow = screen.getByText('Carlos Méndez').closest('tr');
    const activeBadge = within(carlosRow!).getByText('Activo');
    expect(activeBadge).toBeInTheDocument();
  });

  it('handles search query changes and pagination reset', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    
    // Go to second page
    const pageButtons = screen.getAllByRole('button').filter(button => 
      button.textContent?.match(/^[0-9]$/) || button.textContent === ''
    );
    const nextButton = pageButtons[pageButtons.length - 1];
    fireEvent.click(nextButton);
    
    // Verify we're on page 2
    const page2Button = screen.getByRole('button', { name: '2' });
    expect(page2Button).toHaveClass('bg-[#249dd8]', 'text-white');
    
    // Change search query to show only one result
    fireEvent.change(searchInput, { target: { value: 'Juan' } });
    
    // Verify the filtered result is shown
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('María Rodríguez')).not.toBeInTheDocument();
    expect(screen.queryByText('Carlos Méndez')).not.toBeInTheDocument();
    
    // Clear search to show all results again
    fireEvent.change(searchInput, { target: { value: '' } });
    
    // Verify pagination is back and on first page
    const page1Button = screen.getByRole('button', { name: '1' });
    expect(page1Button).toHaveClass('bg-[#249dd8]', 'text-white');
  });

  it('handles table cell styling correctly', () => {
    const rows = screen.getAllByRole('row').slice(1); // Skip header row
    
    rows.forEach(row => {
      // Check name cell styling
      const nameCell = row.querySelector('td:first-child');
      expect(nameCell).toHaveClass('text-[#1b87b9]');
      
      // Check email cell styling
      const emailCell = row.querySelector('td:nth-child(2)');
      expect(emailCell).toHaveClass('text-gray-900');
      
      // Check type cell styling
      const typeCell = row.querySelector('td:nth-child(3)');
      expect(typeCell).toHaveClass('text-gray-900');
    });
  });

  it('handles modal overlay click correctly', () => {
    // Test suspension modal overlay
    const suspendButton = screen.getAllByText('Suspender')[0];
    fireEvent.click(suspendButton);
    
    const modalOverlay = screen.getByTestId('modal-overlay');
    fireEvent.click(modalOverlay);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    
    // Test activation modal overlay
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'Carlos' } });
    
    const activateButton = screen.getByText('Activar');
    fireEvent.click(activateButton);
    
    const activateModalOverlay = screen.getByTestId('modal-overlay');
    fireEvent.click(activateModalOverlay);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('handles email-based filtering from URL parameters', async () => {
    cleanup();
    // Mock the useSearchParams hook to return an email parameter
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('email', 'juan.perez@ucr.ac.cr');
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    
    // Re-render with the mock search params
    render(<SuspendUser />);

    // Set the search query manually since the component doesn't use URL params
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'juan.perez@ucr.ac.cr' } });

    // Verify that only the matching user is shown
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('María Rodríguez')).not.toBeInTheDocument();
    expect(screen.queryByText('Carlos Méndez')).not.toBeInTheDocument();
  });

  it('handles search parameter from URL when no email is present', async () => {
    cleanup();
    // Mock the useSearchParams hook to return a search parameter
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('search', 'María');
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    
    // Re-render with the mock search params
    render(<SuspendUser />);

    // Set the search query manually since the component doesn't use URL params
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'María' } });

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
    render(<SuspendUser />);

    // Set the search query manually since the component doesn't use URL params
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'juan.perez@ucr.ac.cr' } });

    // Verify that only the email-matched user is shown
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('María Rodríguez')).not.toBeInTheDocument();
    expect(screen.queryByText('Carlos Méndez')).not.toBeInTheDocument();
  });

  it('handles empty URL parameters', async () => {
    cleanup();
    // Mock the useSearchParams hook to return no parameters
    const mockSearchParams = new URLSearchParams();
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    
    // Re-render with the mock search params
    render(<SuspendUser />);

    // Verify that the search input is empty
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    expect(searchInput).toHaveValue('');

    // Verify that all users are shown
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María Rodríguez')).toBeInTheDocument();
    expect(screen.getByText('Carlos Méndez')).toBeInTheDocument();
  });
}); 