import { GET, PATCH } from '@/app/api/admin/auth/profile/route';
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

const mockRequest = (cookieValue: string | null, formData?: FormData): any => {
  return {
    cookies: {
      get: jest.fn(() => (cookieValue ? { value: cookieValue } : undefined)),
    },
    formData: jest.fn(() => Promise.resolve(formData || new FormData())),
  };
};

describe('GET /api/admin/auth/profile', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 if no access token in cookies', async () => {
    const response: any = await GET(mockRequest(null));
    expect(response.status).toBe(401);
    expect(response.message).toBe('Unauthorized');
  });

  it('returns profile data when successful', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { full_name: 'Test User' } }),
    });

    const response: any = await GET(mockRequest('valid-token'));
    expect(response.status).toBe(200);
    expect(response.message).toBe('Profile retrieved successfully');
    expect(response.data.full_name).toBe('Test User');
  });

  it('returns error when backend fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ error: 'Forbidden' }),
    });

    const response: any = await GET(mockRequest('valid-token'));
    expect(response.status).toBe(403);
    expect(response.message).toBe('Failed to fetch profile');
    expect(response.error).toEqual({ error: 'Forbidden' });
  });

  it('returns 500 on internal error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const response: any = await GET(mockRequest('valid-token'));
    expect(response.status).toBe(500);
    expect(response.message).toBe('Internal server error');
    expect(response.error).toBe('Network error');
  });
});

describe('PATCH /api/admin/auth/profile', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 if no token is present', async () => {
    const response: any = await PATCH(mockRequest(null));
    expect(response.status).toBe(401);
    expect(response.message).toBe('Unauthorized');
  });

  it('updates profile successfully', async () => {
    const formData = new FormData();
    formData.append('full_name', 'Updated Name');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { full_name: 'Updated Name' } }),
    });

    const response: any = await PATCH(mockRequest('valid-token', formData));
    expect(response.status).toBe(200);
    expect(response.message).toBe('Profile updated successfully');
    expect(response.data.full_name).toBe('Updated Name');
  });

  it('returns error when backend fails update', async () => {
    const formData = new FormData();
    formData.append('full_name', 'Error Name');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Bad request' }),
    });

    const response: any = await PATCH(mockRequest('valid-token', formData));
    expect(response.status).toBe(400);
    expect(response.message).toBe('Failed to update profile');
    expect(response.error).toEqual({ message: 'Bad request' });
  });

  it('returns 500 on unexpected error', async () => {
    const formData = new FormData();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Unexpected failure'));

    const response: any = await PATCH(mockRequest('valid-token', formData));
    expect(response.status).toBe(500);
    expect(response.message).toBe('Internal server error');
    expect(response.error).toBe('Unexpected failure');
  });
});