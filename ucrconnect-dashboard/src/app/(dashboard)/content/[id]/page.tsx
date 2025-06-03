'use client';
import { useState, useEffect, JSX } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { mockApiResponse } from '../../../../../public/data/contentData';

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

// Helper function to format file size
const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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
                // TODO: API call
                const foundPost = mockApiResponse.posts.find(p => p.id === postId);

                if (!foundPost) {
                    setError('Publicaci&oacute;n no encontrada');
                    return;
                }

                setPost(foundPost);
            } catch (err) {
                setError('Error al cargar la publicaci&oacute;n');
                console.error('Error fetching post:', err);
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);

    // Handle hide post
    const handleHidePost = async (suspensionDays?: number): Promise<void> => {
        if (!post) return;

        setActionLoading(true);
        try {
            // TODO: API call
            setPost({ ...post, is_active: false, status: 0 });

            // Redirect
            setTimeout(() => {
                router.push('/content');
            }, 10);
        } catch (err) {
            console.error('Error hiding post:', err);
        } finally {
            setActionLoading(false);
        }
    };

    // Handle clear reports
    const handleClearReports = async (): Promise<void> => {
        if (!post) return;

        setActionLoading(true);
        try {
            // TODO: API call
            setPost({ ...post, active_reports: '0' });

            // Redirect
            setTimeout(() => {
                router.push('/content');
            }, 10);
        } catch (err) {
            console.error('Error clearing reports:', err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="flex justify-center items-center py-20">
                    <div className="text-gray-500">Cargando publicaci&oacute;n...</div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="text-center py-20">
                    <div className="text-red-500 mb-4">{error || 'Publicaci&oacute;n no encontrada'}</div>
                    <button
                        onClick={() => router.push('/content')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                        Volver al panel
                    </button>
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

            {/* Main Content */}
            <div className="bg-gray-20 rounded-lg shadow-lg p-6">
                {/* User Info and Reports */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-[#249dd8]">{post.username}</h2>
                        <p className="text-gray-600">{post.email}</p>
                        <p className="text-sm text-gray-500 mt-1">ID: {post.id}</p>
                    </div>
                    <div className="text-right">
                        <span className="inline-block bg-red-100 text-red-800 text-sm font-semibold px-3 py-2 rounded-lg mb-2">
                            {post.active_reports} reportes activos
                        </span>
                        <p className="text-sm text-gray-600">
                            {post.total_reports} reportes en total
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Tipo: {getMediaTypeLabel(post.media_type)}
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
                                {post.file_size && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Tama&ntilde;o del archivo: {formatFileSize(post.file_size)}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-[#249dd8]">Informaci&oacute;n</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p ><span className="font-medium">Creado:</span> {formatDate(post.created_at)}</p>
                            <p><span className="font-medium">Actualizado:</span> {formatDate(post.updated_at)}</p>
                            <p>
                                <span className="font-medium">Estado:</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${post.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {post.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#249dd8] mb-3 ">Usuario</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-medium">ID Usuario:</span> {post.user_id}</p>
                            <p><span className="font-medium">Nombre:</span> {post.username}</p>
                            <p><span className="font-medium">Email:</span> {post.email}</p>
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
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    setShowHideConfirmModal(false);
                                    setShowSuspendModal(true);
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
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
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuspendModal(false);
                                    handleHidePost();
                                }}
                                className="px-4 py-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-md"
                            >
                                Solo ocultar
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuspendModal(false);
                                    setShowSuspensionDuration(true);
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
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
                                >
                                    1 d&iacute;a
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSuspensionDuration(false);
                                        handleHidePost(3);
                                    }}
                                    className="px-4 py-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-md"
                                >
                                    3 d&iacute;as
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSuspensionDuration(false);
                                        handleHidePost(7);
                                    }}
                                    className="px-4 py-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-md"
                                >
                                    7 d&iacute;as
                                </button>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setShowSuspensionDuration(false)}
                                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
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
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmClearReports(false);
                                    handleClearReports();
                                }}
                                className="px-4 py-2 bg-[#249dd8] hover:bg-[#1b87b9] text-white rounded-md"
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