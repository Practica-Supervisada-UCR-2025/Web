import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Content from '../page';

// Mock fetch globally
global.fetch = jest.fn();

// Mock data that matches the new API structure
const mockApiResponse = {
    message: 'Success',
    posts: [
        {
            id: '1',
            username: 'user1',
            email: 'user1@example.com',
            content: 'Test content 1',
            media_type: 0,
            active_reports: '3',
            total_reports: '5',
            created_at: '2025-05-01T10:00:00Z',
            is_active: true,
        },
        {
            id: '2',
            username: 'user2',
            email: 'user2@example.com',
            content: 'Test content 2',
            media_type: 1,
            file_url: '/test-image.jpg',
            active_reports: '5',
            total_reports: '7',
            created_at: '2025-05-02T14:30:00Z',
            is_active: true,
        },
        {
            id: '3',
            username: 'user3',
            email: 'user3@example.com',
            content: 'Test content 3',
            media_type: 0,
            active_reports: '4',
            total_reports: '4',
            created_at: '2025-05-03T09:15:00Z',
            is_active: true,
        },
        {
            id: '4',
            username: 'user4',
            email: 'user4@example.com',
            content: 'Test content 4',
            media_type: 0,
            active_reports: '2',
            total_reports: '2',
            created_at: '2025-05-04T16:45:00Z',
            is_active: true,
        },
        {
            id: '5',
            username: 'user5',
            email: 'user5@example.com',
            content: 'Test content 5',
            media_type: 0,
            active_reports: '1',
            total_reports: '1',
            created_at: '2025-05-05T11:30:00Z',
            is_active: true,
        },
        {
            id: '6',
            username: 'user6',
            email: 'user6@example.com',
            content: 'Test content 6',
            media_type: 0,
            active_reports: '6',
            total_reports: '8',
            created_at: '2025-05-06T13:20:00Z',
            is_active: true,
        },
        {
            id: '7',
            username: 'user7',
            email: 'user7@example.com',
            content: 'Test content 7',
            media_type: 1,
            file_url: '/test-image-7.jpg',
            active_reports: '2',
            total_reports: '3',
            created_at: '2025-05-07T09:45:00Z',
            is_active: true,
        },
        {
            id: '8',
            username: 'user8',
            email: 'user8@example.com',
            content: 'Test content 8',
            media_type: 0,
            active_reports: '1',
            total_reports: '2',
            created_at: '2025-05-08T14:15:00Z',
            is_active: true,
        },
        {
            id: '9',
            username: 'user9',
            email: 'user9@example.com',
            content: 'Test content 9',
            media_type: 0,
            active_reports: '3',
            total_reports: '4',
            created_at: '2025-05-09T16:30:00Z',
            is_active: true,
        },
    ],
    metadata: {
        totalPosts: 9,
        totalPages: 2,
        currentPage: 1,
    }
};

// Mock console.log to avoid noise in tests
global.console.log = jest.fn();

describe('Content Component', () => {
    beforeEach(() => {
        fetch.mockClear();
        fetch.mockResolvedValue({
            ok: true,
            json: async () => mockApiResponse,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders the moderation panel with correct heading', async () => {
        render(<Content />);

        await waitFor(() => {
            const headingElement = screen.getByText(/panel de moderaci.n/i);
            expect(headingElement).toBeInTheDocument();
            expect(headingElement.tagName).toBe('H1');
            expect(headingElement).toHaveClass('text-2xl');
        });
    });

    test('displays loading state initially', () => {
        render(<Content />);
        expect(screen.getByText('Cargando publicaciones reportadas...')).toBeInTheDocument();
    });

    test('displays the correct number of reported posts after loading', async () => {
        render(<Content />);

        await waitFor(() => {
            const postSummary = screen.getByText(/Mostrando 9 de 9 publicaciones reportadas activas/i);
            expect(postSummary).toBeInTheDocument();
        });
    });

    test('renders sort dropdown with correct options', async () => {
        render(<Content />);

        await waitFor(() => {
            const sortDropdown = screen.getByLabelText('Ordenar por:');
            expect(sortDropdown).toBeInTheDocument();

            const reportesOption = screen.getByRole('option', { name: 'Reportes' });
            const fechaOption = screen.getByRole('option', { name: 'Fecha' });

            expect(reportesOption).toBeInTheDocument();
            expect(fechaOption).toBeInTheDocument();

            // Default should be 'Reportes'
            expect(reportesOption.selected).toBe(true);
        });
    });

    test('shows post cards with correct information', async () => {
        render(<Content />);

        await waitFor(() => {
            // Check if username is displayed
            const username6 = screen.getByText('user6');
            expect(username6).toBeInTheDocument();

            // Check if activeReports is displayed
            const reports = screen.getAllByText(/reportes activos/i);
            expect(reports.length).toBeGreaterThan(0);

            // Check if one of the cards has the email
            const email6 = screen.getByText('user6@example.com');
            expect(email6).toBeInTheDocument();
        });
    });

    test('changes sort order when dropdown is changed', async () => {
        render(<Content />);
        const user = userEvent.setup();

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByText('user6')).toBeInTheDocument();
        });

        // First post should be the one with most reports (user6 with 6 reports)
        // Find all report elements and get the first one (highest reports)
        const reportElements = screen.getAllByText(/6.*reportes activos/i);
        const firstCard = reportElements[0].closest('.bg-white');
        expect(within(firstCard).getByText('user6')).toBeInTheDocument();

        // Change sort to date
        const sortDropdown = screen.getByLabelText('Ordenar por:');
        await user.selectOptions(sortDropdown, 'date');

        // Wait for the API call to complete
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('orderBy=date'));
        });
    });

    test('opens modal when a post card is clicked', async () => {
        render(<Content />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('user2')).toBeInTheDocument();
        });

        // Find first post card and click it
        const firstPostCard = screen.getByText('user2').closest('div').parentElement;
        await user.click(firstPostCard);

        // Check if modal appears
        const modalTitle = screen.getByText(/Detalles de la publicaci.n/i);
        expect(modalTitle).toBeInTheDocument();

        // Check if close button works
        const closeButton = screen.getByRole('button', { name: '' });
        await user.click(closeButton);

        // Modal should be closed
        expect(screen.queryByText(/Detalles de la publicaci.n/i)).not.toBeInTheDocument();
    });

    test('hide post functionality works', async () => {
        render(<Content />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('user6')).toBeInTheDocument();
        });

        // Click on first post card
        const firstPostCard = screen.getByText('user6').closest('div').parentElement;
        await user.click(firstPostCard);

        // Click "Ocultar publicaci.n" button 
        const hideButton = screen.getByText(/Ocultar publicaci.n/i);
        await user.click(hideButton);

        // Confirmation modal should appear
        const confirmModal = screen.getByText(/.Deseas ocultar publicaci.n?/i);
        expect(confirmModal).toBeInTheDocument();

        // Click "Ocultar" button
        const confirmHideButton = screen.getByText('Ocultar');
        await user.click(confirmHideButton);

        // Now the suspension modal should appear
        const suspendModal = screen.getByText(/.Tambi.n deseas suspender al usuario?/i);
        expect(suspendModal).toBeInTheDocument();

        // Click "Solo ocultar" button
        const onlyHideButton = screen.getByText('Solo ocultar');
        await user.click(onlyHideButton);

        // Modal should close and user6 should be removed from view
        await waitFor(() => {
            expect(screen.queryByText('user6')).not.toBeInTheDocument();
        });
    });

    test('clear reports functionality works', async () => {
        render(<Content />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('user6')).toBeInTheDocument();
        });

        // Click on first post card
        const firstPostCard = screen.getByText('user6').closest('div').parentElement;
        await user.click(firstPostCard);

        // Click "Eliminar reportes" button
        const clearReportsButton = screen.getByText('Eliminar reportes');
        await user.click(clearReportsButton);

        // Confirmation modal should appear
        const confirmModal = screen.getByText(/Confirmar eliminaci.n de reportes/i);
        expect(confirmModal).toBeInTheDocument();

        // Click "Confirmar" button
        const confirmButton = screen.getByText('Confirmar');
        await user.click(confirmButton);

        // Modal should close and user6 should be removed from view
        await waitFor(() => {
            expect(screen.queryByText('user6')).not.toBeInTheDocument();
        });
    });

    test('suspension functionality works correctly', async () => {
        render(<Content />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('user2')).toBeInTheDocument();
        });

        // Click on first post card
        const firstPostCard = screen.getByText('user2').closest('div').parentElement;
        await user.click(firstPostCard);

        // Click "Ocultar publicaci.n" button
        const hideButton = screen.getByText(/Ocultar publicaci.n/i);
        await user.click(hideButton);

        // First confirm hiding
        const confirmHideButton = screen.getByText('Ocultar');
        await user.click(confirmHideButton);

        // Click "Suspender" button
        const suspendButton = screen.getByText('Suspender');
        await user.click(suspendButton);

        // Suspension duration modal should appear
        const durationModal = screen.getByText(/Selecciona la duraci.n de la suspensi.n/i);
        expect(durationModal).toBeInTheDocument();

        // Test cancellation of suspension duration modal
        const cancelButton = screen.getByText('Cancelar');
        await user.click(cancelButton);

        // Suspension modal should be closed
        expect(screen.queryByText(/Selecciona la duraci.n de la suspensi.n/i)).not.toBeInTheDocument();
    });

    test('pagination controls work correctly', async () => {
        // Mock response for page 2
        const page2Response = {
            ...mockApiResponse,
            posts: [mockApiResponse.posts[8]], // Only user9
            metadata: {
                totalPosts: 1,
                totalPages: 2,
                currentPage: 2,
            }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse,
        }).mockResolvedValueOnce({
            ok: true,
            json: async () => page2Response,
        });

        render(<Content />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText(/Página 1 de 2/i)).toBeInTheDocument();
        });

        // Previous button should be disabled on page 1
        const prevButton = screen.getByText('Anterior');
        expect(prevButton).toBeDisabled();

        // Next button should be enabled
        const nextButton = screen.getByText('Siguiente');
        expect(nextButton).not.toBeDisabled();

        // Click next button
        await user.click(nextButton);

        // Wait for the API call and page update
        await waitFor(() => {
            expect(screen.getByText(/Página 2 de 2/i)).toBeInTheDocument();
        });
    });

    test('cancel button in hide post confirmation modal works', async () => {
        render(<Content />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('user6')).toBeInTheDocument();
        });

        // Click on post card
        const postCard = screen.getByText('user6').closest('div').parentElement;
        await user.click(postCard);

        // Click "Ocultar publicaci.n" button
        const hideButton = screen.getByText(/Ocultar publicaci.n/i);
        await user.click(hideButton);

        // Check modal appeared
        expect(screen.getByText(/.Deseas ocultar publicaci.n?/i)).toBeInTheDocument();

        // Click cancel button
        const cancelButton = screen.getByText('Cancelar');
        await user.click(cancelButton);

        // Modal should close and we should be back at post detail modal
        expect(screen.queryByText(/.Deseas ocultar publicaci.n?/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Detalles de la publicaci.n/i)).toBeInTheDocument();
    });

    test('cancel button in suspend user modal works', async () => {
        render(<Content />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('user6')).toBeInTheDocument();
        });

        // Find the post card with user6
        const postCard = screen.getByText('user6').closest('div').parentElement;
        await user.click(postCard);

        // Click "Ocultar publicaci.n" button
        const hideButton = screen.getByText(/Ocultar publicaci.n/i);
        await user.click(hideButton);

        // Click "Ocultar" in the confirmation dialog
        const confirmHideButton = screen.getByText('Ocultar');
        await user.click(confirmHideButton);

        // Check suspend user modal appeared
        expect(screen.getByText(/.Tambi.n deseas suspender al usuario?/i)).toBeInTheDocument();

        // Click cancel button
        const cancelButton = screen.getByText('Cancelar');
        await user.click(cancelButton);

        // Modal should close
        expect(screen.queryByText(/.Tambi.n deseas suspender al usuario?/i)).not.toBeInTheDocument();
    });

    test('cancel button in clear reports modal works', async () => {
        render(<Content />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('user6')).toBeInTheDocument();
        });

        // Click on post card
        const postCard = screen.getByText('user6').closest('div').parentElement;
        await user.click(postCard);

        // Click "Eliminar reportes" button
        const clearReportsButton = screen.getByText('Eliminar reportes');
        await user.click(clearReportsButton);

        // Check modal appeared
        expect(screen.getByText(/Confirmar eliminaci.n de reportes/i)).toBeInTheDocument();

        // Click cancel button
        const cancelButton = screen.getByText('Cancelar');
        await user.click(cancelButton);

        // Modal should close and we should be back at post detail modal
        expect(screen.queryByText(/Confirmar eliminaci.n de reportes/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Detalles de la publicaci.n/i)).toBeInTheDocument();
    });

    test('reload button works correctly', async () => {
        render(<Content />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('user6')).toBeInTheDocument();
        });

        // Now click reload button
        const reloadButton = screen.getByTitle('Recargar');
        await user.click(reloadButton);

        // Should make a new API call
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(2); // Initial load + reload
        });
    });

    test('handles API errors gracefully', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        render(<Content />);

        await waitFor(() => {
            expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
        });

        // Should show retry button
        const retryButton = screen.getByText('Reintentar');
        expect(retryButton).toBeInTheDocument();
    });

    test('shows empty state when no posts are available', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                ...mockApiResponse,
                posts: [],
                metadata: {
                    totalPosts: 0,
                    totalPages: 1,
                    currentPage: 1,
                }
            }),
        });

        render(<Content />);

        await waitFor(() => {
            expect(screen.getByText(/No hay publicaciones reportadas activas para mostrar/i)).toBeInTheDocument();
        });
    });

    test('displays image content correctly', async () => {
        render(<Content />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('user2')).toBeInTheDocument();
        });

        // Click on post with image content
        const imagePostCard = screen.getByText('user2').closest('div').parentElement;
        await user.click(imagePostCard);

        // Should show image in modal
        const image = screen.getByAltText('Contenido de user2');
        expect(image).toBeInTheDocument();
        expect(image.src).toContain('/test-image.jpg');
    });
});