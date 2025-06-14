// app/(dashboard)/analytics/__test__/page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Analytics from '../page';
import React from 'react';

jest.mock('@/app/components/analytics/chart', () => {
  return function MockChart({ data, type, xKey, yKey }: any) {
    return (
      <div data-testid="chart-mock">
        Chart: {type} | xKey: {xKey} | yKey: {yKey} | dataLength: {data.length}
      </div>
    );
  };
});

jest.mock('@/lib/analyticsApi', () => ({
  fetchAnalytics: jest.fn(),
}));

import { fetchAnalytics } from '@/lib/analyticsApi';

describe('Analytics Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders inputs and fetch button', () => {
    render(<Analytics />);

    expect(screen.getByLabelText('Tipo de gráfico')).toBeInTheDocument();
    expect(screen.getByLabelText('Intervalo')).toBeInTheDocument();
    expect(screen.getByLabelText('Inicio')).toBeInTheDocument();
    expect(screen.getByLabelText('Fin')).toBeInTheDocument();
    expect(screen.getByText('Solicitar')).toBeInTheDocument();
  });

  test('renders chart after fetching data', async () => {
    (fetchAnalytics as jest.Mock).mockResolvedValue({
      data: {
        series: [
          { date: '2024-01-01', count: 10 },
          { date: '2024-01-02', count: 20 },
        ],
      },
    });

    render(<Analytics />);
    fireEvent.click(screen.getByText('Solicitar'));

    await waitFor(() => {
      expect(fetchAnalytics).toHaveBeenCalled();
      expect(screen.getByTestId('chart-mock')).toBeInTheDocument();
      expect(screen.getByTestId('chart-mock')).toHaveTextContent('Chart: line');
    });
  });

  test('switches to bar chart for volume graph type', async () => {
    (fetchAnalytics as jest.Mock).mockResolvedValue({
      data: {
        series: [{ date: '2024-01-01', count: 10 }],
      },
    });

    render(<Analytics />);
    fireEvent.change(screen.getByLabelText('Tipo de gráfico'), {
      target: { value: 'volume' },
    });
    fireEvent.click(screen.getByText('Solicitar'));

    await waitFor(() => {
      expect(screen.getByTestId('chart-mock')).toHaveTextContent('Chart: bar');
    });
  });

  test('uses line chart by default if graphType is unknown', async () => {
    (fetchAnalytics as jest.Mock).mockResolvedValue({
      data: { series: [{ date: '2024-01-01', count: 5 }] },
    });

    render(<Analytics />);
    fireEvent.change(screen.getByLabelText('Tipo de gráfico'), {
      target: { value: 'otroTipoInvalido' },
    });
    fireEvent.click(screen.getByText('Solicitar'));

    await waitFor(() => {
      expect(screen.getByTestId('chart-mock')).toHaveTextContent('Chart: line');
    });
  });

  test('shows loading text when fetching data', async () => {
    (fetchAnalytics as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: { series: [] } }), 100)
        )
    );

    render(<Analytics />);
    fireEvent.click(screen.getByText('Solicitar'));

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  test('shows error message on API failure', async () => {
    (fetchAnalytics as jest.Mock).mockRejectedValue(new Error('Error de API'));

    render(<Analytics />);
    fireEvent.click(screen.getByText('Solicitar'));

    await waitFor(() => {
      expect(screen.getByText('Error de API')).toBeInTheDocument();
    });
  });

  test('shows "no data" message when response is empty', async () => {
    (fetchAnalytics as jest.Mock).mockResolvedValue({
      data: { series: [] },
    });

    render(<Analytics />);
    fireEvent.click(screen.getByText('Solicitar'));

    await waitFor(() => {
      expect(screen.getByText('No hay datos para mostrar.')).toBeInTheDocument();
    });
  });
});
