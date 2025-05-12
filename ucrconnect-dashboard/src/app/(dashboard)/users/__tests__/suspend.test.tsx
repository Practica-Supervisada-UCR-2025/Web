import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SuspendUser from '../suspend/page';

describe('SuspendUser Page', () => {
  beforeEach(() => {
    render(<SuspendUser />);
  });

  it('renders the page title correctly', () => {
    const heading = screen.getByRole('heading', { name: 'Suspender Usuarios' });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-[#204C6F]');
  });

  it('renders the search input with correct placeholder and styling', () => {
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveClass('rounded-full', 'shadow-md');
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

    const modal = screen.getByRole('dialog', { name: /está apunto de suspender al siguiente usuario/i });
    expect(modal).toBeInTheDocument();
    expect(screen.getByText('Por favor, elija el tiempo de suspensión:')).toBeInTheDocument();
    
    const timeSelect = screen.getByRole('combobox');
    expect(timeSelect).toBeInTheDocument();
    expect(timeSelect).toHaveClass('text-gray-500');
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
    const suspendedBadge = screen.getByText('Suspendido');

    expect(activeBadges).toHaveLength(2);
    activeBadges.forEach(badge => {
      expect(badge).toHaveClass('bg-[#609000]/20', 'text-[#609000]');
    });

    expect(suspendedBadge).toBeInTheDocument();
    expect(suspendedBadge).toHaveClass('bg-red-100', 'text-red-700');
  });

  it('displays table with correct headers', () => {
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(5);
    expect(headers[0]).toHaveTextContent('Nombre');
    expect(headers[1]).toHaveTextContent('Correo');
    expect(headers[2]).toHaveTextContent('Tipo');
    expect(headers[3]).toHaveTextContent('Estado');
  });
}); 