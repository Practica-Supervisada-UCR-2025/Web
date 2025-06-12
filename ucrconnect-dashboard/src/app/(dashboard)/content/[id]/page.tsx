'use client';
import { useState, useEffect, JSX } from 'react';
import { useRouter, useParams } from 'next/navigation';

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

export default function PostDetail(): JSX.Element {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHideConfirmModal, setShowHideConfirmModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [showSuspensionDuration, setShowSuspensionDuration] = useState(false);
    const [showConfirmClearReports, setShowConfirmClearReports] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const router = useRouter();
    const params = useParams();
    const postId = params.id as string;

    // Fetch post data by ID
    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/posts/${postId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Publicaci&oacute;n no encontrada');
                        return;
                    }
                    if (response.status === 401) {
                        setError('No autorizado para ver esta publicaci&oacute;n');
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: ApiResponse = await response.json();

                // Handle different response structures from your backend
                if (data.post) {
                    setPost(data.post);
                } else if (data.message === 'Success' && (data as any).data) {
                    // Handle case where backend returns data in a different structure
                    setPost((data as any).data);
                } else {
                    setError('Estructura de respuesta inesperada');
                }

            } catch (err) {
                console.error('Error fetching post:', err);
                setError(err instanceof Error ? err.message : 'Error al cargar la publicaci&oacute;n');
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);

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
                throw new Error(errorData.message || 'Error al procesar la acci&oacute;n');
            }

            const result = await response.json();

            // Update local state based on action
            switch (action) {
                case 'hide':
                    setPost({ ...post, is_active: false, status: 0 });
                    break;
                case 'clear_reports':
                    setPost({ ...post, active_reports: '0' });
                    break;
                case 'suspend_user':
                    setPost({ ...post, is_active: false, status: 0 });
                    break;
            }

            // Show success message and redirect
            setTimeout(() => {
                router.push('/content');
            }, 1000);

        } catch (err) {
            console.error('Error processing moderation action:', err);
            setError(err instanceof Error ? err.message : 'Error al procesar la acci&oacute;n');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle hide post
    const handleHidePost = async (suspensionDays?: number): Promise<void> => {
        if (suspensionDays) {
            await handleModerationAction('suspend_user', suspensionDays);
        } else {
            await handleModerationAction('hide');
        }
    };

    // Handle clear reports
    const handleClearReports = async (): Promise<void> => {
        await handleModerationAction('clear_reports');
    };

    // Loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="flex justify-center items-center py-20">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#249dd8]"></div>
                        <span className="text-gray-500">Cargando publicaci&oacute;n...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !post) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="text-center py-20">
                    <div className="text-red-500 mb-4">{error || 'Publicaci&oacute;n no encontrada'}</div>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-md"
                        >
                            Reintentar
                        </button>
                        <button
                            onClick={() => router.push('/content')}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                        >
                            Volver al panel
                        </button>
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
            {actionLoading && (
                <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md">
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                        Procesando acci&oacute;n...
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && !loading && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {/* Main Content */}
            <div className="bg-gray-20 rounded-lg shadow-lg p-6">
                {/* User Info and Reports */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-[#249dd8]">{post.username}</h2>
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
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${post.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {post.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6 border-t">
                    <button
                        onClick={() => setShowHideConfirmModal(true)}
                        disabled={actionLoading || !post.is_active}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
                    >
                        {actionLoading ? 'Procesando...' : 'Ocultar publicaci\u00f3n'}
                    </button>

                    <button
                        onClick={() => setShowConfirmClearReports(true)}
                        disabled={actionLoading || parseInt(post.active_reports) === 0}
                        className="px-6 py-3 bg-[#249dd8] hover:bg-[#1b87b9] disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
                    >
                        {actionLoading ? 'Procesando...' : 'Eliminar reportes'}
                    </button>
                </div>
            </div>

            {/* Modals */}
            {showHideConfirmModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">&iquest;Deseas ocultar publicaci&oacute;n?</h3>
                        <p className="text-gray-600 mb-4">Esta acci&oacute;n esconder&aacute; la publicaci&oacute;n de la vista p&uacute;blica.</p>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={() => setShowHideConfirmModal(false)}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                                disabled={actionLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    setShowHideConfirmModal(false);
                                    setShowSuspendModal(true);
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                                disabled={actionLoading}
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSuspendModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">&iquest;Tambi&eacute;n deseas suspender al usuario?</h3>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={() => setShowSuspendModal(false)}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                                disabled={actionLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuspendModal(false);
                                    handleHidePost();
                                }}
                                className="px-4 py-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-md"
                                disabled={actionLoading}
                            >
                                Solo ocultar
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuspendModal(false);
                                    setShowSuspensionDuration(true);
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                                disabled={actionLoading}
                            >
                                Suspender
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSuspensionDuration && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Selecciona la duraci&oacute;n de la suspensi&oacute;n</h3>
                        <div className="flex flex-col space-y-3 mt-6">
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => {
                                        setShowSuspensionDuration(false);
                                        handleHidePost(1);
                                    }}
                                    className="px-4 py-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-md"
                                    disabled={actionLoading}
                                >
                                    1 d&iacute;a
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSuspensionDuration(false);
                                        handleHidePost(3);
                                    }}
                                    className="px-4 py-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-md"
                                    disabled={actionLoading}
                                >
                                    3 d&iacute;as
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSuspensionDuration(false);
                                        handleHidePost(7);
                                    }}
                                    className="px-4 py-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-md"
                                    disabled={actionLoading}
                                >
                                    7 d&iacute;as
                                </button>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setShowSuspensionDuration(false)}
                                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                                    disabled={actionLoading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmClearReports && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Confirmar eliminaci&oacute;n de reportes</h3>
                        <p className="text-gray-600 mb-4">&iquest;Est&aacute;s seguro de que deseas eliminar todos los reportes activos de esta publicaci&oacute;n?</p>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={() => setShowConfirmClearReports(false)}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                                disabled={actionLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmClearReports(false);
                                    handleClearReports();
                                }}
                                className="px-4 py-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-md"
                                disabled={actionLoading}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}