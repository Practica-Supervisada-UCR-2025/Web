// tests/api/analytics/growth.test.ts
import { GET } from '@/app/api/analytics/user-stats/growth/route';
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

const mockRequest = (cookieValue: string | null, url = ''): any => ({
  cookies: {
    get: jest.fn(() => (cookieValue ? { value: cookieValue } : undefined)),
  },
  url,
});

describe('GET /api/analytics/user-stats/growth', () => {
  beforeEach(() => jest.clearAllMocks());

  const baseUrl = 'http://localhost:3000/api/analytics/user-stats/growth';
  const validUrl = `${baseUrl}?interval=daily&startDate=2024-01-01&endDate=2024-01-31`;

  it('returns 401 if no access token is present', async () => {
    const req = mockRequest(null, validUrl);
    const res: any = await GET(req);

    expect(res.status).toBe(401);
    expect(res.message).toMatch(/no autorizado/i);
  });

  it('returns 400 if query parameters are missing', async () => {
    const req = mockRequest('valid-token', `${baseUrl}?interval=weekly`);
    const res: any = await GET(req);

    expect(res.status).toBe(400);
    expect(res.message).toMatch(/faltan parámetros requeridos/i);
  });

  it('returns backend error if response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve('Internal error from backend'),
    });

    const res: any = await GET(mockRequest('valid-token', validUrl));

    expect(res.status).toBe(502);
    expect(res.message).toMatch(/error al obtener datos/i);
    expect(res.backendResponsePreview).toMatch(/internal error/i);
  });

  it('returns error if backend returns non-JSON response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'text/html' },
      text: () => Promise.resolve('<html>not JSON</html>'),
    });

    const res: any = await GET(mockRequest('valid-token', validUrl));

    expect(res.status).toBe(502);
    expect(res.message).toMatch(/no es JSON/i);
    expect(res.backendResponsePreview).toMatch(/<html>/i);
  });

  it('returns data if backend responds successfully', async () => {
    const fakeData = { users: [1, 2, 3] };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve(fakeData),
    });

    const res: any = await GET(mockRequest('valid-token', validUrl));

    expect(res.status).toBe(200);
    expect(res.message).toBe('Datos obtenidos');
    expect(res.data).toEqual(fakeData);
  });

  it('returns 500 on internal server error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

    const res: any = await GET(mockRequest('valid-token', validUrl));

    expect(res.status).toBe(500);
    expect(res.message).toMatch(/error interno/i);
    expect(res.error).toBe('Network failure');
  });
});
