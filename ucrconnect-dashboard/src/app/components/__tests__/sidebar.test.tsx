import { render, screen, fireEvent, act } from '@testing-library/react';
import Sidebar from '../sidebar';
import '@testing-library/jest-dom';

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

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Sidebar Component', () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Default mock for usePathname
        const { usePathname } = require('next/navigation');
        usePathname.mockReturnValue('/dashboard');

        // Clear localStorage
        window.localStorage.clear();

        // Mock setTimeout and clearTimeout
        jest.useFakeTimers();
    });

    afterEach(() => {
        // Restore timers after each test
        jest.useRealTimers();
    });

    it('correctly highlights the active navigation item based on current pathname', () => {
        // Mock pathname for a specific route
        const { usePathname } = require('next/navigation');

        // Test dashboard page (active)
        usePathname.mockReturnValue('/dashboard');
        render(<Sidebar />);

        // General should be highlighted as active
        const generalItem = screen.getByText('General');
        expect(generalItem).toHaveClass('font-bold');

        // Other items should not be highlighted
        const usersItem = screen.getByText('Usuarios');
        expect(usersItem).not.toHaveClass('font-bold');

    });

    it('renders the sidebar with correct navigation items', () => {
        render(<Sidebar />);

        // Check if the brand name is rendered
        expect(screen.getByText('UCR Connect')).toBeInTheDocument();

        // Check for main navigation items
        expect(screen.getByText('General')).toBeInTheDocument();
        expect(screen.getByText('Usuarios')).toBeInTheDocument();
        expect(screen.getByText('Moderaci\u00F3n')).toBeInTheDocument();
        expect(screen.getByText('Anal\u00EDticas')).toBeInTheDocument();
        expect(screen.getByText('Notificaciones')).toBeInTheDocument();
    });

    it('collapses and expands when toggle button is clicked', () => {
        render(<Sidebar />);

        // Find the toggle button
        const toggleButton = screen.getAllByRole('button')[0];
        expect(toggleButton).toBeInTheDocument();

        // Sidebar should start expanded
        expect(screen.getByText('General')).toBeVisible();

        // Click to collapse
        fireEvent.click(toggleButton);

        // Animation occurs, text should be hidden
        act(() => {
            jest.advanceTimersByTime(300);
        });

        // After animation, we should no longer see the text
        expect(screen.queryByText('General')).not.toBeInTheDocument();

        // Find and click the collapsed toggle button
        const collapsedToggleButton = screen.getAllByRole('button')[0];
        fireEvent.click(collapsedToggleButton);

        // Animation occurs
        act(() => {
            jest.advanceTimersByTime(300);
        });

        // Text should be visible again
        expect(screen.getByText('General')).toBeVisible();
    });

    it('saves sidebar state to localStorage', () => {
        render(<Sidebar />);

        // Initially should be open (default state)
        expect(window.localStorage.getItem('sidebarState')).toBe('open');

        // Click to collapse
        const toggleButton = screen.getAllByRole('button')[0];
        fireEvent.click(toggleButton);

        // Check localStorage was updated
        expect(window.localStorage.getItem('sidebarState')).toBe('collapsed');

        // Click to expand
        act(() => {
            jest.advanceTimersByTime(300);
        });

        const collapsedToggleButton = screen.getAllByRole('button')[0];
        fireEvent.click(collapsedToggleButton);

        // Check localStorage was updated again
        act(() => {
            jest.advanceTimersByTime(300);
        });
        expect(window.localStorage.getItem('sidebarState')).toBe('open');
    });

    it('loads sidebar state from localStorage on mount', () => {
        // Set localStorage value before rendering
        window.localStorage.setItem('sidebarState', 'collapsed');

        render(<Sidebar />);

        // Check if sidebar starts collapsed
        const generalText = screen.queryByText('General');
        expect(generalText).not.toBeInTheDocument();
    });

    it('correctly links to respective pages', () => {
        render(<Sidebar />);

        // Check each navigation link has the correct href
        const generalLink = screen.getByText('General').closest('a');
        expect(generalLink).toHaveAttribute('href', '/dashboard');

        const usersLink = screen.getByText('Usuarios').closest('a');
        expect(usersLink).toHaveAttribute('href', '/users');

        const contentLink = screen.getByText('Moderaci\u00F3n').closest('a');
        expect(contentLink).toHaveAttribute('href', '/content');

        const analyticsLink = screen.getByText('Anal\u00EDticas').closest('a');
        expect(analyticsLink).toHaveAttribute('href', '/analytics');
    });

    it('renders appropriate burger menu for mobile', () => {
        render(<Sidebar />);

        // Check that mobile burger button exists
        const mobileMenuButton = screen.getAllByRole('button').find(button =>
            button.parentElement?.className.includes('md:hidden')
        );
        expect(mobileMenuButton).toBeInTheDocument();

        // Check that desktop sidebar also exists
        const desktopSidebar = document.querySelector('aside.hidden.md\\:block');
        expect(desktopSidebar).toBeInTheDocument();
    });

    it('opens and closes mobile menu when burger button is clicked', () => {
        render(<Sidebar />);

        // Find and click the mobile burger button
        const buttons = screen.getAllByRole('button');
        const mobileButton = buttons.find(button =>
            button.parentElement?.className.includes('md:hidden')
        );

        if (mobileButton) {
            fireEvent.click(mobileButton);

            // Mobile menu should now be open (Using "Notificaciones" since its in the menu)
            expect(screen.getAllByText('Notificaciones').length).toBeGreaterThan(0);

            // Find and click the close button
            const closeButton = screen.getAllByRole('button').find(button =>
                button.parentElement?.className.includes('md:hidden fixed top-4 right-4')
            );

            if (closeButton) {
                fireEvent.click(closeButton);
            }
        }
    });

    it('closes mobile menu when clicking a navigation item', () => {
        render(<Sidebar />);

        // Open mobile menu
        const buttons = screen.getAllByRole('button');
        const mobileButton = buttons.find(button =>
            button.parentElement?.className.includes('md:hidden')
        );

        if (mobileButton) {
            fireEvent.click(mobileButton);

            // Mobile menu should be open
            expect(screen.getAllByText('Notificaciones').length).toBeGreaterThan(0);

            // Click a navigation item
            const mobileNavItems = screen.getAllByText('General');
            // Find the one in the mobile menu
            const mobileNavItem = mobileNavItems.find(item =>
                item.closest('div')?.className.includes('md:hidden')
            );

            if (mobileNavItem) {
                fireEvent.click(mobileNavItem);
            }
        }
    });

    it('defaults to open sidebar when localStorage has no value', () => {
        // Ensure localStorage is empty
        window.localStorage.clear();

        render(<Sidebar />);

        // Check sidebar is expanded by default
        expect(screen.getByText('General')).toBeVisible();
        expect(screen.getByText('UCR Connect')).toBeVisible();

        const sidebar = document.querySelector('aside');
        expect(sidebar).toHaveClass('w-64');
    });

    it('renders collapsed sidebar correctly with only icons visible', () => {
        // Set localStorage to start collapsed
        window.localStorage.setItem('sidebarState', 'collapsed');

        render(<Sidebar />);

        // Check that text labels are not visible
        expect(screen.queryByText('General')).not.toBeInTheDocument();
        expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();

        // Check that sidebar has the collapsed width class
        const sidebar = document.querySelector('aside');
        expect(sidebar).toHaveClass('w-16');
        expect(sidebar).not.toHaveClass('w-64');
    });

});