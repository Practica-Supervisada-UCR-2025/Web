import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import PostDetail from '../page';
import { mockApiResponse } from '../../../../../../public/data/contentData';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useParams: jest.fn(),
}));

// Mock the content data
jest.mock('../../../../../../public/data/contentData', () => ({
    mockApiResponse: {
        posts: [
            {
                id: '1',
                user_id: 'user1',
                content: 'Test post content',
                file_url: 'https://example.com/image.jpg',
                file_size: 1024,
                media_type: 1,
                is_active: true,
                is_edited: false,
                status: 1,
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2025-02-17T10:30:00Z',
                username: 'testuser',
                email: 'test@example.com',
                active_reports: '3',
                total_reports: '5',
            },
            {
                id: '2',
                user_id: 'user2',
                content: 'Another test post',
                file_url: null,
                file_size: null,
                media_type: 0,
                is_active: false,
                is_edited: true,
                status: 0,
                created_at: '2024-01-14T09:00:00Z',
                updated_at: '2024-01-14T11:00:00Z',
                username: 'inactiveuser',
                email: 'inactive@example.com',
                active_reports: '0',
                total_reports: '2',
            },
        ],
    },
}));

describe('PostDetail Component', () => {
    const mockPush = jest.fn();
    const mockBack = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            back: mockBack,
        });

        jest.clearAllMocks();
    });

    describe('Loading and Error States', () => {
        it('should display error when post is not found', async () => {
            (useParams as jest.Mock).mockReturnValue({ id: 'nonexistent' });

            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText('Publicaci&oacute;n no encontrada')).toBeInTheDocument();
            });

            expect(screen.getByText('Volver al panel')).toBeInTheDocument();
        });

        it('should navigate back to content panel when "Volver al panel" is clicked', async () => {
            (useParams as jest.Mock).mockReturnValue({ id: 'nonexistent' });

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
                expect(screen.getByText(/15/)).toBeInTheDocument(); // Day
                expect(screen.getByText(/enero|Enero/)).toBeInTheDocument(); // Month
                expect(screen.getByText(/2024/)).toBeInTheDocument(); // Year
            });
        });

        it('should display inactive post correctly', async () => {
            (useParams as jest.Mock).mockReturnValue({ id: '2' });

            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText('inactiveuser')).toBeInTheDocument();
            });

            expect(screen.getByText('Inactivo')).toBeInTheDocument();
            expect(screen.getByText('0 reportes activos')).toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
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

    describe('Action Buttons', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
        });

        it('should disable hide button for inactive posts', async () => {
            (useParams as jest.Mock).mockReturnValue({ id: '2' });

            render(<PostDetail />);

            await waitFor(() => {
                const hideButton = screen.getByText(/Ocultar publicaci.n/i);
                expect(hideButton).toBeDisabled();
            });
        });

        it('should disable clear reports button when no active reports', async () => {
            (useParams as jest.Mock).mockReturnValue({ id: '2' });

            render(<PostDetail />);

            await waitFor(() => {
                const clearButton = screen.getByText('Eliminar reportes');
                expect(clearButton).toBeDisabled();
            });
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

    describe('Hide Post Modal Flow', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
        });

        it('should open hide confirmation modal when hide button is clicked', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                expect(screen.getByText(/Ocultar publicaci.n/i)).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText(/Ocultar publicaci.n/i));

            expect(screen.getByText(/.Deseas ocultar publicaci.n?/i)).toBeInTheDocument();
            expect(screen.getByText(/Esta acci.n esconder. la publicaci.n de la vista p.blica./i)).toBeInTheDocument();
        });

        it('should close hide modal when cancel is clicked', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                fireEvent.click(screen.getByText(/Ocultar publicaci.n/i));
            });

            fireEvent.click(screen.getByText('Cancelar'));

            expect(screen.queryByText(/.Deseas ocultar publicaci.n?/i)).not.toBeInTheDocument();
        });

        it('should open suspend modal when continue is clicked', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                fireEvent.click(screen.getByText(/Ocultar publicaci.n/i));
            });

            fireEvent.click(screen.getByText('Continuar'));

            expect(screen.getByText(/.Tambi.n deseas suspender al usuario?/i)).toBeInTheDocument();
        });

        it('should hide post only when "Solo ocultar" is clicked', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                fireEvent.click(screen.getByText(/Ocultar publicaci.n/i));
            });

            fireEvent.click(screen.getByText('Continuar'));
            fireEvent.click(screen.getByText('Solo ocultar'));

            // Wait for the redirect
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/content');
            });
        });

        it('should open suspension duration modal when "Suspender" is clicked', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                fireEvent.click(screen.getByText(/Ocultar publicaci.n/i));
            });

            fireEvent.click(screen.getByText('Continuar'));
            fireEvent.click(screen.getByText('Suspender'));

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

            fireEvent.click(screen.getByText('Continuar'));
            fireEvent.click(screen.getByText('Suspender'));
            fireEvent.click(screen.getByText(/3 d.as/i));

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/content');
            });
        });
    });

    describe('Clear Reports Modal Flow', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
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
            fireEvent.click(cancelButtons[0]);

            expect(screen.queryByText(/Confirmar eliminaci.n de reportes/i)).not.toBeInTheDocument();
        });

        it('should clear reports when confirm is clicked', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                fireEvent.click(screen.getByText('Eliminar reportes'));
            });

            fireEvent.click(screen.getByText('Confirmar'));

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/content');
            });
        });
    });

    describe('Image Error Handling', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
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
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
        });

        it('should show processing state during actions', async () => {
            render(<PostDetail />);

            await waitFor(() => {
                fireEvent.click(screen.getByText(/Ocultar publicaci.n/));
            });

            fireEvent.click(screen.getByText('Continuar'));
            fireEvent.click(screen.getByText('Solo ocultar'));
        });
    });
});