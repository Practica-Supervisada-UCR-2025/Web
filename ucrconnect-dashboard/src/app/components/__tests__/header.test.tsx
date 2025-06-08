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
            { path: '/content', title: 'Contenido' },
            { path: '/analytics', title: 'Anal\u00EDticas' },
            { path: '/settings', title: 'Configuraci\u00F3n' },
        ];

        for (const { path, title } of pathsToTest) {
            usePathname.mockReturnValue(path);
            const { unmount } = render(<Header />);
            expect(screen.getByText(title)).toBeInTheDocument();
            unmount();
        }
    });

    it('opens and closes settings dropdown when settings button is clicked', async () => {
        render(<Header />);

        // Settings should not be visible initially
        expect(screen.queryByText('Configuraciones')).not.toBeInTheDocument();

        // Click settings button
        fireEvent.click(screen.getByAltText('Settings'));

        // Fast-forward timers to trigger visibility
        act(() => {
            jest.advanceTimersByTime(50);
        });

        // Settings should now be visible
        expect(screen.getByText('Configuraciones')).toBeInTheDocument();
        expect(screen.getByText('Editar configuraciones')).toBeInTheDocument();

        // Click settings button again to close
        fireEvent.click(screen.getByAltText('Settings'));

        // Fast-forward timers to trigger closing animation
        act(() => {
            jest.advanceTimersByTime(150);
        });

        // Settings should no longer be visible
        expect(screen.queryByText('Configuraciones')).not.toBeInTheDocument();
    });

    it('opens and closes notifications dropdown when notifications button is clicked', async () => {
        render(<Header />);

        // Notifications should not be visible initially
        expect(screen.queryByText('Notifications')).not.toBeInTheDocument();

        // Click notifications button
        fireEvent.click(screen.getByAltText('Notifications'));

        // Fast-forward timers to trigger visibility
        act(() => {
            jest.advanceTimersByTime(50);
        });

        // Notifications should now be visible
        expect(screen.getByText('Notifications')).toBeInTheDocument();
        expect(screen.getByText('Sin notificaciones.')).toBeInTheDocument();

        // Click notifications button again to close
        fireEvent.click(screen.getByAltText('Notifications'));

        // Fast-forward timers to trigger closing animation
        act(() => {
            jest.advanceTimersByTime(150);
        });

        // Notifications should no longer be visible
        expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });

    it('closes settings when notifications button is clicked', async () => {
        render(<Header />);

        // Click settings button to open settings
        fireEvent.click(screen.getByAltText('Settings'));

        // Fast-forward timers
        act(() => {
            jest.advanceTimersByTime(50);
        });

        // Settings should be visible
        expect(screen.getByText('Configuraciones')).toBeInTheDocument();

        // Click notifications button
        fireEvent.click(screen.getByAltText('Notifications'));

        // Fast-forward timers for closing settings
        act(() => {
            jest.advanceTimersByTime(150);
        });

        // Fast-forward timers for opening notifications
        act(() => {
            jest.advanceTimersByTime(50);
        });

        // Settings should be closed and notifications should be open
        expect(screen.queryByText('Configuraciones')).not.toBeInTheDocument();
        expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('closes notifications when settings button is clicked', async () => {
        render(<Header />);

        // Click notifications button to open notifications
        fireEvent.click(screen.getByAltText('Notifications'));

        // Fast-forward timers
        act(() => {
            jest.advanceTimersByTime(50);
        });

        // Notifications should be visible
        expect(screen.getByText('Notifications')).toBeInTheDocument();

        // Click settings button
        fireEvent.click(screen.getByAltText('Settings'));

        // Fast-forward timers for closing notifications
        act(() => {
            jest.advanceTimersByTime(150);
        });

        // Fast-forward timers for opening settings
        act(() => {
            jest.advanceTimersByTime(50);
        });

        // Notifications should be closed and settings should be open
        expect(screen.queryByText('Sin notificaciones.')).not.toBeInTheDocument();
        expect(screen.getByText('Configuraciones')).toBeInTheDocument();
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

    it('cleans up timeouts when unmounted', () => {
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

        const { unmount } = render(<Header />);

        // Click both buttons to create timeouts
        fireEvent.click(screen.getByAltText('Settings'));
        fireEvent.click(screen.getByAltText('Notifications'));

        // Unmount component
        unmount();

        // Should clean up timeouts
        expect(clearTimeoutSpy).toHaveBeenCalled();
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

    it('closes profile dropdown when settings button is clicked', async () => {
        render(<Header />);

        // Click profile button to open profile dropdown
        fireEvent.click(screen.getByAltText('profile'));
        
        // Fast-forward timers
        act(() => {
            jest.advanceTimersByTime(50);
        });

        // Profile dropdown should be visible
        expect(screen.getByText('Ver perfil')).toBeInTheDocument();

        // Click settings button
        fireEvent.click(screen.getByAltText('Settings'));

        // Fast-forward timers for closing profile
        act(() => {
            jest.advanceTimersByTime(150);
        });

        // Fast-forward timers for opening settings
        act(() => {
            jest.advanceTimersByTime(50);
        });

        // Profile dropdown should be closed and settings should be open
        expect(screen.queryByText('Ver perfil')).not.toBeInTheDocument();
        expect(screen.getByText('Configuraciones')).toBeInTheDocument();
    });

    it('closes profile dropdown when notifications button is clicked', async () => {
        render(<Header />);

        // Click profile button to open profile dropdown
        fireEvent.click(screen.getByAltText('profile'));
        
        // Fast-forward timers
        act(() => {
            jest.advanceTimersByTime(50);
        });

        // Profile dropdown should be visible
        expect(screen.getByText('Ver perfil')).toBeInTheDocument();

        // Click notifications button
        fireEvent.click(screen.getByAltText('Notifications'));

        // Fast-forward timers for closing profile
        act(() => {
            jest.advanceTimersByTime(150);
        });

        // Fast-forward timers for opening notifications
        act(() => {
            jest.advanceTimersByTime(50);
        });

        // Profile dropdown should be closed and notifications should be open
        expect(screen.queryByText('Ver perfil')).not.toBeInTheDocument();
        expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('cleans up all timeouts when unmounted', () => {
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

        const { unmount } = render(<Header />);

        // Click all buttons to create timeouts
        fireEvent.click(screen.getByAltText('Settings'));
        fireEvent.click(screen.getByAltText('Notifications'));
        fireEvent.click(screen.getByAltText('profile'));

        // Fast-forward timers to ensure timeouts are created
        act(() => {
            jest.advanceTimersByTime(50);
        });

        // Unmount component
        unmount();

        // Should clean up all timeouts
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });
});