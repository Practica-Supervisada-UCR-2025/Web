import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Mock window.location
const mockLocation = {
  href: '',
  origin: 'http://localhost:3000',
  reload: jest.fn(),
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  value: '',
  writable: true,
});

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Custom fallback component
const CustomFallback = () => (
  <div data-testid="custom-fallback">Custom error fallback</div>
);

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Reset mocks
    mockLocation.href = '';
    mockLocation.reload.mockClear();
    document.cookie = '';
    jest.clearAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child component</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child component')).toBeInTheDocument();
  });

  it('should render default error UI when an error occurs', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('Ha ocurrido un error inesperado. Por favor, intente recargar la página.')).toBeInTheDocument();
    expect(screen.getByText('Recargar página')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should render custom fallback when provided and error occurs', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should reload page when reload button is clicked', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText('Recargar página');
    fireEvent.click(reloadButton);

    expect(mockLocation.reload).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should log error to console when non-session error occurs', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );

    consoleSpy.mockRestore();
  });

  it('should preserve error state for non-session errors', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show error UI
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();

    // Rerender with no error - should still show error UI
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Should still show error UI because error state is preserved
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should test getDerivedStateFromError for session expiration', () => {
    const sessionExpiredError = new Error('Session expired');
    const result = ErrorBoundary.getDerivedStateFromError(sessionExpiredError);
    
    // Should return hasError: false for session expiration
    expect(result).toEqual({ hasError: false });
    
    // Should clear cookie
    expect(document.cookie).toContain('access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;');
    
    // Should redirect
    expect(mockLocation.href).toBe('http://localhost:3000/login?session_expired=true');
  });

  it('should test getDerivedStateFromError for regular errors', () => {
    const regularError = new Error('Regular error');
    const result = ErrorBoundary.getDerivedStateFromError(regularError);
    
    // Should return hasError: true for regular errors
    expect(result).toEqual({ hasError: true, error: regularError });
    
    // Should not clear cookie or redirect
    expect(document.cookie).toBe('');
    expect(mockLocation.href).toBe('');
  });

  it('should test componentDidCatch for session expiration', () => {
    const errorBoundary = new ErrorBoundary({ children: <div>test</div> });
    const sessionExpiredError = new Error('Session expired');
    const errorInfo = { componentStack: 'test' };
    
    // Mock console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    errorBoundary.componentDidCatch(sessionExpiredError, errorInfo);
    
    // Should clear cookie
    expect(document.cookie).toContain('access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;');
    
    // Should redirect
    expect(mockLocation.href).toBe('http://localhost:3000/login?session_expired=true');
    
    consoleSpy.mockRestore();
  });

  it('should test componentDidCatch for regular errors', () => {
    const errorBoundary = new ErrorBoundary({ children: <div>test</div> });
    const regularError = new Error('Regular error');
    const errorInfo = { componentStack: 'test' };
    
    // Mock console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    errorBoundary.componentDidCatch(regularError, errorInfo);
    
    // Should log error
    expect(consoleSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      regularError,
      errorInfo
    );
    
    // Should not clear cookie or redirect
    expect(document.cookie).toBe('');
    expect(mockLocation.href).toBe('');
    
    consoleSpy.mockRestore();
  });
}); 