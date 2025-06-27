'use client';
import { useState, useEffect, JSX } from 'react';
import { useRouter } from 'next/navigation';

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
        totalReportedPosts: number;
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

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
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

// Modal component
const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center">
                    <div className="mb-4">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Sin implementar a&uacute;n
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Esta funcionalidad no est&aacute; disponible para posts inactivos.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-xl transition-colors"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
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
                    <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-xl">
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
                    <div className="mt-2 rounded-xl overflow-hidden">
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
                <span className={`px-2 py-1 rounded-xl text-xs font-medium ${post.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {post.is_active ? 'Activo' : 'Inactivo'}
                </span>
            </div>
        </div>
    );
};

// Pagination component
const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#249dd8] text-white hover:bg-[#1b87b9]'
                    }`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
            </button>
            {[...Array(totalPages)].map((_, index) => (
                <button
                    key={index}
                    onClick={() => onPageChange(index + 1)}
                    className={`px-3 py-1 rounded-lg ${currentPage === index + 1
                            ? 'bg-[#249dd8] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {index + 1}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#249dd8] text-white hover:bg-[#1b87b9]'
                    }`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
            </button>
        </div>
    );
};
export default function Content(): JSX.Element {
    const [apiData, setApiData] = useState<ApiResponse | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortBy, setSortBy] = useState<'reports' | 'date'>('reports');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const router = useRouter();
    const postsPerPage = 8;

    // Fetch data function
    const fetchData = async (page: number = currentPage, sort: 'reports' | 'date' = sortBy) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `/api/posts/reported?page=${page}&limit=${postsPerPage}&sortBy=${sort}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();
            setApiData(data);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, []);

    // Fetch data when page or sort changes
    useEffect(() => {
        if (apiData) { // Only fetch if we've already loaded initial data
            fetchData(currentPage, sortBy);
        }
    }, [currentPage, sortBy]);

    // Handle page change
    const handlePageChange = (pageNumber: number): void => {
        setCurrentPage(pageNumber);
    };

    // Handle sort change
    const handleSortChange = (newSort: 'reports' | 'date'): void => {
        setSortBy(newSort);
        setCurrentPage(1); // Reset to first page when sorting changes
    };

    // Handle reload
    const handleReload = (): void => {
        setCurrentPage(1);
        fetchData(1, sortBy);
    };

    // Handle post click - navigate to dedicated page or show modal
    const handlePostClick = (post: Post): void => {
        if (post.is_active) {
            router.push(`/content/${post.id}`);
        } else {
            setIsModalOpen(true);
        }
    };

    // Handle modal close
    const handleModalClose = (): void => {
        setIsModalOpen(false);
    };

    // Loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="flex justify-center items-center py-20">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-xl h-6 w-6 border-b-2 border-[#249dd8]"></div>
                        <span className="text-gray-500">Cargando publicaciones...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="flex flex-col justify-center items-center py-20">
                    <div className="text-red-500 mb-4">Error al cargar las publicaciones: {error}</div>
                    <button
                        onClick={handleReload}
                        className="px-4 py-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-xl"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (!apiData) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="flex justify-center items-center py-20">
                    <div className="text-gray-500">No hay datos disponibles</div>
                </div>
            </div>
        );
    }

    const { posts, metadata } = apiData;

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
                            onChange={(e) => handleSortChange(e.target.value as 'reports' | 'date')}
                            className="bg-white border border-gray-300 rounded-xl px-3 py-1 text-sm text-gray-800"
                            disabled={loading}
                        >
                            <option value="reports">Reportes</option>
                            <option value="date">Fecha</option>
                        </select>
                    </div>

                    <button
                        onClick={handleReload}
                        disabled={loading}
                        className="ml-2 p-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-xl flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Recargar"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="mb-4 text-sm text-gray-500">
                Mostrando {posts.length} de {metadata.totalReportedPosts} publicaciones reportadas
                <span className="ml-4 text-xs">
                    (Total en sistema: {metadata.totalPosts})
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} onClick={handlePostClick} />
                ))}
            </div>

            {posts.length === 0 && !loading && (
                <div className="text-center py-10 text-gray-500">
                    No hay publicaciones reportadas activas.
                </div>
            )}

            {metadata.totalPages > 1 && (
                <Pagination
                    currentPage={metadata.currentPage}
                    totalPages={metadata.totalPages}
                    onPageChange={handlePageChange}
                />
            )}

            <Modal isOpen={isModalOpen} onClose={handleModalClose} />
        </div>
    );
}