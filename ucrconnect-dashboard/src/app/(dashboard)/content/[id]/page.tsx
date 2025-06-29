'use client';
import { useState, useEffect, JSX } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { mockApiResponse } from '../../../../../public/data/contentData';
import Link from 'next/link';

// Type definitions
interface Comment {
    id: string;
    user_id: string;
    username: string;
    email: string;
    content: string;
    created_at: string;
    updated_at: string;
}

interface Post {
    id: string;
    user_id: string;
    content: string;
    file_url: string | null;
    file_size: number | null;
    media_type: number; // 0 = text, 1 = image, 2 = gif
    is_active: boolean;
    is_edited: boolean;
    status?: number;
    created_at: string;
    updated_at: string;
    username: string;
    email: string;
    active_reports: string;
    total_reports: string;
    comments?: Comment[];
    comments_metadata?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
    };
}

interface ApiResponse {
    message: string;
    post: Post;
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

// Helper function to normalize post data
const normalizePostData = (postData: any): Post => {
    return {
        ...postData,
        // Assume active by default if is_active is not provided or if status indicates active
        is_active: postData.is_active ?? (postData.status !== 0),
        // Set default status based on is_active if not provided
        status: postData.status ?? (postData.is_active !== false ? 1 : 0)
    };
};

export default function PostDetail(): JSX.Element {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHideConfirmModal, setShowHideConfirmModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [showSuspensionDuration, setShowSuspensionDuration] = useState(false);
    const [suspensionReason, setSuspensionReason] = useState('');
    const [suspensionTime, setSuspensionTime] = useState('1');
    const [showConfirmClearReports, setShowConfirmClearReports] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [totalComments, setTotalComments] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [hideButtons, setHideButtons] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    const router = useRouter();
    const params = useParams();
    const postId = params.id as string;

    // Fetch post data by ID
    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch all comments at once by using a large pageSize
                const response = await fetch(`/api/posts/${postId}?page=1&pageSize=100`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Publicaci\u00f3n no encontrada');
                        return;
                    }
                    if (response.status === 401) {
                        setError('No autorizado para ver esta publicaci\u00f3n');
                        return;
                    }
                    throw new Error(`Código de error: ${response.status}. Reintentar posteriormente.`);
                }

                const data: ApiResponse = await response.json();

                // Handle different response structures from your backend
                if (data.post) {
                    const normalizedPost = normalizePostData(data.post);
                    setPost(normalizedPost);
                    
                    // Set comments from the post data
                    if (data.post.comments) {
                        // Store all comments but only show the first 5
                        const allComments = data.post.comments;
                        // Get unique comments by ID
                        const uniqueComments = Array.from(new Map(allComments.map(c => [c.id, c])).values());
                        setComments(uniqueComments.slice(0, 5));
                        
                        // Set pagination metadata
                        if (data.post.comments_metadata) {
                            // Use the actual number of unique comments
                            setTotalComments(uniqueComments.length);
                            setCurrentPage(1);
                            // Show "Load More" if we have more than 5 unique comments
                            setHasMore(uniqueComments.length > 5);
                        }
                    }
                } else if (data.message === 'Success' && (data as any).data) {
                    // Handle case where backend returns data in a different structure
                    const normalizedPost = normalizePostData((data as any).data);
                    setPost(normalizedPost);
                } else {
                    setError('Estructura de respuesta inesperada');
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar la publicaci\u00f3n');
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);

    // Function to load more comments
    const loadMoreComments = async () => {
        if (!post || loadingMore) return;
        
        try {
            setLoadingMore(true);
            const nextPage = currentPage + 1;
            const commentsPerPage = 5;
            
            // Calculate how many comments to show
            const startIndex = 0;
            const endIndex = nextPage * commentsPerPage;
            
            // Get all comments from the post and ensure they're unique
            const allComments = Array.from(new Map((post.comments || []).map(c => [c.id, c])).values());
            
            // Show more comments
            setComments(allComments.slice(startIndex, endIndex));
            setCurrentPage(nextPage);
            
            // Check if we have more comments to show
            setHasMore(endIndex < allComments.length);
            
        } catch (err) {
            console.error('Error loading more comments:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar m\u00e1s comentarios');
        } finally {
            setLoadingMore(false);
        }
    };

    // Handle delete post (soft delete)
    const handleDeletePost = async (): Promise<void> => {
        if (!post) return;
        setActionLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/reported/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: post.id,
                    authorUsername: post.username,
                    moderatorUsername: 'admin' // TODO
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('No tienes permisos para realizar esta acci\u00f3n');
                } else if (response.status === 400) {
                    throw new Error('Error de validaci\u00f3n');
                } else {
                    throw new Error(result.message || 'Error al ocultar la publicaci\u00f3n');
                }
            }
            // Update local state
            setPost({ ...post, is_active: false, status: 0 });
            setSuccessMessage('Publicaci\u00f3n ocultada exitosamente');
            setHideButtons(true);
            // Redirect after success
            setTimeout(() => {
                router.push('/content');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al ocultar la publicaci\u00f3n');
        } finally {
            setActionLoading(false);
        }
    };
    // Handle restore post
    const handleRestorePost = async (): Promise<void> => {
        if (!post) return;
        setActionLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/reported/restore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: post.id,
                    authorUsername: post.username,
                    moderatorUsername: 'admin' // TODO
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('No tienes permisos para realizar esta acci\u00f3n');
                } else if (response.status === 400) {
                    throw new Error('Error de validaci\u00f3n');
                } else {
                    throw new Error(result.message || 'Error al restaurar la publicaci\u00f3n');
                }
            }
            // Update local state
            setPost({ ...post, is_active: true, status: 1 });
            setSuccessMessage('Publicaci\u00f3n restaurada exitosamente');
            setHideButtons(true);
            // Redirect after success
            setTimeout(() => {
                router.push('/content');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al restaurar la publicaci\u00f3n');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle moderation actions
    const handleModerationAction = async (action: string, suspensionDays?: number): Promise<void> => {
        if (!post) return;

        setActionLoading(true);
        try {
            const requestBody: any = { action };
            if (suspensionDays) {
                requestBody.suspensionDays = suspensionDays;
            }

            const response = await fetch(`/api/posts/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al procesar la acci\u00f3n');
            }

            const result = await response.json();

            // Update local state based on action
            switch (action) {
                case 'clear_reports':
                    setPost({ ...post, active_reports: '0' });
                    setSuccessMessage('Reportes eliminados exitosamente');
                    setHideButtons(true);
                    break;
                case 'suspend_user':
                    setPost({ ...post, is_active: false, status: 0 });
                    setSuccessMessage(`Usuario suspendido por ${suspensionDays} d\u00edas exitosamente`);
                    setHideButtons(true);
                    break;
            }

            // Show success message and redirect
            setTimeout(() => {
                router.push('/content');
            }, 1000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al procesar la acci\u00f3n');
        } finally {
            setActionLoading(false);
        }
    };
    // Handle hide post
    const handleHidePost = async (suspensionDays?: number): Promise<void> => {
        if (suspensionDays) {
            // Show "not implemented" message for user suspension
            setSuccessMessage('Funcionalidad de suspensi\u00f3n de usuario no implementada a\u00fan');
            setHideButtons(true);
            setTimeout(() => {
                router.push('/content');
            }, 2000);
        } else {
            await handleDeletePost();
        }
    };
    // Handle clear reports
    const handleClearReports = async (): Promise<void> => {
        await handleModerationAction('clear_reports');
    };
    // Clear messages after timeout
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);
    // Loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="flex justify-center items-center py-20">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-xl h-6 w-6 border-b-2 border-[#249dd8]"></div>
                        <span className="text-gray-500">Cargando publicaci&oacute;n...</span>
                    </div>
                </div>
            </div>
        );
    }
    // Error state
    if (error && !post) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="text-center py-20">
                    <div className="text-red-500 mb-4">{error || 'Publicaci\u00f3n no encontrada'}</div>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-xl"
                        >
                            Reintentar
                        </button>
                        <button
                            onClick={() => router.push('/content')}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl"
                        >
                            Volver al panel
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    if (!post) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <div className="h-5 w-5 bg-gray-300 rounded mr-2 animate-pulse"></div>
                        <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                    <div className="h-8 w-48 bg-gray-300 rounded animate-pulse"></div>
                    <div></div>
                </div>

                {/* Main Content Skeleton */}
                <div className="bg-gray-20 rounded-lg shadow-lg p-6">
                    {/* User Info and Reports Skeleton */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="h-6 w-32 bg-gray-300 rounded animate-pulse mb-2"></div>
                            <div className="h-4 w-48 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                        <div className="text-right">
                            <div className="h-8 w-32 bg-gray-300 rounded-lg animate-pulse mb-2"></div>
                            <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="mb-6">
                        <div className="h-6 w-20 bg-gray-300 rounded animate-pulse mb-3"></div>
                        <div className="bg-gray-100 rounded-lg p-4">
                            <div className="space-y-2 mb-4">
                                <div className="h-4 w-full bg-gray-300 rounded animate-pulse"></div>
                                <div className="h-4 w-4/5 bg-gray-300 rounded animate-pulse"></div>
                                <div className="h-4 w-3/4 bg-gray-300 rounded animate-pulse"></div>
                            </div>
                            {/* Image placeholder */}
                            <div className="h-48 w-full bg-gray-300 rounded-lg animate-pulse"></div>
                        </div>
                    </div>

                    {/* Metadata Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <div className="h-6 w-24 bg-gray-300 rounded animate-pulse mb-3"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-40 bg-gray-300 rounded animate-pulse"></div>
                                <div className="h-4 w-36 bg-gray-300 rounded animate-pulse"></div>
                                <div className="flex items-center">
                                    <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
                                    <div className="h-6 w-16 bg-gray-300 rounded-full ml-2 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comments Section Skeleton */}
                    <div className="mt-8 border-t pt-6">
                        <div className="h-6 w-24 bg-gray-300 rounded animate-pulse mb-4"></div>
                        <div className="space-y-4">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                                        <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-full bg-gray-300 rounded animate-pulse"></div>
                                        <div className="h-4 w-3/4 bg-gray-300 rounded animate-pulse"></div>
                                    </div>
                                    <div className="h-3 w-32 bg-gray-300 rounded animate-pulse mt-2"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons Skeleton */}
                    <div className="flex flex-wrap gap-4 pt-6 border-t">
                        <div className="h-12 w-40 bg-gray-300 rounded-xl animate-pulse"></div>
                        <div className="h-12 w-36 bg-gray-300 rounded-xl animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Detalles de la Publicaci&oacute;n</h1>
                <div></div>
            </div>

            {/* Success message */}
            {successMessage && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {successMessage}
                    </div>
                </div>
            )}
            {/* Loading message */}
            {actionLoading && (
                <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-xl">
                    <div className="flex items-center">
                        <div className="animate-spin rounded-xl h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                        Procesando acci&oacute;n...
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                    {error}
                </div>
            )}

            {/* Main Content */}
            <div className="bg-gray-20 rounded-lg shadow-lg p-6">
                {/* User Info and Reports */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <Link href={`/users?search=${encodeURIComponent(post.username)}&email=${encodeURIComponent(post.email)}`}>
                            <h2 className="text-xl font-semibold text-[#249dd8] hover:text-[#1b87b9] cursor-pointer">{post.username}</h2>
                        </Link>
                        <p className="text-gray-600">{post.email}</p>
                    </div>
                    <div className="text-right">
                        <span className="inline-block bg-red-100 text-red-800 text-sm font-semibold px-3 py-2 rounded-lg mb-2">
                            {post.active_reports} reportes activos
                        </span>
                        <p className="text-sm text-gray-600">
                            {post.total_reports} reportes en total
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#249dd8] mb-3">Contenido</h3>
                    <div className="bg-gray-100 rounded-lg p-4">
                        <p className="text-gray-700 mb-4">{post.content}</p>

                        {post.media_type !== 0 && post.file_url && (
                            <div className="mt-4">
                                <img
                                    src={post.file_url}
                                    alt={`Contenido de ${post.username}`}
                                    className="w-full h-auto max-h-96 object-contain rounded-lg"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-[#249dd8]">Informaci&oacute;n</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-medium">Creado:</span> {formatDate(post.created_at)}</p>
                            <p><span className="font-medium">Actualizado:</span> {formatDate(post.updated_at)}</p>
                            <p>
                                <span className="font-medium">Estado:</span>
                                <span className={`ml-2 px-2 py-1 rounded-xl text-xs font-medium ${post.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {post.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sección de Comentarios */}
                <div className="mt-8 border-t pt-6">
                    <h3 className="text-lg font-bold text-[#249dd8] mb-4">Comentarios ({totalComments})</h3>
                    
                    {loading ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Cargando comentarios...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-red-500">{error}</p>
                        </div>
                    ) : comments.length > 0 ? (
                        <>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {comments.map((comment) => (
                                <div 
                                    key={comment.id} 
                                    className="bg-gray-50 p-4 rounded-lg"
                                    data-testid="comment-item"
                                    data-created-at={comment.created_at}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Link 
                                            href={`/users?search=${encodeURIComponent(comment.username)}${comment.email ? `&email=${encodeURIComponent(comment.email)}` : ''}`}
                                            className="font-semibold text-[#249dd8] hover:underline"
                                            data-testid="user-profile-link"
                                        >
                                            {comment.username}
                                        </Link>
                                        <span className="text-gray-500 text-sm">
                                            {comment.email}
                                        </span>
                                    </div>
                                    <p className="text-gray-700">{comment.content}</p>
                                    <div className="text-sm text-gray-500 mt-2">
                                        {new Date(comment.created_at).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                            {hasMore && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={loadMoreComments}
                                        disabled={loadingMore}
                                        className="px-4 py-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-xl disabled:bg-gray-400"
                                    >
                                        {loadingMore ? (
                                            <span className="flex items-center justify-center">
                                                <div className="animate-spin rounded-xl h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Cargando...
                                            </span>
                                        ) : (
                                            'Cargar m\u00e1s comentarios'
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">No hay comentarios para mostrar</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons*/}
                {!hideButtons && (
                    <div className="flex flex-wrap gap-4 pt-6 border-t">
                        {post.is_active ? (
                            // Buttons for active posts
                            <>
                                <button
                                    onClick={() => setShowHideConfirmModal(true)}
                                    disabled={actionLoading}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors"
                                >
                                    {actionLoading ? 'Procesando...' : 'Ocultar publicación'}
                                </button>
                                <button
                                    onClick={() => setShowConfirmClearReports(true)}
                                    disabled={actionLoading || parseInt(post.active_reports) === 0}
                                    className="px-6 py-3 bg-[#249dd8] hover:bg-[#1b87b9] disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors"
                                >
                                    {actionLoading ? 'Procesando...' : 'Eliminar reportes'}
                                </button>
                            </>
                        ) : (
                            // Buttons for inactive posts
                                <>
                                    <button
                                        onClick={() => setShowConfirmClearReports(true)}
                                        disabled={actionLoading}
                                        className="px-6 py-3 bg-[#249dd8] hover:bg-[#1b87b9] disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors"
                                    >
                                        {actionLoading ? 'Procesando...' : 'Restaurar publicación'}
                                    </button>
                                </>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showHideConfirmModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h3 className="text-xl font-semibold mb-4 text-center mb-4 text-gray-800">&iquest;Deseas ocultar publicaci&oacute;n?</h3>
                        <p className="text-gray-600 mb-4 text-center ">Esta acci&oacute;n esconder&aacute; la publicaci&oacute;n de la vista p&uacute;blica.</p>
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                onClick={() => setShowHideConfirmModal(false)}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
                                disabled={actionLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    setShowHideConfirmModal(false);
                                    setShowSuspendModal(true);
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                                disabled={actionLoading}
                            >
                                Ocultar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSuspendModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h3 className="text-xl font-semibold mb-4 text-center mb-4 text-gray-800">&iquest;Tambi&eacute;n deseas suspender al usuario?</h3>
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                onClick={() => setShowSuspendModal(false)}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
                                disabled={actionLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuspendModal(false);
                                    handleHidePost();
                                }}
                                className="px-4 py-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-xl"
                                disabled={actionLoading}
                            >
                                Solo ocultar
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuspendModal(false);
                                    setShowSuspensionDuration(true);
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                                disabled={actionLoading}
                            >
                                Suspender
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showSuspensionDuration && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm shadow-xl" role="dialog" aria-labelledby="suspend-modal-title">
                        <h2 id="suspend-modal-title" className="text-xl font-semibold mb-4 text-center mb-4 text-gray-800">
                            Está a punto de suspender al siguiente usuario: {post.username}
                        </h2>
                        <p className="text-gray-600 mb-4 text-center">Por favor, elija el tiempo de suspensión:</p>

                        <select
                            className="w-full p-2 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-1 focus:ring-[#1b87b9] focus:border-[#1b87b9] text-gray-900"
                            value={suspensionTime}
                            onChange={(e) => setSuspensionTime(e.target.value)}
                        >
                            <option value="1" className="text-gray-500">1 día</option>
                            <option value="3" className="text-gray-500">3 días</option>
                            <option value="7" className="text-gray-500">7 días</option>
                        </select>

                        <textarea
                            className="w-full p-2 border border-gray-300 rounded-xl mb-6 focus:outline-none focus:ring-1 focus:ring-[#1b87b9] focus:border-[#1b87b9] text-gray-500 resize-none"
                            placeholder="Motivo de la suspensión..."
                            rows={3}
                            value={suspensionReason}
                            onChange={(e) => setSuspensionReason(e.target.value)}
                        />

                        <div className="flex justify-center gap-4">
                            <button
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
                                onClick={() => {
                                    setShowSuspensionDuration(false);
                                    setSuspensionReason('');
                                }}
                                disabled={actionLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                                onClick={() => {
                                    setShowSuspensionDuration(false);
                                    handleHidePost(parseInt(suspensionTime));
                                }}
                                disabled={actionLoading}
                            >
                                Suspender
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showConfirmClearReports && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h3 className="text-xl font-semibold mb-4 text-center mb-4 text-gray-800">
                            {post.is_active ? 'Confirmar eliminaci\u00f3n de reportes' : 'Confirmar restauraci\u00f3n de publicaci\u00f3n'}
                        </h3>
                        <p className="text-gray-600 mb-4 text-center">
                            {post.is_active
                                ? '\u00bfEst\u00e1s seguro de que deseas eliminar todos los reportes activos de esta publicaci\u00f3n?'
                                : '\u00bfEst\u00e1s seguro de que deseas restaurar esta publicaci\u00f3n?'
                            }
                        </p>
                            <div className="flex justify-center gap-4 mt-6">
                            <button
                                onClick={() => setShowConfirmClearReports(false)}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
                                disabled={actionLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmClearReports(false);
                                    handleRestorePost();
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                                disabled={actionLoading}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}