import { fetchAnalytics } from '@/lib/analyticsApi';

global.fetch = jest.fn();

describe('fetchAnalytics', () => {
  const params = {
    interval: 'daily',
    startDate: '2024-01-01',
    endDate: '2024-01-10',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches growth data correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [{ date: '2024-01-01', count: 5 }] }),
    });

    const data = await fetchAnalytics({ ...params, graphType: 'growth' });

    expect(fetch).toHaveBeenCalledWith(
      '/api/analytics/user-stats/growth?interval=daily&startDate=2024-01-01&endDate=2024-01-10'
    );
    expect(data).toEqual([{ date: '2024-01-01', count: 5 }]);
  });

  it('fetches volume data correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [{ date: '2024-01-01', count: 12 }] }),
    });

    const data = await fetchAnalytics({ ...params, graphType: 'volume' });

    expect(fetch).toHaveBeenCalledWith(
      '/api/analytics/posts-stats/volume?interval=daily&startDate=2024-01-01&endDate=2024-01-10'
    );
    expect(data).toEqual([{ date: '2024-01-01', count: 12 }]);
  });

  it('throws an error on unsupported graphType', async () => {
    await expect(
      fetchAnalytics({ ...params, graphType: 'unknown' })
    ).rejects.toThrow('Tipo de gráfico no soportado: unknown');
  });

  it('throws an error when backend returns an error with message', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Datos inválidos' }),
    });

    await expect(
      fetchAnalytics({ ...params, graphType: 'growth' })
    ).rejects.toThrow('Datos inválidos');
  });

  it('throws a generic error when backend response is not JSON', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject('not json'),
    });

    await expect(
      fetchAnalytics({ ...params, graphType: 'volume' })
    ).rejects.toThrow('Error al obtener datos');
  });

  it('fetches total data correctly with reversed date format', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [{ date: '01-01-2024', count: 3 }] }),
    });

    const data = await fetchAnalytics({ ...params, graphType: 'total' });

    expect(fetch).toHaveBeenCalledWith(
      '/api/analytics/posts/stats/total?start_date=01-01-2024&end_date=10-01-2024&period=daily'
    );
    expect(data).toEqual([{ date: '01-01-2024', count: 3 }]);
  });
});
