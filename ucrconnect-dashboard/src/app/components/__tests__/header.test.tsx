import { render, screen, fireEvent, act } from '@testing-library/react';
import Header from '../header';
import '@testing-library/jest-dom';

// Mock Node.js timers
jest.useFakeTimers();

// Mock Firebase
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
    getApps: jest.fn(() => []),
}));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
        currentUser: null,
        onAuthStateChanged: jest.fn(),
    })),
    signOut: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={href}>{children}</a>;
    };
});

describe('Header Component', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Default mock for usePathname
        const { usePathname } = require('next/navigation');
        usePathname.mockReturnValue('/');
    });

    afterEach(() => {
        // Clear all timers after each test
        jest.clearAllTimers();
    });

    it('displays different section titles based on pathname', () => {
        const { usePathname } = require('next/navigation');

        // Test different paths
        const pathsToTest = [
            { path: '/users', title: 'Usuarios' },
            { path: '/content', title: 'Moderaci\u00F3n' },
            { path: '/analytics', title: 'Anal\u00EDticas' },
        ];

        for (const { path, title } of pathsToTest) {
            usePathname.mockReturnValue(path);
            const { unmount } = render(<Header />);
            expect(screen.getByText(title)).toBeInTheDocument();
            unmount();
        }
    });

    it('has functioning link to profile page', () => {
        render(<Header />);
        const profileImage = screen.getByAltText('profile');
        expect(profileImage).toBeInTheDocument();
        
        // Click the profile button to open the dropdown
        fireEvent.click(profileImage);
        
        // Fast-forward timers to trigger visibility
        act(() => {
            jest.advanceTimersByTime(50);
        });
        
        // Find the profile link in the dropdown
        const profileLink = screen.getByText('Ver perfil');
        expect(profileLink).toBeInTheDocument();
        expect(profileLink).toHaveAttribute('href', '/profile');
    });

    it('calls logout API and redirects on logout', async () => {
        // Mock fetch
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true
        });
        global.fetch = mockFetch;

        // Mock Firebase signOut
        const { signOut } = require('firebase/auth');
        signOut.mockResolvedValue(undefined);

        // Mock window.location
        const mockLocation = { href: '' };
        Object.defineProperty(window, 'location', {
            value: mockLocation,
            writable: true
        });

        render(<Header />);
        
        // Click profile button to open dropdown
        fireEvent.click(screen.getByAltText('profile'));
        
        // Fast-forward timers
        act(() => {
            jest.advanceTimersByTime(50);
        });

        // Click logout button
        fireEvent.click(screen.getByText('Cerrar sesión'));

        // Wait for fetch to complete
        await act(async () => {
            await Promise.resolve();
        });

        // Verify fetch was called with correct endpoint
        expect(mockFetch).toHaveBeenCalledWith('/api/admin/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Verify Firebase signOut was called
        expect(signOut).toHaveBeenCalled();

        // Verify redirect
        expect(window.location.href).toBe('/login?logout=success');
    });

    it('handles logout error', async () => {
        // Mock fetch to fail
        const mockFetch = jest.fn().mockResolvedValue({
            ok: false
        });
        global.fetch = mockFetch;

        // Mock Firebase signOut to fail
        const { signOut } = require('firebase/auth');
        signOut.mockRejectedValue(new Error('Firebase error'));

        // Mock window.location
        const mockLocation = { href: '' };
        Object.defineProperty(window, 'location', {
            value: mockLocation,
            writable: true
        });

        // Mock console.error
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        render(<Header />);
        
        // Click profile button to open dropdown
        fireEvent.click(screen.getByAltText('profile'));
        
        // Fast-forward timers
        act(() => {
            jest.advanceTimersByTime(50);
        });

        // Click logout button
        fireEvent.click(screen.getByText('Cerrar sesión'));

        // Wait for fetch to complete
        await act(async () => {
            await Promise.resolve();
        });

        // Verify fetch was called
        expect(mockFetch).toHaveBeenCalledWith('/api/admin/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Verify Firebase signOut was called
        expect(signOut).toHaveBeenCalled();

        // Verify error was logged
        expect(consoleSpy).toHaveBeenCalledWith('Failed to logout from backend');

        // Verify redirect
        expect(window.location.href).toBe('/login?logout=error');

        // Clean up
        consoleSpy.mockRestore();
    });
});