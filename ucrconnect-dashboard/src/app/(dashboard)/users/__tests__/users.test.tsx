import { render, screen, fireEvent } from '@testing-library/react';
import Users from '@/app/(dashboard)/users/page';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Users Page', () => {
  beforeEach(() => {
    render(<Users />);
  });

  test('displays dashboard stats correctly', () => {
    // Check if the stats card exists
    const statsCard = screen.getByText('1234');
    expect(statsCard).toBeInTheDocument();

    // Check if the title is correct
    expect(screen.getByText('Usuarios')).toBeInTheDocument();

    // Check if the change percentage is displayed
    expect(screen.getByText('+12%')).toBeInTheDocument();

    // Check if the card has the correct background gradient
    const card = statsCard.closest('div[class*="bg-gradient-to-tr"]');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-gradient-to-tr', 'from-[#249DD8]', 'to-[#41ADE7BF]', 'text-white');
  });

  test('dashboard stats card is clickable and has correct link', () => {
    const statsCard = screen.getByText('1234').closest('a');
    expect(statsCard).toHaveAttribute('href', '/users');
  });

  test('shows title and button with correct link', () => {
    // Title
    expect(screen.getByRole('heading', { name: /usuarios/i, level: 3 })).toBeInTheDocument();

    // Button
    const button = screen.getByRole('button', { name: /registrar nuevo usuario/i });
    expect(button).toBeInTheDocument();

    // Link
    const link = button.closest('a');
    expect(link).toHaveAttribute('href', '/users/register');
  });

  test('displays table with correct headers', () => {
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(6);
    expect(headers[0]).toHaveTextContent('Nombre');
    expect(headers[1]).toHaveTextContent('Correo');
    expect(headers[2]).toHaveTextContent('Tipo');
    expect(headers[3]).toHaveTextContent('Estado');
  });

  test('displays user data correctly', () => {
    // First user (Juan Pérez)
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('juan.perez@ucr.ac.cr')).toBeInTheDocument();
    const studentTypes = screen.getAllByText('Estudiante');
    expect(studentTypes).toHaveLength(2); // Both Juan and Carlos are students
    const activeStatuses = screen.getAllByText('Activo');
    expect(activeStatuses).toHaveLength(2); // Both Juan and María are active

    // Second user (María Rodríguez)
    expect(screen.getByText('María Rodríguez')).toBeInTheDocument();
    expect(screen.getByText('maria.rodriguez@ucr.ac.cr')).toBeInTheDocument();
    expect(screen.getByText('Profesor')).toBeInTheDocument();

    // Third user (Carlos Méndez)
    expect(screen.getByText('Carlos Méndez')).toBeInTheDocument();
    expect(screen.getByText('carlos.mendez@ucr.ac.cr')).toBeInTheDocument();
    expect(screen.getByText('Suspendido')).toBeInTheDocument();
  });

  test('filters users when typing in search input', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    
    // Search by name
    fireEvent.change(searchInput, { target: { value: 'Juan' } });
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('María Rodríguez')).not.toBeInTheDocument();
    expect(screen.queryByText('Carlos Méndez')).not.toBeInTheDocument();

    // Search by email
    fireEvent.change(searchInput, { target: { value: 'maria' } });
    expect(screen.getByText('María Rodríguez')).toBeInTheDocument();
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
    expect(screen.queryByText('Carlos Méndez')).not.toBeInTheDocument();
  });

  test('displays correct user status badges with proper styling', () => {
    const activeBadges = screen.getAllByText('Activo');
    const suspendedBadge = screen.getByText('Suspendido');

    expect(activeBadges).toHaveLength(2);
    activeBadges.forEach(badge => {
      expect(badge).toHaveClass('border', 'border-[#609000]', 'text-[#609000]');
    });

    expect(suspendedBadge).toBeInTheDocument();
    expect(suspendedBadge).toHaveClass('border', 'border-red-700', 'text-red-700');
  });

  test('has action buttons for each user', () => {
    const editButtons = screen.getAllByRole('button', { name: '' });
    expect(editButtons).toHaveLength(6); // 3 users * 2 buttons each (edit and notify)
  });
});
