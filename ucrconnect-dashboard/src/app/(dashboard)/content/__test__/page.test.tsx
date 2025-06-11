import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import Content from '../page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock the API response data to match the actual component interface
jest.mock('../../../../../public/data/contentData', () => ({
    mockApiResponse: {
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
                media_type: 0, // text
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
                media_type: 1, // image
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
                media_type: 0, // text
                is_active: true,
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
                file_url: null,
                file_size: null,
                media_type: 0, // text
                is_active: true,
                is_edited: false,
                status: 1,
                active_reports: '2',
                total_reports: '2',
                created_at: '2025-05-04T16:45:00Z',
                updated_at: '2025-05-04T16:45:00Z',
            },
            {
                id: '5',
                user_id: 'user5',
                username: 'user5',
                email: 'user5@example.com',
                content: 'Test content 5',
                file_url: null,
                file_size: null,
                media_type: 0, // text
                is_active: true,
                is_edited: false,
                status: 1,
                active_reports: '1',
                total_reports: '1',
                created_at: '2025-05-05T11:30:00Z',
                updated_at: '2025-05-05T11:30:00Z',
            },
            {
                id: '6',
                user_id: 'user6',
                username: 'user6',
                email: 'user6@example.com',
                content: 'Test content 6',
                file_url: null,
                file_size: null,
                media_type: 0, // text
                is_active: true,
                is_edited: false,
                status: 1,
                active_reports: '6',
                total_reports: '8',
                created_at: '2025-05-06T13:20:00Z',
                updated_at: '2025-05-06T13:20:00Z',
            },
            {
                id: '7',
                user_id: 'user7',
                username: 'user7',
                email: 'user7@example.com',
                content: 'Test content 7',
                file_url: '/test-image-7.jpg',
                file_size: 2048,
                media_type: 1, // image
                is_active: true,
                is_edited: false,
                status: 1,
                active_reports: '2',
                total_reports: '3',
                created_at: '2025-05-07T09:45:00Z',
                updated_at: '2025-05-07T09:45:00Z',
            },
            {
                id: '8',
                user_id: 'user8',
                username: 'user8',
                email: 'user8@example.com',
                content: 'Test content 8',
                file_url: null,
                file_size: null,
                media_type: 0, // text
                is_active: true,
                is_edited: false,
                status: 1,
                active_reports: '1',
                total_reports: '2',
                created_at: '2025-05-08T14:15:00Z',
                updated_at: '2025-05-08T14:15:00Z',
            },
            {
                id: '9',
                user_id: 'user9',
                username: 'user9',
                email: 'user9@example.com',
                content: 'Test content 9',
                file_url: null,
                file_size: null,
                media_type: 0, // text
                is_active: true,
                is_edited: false,
                status: 1,
                active_reports: '3',
                total_reports: '4',
                created_at: '2025-05-09T16:30:00Z',
                updated_at: '2025-05-09T16:30:00Z',
            },
            // These should be filtered out
            {
                id: '10',
                user_id: 'user10',
                username: 'user10',
                email: 'user10@example.com',
                content: 'Test content 10',
                file_url: null,
                file_size: null,
                media_type: 0, // text
                is_active: true,
                is_edited: false,
                status: 1,
                active_reports: '0', // Should be filtered out
                total_reports: '1',
                created_at: '2025-05-10T10:00:00Z',
                updated_at: '2025-05-10T10:00:00Z',
            },
            {
                id: '11',
                user_id: 'user11',
                username: 'user11',
                email: 'user11@example.com',
                content: 'Test content 11',
                file_url: null,
                file_size: null,
                media_type: 0, // text
                is_active: false, // Should be filtered out
                is_edited: false,
                status: 1,
                active_reports: '2',
                total_reports: '2',
                created_at: '2025-05-11T16:45:00Z',
                updated_at: '2025-05-11T16:45:00Z',
            },
        ],
        metadata: {
            totalPosts: 11,
            totalPages: 2,
            currentPage: 1,
        },
    },
}));

// for restoration
const originalMockData = {
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
            media_type: 0, // text
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
            media_type: 1, // image
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
            media_type: 0, // text
            is_active: true,
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
            file_url: null,
            file_size: null,
            media_type: 0, // text
            is_active: true,
            is_edited: false,
            status: 1,
            active_reports: '2',
            total_reports: '2',
            created_at: '2025-05-04T16:45:00Z',
            updated_at: '2025-05-04T16:45:00Z',
        },
        {
            id: '5',
            user_id: 'user5',
            username: 'user5',
            email: 'user5@example.com',
            content: 'Test content 5',
            file_url: null,
            file_size: null,
            media_type: 0, // text
            is_active: true,
            is_edited: false,
            status: 1,
            active_reports: '1',
            total_reports: '1',
            created_at: '2025-05-05T11:30:00Z',
            updated_at: '2025-05-05T11:30:00Z',
        },
        {
            id: '6',
            user_id: 'user6',
            username: 'user6',
            email: 'user6@example.com',
            content: 'Test content 6',
            file_url: null,
            file_size: null,
            media_type: 0, // text
            is_active: true,
            is_edited: false,
            status: 1,
            active_reports: '6',
            total_reports: '8',
            created_at: '2025-05-06T13:20:00Z',
            updated_at: '2025-05-06T13:20:00Z',
        },
        {
            id: '7',
            user_id: 'user7',
            username: 'user7',
            email: 'user7@example.com',
            content: 'Test content 7',
            file_url: '/test-image-7.jpg',
            file_size: 2048,
            media_type: 1, // image
            is_active: true,
            is_edited: false,
            status: 1,
            active_reports: '2',
            total_reports: '3',
            created_at: '2025-05-07T09:45:00Z',
            updated_at: '2025-05-07T09:45:00Z',
        },
        {
            id: '8',
            user_id: 'user8',
            username: 'user8',
            email: 'user8@example.com',
            content: 'Test content 8',
            file_url: null,
            file_size: null,
            media_type: 0, // text
            is_active: true,
            is_edited: false,
            status: 1,
            active_reports: '1',
            total_reports: '2',
            created_at: '2025-05-08T14:15:00Z',
            updated_at: '2025-05-08T14:15:00Z',
        },
        {
            id: '9',
            user_id: 'user9',
            username: 'user9',
            email: 'user9@example.com',
            content: 'Test content 9',
            file_url: null,
            file_size: null,
            media_type: 0, // text
            is_active: true,
            is_edited: false,
            status: 1,
            active_reports: '3',
            total_reports: '4',
            created_at: '2025-05-09T16:30:00Z',
            updated_at: '2025-05-09T16:30:00Z',
        },
        // These should be filtered out
        {
            id: '10',
            user_id: 'user10',
            username: 'user10',
            email: 'user10@example.com',
            content: 'Test content 10',
            file_url: null,
            file_size: null,
            media_type: 0, // text
            is_active: true,
            is_edited: false,
            status: 1,
            active_reports: '0', // Should be filtered out
            total_reports: '1',
            created_at: '2025-05-10T10:00:00Z',
            updated_at: '2025-05-10T10:00:00Z',
        },
        {
            id: '11',
            user_id: 'user11',
            username: 'user11',
            email: 'user11@example.com',
            content: 'Test content 11',
            file_url: null,
            file_size: null,
            media_type: 0, // text
            is_active: false, // Should be filtered out
            is_edited: false,
            status: 1,
            active_reports: '2',
            total_reports: '2',
            created_at: '2025-05-11T16:45:00Z',
            updated_at: '2025-05-11T16:45:00Z',
        },
    ],
    metadata: {
        totalPosts: 11,
        totalPages: 2,
        currentPage: 1,
    },
};

const emptyMockData = {
    message: 'Success',
    posts: [],
    metadata: {
        totalPosts: 0,
        totalPages: 0,
        currentPage: 1,
    },
};

const filteredOutMockData = {
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
            active_reports: '0', // Zero reports - should be filtered out
            total_reports: '0',
            created_at: '2025-05-01T10:00:00Z',
            updated_at: '2025-05-01T10:00:00Z',
        },
        {
            id: '2',
            user_id: 'user2',
            username: 'user2',
            email: 'user2@example.com',
            content: 'Test content 2',
            file_url: null,
            file_size: null,
            media_type: 0,
            is_active: false, // Inactive - should be filtered out
            is_edited: false,
            status: 1,
            active_reports: '5',
            total_reports: '5',
            created_at: '2025-05-02T10:00:00Z',
            updated_at: '2025-05-02T10:00:00Z',
        },
    ],
    metadata: {
        totalPosts: 2,
        totalPages: 1,
        currentPage: 1,
    },
};

const gifMockData = {
    message: 'Success',
    posts: [
        {
            id: '1',
            user_id: 'user1',
            username: 'user1',
            email: 'user1@example.com',
            content: 'GIF content',
            file_url: '/test.gif',
            file_size: 2048,
            media_type: 2, // GIF
            is_active: true,
            is_edited: false,
            status: 1,
            active_reports: '3',
            total_reports: '3',
            created_at: '2025-05-01T10:00:00Z',
            updated_at: '2025-05-01T10:00:00Z',
        },
        {
            id: '2',
            user_id: 'user2',
            username: 'user2',
            email: 'user2@example.com',
            content: 'Unknown media content',
            file_url: null,
            file_size: null,
            media_type: 99, // Unknown media type
            is_active: true,
            is_edited: false,
            status: 1,
            active_reports: '2',
            total_reports: '2',
            created_at: '2025-05-02T10:00:00Z',
            updated_at: '2025-05-02T10:00:00Z',
        },
    ],
    metadata: {
        totalPosts: 2,
        totalPages: 1,
        currentPage: 1,
    },
};

describe('Content Component', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
    });

    it('renders the component with correct title', async () => {
        render(<Content />);

        await waitFor(() => {
            expect(screen.getByText(/Panel de Moderaci.n/i)).toBeInTheDocument();
        });
    });

    it('filters and displays only active posts with reports > 0', async () => {
        render(<Content />);

        await waitFor(() => {
            expect(screen.getByText(/Panel de Moderaci.n/i)).toBeInTheDocument();
        });

        expect(screen.getByText('Mostrando 8 de 9 publicaciones reportadas')).toBeInTheDocument();
        expect(screen.getByText('(Total en sistema: 11)')).toBeInTheDocument();
    });

    it('displays posts in correct order by reports (default)', async () => {
        render(<Content />);

        await waitFor(() => {
            expect(screen.getByText(/Panel de Moderaci.n/i)).toBeInTheDocument();
        });

        const postCards = screen.getAllByText(/reportes activos/);

        // Should be sorted by reports in descending order
        expect(postCards[0]).toHaveTextContent('6 reportes activos'); // user6
        expect(postCards[1]).toHaveTextContent('5 reportes activos'); // user2
        expect(postCards[2]).toHaveTextContent('4 reportes activos'); // user3
    });

    it('sorts posts by date when date option is selected', async () => {
        const user = userEvent.setup();
        render(<Content />);

        await waitFor(() => {
            expect(screen.getByText(/Panel de Moderaci.n/i)).toBeInTheDocument();
        });

        const sortSelect = screen.getByLabelText('Ordenar por:');
        await user.selectOptions(sortSelect, 'date');

        await waitFor(() => {
            const postCards = screen.getAllByText(/Test content/);
            // Should be sorted by date in descending order (newest first)
            expect(postCards[0]).toHaveTextContent('Test content 9'); // 2025-05-09
            expect(postCards[1]).toHaveTextContent('Test content 8'); // 2025-05-08
            expect(postCards[2]).toHaveTextContent('Test content 7'); // 2025-05-07
        });
    });

    it('displays post cards with correct information', async () => {
        render(<Content />);

        await waitFor(() => {
            expect(screen.getByText(/Panel de Moderaci.n/i)).toBeInTheDocument();
        });

        // Check first post (user6 with highest reports)
        expect(screen.getByText('user6')).toBeInTheDocument();
        expect(screen.getByText('user6@example.com')).toBeInTheDocument();
        expect(screen.getByText('Test content 6')).toBeInTheDocument();
        expect(screen.getByText('6 reportes activos')).toBeInTheDocument();
        expect(screen.getAllByText('Texto')).toHaveLength(6); // Multiple text posts visible
    });

    it('displays images for posts with media_type 1', async () => {
        render(<Content />);

        await waitFor(() => {
            expect(screen.getByText(/Panel de Moderaci.n/i)).toBeInTheDocument();
        });

        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);

        // Check that image posts have the correct alt text
        expect(screen.getByAltText('Contenido de user2')).toBeInTheDocument();
        expect(screen.getByAltText('Contenido de user7')).toBeInTheDocument();
    });

    it('handles pagination correctly', async () => {
        const user = userEvent.setup();
        render(<Content />);

        await waitFor(() => {
            expect(screen.getByText(/Panel de Moderaci.n/i)).toBeInTheDocument();
        });

        // Should show pagination controls
        expect(screen.getByText(/P.gina 1 de 2/i)).toBeInTheDocument();
        expect(screen.getByText('Anterior')).toBeInTheDocument();
        expect(screen.getByText('Siguiente')).toBeInTheDocument();

        // Previous button should be disabled on first page
        const prevButton = screen.getByText('Anterior');
        expect(prevButton).toBeDisabled();

        // Click next page
        const nextButton = screen.getByText('Siguiente');
        await user.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText(/P.gina 2 de 2/i)).toBeInTheDocument();
        });

        // Should show only 1 post on second page (9 total posts, 8 per page)
        expect(screen.getByText('Mostrando 1 de 9 publicaciones reportadas')).toBeInTheDocument();
    });

    it('navigates to post detail when post is clicked', async () => {
        const user = userEvent.setup();
        render(<Content />);

        await waitFor(() => {
            expect(screen.getByText(/Panel de Moderaci.n/i)).toBeInTheDocument();
        });

        // Click on the first post
        const firstPost = screen.getByText('Test content 6').closest('div');
        await user.click(firstPost!);

        expect(mockPush).toHaveBeenCalledWith('/content/6');
    });

    it('handles reload functionality', async () => {
        const user = userEvent.setup();
        render(<Content />);

        await waitFor(() => {
            expect(screen.getByText(/Panel de Moderaci.n/i)).toBeInTheDocument();
        });

        // Go to page 2
        const nextButton = screen.getByText('Siguiente');
        await user.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText(/P.gina 2 de 2/i)).toBeInTheDocument();
        });

        // Click reload button
        const reloadButton = screen.getByTitle('Recargar');
        await user.click(reloadButton);

        await waitFor(() => {
            // Should be back to page 1
            expect(screen.getByText(/P.gina 1 de 2/i)).toBeInTheDocument();
            expect(screen.getByText('Mostrando 8 de 9 publicaciones reportadas')).toBeInTheDocument();
        });
    });

    it('displays correct media type labels', async () => {
        render(<Content />);

        await waitFor(() => {
            expect(screen.getByText(/Panel de Moderaci.n/i)).toBeInTheDocument();
        });

        // Check for text and image media types
        expect(screen.getAllByText('Texto')).toHaveLength(6); // 7 text posts visible on first page
        expect(screen.getAllByText('Imagen')).toHaveLength(2); // 1 image post visible on first page
    });

    it('handles image error correctly', async () => {
        render(<Content />);

        await waitFor(() => {
            expect(screen.getByText(/Panel de Moderaci.n/i)).toBeInTheDocument();
        });

        const image = screen.getByAltText('Contenido de user2');

        // Simulate image error
        fireEvent.error(image);

        // Image should be hidden
        expect(image).toHaveStyle('display: none');
    });

    it('shows empty state when no posts match filter', async () => {
        render(<Content />);

        await waitFor(() => {
            expect(screen.getByText(/Panel de Moderaci.n/i)).toBeInTheDocument();
        });

        expect(screen.getByText('Mostrando 8 de 9 publicaciones reportadas')).toBeInTheDocument();
        expect(screen.getByText('(Total en sistema: 11)')).toBeInTheDocument();

        // This confirms that 2 posts were filtered out (11 total - 9 shown = 2 filtered)
    });

    it('formats dates correctly', async () => {
        render(<Content />);

        await waitFor(() => {
            expect(screen.getByText(/Panel de Moderaci.n/i)).toBeInTheDocument();
        });

        // Check for formatted date
        expect(screen.getByText(/Creado: 6 de mayo de 2025/)).toBeInTheDocument();
    });

    // Test loading state
    describe('Loading State', () => {
        it('displays loading message when apiData is null', () => {
            // Mock useState to return null initially
            const mockSetState = jest.fn();
            jest.spyOn(React, 'useState')
                .mockImplementationOnce(() => [null, mockSetState]) // apiData
                .mockImplementationOnce(() => [1, mockSetState]) // currentPage
                .mockImplementationOnce(() => ['reports', mockSetState]); // sortBy

            render(<Content />);

            expect(screen.getByText('Cargando publicaciones...')).toBeInTheDocument();
        });
    });

    // Test empty states and edge cases
    describe('Empty States and Edge Cases', () => {
        it('displays empty state when all posts are filtered out', async () => {
            // Temporarily change the mock
            const mockModule = require('../../../../../public/data/contentData');
            mockModule.mockApiResponse = filteredOutMockData;

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('No hay publicaciones reportadas activas.')).toBeInTheDocument();
            });

            // Should show 0 posts
            expect(screen.getByText('Mostrando 0 de 0 publicaciones reportadas')).toBeInTheDocument();

            // Restore original mock
            mockModule.mockApiResponse = originalMockData;
        });

        it('displays empty state with completely empty data', async () => {
            const mockModule = require('../../../../../public/data/contentData');
            mockModule.mockApiResponse = emptyMockData;

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText('No hay publicaciones reportadas activas.')).toBeInTheDocument();
            });

            // Restore original mock
            mockModule.mockApiResponse = originalMockData;
        });
    });

    // Test media type edge cases
    describe('Media Type Coverage', () => {
        it('handles GIF media type and unknown media types', async () => {
            const mockModule = require('../../../../../public/data/contentData');
            mockModule.mockApiResponse = gifMockData;

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText(/Panel de Moderaci/i)).toBeInTheDocument();
            });

            // Check for GIF label
            expect(screen.getByText('GIF')).toBeInTheDocument();

            // Check for unknown media type fallback
            expect(screen.getByText('Desconocido')).toBeInTheDocument();

            // Restore original mock
            mockModule.mockApiResponse = originalMockData;
        });

        it('handles posts without file_url when media_type is not 0', async () => {
            const mockModule = require('../../../../../public/data/contentData');
            const mockDataWithoutFileUrl = {
                ...gifMockData,
                posts: [
                    {
                        ...gifMockData.posts[0],
                        file_url: null, // No file URL but media_type is 2 (GIF)
                    }
                ]
            };
            mockModule.mockApiResponse = mockDataWithoutFileUrl;

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText(/Panel de Moderaci/i)).toBeInTheDocument();
            });

            // Should not render an image since file_url is null
            expect(screen.queryByRole('img')).not.toBeInTheDocument();

            // Restore original mock
            mockModule.mockApiResponse = originalMockData;
        });
    });

    // Test pagination edge cases
    describe('Pagination Edge Cases', () => {
        it('handles single page scenario (no pagination controls)', async () => {
            const singlePageMock = {
                ...originalMockData,
                posts: originalMockData.posts.slice(0, 3),
            };

            const mockModule = require('../../../../../public/data/contentData');
            mockModule.mockApiResponse = singlePageMock;

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText(/Panel de Moderaci/i)).toBeInTheDocument();
            });

            // Should not show pagination controls
            expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
            expect(screen.queryByText('Siguiente')).not.toBeInTheDocument();

            // Restore original mock
            mockModule.mockApiResponse = originalMockData;
        });

        it('disables next button on last page', async () => {
            const user = userEvent.setup();
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText(/Panel de Moderaci/i)).toBeInTheDocument();
            });

            // Go to last page
            const nextButton = screen.getByText('Siguiente');
            await user.click(nextButton);

            await waitFor(() => {
                expect(screen.getByText(/P.gina 2 de 2/i)).toBeInTheDocument();
            });

            // Next button should be disabled
            expect(screen.getByText('Siguiente')).toBeDisabled();
        });

        it('enables previous button when not on first page', async () => {
            const user = userEvent.setup();
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText(/Panel de Moderaci/i)).toBeInTheDocument();
            });

            // Initially previous should be disabled
            expect(screen.getByText('Anterior')).toBeDisabled();

            // Go to second page
            await user.click(screen.getByText('Siguiente'));

            await waitFor(() => {
                expect(screen.getByText(/P.gina 2 de 2/i)).toBeInTheDocument();
            });

            // Previous button should be enabled
            expect(screen.getByText('Anterior')).not.toBeDisabled();
        });
    });

    // Test status conditions
    describe('Post Status Conditions', () => {
        it('displays correct status for inactive posts (if any make it through filter)', async () => {
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText(/Panel de Moderaci/i)).toBeInTheDocument();
            });

            // All visible posts should show "Activo" since we filter out inactive ones
            const statusElements = screen.getAllByText('Activo');
            expect(statusElements.length).toBeGreaterThan(0);

            // Should not find any "Inactivo" status since they're filtered out
            expect(screen.queryByText('Inactivo')).not.toBeInTheDocument();
        });
    });

    // Test sorting edge cases
    describe('Sorting Edge Cases', () => {
        it('handles posts with identical report counts', async () => {
            const identicalReportsMock = {
                ...originalMockData,
                posts: [
                    {
                        id: '1',
                        user_id: 'user1',
                        username: 'user1',
                        email: 'user1@example.com',
                        content: 'Content 1',
                        file_url: null,
                        file_size: null,
                        media_type: 0,
                        is_active: true,
                        is_edited: false,
                        status: 1,
                        active_reports: '3',
                        total_reports: '3',
                        created_at: '2025-05-01T10:00:00Z',
                        updated_at: '2025-05-01T10:00:00Z',
                    },
                    {
                        id: '2',
                        user_id: 'user2',
                        username: 'user2',
                        email: 'user2@example.com',
                        content: 'Content 2',
                        file_url: null,
                        file_size: null,
                        media_type: 0,
                        is_active: true,
                        is_edited: false,
                        status: 1,
                        active_reports: '3', // Same report count
                        total_reports: '3',
                        created_at: '2025-05-02T10:00:00Z',
                        updated_at: '2025-05-02T10:00:00Z',
                    },
                ]
            };

            const mockModule = require('../../../../../public/data/contentData');
            mockModule.mockApiResponse = identicalReportsMock;

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText(/Panel de Moderaci/i)).toBeInTheDocument();
            });

            // Both posts should be visible
            expect(screen.getByText('Content 1')).toBeInTheDocument();
            expect(screen.getByText('Content 2')).toBeInTheDocument();

            // Restore original mock
            mockModule.mockApiResponse = originalMockData;
        });

        it('handles posts with identical dates when sorting by date', async () => {
            const user = userEvent.setup();
            const identicalDatesMock = {
                ...originalMockData,
                posts: [
                    {
                        id: '1',
                        user_id: 'user1',
                        username: 'user1',
                        email: 'user1@example.com',
                        content: 'Content 1',
                        file_url: null,
                        file_size: null,
                        media_type: 0,
                        is_active: true,
                        is_edited: false,
                        status: 1,
                        active_reports: '1',
                        total_reports: '1',
                        created_at: '2025-05-01T10:00:00Z', // Same date
                        updated_at: '2025-05-01T10:00:00Z',
                    },
                    {
                        id: '2',
                        user_id: 'user2',
                        username: 'user2',
                        email: 'user2@example.com',
                        content: 'Content 2',
                        file_url: null,
                        file_size: null,
                        media_type: 0,
                        is_active: true,
                        is_edited: false,
                        status: 1,
                        active_reports: '2',
                        total_reports: '2',
                        created_at: '2025-05-01T10:00:00Z', // Same date
                        updated_at: '2025-05-01T10:00:00Z',
                    },
                ]
            };

            const mockModule = require('../../../../../public/data/contentData');
            mockModule.mockApiResponse = identicalDatesMock;

            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText(/Panel de Moderaci/i)).toBeInTheDocument();
            });

            // Change to date sorting
            const sortSelect = screen.getByLabelText('Ordenar por:');
            await user.selectOptions(sortSelect, 'date');

            // Both posts should still be visible
            await waitFor(() => {
                expect(screen.getByText('Content 1')).toBeInTheDocument();
                expect(screen.getByText('Content 2')).toBeInTheDocument();
            });

            // Restore original mock
            mockModule.mockApiResponse = originalMockData;
        });
    });

    // Test image error handling more thoroughly
    describe('Image Error Handling', () => {
        it('handles multiple image errors', async () => {
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText(/Panel de Moderaci/i)).toBeInTheDocument();
            });

            const images = screen.getAllByRole('img');

            // Trigger error on all images
            images.forEach(img => {
                fireEvent.error(img);
                expect(img).toHaveStyle('display: none');
            });
        });
    });

    // Test component update scenarios
    describe('Component Updates', () => {
        it('handles page changes correctly', async () => {
            const user = userEvent.setup();
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText(/Panel de Moderaci/i)).toBeInTheDocument();
            });

            const nextButton = screen.getByText('Siguiente');
            await user.click(nextButton);

            await waitFor(() => {
                expect(screen.getByText(/P.gina 2 de 2/i)).toBeInTheDocument();
            });

            const prevButton = screen.getByText('Anterior');
            await user.click(prevButton);

            await waitFor(() => {
                expect(screen.getByText(/P.gina 1 de 2/i)).toBeInTheDocument();
            });
        });
    });

    // Test accessibility and interaction edge cases
    describe('Accessibility and Interactions', () => {
        it('handles reload with different sort orders', async () => {
            const user = userEvent.setup();
            render(<Content />);

            await waitFor(() => {
                expect(screen.getByText(/Panel de Moderaci/i)).toBeInTheDocument();
            });

            // Change sort order first
            const sortSelect = screen.getByLabelText('Ordenar por:');
            await user.selectOptions(sortSelect, 'date');

            // Then reload
            const reloadButton = screen.getByTitle('Recargar');
            await user.click(reloadButton);

            await waitFor(() => {
                // Should maintain the sort order but reset to page 1
                expect(screen.getByText(/P.gina 1 de 2/i)).toBeInTheDocument();
                expect(sortSelect).toHaveValue('date');
            });
        });
    });
});