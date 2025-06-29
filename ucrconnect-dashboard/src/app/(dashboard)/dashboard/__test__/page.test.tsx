import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../page';

// Mock de StatCard
jest.mock('@/app/components/statCard', () => {
  return function MockStatCard({ title, value, bgStyle }) {
    return (
      <div data-testid="stat-card" className={bgStyle}>
        <div data-testid="stat-title">{title}</div>
        <div data-testid="stat-value">{value}</div>
      </div>
    );
  };
});

// Mock de Link
jest.mock('next/link', () => {
  return ({ href, children }) => <a href={href} data-testid="next-link">{children}</a>;
});

// Mock de Chart
jest.mock('@/app/components/analytics/chart', () => {
  return function MockChart({ type }) {
    return <div data-testid={`chart-${type}`}>{`Chart tipo ${type}`}</div>;
  };
});

// Mocks de funciones de API
jest.mock('@/lib/dashboardApi', () => ({
  fetchUserGrowthDashboardData: jest.fn(() =>
    Promise.resolve({
      chartData: [{ date: '2024-01', count: 100 }],
      totalUsers: 5234
    })
  ),
  fetchPostCountLast30Days: jest.fn(() =>
    Promise.resolve({
      data: [{ date: '2025-06-01', count: 20 }],
      totalPosts: 1234
    })
  ),
  fetchReportsLast30Days: jest.fn(() =>
    Promise.resolve({
      chartData: [{ date: '2025-06-01', count: 5 }],
      totalReports: 56
    })
  )
}));

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza las tarjetas con los datos correctos', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getAllByTestId('stat-card')).toHaveLength(3);
    });

    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Posts/Mes')).toBeInTheDocument();
    expect(screen.getByText('Reportes/Mes')).toBeInTheDocument();

    expect(screen.getByText('5234')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByText('56')).toBeInTheDocument();
  });

  test('renderiza los gráficos con datos', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
      expect(screen.getByTestId('chart-bar')).toBeInTheDocument();
      expect(screen.getByTestId('chart-pie')).toBeInTheDocument();
    });
  });

  test('renderiza mensaje de error si falla la carga', async () => {
    // Forzamos error
    const { fetchUserGrowthDashboardData } = require('@/lib/dashboardApi');
    fetchUserGrowthDashboardData.mockImplementationOnce(() => {
      throw new Error('Error al cargar el panel');
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Error al cargar el panel/i)).toBeInTheDocument();
    });
  });

  test('envuelve tarjetas en links correctos', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      const links = screen.getAllByTestId('next-link');
      expect(links[0]).toHaveAttribute('href', '/users');
      expect(links[1]).toHaveAttribute('href', '/content');
      expect(links[2]).toHaveAttribute('href', '/content');
    });
  });

  test('aplica estilos de fondo personalizados a la tarjeta de Usuarios', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      const usuariosCard = screen.getAllByTestId('stat-card')[0];
      expect(usuariosCard.className).toContain('from-[#249DD8]');
      expect(usuariosCard.className).toContain('text-white');
    });
  });
});
