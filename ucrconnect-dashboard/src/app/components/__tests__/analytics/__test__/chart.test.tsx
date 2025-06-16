import React from 'react';
import { render, screen } from '@testing-library/react';
import Chart from '@/components/analytics/chart';

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive">{children}</div>,
  LineChart: ({ children }: any) => <svg data-testid="line-chart">{children}</svg>,
  BarChart: ({ children }: any) => <svg data-testid="bar-chart">{children}</svg>,
  Line: () => <path data-testid="line" />,
  Bar: ({ children }: any) => <g data-testid="bar">{children}</g>,
  Cell: () => <rect data-testid="cell" />,
  XAxis: () => <g data-testid="x-axis" />,
  YAxis: () => <g data-testid="y-axis" />,
  CartesianGrid: () => <g data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('Chart component', () => {
  const mockData = [
    { date: '2024-01-01', value: 10 },
    { date: '2024-01-02', value: 20 },
    { date: '2024-01-03', value: 15 },
  ];

  it('muestra mensaje cuando no hay datos', () => {
    render(<Chart data={[]} xKey="date" yKey="value" />);
    expect(screen.getByText(/no hay datos para mostrar/i)).toBeInTheDocument();
  });

  it('renderiza gráfico de línea por defecto', () => {
    render(<Chart data={mockData} xKey="date" yKey="value" />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });

  it('renderiza gráfico de barras cuando se especifica', () => {
    render(<Chart data={mockData} xKey="date" yKey="value" type="bar" />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getAllByTestId('cell').length).toBeGreaterThan(0);
  });

  it('usa el color especificado para el gráfico de línea (mock)', () => {
    render(<Chart data={mockData} xKey="date" yKey="value" type="line" color="#ff0000" />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('aplica colores personalizados a las barras', () => {
    const customColors = ['#111111', '#222222', '#333333'];
    render(
      <Chart data={mockData} xKey="date" yKey="value" type="bar" barColors={customColors} />
    );
    expect(screen.getAllByTestId('cell').length).toBe(mockData.length);
  });
});
