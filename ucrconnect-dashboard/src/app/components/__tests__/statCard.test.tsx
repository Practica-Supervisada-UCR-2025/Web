import { render, screen } from '@testing-library/react';
import StatCard from '@/components/statCard';

describe('StatCard component', () => {
  it('muestra correctamente título y valor', () => {
    render(<StatCard title="Usuarios" value={1200} />);
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('1200')).toBeInTheDocument();
  });

  it('debe renderizar como enlace cuando se pasa route', () => {
    render(<StatCard title="Usuarios" value={1200} route="/usuarios" />);
    const linkElement = screen.getByRole('link');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('role', 'link');
  });

  it('aplica fondo personalizado cuando se pasa bgStyle', () => {
    render(<StatCard title="Usuarios" value={1200} bgStyle="bg-blue-100" />);
    expect(screen.getByRole('region')).toHaveClass('bg-blue-100');
  });

  it('navega correctamente al hacer click cuando hay route', () => {
    delete (window as any).location;
    (window as any).location = { href: '' };

    render(<StatCard title="Usuarios" value={1200} route="/usuarios" />);
    const link = screen.getByRole('link');
    link.click();

    expect(window.location.href).toBe('/usuarios');
  });

  it('navega al presionar Enter cuando hay route', () => {
    delete (window as any).location;
    (window as any).location = { href: '' };

    render(<StatCard title="Usuarios" value={1200} route="/usuarios" />);
    const link = screen.getByRole('link');
    link.focus();

    link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(window.location.href).toBe('/usuarios');
  });
});
