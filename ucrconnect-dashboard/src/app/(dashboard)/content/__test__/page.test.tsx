import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Content from '../page';
import { mockPosts } from '../mockData';

// Mock the entire module with pagination-appropriate data
jest.mock('../mockData', () => ({
    mockPosts: [
        {
            id: 1,
            username: 'user1',
            email: 'user1@example.com',
            content: 'Test content 1',
            contentType: 'text',
            activeReports: 3,
            totalReports: 5,
            createdAt: '2025-05-01T10:00:00Z',
            active: true,
        },
        {
            id: 2,
            username: 'user2',
            email: 'user2@example.com',
            content: 'Test content 2',
            contentType: 'image',
            imageUrl: '/test-image.jpg',
            activeReports: 5,
            totalReports: 7,
            createdAt: '2025-05-02T14:30:00Z',
            active: true,
        },
        {
            id: 3,
            username: 'user3',
            email: 'user3@example.com',
            content: 'Test content 3',
            contentType: 'text',
            activeReports: 4,
            totalReports: 4,
            createdAt: '2025-05-03T09:15:00Z',
            active: true,
        },
        {
            id: 4,
            username: 'user4',
            email: 'user4@example.com',
            content: 'Test content 4',
            contentType: 'text',
            activeReports: 2,
            totalReports: 2,
            createdAt: '2025-05-04T16:45:00Z',
            active: true,
        },

        {
            id: 5,
            username: 'user5',
            email: 'user5@example.com',
            content: 'Test content 5',
            contentType: 'text',
            activeReports: 1,
            totalReports: 1,
            createdAt: '2025-05-05T11:30:00Z',
            active: true,
        },
        {
            id: 6,
            username: 'user6',
            email: 'user6@example.com',
            content: 'Test content 6',
            contentType: 'text',
            activeReports: 6,
            totalReports: 8,
            createdAt: '2025-05-06T13:20:00Z',
            active: true,
        },
        {
            id: 7,
            username: 'user7',
            email: 'user7@example.com',
            content: 'Test content 7',
            contentType: 'image',
            imageUrl: '/test-image-7.jpg',
            activeReports: 2,
            totalReports: 3,
            createdAt: '2025-05-07T09:45:00Z',
            active: true,
        },
        {
            id: 8,
            username: 'user8',
            email: 'user8@example.com',
            content: 'Test content 8',
            contentType: 'text',
            activeReports: 1,
            totalReports: 2,
            createdAt: '2025-05-08T14:15:00Z',
            active: true,
        },
        {
            id: 9,
            username: 'user9',
            email: 'user9@example.com',
            content: 'Test content 9',
            contentType: 'text',
            activeReports: 3,
            totalReports: 4,
            createdAt: '2025-05-09T16:30:00Z',
            active: true,
        },
        // These won't be shown by default (inactive or no active reports)
        {
            id: 10,
            username: 'user10',
            email: 'user10@example.com',
            content: 'Test content 10',
            contentType: 'text',
            activeReports: 0, // Should be filtered out
            totalReports: 1,
            createdAt: '2025-05-10T10:00:00Z',
            active: true,
        },
        {
            id: 11,
            username: 'user11',
            email: 'user11@example.com',
            content: 'Test content 11',
            contentType: 'text',
            activeReports: 2,
            totalReports: 2,
            createdAt: '2025-05-11T16:45:00Z',
            active: false, // Should be filtered out
        },
    ]
}));

describe('Content Component', () => {
    test('renders the moderation panel with correct heading', () => {
        render(<Content />);
        const headingElement = screen.getByText(/panel de moderaci.n/i);
        expect(headingElement).toBeInTheDocument();
        expect(headingElement.tagName).toBe('H1');
        expect(headingElement).toHaveClass('text-2xl');
    });

    test('displays the correct number of reported posts', () => {
        render(<Content />);
        const postSummary = screen.getByText('Mostrando 8 de 9 publicaciones reportadas');
        expect(postSummary).toBeInTheDocument();
    });

    test('renders sort dropdown with correct options', () => {
        render(<Content />);
        const sortDropdown = screen.getByLabelText('Ordenar por:');
        expect(sortDropdown).toBeInTheDocument();

        const reportesOption = screen.getByRole('option', { name: 'Reportes' });
        const fechaOption = screen.getByRole('option', { name: 'Fecha' });

        expect(reportesOption).toBeInTheDocument();
        expect(fechaOption).toBeInTheDocument();

        // Default should be 'Reportes'
        expect(reportesOption.selected).toBe(true);
    });

    test('shows post cards with correct information', () => {
        render(<Content />);

        // Check if username is displayed
        const username6 = screen.getByText('user6');
        expect(username6).toBeInTheDocument();

        // Check if activeReports is displayed
        const reports = screen.getAllByText(/reportes activos/i);
        expect(reports.length).toBe(8); // 8 posts per page

        // Check if one of the cards has the email
        const email6 = screen.getByText('user6@example.com');
        expect(email6).toBeInTheDocument();
    });

    test('changes sort order when dropdown is changed', async () => {
        render(<Content />);
        const user = userEvent.setup();

        // First post should be the one with most reports (user6 with 6 reports)
        const firstCard = screen.getAllByText(/reportes activos/i)[0].closest('div').parentElement;
        expect(within(firstCard).getByText('user6')).toBeInTheDocument();

        // Change sort to date
        const sortDropdown = screen.getByLabelText('Ordenar por:');
        await user.selectOptions(sortDropdown, 'date');

        // Now first post should be the newest one
        const newFirstCard = screen.getAllByText(/reportes activos/i)[0].closest('div').parentElement;
        expect(within(newFirstCard).getByText('user9')).toBeInTheDocument();
    });

    test('opens modal when a post card is clicked', async () => {
        render(<Content />);
        const user = userEvent.setup();

        // Find first post card and click it
        const firstPostCard = screen.getByText('user2').closest('div').parentElement;
        await user.click(firstPostCard);

        // Check if modal appears
        const modalTitle = screen.getByText(/Detalles de la publicaci.n/i);
        expect(modalTitle).toBeInTheDocument();

        // Check if close button works
        const closeButton = screen.getByRole('button', {
            name: ''
        });
        await user.click(closeButton);

        // Modal should be closed
        expect(screen.queryByText(/Detalles de la publicaci.n/i)).not.toBeInTheDocument();
    });

    test('hide post functionality works', async () => {
        render(<Content />);
        const user = userEvent.setup();

        // Click on first post card
        const firstPostCard = screen.getByText('user6').closest('div').parentElement;
        await user.click(firstPostCard);

        // Click "Ocultar publicación" button 
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
        expect(screen.queryByText('user6')).not.toBeInTheDocument();

        // Should now show fewer posts
        const postSummary = screen.getByText('Mostrando 8 de 8 publicaciones reportadas');
        expect(postSummary).toBeInTheDocument();
    });

    test('clear reports functionality works', async () => {
        render(<Content />);
        const user = userEvent.setup();

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

        // Modal should close and user6 should be removed from view (since activeReports becomes 0)
        expect(screen.queryByText('user6')).not.toBeInTheDocument();

        // Should now show fewer posts
        const postSummary = screen.getByText('Mostrando 8 de 8 publicaciones reportadas');
        expect(postSummary).toBeInTheDocument();
    });

    test('suspension functionality works correctly', async () => {
        render(<Content />);
        const user = userEvent.setup();

        // Click on first post card
        const firstPostCard = screen.getByText('user2').closest('div').parentElement;
        await user.click(firstPostCard);

        // Click "Ocultar publicación" button
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

    test('changes page when current page becomes empty after action', async () => {
        render(<Content />);
        const user = userEvent.setup();

        // First navigate to page 2 to test the page change logic
        const pagination = screen.getByText('Siguiente');
        await user.click(pagination);

        // Now we should be on page 2 with only 1 post
        expect(screen.getByText('user8')).toBeInTheDocument();

        // Click on user8 post card
        const lastPostCard = screen.getByText('user8').closest('div').parentElement;
        await user.click(lastPostCard);

        // Hide the post
        const hideButton = screen.getByText(/Ocultar publicaci.n/i);
        await user.click(hideButton);

        // Confirm hiding
        const confirmHideButton = screen.getByText('Ocultar');
        await user.click(confirmHideButton);

        const onlyHideButton = screen.getByText('Solo ocultar');
        await user.click(onlyHideButton);

        // Should automatically go back to page 1 since page 2 is now empty
        expect(screen.getByText('user6')).toBeInTheDocument();
    });

    test('changes page when clearing reports makes current page empty', async () => {
        render(<Content />);
        const user = userEvent.setup();

        // First navigate to page 2
        const pagination = screen.getByText('Siguiente');
        await user.click(pagination);

        // Now we should be on page 2 with only 1 post 
        expect(screen.getByText('user8')).toBeInTheDocument();

        // Click on post card
        const lastPostCard = screen.getByText('user8').closest('div').parentElement;
        await user.click(lastPostCard);

        // Clear reports for this post
        const clearReportsButton = screen.getByText('Eliminar reportes');
        await user.click(clearReportsButton);
        const confirmButton = screen.getByText('Confirmar');
        await user.click(confirmButton);

        // Should automatically go back to page 1 since page 2 is now empty
        expect(screen.getByText('user6')).toBeInTheDocument();
    });

    test('pagination controls work correctly', async () => {
        render(<Content />);
        const user = userEvent.setup();

        // Check initial pagination state
        const paginationElement = screen.getByText(/P.gina 1 de 2/i);
        expect(paginationElement).toBeInTheDocument();

        // Previous button should be disabled on page 1
        const prevButton = screen.getByText('Anterior');
        expect(prevButton).toBeDisabled();

        // Next button should be enabled
        const nextButton = screen.getByText('Siguiente');
        expect(nextButton).not.toBeDisabled();

        // Click next button
        await user.click(nextButton);

        // Should now be on page 2
        expect(screen.getByText(/P.gina 2 de 2/i)).toBeInTheDocument();

        // Previous button should now be enabled
        expect(screen.getByText('Anterior')).not.toBeDisabled();

        // Next button should now be disabled (on last page)
        expect(screen.getByText('Siguiente')).toBeDisabled();

        // Click previous button
        await user.click(screen.getByText('Anterior'));

        // Should now be back on page 1
        expect(screen.getByText(/P.gina 1 de 2/i)).toBeInTheDocument();
    });

    test('cancel button in hide post confirmation modal works', async () => {
        render(<Content />);
        const user = userEvent.setup();

        // Click on post card
        const postCard = screen.getAllByText('user6')[0].closest('h3').parentElement;
        await user.click(postCard);

        // Click "Ocultar publicación" button
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

        // Find the post card with user6 by a more specific selector
        const postCards = screen.getAllByText('user6');
        const postCard = postCards[0].closest('.bg-white.shadow');
        await user.click(postCard);

        // Click "Ocultar publicación" button
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

        // Click on first post to hide it
        const firstPostCard = screen.getByText('user6').closest('div').parentElement;
        await user.click(firstPostCard);

        // Hide the post
        const hideButton = screen.getByText(/Ocultar publicaci.n/i);
        await user.click(hideButton);
        const confirmHideButton = screen.getByText('Ocultar');
        await user.click(confirmHideButton);
        const onlyHideButton = screen.getByText('Solo ocultar');
        await user.click(onlyHideButton);

        // Post should be hidden
        expect(screen.queryByText('user6')).not.toBeInTheDocument();

        // Now click reload button
        const reloadButton = screen.getByTitle('Recargar');
        await user.click(reloadButton);

        // Post should be back (as we're reloading from the mock data)
        expect(screen.getByText('user6')).toBeInTheDocument();
    });
});