import { POST } from '../route';
import { NextResponse } from 'next/server';

// Mock console methods
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
});

// Mock the NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      ...data,
      status: options?.status || 200,
      cookies: {
        set: jest.fn(),
        get: jest.fn(),
      },
    })),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('Login API Route', () => {
  const mockRequest = (body: any) => {
    return {
      json: () => Promise.resolve(body),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      url: 'http://localhost:3000/api/admin/auth/login',
      method: 'POST',
      // Add other required properties
      cache: 'default' as RequestCache,
      credentials: 'same-origin' as RequestCredentials,
      destination: '' as RequestDestination,
      integrity: '',
      keepalive: false,
      mode: 'cors' as RequestMode,
      redirect: 'follow' as RequestRedirect,
      referrer: '',
      referrerPolicy: 'no-referrer' as ReferrerPolicy,
      signal: new AbortController().signal,
      body: null,
      bodyUsed: false,
      clone: jest.fn(),
      arrayBuffer: jest.fn(),
      blob: jest.fn(),
      formData: jest.fn(),
      text: jest.fn(),
      bytes: jest.fn(),
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('handles successful login with backend response', async () => {
    // Mock successful backend response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        access_token: 'mock-backend-token'
      })
    });

    const response = await POST(mockRequest({
      email: 'test@ucr.ac.cr',
      full_name: 'Test User',
      auth_id: 'test-uid',
      auth_token: 'test-token',
    }));

    expect(response.status).toBe(200);
    expect(response).toEqual(expect.objectContaining({
      message: 'Login successful',
    }));
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/auth/login'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@ucr.ac.cr',
          full_name: 'Test User',
          auth_id: 'test-uid',
          auth_token: 'test-token',
        })
      })
    );
  });

  it('handles missing required fields', async () => {
    const response = await POST(mockRequest({}));

    expect(response.status).toBe(400);
    expect(response).toEqual(expect.objectContaining({
      message: 'Invalid request',
      details: 'Missing required fields'
    }));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles backend unauthorized response', async () => {
    // Mock unauthorized backend response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({
        message: 'Unauthorized',
        details: ['Not registered user']
      })
    });

    const response = await POST(mockRequest({
      email: 'test@ucr.ac.cr',
      full_name: 'Test User',
      auth_id: 'test-uid',
      auth_token: 'test-token',
    }));

    expect(response.status).toBe(401);
    expect(response).toEqual(expect.objectContaining({
      message: 'Unauthorized',
      details: ['Not registered user']
    }));
  });

  it('handles backend server error', async () => {
    // Mock server error backend response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({
        message: 'Internal server error'
      })
    });

    const response = await POST(mockRequest({
      email: 'test@ucr.ac.cr',
      full_name: 'Test User',
      auth_id: 'test-uid',
      auth_token: 'test-token',
    }));

    expect(response.status).toBe(500);
    expect(response).toEqual(expect.objectContaining({
      message: 'Internal server error'
    }));
  });

  it('handles fetch error', async () => {
    // Mock fetch error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const response = await POST(mockRequest({
      email: 'test@ucr.ac.cr',
      full_name: 'Test User',
      auth_id: 'test-uid',
      auth_token: 'test-token',
    }));

    expect(response.status).toBe(500);
    expect(response).toEqual(expect.objectContaining({
      message: 'Internal server error'
    }));
  });
}); 
