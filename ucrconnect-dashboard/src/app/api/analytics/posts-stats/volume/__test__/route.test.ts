import { GET } from '@/app/api/analytics/posts-stats/volume/route';
import { NextResponse } from 'next/server';

const originalConsole = { ...console };
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsole.error;
});

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      ...data,
      status: options?.status || 200,
    })),
  },
}));

global.fetch = jest.fn();

const mockRequest = (cookieValue: string | null, url = ''): any => {
  return {
    cookies: {
      get: jest.fn(() => (cookieValue ? { value: cookieValue } : undefined)),
    },
    url,
  };
};

describe('GET /api/analytics/posts-stats/volume', () => {
  beforeEach(() => jest.clearAllMocks());

  const validUrl =
    'https://example.com/api/analytics/posts-stats/volume?interval=daily&startDate=2024-01-01&endDate=2024-06-01';

  it('returns 401 if no token in cookies', async () => {
    const res: any = await GET(mockRequest(null, validUrl));
    expect(res.status).toBe(401);
    expect(res.message).toMatch(/No autorizado/i);
  });

  it('returns 400 if missing query parameters', async () => {
    const res: any = await GET(mockRequest('token', 'https://example.com'));
    expect(res.status).toBe(400);
    expect(res.message).toMatch(/Faltan parámetros requeridos/i);
  });

  it('returns 502 if backend fails with non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: { get: () => 'application/json' },
      text: async () => 'Server error',
    });

    const res: any = await GET(mockRequest('token', validUrl));
    expect(res.status).toBe(502);
    expect(res.message).toMatch(/Error al obtener datos/i);
  });

  it('returns 502 if backend returns non-JSON content', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'text/html' },
      text: async () => '<html>Error</html>',
    });

    const res: any = await GET(mockRequest('token', validUrl));
    expect(res.status).toBe(502);
    expect(res.message).toMatch(/no es JSON/i);
  });

  it('returns data if backend responds correctly', async () => {
    const mockData = { series: [1, 2, 3] };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => mockData,
    });

    const res: any = await GET(mockRequest('token', validUrl));
    expect(res.status).toBe(200);
    expect(res.message).toBe('Datos obtenidos');
    expect(res.data).toEqual(mockData);
  });

  it('returns 500 on unexpected fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network fail'));

    const res: any = await GET(mockRequest('token', validUrl));
    expect(res.status).toBe(500);
    expect(res.message).toMatch(/Error interno/i);
    expect(res.error).toBe('Network fail');
  });
});