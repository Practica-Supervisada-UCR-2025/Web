'use client';
import { useState, useEffect, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { mockApiResponse } from '../../../../public/data/contentData';

// Type definitions
interface Post {
    id: string;
    user_id: string;
    content: string;
    file_url: string | null;
    file_size: number | null;
    media_type: number; // 0 = text, 1 = image, 2 = gif
    is_active: boolean;
    is_edited: boolean;
    status: number;
    created_at: string;
    updated_at: string;
    username: string;
    email: string;
    active_reports: string;
    total_reports: string;
}

interface ApiResponse {
    message: string;
    posts: Post[];
    metadata: {
        totalPosts: number;
        totalPages: number;
        currentPage: number;
    };
}

interface PostCardProps {
    post: Post;
    onClick: (post: Post) => void;
}

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

// Helper function to format date
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Helper function to get media type label
const getMediaTypeLabel = (mediaType: number): string => {
    switch (mediaType) {
        case 0: return 'Texto';
        case 1: return 'Imagen';
        case 2: return 'GIF';
        default: return 'Desconocido';
    }
};

// Post card component
const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
    return (
        <div
            className="bg-white shadow rounded-lg p-4 mb-4 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
            onClick={() => onClick(post)}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-medium text-gray-800">{post.username}</h3>
                    <p className="text-sm text-gray-500">{post.email}</p>
                </div>
                <div className="text-right">
                    <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                        {post.active_reports} reportes activos
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                        {getMediaTypeLabel(post.media_type)}
                    </p>
                </div>
            </div>

            <div className="my-3 flex-grow">
                <p className="text-gray-700 mb-2">{post.content}</p>
                {post.media_type !== 0 && post.file_url && (
                    <div className="mt-2 rounded-md overflow-hidden">
                        <img
                            src={post.file_url}
                            alt={`Contenido de ${post.username}`}
                            className="w-full h-auto max-h-48 object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
                <span>Creado: {formatDate(post.created_at)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {post.is_active ? 'Activo' : 'Inactivo'}
                </span>
            </div>
        </div>
    );
};

// Pagination component
const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex justify-center items-center mt-6 mb-8">
            <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-l-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Anterior
            </button>

            <div className="px-4 py-2 bg-gray-100 text-gray-800">
                P&aacute;gina {currentPage} de {totalPages}
            </div>

            <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Siguiente
            </button>
        </div>
    );
};

export default function Content(): JSX.Element {
    const [apiData, setApiData] = useState<ApiResponse | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortBy, setSortBy] = useState<'reports' | 'date'>('reports');
    const router = useRouter();
    const postsPerPage = 8;

    useEffect(() => {
        const fetchData = async () => {
            // TODO: API
            setApiData(mockApiResponse);
        };

        fetchData();
    }, []);

    if (!apiData) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="flex justify-center items-center py-20">
                    <div className="text-gray-500">Cargando publicaciones...</div>
                </div>
            </div>
        );
    }

    // Filter posts: active AND with reports > 0
    const filteredPosts = apiData.posts
        .filter(post => post.is_active && parseInt(post.active_reports) > 0)
        .sort((a, b) => {
            if (sortBy === 'reports') {
                return parseInt(b.active_reports) - parseInt(a.active_reports);
            } else { // sortBy === 'date'
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });

    // Calculate total pages
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    // Get current posts
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

    // Change page
    const handlePageChange = (pageNumber: number): void => {
        setCurrentPage(pageNumber);
    };

    // Handle reload
    const handleReload = (): void => {
        // In a real app, this would fetch fresh data from the endpoint
        setApiData({ ...mockApiResponse });
        setCurrentPage(1);
    };

    // Handle post click - navigate to dedicated page
    const handlePostClick = (post: Post): void => {
        router.push(`/content/${post.id}`);
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Panel de Moderaci&oacute;n</h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <label htmlFor="sortBy" className="mr-2 text-sm text-gray-600">Ordenar por:</label>
                        <select
                            id="sortBy"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'reports' | 'date')}
                            className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-800"
                        >
                            <option value="reports">Reportes</option>
                            <option value="date">Fecha</option>
                        </select>
                    </div>

                    <button
                        onClick={handleReload}
                        className="ml-2 p-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-md flex items-center"
                        title="Recargar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="mb-4 text-sm text-gray-500">
                Mostrando {currentPosts.length} de {filteredPosts.length} publicaciones reportadas
                <span className="ml-4 text-xs">
                    (Total en sistema: {apiData.metadata.totalPosts})
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentPosts.map(post => (
                    <PostCard key={post.id} post={post} onClick={handlePostClick} />
                ))}
            </div>

            {currentPosts.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    No hay publicaciones reportadas activas.
                </div>
            )}

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}