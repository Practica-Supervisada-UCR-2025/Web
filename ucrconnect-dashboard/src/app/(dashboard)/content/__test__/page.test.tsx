import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import Content from '../page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Suppress act warnings for async operations that we can't control
const originalError = console.error;
beforeAll(() => {
    console.error = (...args: any[]) => {
        if (
            typeof args[0] === 'string' && (
                args[0].includes('Warning: An update to') ||
                args[0].includes('was not wrapped in act') ||
                args[0].includes('Act warnings') ||
                args[0].includes('inside a test was not wrapped in act')
            )
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});

describe('Content Component', () => {
    const mockPush = jest.fn();
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

    // Mock API response data
    const mockApiResponse = {
        message: 'Success',
        posts: [
            {
                id: '1',
                user_id: 'user1',
                username: 'user1',
                email: 'user1@example.com',
                content: 'Test content 1',
                file_url: null,
                file_size: null,
                media_type: 0,
                is_active: true,
                is_edited: false,
                status: 1,
                active_reports: '3',
                total_reports: '5',
                created_at: '2025-05-01T10:00:00Z',
                updated_at: '2025-05-01T10:00:00Z',
            },
            {
                id: '2',
                user_id: 'user2',
                username: 'user2',
                email: 'user2@example.com',
                content: 'Test content 2',
                file_url: '/test-image.jpg',
                file_size: 1024,
                media_type: 1,
                is_active: true,
                is_edited: false,
                status: 1,
                active_reports: '5',
                total_reports: '7',
                created_at: '2025-05-02T14:30:00Z',
                updated_at: '2025-05-02T14:30:00Z',
            },
            {
                id: '3',
                user_id: 'user3',
                username: 'user3',
                email: 'user3@example.com',
                content: 'Test content 3',
                file_url: null,
                file_size: null,
                media_type: 0,
                is_active: false, // Inactive post
                is_edited: false,
                status: 1,
                active_reports: '4',
                total_reports: '4',
                created_at: '2025-05-03T09:15:00Z',
                updated_at: '2025-05-03T09:15:00Z',
            },
            {
                id: '4',
                user_id: 'user4',
                username: 'user4',
                email: 'user4@example.com',
                content: 'Test content 4',
                file_url: '/test.gif',
                file_size: 2048,
                media_type: 2, // GIF
                is_active: true,
                is_edited: false,
                status: 1,
                active_reports: '2',
                total_reports: '2',
                created_at: '2025-05-04T16:45:00Z',
                updated_at: '2025-05-04T16:45:00Z',
            },
        ],
        metadata: {
            totalPosts: 10,
            totalPages: 2,
            currentPage: 1,
            totalReportedPosts: 4,
        },
    };

    const emptyApiResponse = {
        message: 'Success',
        posts: [],
        metadata: {
            totalPosts: 0,
            totalPages: 0,
            currentPage: 1,
            totalReportedPosts: 0,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });

        // Default successful fetch response
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockApiResponse,
        } as Response);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Component Rendering', () => {
        it('renders the component with correct title', async () => {
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText(/Panel de Moderaci.n/i)).toBeInTheDocument();
            });
        });

        it('displays loading state initially', () => {
            render(<Content />);
            expect(screen.getByText('Cargando publicaciones...')).toBeInTheDocument();
        });

        it('makes API call on mount with correct parameters', async () => {
            render(<Content />);

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                    '/api/posts/reported?page=1&limit=8&sortBy=reports',
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
            });
        });

        it('displays posts after loading', async () => {
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('user1')).toBeInTheDocument();
                expect(screen.getByText('user2')).toBeInTheDocument();
                expect(screen.getByText('Test content 1')).toBeInTheDocument();
                expect(screen.getByText('Test content 2')).toBeInTheDocument();
            });
        });

        it('displays metadata correctly', async () => {
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('Mostrando 4 de 4 publicaciones reportadas')).toBeInTheDocument();
                expect(screen.getByText('(Total en sistema: 10)')).toBeInTheDocument();
            });
        });
    });

    describe('Post Display', () => {
        it('displays post information correctly', async () => {
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('user1')).toBeInTheDocument();
                expect(screen.getByText('user1@example.com')).toBeInTheDocument();
                expect(screen.getByText('Test content 1')).toBeInTheDocument();
                expect(screen.getByText('3 reportes activos')).toBeInTheDocument();
            });
        });

        it('displays media type labels correctly', async () => {
            render(<Content />);

            await waitFor(() => {
                const textoElements = screen.getAllByText('Texto');
                expect(textoElements).toHaveLength(2); // or whatever count you expect
                expect(screen.getByText('Imagen')).toBeInTheDocument();
                expect(screen.getByText('GIF')).toBeInTheDocument();
            });
        });

        it('displays images for posts with media files', async () => {
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByAltText('Contenido de user2')).toBeInTheDocument();
                expect(screen.getByAltText('Contenido de user4')).toBeInTheDocument();
            });
        });

        it('handles image error correctly', async () => {
            render(<Content />);

            await waitFor(async () => {
                const image = screen.getByAltText('Contenido de user2');
                fireEvent.error(image);

                // Wait a bit for the state update to complete
                await new Promise(resolve => setTimeout(resolve, 100));

                expect(image).toHaveStyle('display: none');
            });
        });

        it('displays active/inactive status correctly', async () => {
            render(<Content />);

            await waitFor(() => {
                const activeStatuses = screen.getAllByText('Activo');
                expect(activeStatuses).toHaveLength(3); // 3 active posts

                const inactiveStatuses = screen.getAllByText('Inactivo');
                expect(inactiveStatuses).toHaveLength(1); // 1 inactive post
            });
        });

        it('formats dates correctly', async () => {
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText(/Creado: 1 de mayo de 2025/)).toBeInTheDocument();
                expect(screen.getByText(/Creado: 2 de mayo de 2025/)).toBeInTheDocument();
            });
        });
    });

    describe('Sorting Functionality', () => {
        it('changes sort order when selecting date', async () => {
            const user = userEvent.setup();
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('user1')).toBeInTheDocument();
            });

            const sortSelect = screen.getByLabelText('Ordenar por:');
            await user.selectOptions(sortSelect, 'date');

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                    '/api/posts/reported?page=1&limit=8&sortBy=date',
                    expect.any(Object)
                );
            });
        });

        it('resets to page 1 when changing sort order', async () => {
            const user = userEvent.setup();

            // Mock response for page 2
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    ...mockApiResponse,
                    metadata: { ...mockApiResponse.metadata, currentPage: 2 }
                }),
            } as Response);

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('user1')).toBeInTheDocument();
            });

            // Go to page 2 first
            const nextButton = screen.getByText('Siguiente');
            await user.click(nextButton);

            // Change sort order
            const sortSelect = screen.getByLabelText('Ordenar por:');
            await user.selectOptions(sortSelect, 'date');

            await waitFor(() => {
                expect(mockFetch).toHaveBeenLastCalledWith(
                    '/api/posts/reported?page=1&limit=8&sortBy=date',
                    expect.any(Object)
                );
            });
        });
    });

    describe('Pagination', () => {
        it('displays pagination controls when multiple pages exist', async () => {
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText(/P.gina 1 de 2/i)).toBeInTheDocument();
                expect(screen.getByText('Anterior')).toBeInTheDocument();
                expect(screen.getByText('Siguiente')).toBeInTheDocument();
            });
        });

        it('disables previous button on first page', async () => {
            render(<Content />);

            await waitFor(() => {
                const prevButton = screen.getByText('Anterior');
                expect(prevButton).toBeDisabled();
            });
        });

        it('navigates to next page when next button is clicked', async () => {
            const user = userEvent.setup();
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('Siguiente')).toBeInTheDocument();
            });

            const nextButton = screen.getByText('Siguiente');
            await user.click(nextButton);

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                    '/api/posts/reported?page=2&limit=8&sortBy=reports',
                    expect.any(Object)
                );
            });
        });

        it('hides pagination when only one page exists', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    ...mockApiResponse,
                    metadata: { ...mockApiResponse.metadata, totalPages: 1 }
                }),
            } as Response);

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('user1')).toBeInTheDocument();
            });

            expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
            expect(screen.queryByText('Siguiente')).not.toBeInTheDocument();
        });
    });

    describe('Post Interactions', () => {
        it('navigates to post detail when active post is clicked', async () => {
            const user = userEvent.setup();
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('Test content 1')).toBeInTheDocument();
            });

            const postCard = screen.getByText('Test content 1').closest('div');
            await user.click(postCard!);

            expect(mockPush).toHaveBeenCalledWith('/content/1');
        });

        it('shows modal when inactive post is clicked', async () => {
            const user = userEvent.setup();
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('Test content 3')).toBeInTheDocument();
            });

            const inactivePostCard = screen.getByText('Test content 3').closest('div');
            await user.click(inactivePostCard!);

            // Check modal is displayed
            await waitFor(() => {
                expect(screen.getByText(/Sin implementar a.n/i)).toBeInTheDocument();
                expect(screen.getByText(/Esta funcionalidad no est. disponible para posts inactivos./i)).toBeInTheDocument();
            });
        });

        it('closes modal when close button is clicked', async () => {
            const user = userEvent.setup();
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('Test content 3')).toBeInTheDocument();
            });

            // Click inactive post to open modal
            const inactivePostCard = screen.getByText('Test content 3').closest('div');
            await user.click(inactivePostCard!);

            await waitFor(() => {
                expect(screen.getByText(/Sin implementar a.n/i)).toBeInTheDocument();
            });

            // Click close button
            const closeButton = screen.getByText('Entendido');
            await user.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByText(/Sin implementar a.n/i)).not.toBeInTheDocument();
            });
        });

        it('closes modal when clicking outside modal content', async () => {
            const user = userEvent.setup();
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('Test content 3')).toBeInTheDocument();
            });

            // Click inactive post to open modal
            const inactivePostCard = screen.getByText('Test content 3').closest('div');
            await user.click(inactivePostCard!);

            await waitFor(() => {
                expect(screen.getByText(/Sin implementar a.n/i)).toBeInTheDocument();
            });

            // Click modal backdrop
            const modalBackdrop = screen.getByText(/Sin implementar a.n/i).closest('div')?.parentNode as HTMLElement;
            await user.click(modalBackdrop);

            await waitFor(() => {
                expect(screen.queryByText(/Sin implementar aún/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Reload Functionality', () => {
        it('reloads data when reload button is clicked', async () => {
            const user = userEvent.setup();
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByTitle('Recargar')).toBeInTheDocument();
            });

            const reloadButton = screen.getByTitle('Recargar');
            await user.click(reloadButton);

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                    '/api/posts/reported?page=1&limit=8&sortBy=reports',
                    expect.any(Object)
                );
            });
        });

        it('resets to page 1 when reloading', async () => {
            const user = userEvent.setup();

            // Mock response for page 2
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    ...mockApiResponse,
                    metadata: { ...mockApiResponse.metadata, currentPage: 2 }
                }),
            } as Response);

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('Siguiente')).toBeInTheDocument();
            });

            // Go to page 2
            const nextButton = screen.getByText('Siguiente');
            await user.click(nextButton);

            // Reload
            const reloadButton = screen.getByTitle('Recargar');
            await user.click(reloadButton);

            await waitFor(() => {
                expect(mockFetch).toHaveBeenLastCalledWith(
                    '/api/posts/reported?page=1&limit=8&sortBy=reports',
                    expect.any(Object)
                );
            });
        });
    });

    describe('Error Handling', () => {
        it('displays error message when API call fails', async () => {
            // Mock console.error to prevent error logs in test output
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            mockFetch.mockRejectedValue(new Error('Network error'));

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText(/Error al cargar las publicaciones: Network error/)).toBeInTheDocument();
                expect(screen.getByText('Reintentar')).toBeInTheDocument();
            });

            consoleSpy.mockRestore();
        });

        it('displays error message when API returns non-ok response', async () => {
            // Mock console.error to prevent error logs in test output
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
            } as Response);

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText(/Error al cargar las publicaciones: HTTP error! status: 500/)).toBeInTheDocument();
            });

            consoleSpy.mockRestore();
        });

        it('retries loading when retry button is clicked', async () => {
            const user = userEvent.setup();
            // Mock console.error to prevent error logs in test output
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('Reintentar')).toBeInTheDocument();
            });

            // Reset mock to success for retry
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => mockApiResponse,
            } as Response);

            const retryButton = screen.getByText('Reintentar');
            await user.click(retryButton);

            await waitFor(() => {
                expect(screen.getByText('user1')).toBeInTheDocument();
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Empty States', () => {
        it('displays empty state when no posts are returned', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => emptyApiResponse,
            } as Response);

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('No hay publicaciones reportadas activas.')).toBeInTheDocument();
                expect(screen.getByText('Mostrando 0 de 0 publicaciones reportadas')).toBeInTheDocument();
            });
        });

        it('does not display pagination when no posts exist', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => emptyApiResponse,
            } as Response);

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('No hay publicaciones reportadas activas.')).toBeInTheDocument();
            });

            expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
            expect(screen.queryByText('Siguiente')).not.toBeInTheDocument();
        });
    });

    describe('Media Type Handling', () => {
        it('handles unknown media types', async () => {
            const mockResponseWithUnknownMedia = {
                ...mockApiResponse,
                posts: [
                    {
                        ...mockApiResponse.posts[0],
                        media_type: 99, // Unknown media type
                    }
                ]
            };

            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => mockResponseWithUnknownMedia,
            } as Response);

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('Desconocido')).toBeInTheDocument();
            });
        });

        it('does not display image when file_url is null for non-text media', async () => {
            const mockResponseWithNullFileUrl = {
                ...mockApiResponse,
                posts: [
                    {
                        ...mockApiResponse.posts[1], // Image post
                        file_url: null,
                    }
                ]
            };

            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => mockResponseWithNullFileUrl,
            } as Response);

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('user2')).toBeInTheDocument();
            });

            expect(screen.queryByAltText('Contenido de user2')).not.toBeInTheDocument();
        });
    });
});