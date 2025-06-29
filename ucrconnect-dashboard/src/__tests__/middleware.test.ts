import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn((url) => ({ 
      url,
      cookies: {
        set: jest.fn()
      }
    })),
    next: jest.fn(() => ({})),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to login when accessing protected route without token', async () => {
    const request = {
      nextUrl: { pathname: '/dashboard' },
      cookies: { get: jest.fn().mockReturnValue(null) },
      url: 'http://localhost:3000/dashboard',
    } as unknown as NextRequest;

    await middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.any(URL)
    );
    
    const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectCall.href).toBe('http://localhost:3000/login');
  });

  it('should allow access to protected route with valid token', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    const request = {
      nextUrl: { pathname: '/dashboard' },
      cookies: { get: jest.fn().mockReturnValue({ value: 'valid-token' }) },
      url: 'http://localhost:3000/dashboard',
    } as unknown as NextRequest;

    await middleware(request);

    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('should redirect to login with session expired when token is invalid', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);

    const request = {
      nextUrl: { pathname: '/dashboard' },
      cookies: { get: jest.fn().mockReturnValue({ value: 'invalid-token' }) },
      url: 'http://localhost:3000/dashboard',
    } as unknown as NextRequest;

    await middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.any(URL)
    );
    
    const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectCall.href).toBe('http://localhost:3000/login?session_expired=true');
  });

  it('should redirect to login with session expired when token validation fails', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockRejectedValue(new Error('Network error'));

    const request = {
      nextUrl: { pathname: '/dashboard' },
      cookies: { get: jest.fn().mockReturnValue({ value: 'invalid-token' }) },
      url: 'http://localhost:3000/dashboard',
    } as unknown as NextRequest;

    await middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.any(URL)
    );
    
    const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectCall.href).toBe('http://localhost:3000/login?session_expired=true');
  });

  it('should redirect to dashboard when accessing login with valid token', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    const request = {
      nextUrl: { pathname: '/login' },
      cookies: { get: jest.fn().mockReturnValue({ value: 'valid-token' }) },
      url: 'http://localhost:3000/login',
    } as unknown as NextRequest;

    await middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.any(URL)
    );
    
    const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectCall.href).toBe('http://localhost:3000/');
  });

  it('should allow access to login page without token', async () => {
    const request = {
      nextUrl: { pathname: '/login' },
      cookies: { get: jest.fn().mockReturnValue(null) },
      url: 'http://localhost:3000/login',
    } as unknown as NextRequest;

    await middleware(request);

    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('should allow access to public routes without token', async () => {
    const request = {
      nextUrl: { pathname: '/public-route' },
      cookies: { get: jest.fn().mockReturnValue(null) },
      url: 'http://localhost:3000/public-route',
    } as unknown as NextRequest;

    await middleware(request);

    expect(NextResponse.next).toHaveBeenCalled();
  });
}); 