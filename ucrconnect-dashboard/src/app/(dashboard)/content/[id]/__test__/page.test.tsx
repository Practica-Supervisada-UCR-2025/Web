import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import PostDetail from '../page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useParams: jest.fn(),
}));

describe('PostDetail Component', () => {
    const mockPush = jest.fn();
    const mockBack = jest.fn();
    const originalConsoleError = console.error;

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            back: mockBack,
        });
        console.error = jest.fn();
        jest.clearAllMocks();
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    describe('Loading and Error States', () => {
        beforeEach(() => {
            global.fetch = jest.fn();
        });

        it('should display error when post is not found', async () => {
            (useParams as jest.Mock).mockReturnValue({ id: 'nonexistent' });

            // Mock fetch to return empty result or 404
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: jest.fn().mockResolvedValueOnce({ posts: [] })
            });

            render(<PostDetail />);
            await waitFor(() => {
                expect(screen.getByText('Publicación no encontrada')).toBeInTheDocument();
            });
            expect(screen.getByText('Volver al panel')).toBeInTheDocument();
        });

        it('should navigate back to content panel when "Volver al panel" is clicked', async () => {
            (useParams as jest.Mock).mockReturnValue({ id: 'nonexistent' });

            // Mock fetch for error case
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: jest.fn().mockResolvedValueOnce({ posts: [] })
            });

            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText('Volver al panel')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Volver al panel'));
            expect(mockPush).toHaveBeenCalledWith('/content');
        });
    });

    describe('Post Display', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({
                    message: "Post fetched successfully",
                    post: {
                        id: '1',
                        user_id: '2',
                        content: 'Test post content',
                        file_url: 'https://example.com/image.jpg',
                        file_size: 1024,
                        media_type: 1,
                        is_active: true,
                        is_edited: false,
                        status: 1,
                        created_at: '2025-06-07T20:41:45.301Z',
                        updated_at: '2025-06-08T20:41:45.301Z',
                        username: 'testuser',
                        email: 'test@example.com',
                        active_reports: '3',
                        total_reports: '5',
                    }
                })
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should display post details correctly', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText('testuser')).toBeInTheDocument();
            });

            expect(screen.getByText('test@example.com')).toBeInTheDocument();
            expect(screen.getByText('Test post content')).toBeInTheDocument();
            expect(screen.getByText('3 reportes activos')).toBeInTheDocument();
            expect(screen.getByText('5 reportes en total')).toBeInTheDocument();
            expect(screen.getByText('Activo')).toBeInTheDocument();
        });

        it('should display image when media_type is not 0 and file_url exists', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                const image = screen.getByAltText('Contenido de testuser');
                expect(image).toBeInTheDocument();
                expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
            });
        });

        it('should format dates correctly in Spanish locale', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText(/7 de junio de 2025, ..:../i)).toBeInTheDocument();
            });
        });

        it('should display active post correctly', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText('Activo')).toBeInTheDocument();
            });
        });
    });

    describe('Inactive post Display', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({
                    message: "Post fetched successfully",
                    post: {
                        id: '1',
                        user_id: '2',
                        content: 'Test post content',
                        file_url: 'https://example.com/image.jpg',
                        file_size: 1024,
                        media_type: 1,
                        is_active: false,
                        is_edited: false,
                        status: 1,
                        created_at: '2025-06-07T20:41:45.301Z',
                        updated_at: '2025-06-08T20:41:45.301Z',
                        username: 'testuser',
                        email: 'test@example.com',
                        active_reports: '3',
                        total_reports: '5',
                    }
                })
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should display inactive post correctly', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText('Inactivo')).toBeInTheDocument();
            });
        });
    });

    describe('Navigation', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({
                    message: "Post fetched successfully",
                    post: {
                        id: '1',
                        user_id: '2',
                        content: 'Test post content',
                        file_url: 'https://example.com/image.jpg',
                        file_size: 1024,
                        media_type: 1,
                        is_active: true,
                        is_edited: false,
                        status: 0,
                        created_at: '2025-06-07T20:41:45.301Z',
                        updated_at: '2025-06-08T20:41:45.301Z',
                        username: 'testuser',
                        email: 'test@example.com',
                        active_reports: '3',
                        total_reports: '5',
                    }
                })
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should navigate back when back button is clicked', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText('Volver')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Volver'));
            expect(mockBack).toHaveBeenCalled();
        });
    });

    describe('Disabled action Buttons', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({
                    message: "Post fetched successfully",
                    post: {
                        id: '1',
                        user_id: '2',
                        content: 'Test post content',
                        file_url: 'https://example.com/image.jpg',
                        file_size: 1024,
                        media_type: 1,
                        is_active: false,
                        is_edited: false,
                        status: 0,
                        created_at: '2025-06-07T20:41:45.301Z',
                        updated_at: '2025-06-08T20:41:45.301Z',
                        username: 'testuser',
                        email: 'test@example.com',
                        active_reports: '0',
                        total_reports: '0',
                    }
                })
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should disable hide button for inactive posts', async () => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });

            render(<PostDetail />);

            await waitFor(() => {
                const hideButton = screen.queryByText(/Ocultar publicaci.n/i);
                expect(hideButton).not.toBeInTheDocument();
            });
        });

        it('should disable clear reports button when no active reports', async () => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });

            render(<PostDetail />);

            await waitFor(() => {
                const clearButton = screen.queryByText('Eliminar reportes');
                expect(clearButton).not.toBeInTheDocument();
            });
        });
    });

    describe('Action Buttons', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({
                    message: "Post fetched successfully",
                    post: {
                        id: '1',
                        user_id: '2',
                        content: 'Test post content',
                        file_url: 'https://example.com/image.jpg',
                        file_size: 1024,
                        media_type: 1,
                        is_active: true,
                        is_edited: false,
                        status: 0,
                        created_at: '2025-06-07T20:41:45.301Z',
                        updated_at: '2025-06-08T20:41:45.301Z',
                        username: 'testuser',
                        email: 'test@example.com',
                        active_reports: '5',
                        total_reports: '10',
                    }
                })
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should enable both buttons for active post with reports', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                const hideButton = screen.getByText(/Ocultar publicaci.n/i);
                const clearButton = screen.getByText('Eliminar reportes');

                expect(hideButton).not.toBeDisabled();
                expect(clearButton).not.toBeDisabled();
            });
        });
    });
});

describe('Hide Post Modal Flow', () => {
    const mockPush = jest.fn();
    const mockBack = jest.fn();

    beforeEach(() => {
        // Set up the router mock properly for this describe block
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            back: mockBack,
        });

        (useParams as jest.Mock).mockReturnValue({ id: '1' });

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({
                message: "Post fetched successfully",
                post: {
                    id: '1',
                    user_id: '2',
                    content: 'Test post content',
                    file_url: 'https://example.com/image.jpg',
                    file_size: 1024,
                    media_type: 1,
                    is_active: true,
                    is_edited: false,
                    status: 0,
                    created_at: '2025-06-07T20:41:45.301Z',
                    updated_at: '2025-06-08T20:41:45.301Z',
                    username: 'testuser',
                    email: 'test@example.com',
                    active_reports: '5',
                    total_reports: '10',
                }
            })
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should open hide confirmation modal when hide button is clicked', async () => {
        render(<PostDetail />);

        await waitFor(() => {
            expect(screen.getByText(/Ocultar publicaci.n/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            fireEvent.click(screen.getByText(/Ocultar publicaci.n/i));
        });

        expect(screen.getByText(/.Deseas ocultar publicaci.n?/i)).toBeInTheDocument();
        expect(screen.getByText(/Esta acci.n esconder. la publicaci.n de la vista p.blica./i)).toBeInTheDocument();
    });


    it('should close hide modal when cancel is clicked', async () => {
        render(<PostDetail />);

        await waitFor(() => {
            fireEvent.click(screen.getByText(/Ocultar publicaci.n/i));
        });

        await waitFor(() => {
            fireEvent.click(screen.getByText('Cancelar'));
        });

        expect(screen.queryByText(/.Deseas ocultar publicaci.n?/i)).not.toBeInTheDocument();
    });


    it('should open suspend modal when continue is clicked', async () => {
        render(<PostDetail />);

        await waitFor(() => {
            fireEvent.click(screen.getByText(/Ocultar publicaci.n/i));
        });

        await waitFor(() => {
            fireEvent.click(screen.getByText('Continuar'));
        });

        expect(screen.getByText(/.Tambi.n deseas suspender al usuario?/i)).toBeInTheDocument();
    });

    it('should hide post only when "Solo ocultar" is clicked', async () => {
        render(<PostDetail />);

        await waitFor(() => {
            fireEvent.click(screen.getByText(/Ocultar publicaci.n/i));
        });

        await waitFor(() => {
            fireEvent.click(screen.getByText('Continuar'));
        });
        expect(screen.getByText(/Solo ocultar/i)).toBeInTheDocument();

        await waitFor(() => {
            fireEvent.click(screen.getByText('Solo ocultar'));
        });
        const ocultado = screen.queryByText(/Solo ocultar/i);
        expect(ocultado).not.toBeInTheDocument();
    });

    it('should open suspension duration modal when "Suspender" is clicked', async () => {
        render(<PostDetail />);

        await waitFor(() => {
            fireEvent.click(screen.getByText(/Ocultar publicaci.n/i));
        });
        await waitFor(() => {
            fireEvent.click(screen.getByText('Continuar'));
        });
        await waitFor(() => {
            fireEvent.click(screen.getByText('Suspender'));
        });

        expect(screen.getByText(/Selecciona la duraci.n de la suspensi.n/i)).toBeInTheDocument();
        expect(screen.getByText(/1 d.a/i)).toBeInTheDocument();
        expect(screen.getByText(/3 d.as/i)).toBeInTheDocument();
        expect(screen.getByText(/7 d.as/i)).toBeInTheDocument();
    });

    it('should handle suspension with different durations', async () => {
        render(<PostDetail />);

        await waitFor(() => {
            fireEvent.click(screen.getByText(/Ocultar publicaci.n/i));
        });

        await waitFor(() => {
            fireEvent.click(screen.getByText('Continuar'));
        });
        await waitFor(() => {
            fireEvent.click(screen.getByText('Suspender'));
        });
        expect(screen.getByText(/3 d.as/i)).toBeInTheDocument();
        await waitFor(() => {
            fireEvent.click(screen.getByText(/3 d.as/i));
        });
        const ocultado = screen.queryByText(/3 d.as/i);
        expect(ocultado).not.toBeInTheDocument();

    });

    it('should handle 1 day suspension', async () => {
        render(<PostDetail />);

        await waitFor(() => {
            expect(screen.getByText('Test post content')).toBeInTheDocument();
        });

        // Click hide post button
        const hideButton = screen.getByText('Ocultar publicación');
        await waitFor(() => {
            fireEvent.click(hideButton);
        });

        // Click continue in first modal
        const continueButton = screen.getByText('Continuar');
        await waitFor(() => {
            fireEvent.click(continueButton);
        });

        // Click suspend in second modal
        const suspendButton = screen.getByText('Suspender');
        await waitFor(() => {
            fireEvent.click(suspendButton);
        });

        // Click 1 day suspension
        expect(screen.getByText(/1 d.a/i)).toBeInTheDocument();
        await waitFor(() => {
            fireEvent.click(screen.getByText(/1 d.a/i));
        });
        const ocultado = screen.queryByText(/1 d.a/i);
        expect(ocultado).not.toBeInTheDocument();

        // Wait for the redirect
    });

    it('should handle 7 days suspension', async () => {
        render(<PostDetail />);

        await waitFor(() => {
            expect(screen.getByText('Test post content')).toBeInTheDocument();
        });

        // Click hide post button
        const hideButton = screen.getByText('Ocultar publicación');
        await waitFor(() => {
            fireEvent.click(hideButton);
        });

        // Click continue in first modal
        const continueButton = screen.getByText('Continuar');
        await waitFor(() => {
            fireEvent.click(continueButton);
        });

        // Click suspend in second modal
        const suspendButton = screen.getByText('Suspender');
        await waitFor(() => {
            fireEvent.click(suspendButton);
        });

        // Click 7 days suspension
        expect(screen.getByText(/7 d.as/i)).toBeInTheDocument();
        await waitFor(() => {
            fireEvent.click(screen.getByText(/7 d.as/i));
        });
        const ocultado = screen.queryByText(/7 d.as/i);
        expect(ocultado).not.toBeInTheDocument();
    });

    it('should handle cancel in suspend modal', async () => {
        render(<PostDetail />);

        await waitFor(() => {
            expect(screen.getByText('Test post content')).toBeInTheDocument();
        });

        // Click hide post button
        const hideButton = screen.getByText('Ocultar publicación');
        await waitFor(() => {
            fireEvent.click(hideButton);
        });

        // Click continue in first modal
        const continueButton = screen.getByText('Continuar');
        await waitFor(() => {
            fireEvent.click(continueButton);
        });

        // Click cancel in suspend modal
        const cancelButton = screen.getByText('Cancelar');
        await waitFor(() => {
            fireEvent.click(cancelButton);
        });

        // Verify modal is closed
        expect(screen.queryByText('¿También deseas suspender al usuario?')).not.toBeInTheDocument();
    });

    it('should handle cancel in hide confirm modal', async () => {
        render(<PostDetail />);

        await waitFor(() => {
            expect(screen.getByText('Test post content')).toBeInTheDocument();
        });

        // Click hide post button
        const hideButton = screen.getByText('Ocultar publicación');
        await waitFor(() => {
            fireEvent.click(hideButton);
        });

        // Click cancel in first modal
        const cancelButton = screen.getByText('Cancelar');
        await waitFor(() => {
            fireEvent.click(cancelButton);
        });

        // Verify modal is closed
        expect(screen.queryByText('¿Deseas ocultar publicación?')).not.toBeInTheDocument();
    });


    describe('Clear Reports Modal Flow', () => {
        beforeEach(() => {
            // Set up the router mock properly for this describe block
            (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
                back: mockBack,
            });

            (useParams as jest.Mock).mockReturnValue({ id: '1' });

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({
                    message: "Post fetched successfully",
                    post: {
                        id: '1',
                        user_id: '2',
                        content: 'Test post content',
                        file_url: 'https://example.com/image.jpg',
                        file_size: 1024,
                        media_type: 1,
                        is_active: true,
                        is_edited: false,
                        status: 0,
                        created_at: '2025-06-07T20:41:45.301Z',
                        updated_at: '2025-06-08T20:41:45.301Z',
                        username: 'testuser',
                        email: 'test@example.com',
                        active_reports: '5',
                        total_reports: '10',
                    }
                })
            });
        });

        it('should open clear reports confirmation modal', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                fireEvent.click(screen.getByText('Eliminar reportes'));
            });

            expect(screen.getByText(/Confirmar eliminaci.n de reportes/i)).toBeInTheDocument();
            expect(screen.getByText(/.Est.s seguro de que deseas eliminar todos los reportes activos de esta publicaci.n?/i)).toBeInTheDocument();
        });

        it('should close clear reports modal when cancel is clicked', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                fireEvent.click(screen.getByText('Eliminar reportes'));
            });

            const cancelButtons = screen.getAllByText('Cancelar');

            await waitFor(() => {
                fireEvent.click(cancelButtons[0]);
            });

            expect(screen.queryByText(/Confirmar eliminaci.n de reportes/i)).not.toBeInTheDocument();
        });

        it('should clear reports when confirm is clicked', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                fireEvent.click(screen.getByText('Eliminar reportes'));
            });

            expect(screen.getByText('Confirmar')).toBeInTheDocument();
            await waitFor(() => {
                fireEvent.click(screen.getByText('Confirmar'));
            });
            const ocultado = screen.queryByText('Confirmar');
            expect(ocultado).not.toBeInTheDocument();
        });
    });

    describe('Image Error Handling', () => {
        beforeEach(() => {
            // Set up the router mock properly for this describe block
            (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
                back: mockBack,
            });

            (useParams as jest.Mock).mockReturnValue({ id: '1' });

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({
                    message: "Post fetched successfully",
                    post: {
                        id: '1',
                        user_id: '2',
                        content: 'Test post content',
                        file_url: 'https://example.com/image.jpg',
                        file_size: 1024,
                        media_type: 1,
                        is_active: true,
                        is_edited: false,
                        status: 0,
                        created_at: '2025-06-07T20:41:45.301Z',
                        updated_at: '2025-06-08T20:41:45.301Z',
                        username: 'testuser',
                        email: 'test@example.com',
                        active_reports: '5',
                        total_reports: '10',
                    }
                })
            });
        });

        it('should hide image on load error', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                const image = screen.getByAltText('Contenido de testuser');
                expect(image).toBeInTheDocument();

                // Simulate image load error
                    fireEvent.error(image);

                expect(image.style.display).toBe('none');
            });
        });
    });

    describe('Button States During Actions', () => {
        beforeEach(() => {
            // Set up the router mock properly for this describe block
            (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
                back: mockBack,
            });

            (useParams as jest.Mock).mockReturnValue({ id: '1' });

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({
                    message: "Post fetched successfully",
                    post: {
                        id: '1',
                        user_id: '2',
                        content: 'Test post content',
                        file_url: 'https://example.com/image.jpg',
                        file_size: 1024,
                        media_type: 1,
                        is_active: true,
                        is_edited: false,
                        status: 0,
                        created_at: '2025-06-07T20:41:45.301Z',
                        updated_at: '2025-06-08T20:41:45.301Z',
                        username: 'testuser',
                        email: 'test@example.com',
                        active_reports: '5',
                        total_reports: '10',
                    }
                })
            });
        });

        it('should show processing state during actions', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                fireEvent.click(screen.getByText(/Ocultar publicaci.n/));
            });
            await waitFor(() => {
                fireEvent.click(screen.getByText('Continuar'));
            });
            await waitFor(() => {
                fireEvent.click(screen.getByText('Solo ocultar'));
            });
        });
    });

    describe('Comments Section', () => {
        beforeEach(() => {
            // Set up the router mock properly for this describe block
            (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
                back: mockBack,
            });

            (useParams as jest.Mock).mockReturnValue({ id: '1' });

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({
                    message: "Post fetched successfully",
                    post: {
                        id: '1',
                        user_id: '2',
                        content: 'Test post content',
                        file_url: 'https://example.com/image.jpg',
                        file_size: 1024,
                        media_type: 1,
                        is_active: true,
                        is_edited: false,
                        status: 0,
                        created_at: '2025-06-07T20:41:45.301Z',
                        updated_at: '2025-06-08T20:41:45.301Z',
                        username: 'testuser',
                        email: 'test@example.com',
                        active_reports: '5',
                        total_reports: '10',
                    }
                })
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should show empty state for comments when no comments exist', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText('No hay comentarios para mostrar')).toBeInTheDocument();
            });
        });
    });

    describe('API Error Handling', () => {
        const mockPush = jest.fn();
        const mockBack = jest.fn();

        beforeEach(() => {
            (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
                back: mockBack,
            });
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
            global.fetch = jest.fn();
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should display unauthorized error on 401 status', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: jest.fn().mockResolvedValueOnce({ message: 'Unauthorized' }),
            });

            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText(/No autorizado para ver esta publicaci.n/i)).toBeInTheDocument();
            });
        });

        it('should display a generic error message for other failed requests', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: jest.fn().mockResolvedValueOnce({ message: 'Internal Server Error' }),
            });

            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText(/HTTP error! status: 500/i)).toBeInTheDocument();
            });
        });

        it('should display an error for unexpected response structure', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValueOnce({ message: 'Success but no post data' }), // Missing 'post' object
            });

            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText(/Estructura de respuesta inesperada/i)).toBeInTheDocument();
            });
        });

        it('should handle network errors during fetch', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText(/Reintentar/i)).toBeInTheDocument();
            });
        });

        it('should allow user to retry on fetch error', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
            });
            const reload = jest.fn();
            Object.defineProperty(window, 'location', {
                value: { reload },
                writable: true,
            });

            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText('Reintentar')).toBeInTheDocument();
            });

            await waitFor(() => {
                fireEvent.click(screen.getByText('Reintentar'));
            });
            expect(reload).toHaveBeenCalled();
        });
    });

    describe('Comments Section', () => {
        const mockPush = jest.fn();
        const mockBack = jest.fn();

        beforeEach(() => {
            (useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack });
            (useParams as jest.Mock).mockReturnValue({ id: 'h33e5h59-dd84-7eg3-cc86-7d7c379d857d' });

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({
                    message: "Post fetched successfully",
                    post: {
                        id: 'h33e5h59-dd84-7eg3-cc86-7d7c379d857d',
                        user_id: '2',
                        content: 'Post with comments',
                        file_url: null,
                        media_type: 0,
                        is_active: true,
                        created_at: '2025-06-07T20:41:45.301Z',
                        updated_at: '2025-06-08T20:41:45.301Z',
                        username: 'testuser',
                        email: 'test@example.com',
                        active_reports: '5',
                        total_reports: '10',
                        comments: [],
                        comments_metadata: {
                            currentPage: 1,
                            totalPages: 1,
                            totalItems: 0
                        }
                    }
                })
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should show empty state for comments when no comments exist', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText('No hay comentarios para mostrar')).toBeInTheDocument();
            });
        });

        it('should display an error message if comments fail to load', async () => {
            (global.fetch as jest.Mock).mockReset();
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
            });

            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText(/HTTP error! status: 500/i)).toBeInTheDocument();
            });
        });
    });


    describe('Post Actions API Responses', () => {
        const mockPush = jest.fn();
        const mockBack = jest.fn();

        beforeEach(() => {
            // Set up the router mock properly for this describe block
            (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
                back: mockBack,
            });

            (useParams as jest.Mock).mockReturnValue({ id: '1' });

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({
                    message: "Post fetched successfully",
                    post: {
                        id: '1',
                        user_id: '2',
                        content: 'Test post content',
                        file_url: 'https://example.com/image.jpg',
                        file_size: 1024,
                        media_type: 1,
                        is_active: true,
                        is_edited: false,
                        status: 0,
                        created_at: '2025-06-07T20:41:45.301Z',
                        updated_at: '2025-06-08T20:41:45.301Z',
                        username: 'testuser',
                        email: 'test@example.com',
                        active_reports: '5',
                        total_reports: '10',
                    }
                })
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should handle successful post hiding', async () => {
            // Mock the fetch for the delete action
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({ message: 'Post hidden successfully' }),
            });

            render(<PostDetail />);

            await waitFor(() => {
                fireEvent.click(screen.getByText(/Ocultar publicaci.n/i));
            });
            await waitFor(() => {
                fireEvent.click(screen.getByText('Continuar'));
            });
            await waitFor(() => {
                fireEvent.click(screen.getByText('Solo ocultar'));
            });

            await waitFor(() => {
                expect(screen.getByText(/Publicaci.n ocultada exitosamente/i)).toBeInTheDocument();
            });

            // Check if redirection is called
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/content');
            }, { timeout: 2100 });
        });

    });


});

