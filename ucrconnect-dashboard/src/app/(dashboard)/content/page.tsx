'use client';
import { useState, useEffect } from 'react';
import { mockPosts as initialMockPosts } from './mockData';

// Helper function to format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Post card component
const PostCard = ({ post, onClick }) => {
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
                        {post.activeReports} reportes activos
                    </span>
                </div>
            </div>

            <div className="my-3 flex-grow">
                <p className="text-gray-700 mb-2">{post.content}</p>
                {post.contentType !== 'text' && (
                    <div className="mt-2 rounded-md overflow-hidden">
                        <img
                            src={post.imageUrl}
                            alt={`Contenido de ${post.username}`}
                            className="w-full h-auto max-h-48 object-cover"
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
                <span>Creado: {formatDate(post.createdAt)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {post.active ? 'Activo' : 'Inactivo'}
                </span>
            </div>
        </div>
    );
};

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
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

// Modal component for post details
const PostModal = ({ post, onClose, onHidePost, onClearReports }) => {
    const [showHideConfirmModal, setShowHideConfirmModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [showSuspensionDuration, setShowSuspensionDuration] = useState(false);
    const [showConfirmClearReports, setShowConfirmClearReports] = useState(false);

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-3xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold mb-4 text-gray-800">Detalles de la publicaci&oacute;n</h2>

                <div className="mb-6">
                    <div className="flex justify-between mb-2">
                        <div>
                            <h3 className="font-medium text-gray-800">{post.username}</h3>
                            <p className="text-sm text-gray-500">{post.email}</p>
                        </div>
                        <div>
                            <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                                {post.activeReports} reportes activos
                            </span>
                            <p className="text-xs text-gray-500 mt-1 text-right">
                                {post.totalReports} reportes en total
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-700 my-4">{post.content}</p>

                    {post.contentType !== 'text' && (
                        <div className="mt-2 rounded-md overflow-hidden">
                            <img
                                src={post.imageUrl}
                                alt={`Contenido de ${post.username}`}
                                className="w-full h-auto max-h-80 object-contain"
                            />
                        </div>
                    )}

                    <div className="mt-4 text-sm text-gray-500">
                        <p>Creado: {formatDate(post.createdAt)}</p>
                        <p className="mt-1">
                            Estado:
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${post.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {post.active ? 'Activo' : 'Inactivo'}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex space-x-4 mt-6">
                    <button
                        onClick={() => setShowHideConfirmModal(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
                    >
                        Ocultar publicaci&oacute;n
                    </button>
                    <button
                        onClick={() => setShowConfirmClearReports(true)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
                    >
                        Eliminar reportes
                    </button>
                </div>
            </div>

            {showHideConfirmModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
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
                                Ocultar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSuspendModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
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
                                    onHidePost();
                                }}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
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
                <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Selecciona la duraci&oacute;n de la suspensi&oacute;n</h3>
                        <div className="flex flex-col space-y-3 mt-6">
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => {
                                        setShowSuspensionDuration(false);
                                        onHidePost();
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                >
                                    1 d&iacute;a
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSuspensionDuration(false);
                                        onHidePost();
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                >
                                    3 d&iacute;as
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSuspensionDuration(false);
                                        onHidePost();
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
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
                <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
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
                                    onClearReports();
                                }}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function Content() {
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPost, setSelectedPost] = useState(null);
    const [sortBy, setSortBy] = useState('reports'); // 'reports' or 'date'
    const postsPerPage = 8;

    // Initialize posts from mock data
    useEffect(() => {
        setPosts([...initialMockPosts]);
    }, []);

    // Filter posts: active AND with reports > 0
    const filteredPosts = posts.filter(post => post.active && post.activeReports > 0).sort((a, b) => {
        if (sortBy === 'reports') {
            return b.activeReports - a.activeReports;
        } else { // sortBy === 'date'
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    // Calculate total pages
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    // Get current posts
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

    // Change page
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Handle reload
    const handleReload = () => {
        // In a real app, this would fetch fresh data from the endpoint
        // Mocket for now
        setPosts([...initialMockPosts]);
        setCurrentPage(1);
    };

    // Handle post click
    const handlePostClick = (post) => {
        setSelectedPost(post);
    };

    // Handle hide post
    const handleHidePost = () => {
        setPosts(posts.map(post =>
            post.id === selectedPost.id ? { ...post, active: false } : post
        ));
        setSelectedPost(null);

        // Check if current page is empty after this action and go to previous page if needed
        const remainingPosts = filteredPosts.filter(post => post.id !== selectedPost.id);
        const remainingPages = Math.ceil(remainingPosts.length / postsPerPage);
        if (currentPage > 1 && currentPage > remainingPages) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Handle clear reports
    const handleClearReports = () => {
        setPosts(posts.map(post =>
            post.id === selectedPost.id ? { ...post, activeReports: 0 } : post
        ));
        setSelectedPost(null);

        // Check if current page is empty after this action and go to previous page if needed
        const remainingPosts = filteredPosts.filter(post => post.id !== selectedPost.id);
        const remainingPages = Math.ceil(remainingPosts.length / postsPerPage);
        if (currentPage > 1 && currentPage > remainingPages) {
            setCurrentPage(currentPage - 1);
        }
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
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-800"
                        >
                            <option value="reports">Reportes</option>
                            <option value="date">Fecha</option>
                        </select>
                    </div>

                    <button
                        onClick={handleReload}
                        className="ml-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
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

            {selectedPost && (
                <PostModal
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                    onHidePost={handleHidePost}
                    onClearReports={handleClearReports}
                />
            )}
        </div>
    );
}