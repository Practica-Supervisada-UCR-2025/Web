'use client';
import { useEffect, useState, Suspense } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
  username: string;
  profile_picture: string;
  is_active: boolean;
  created_at: string;
  suspensionDays?: number; // Optional field for suspension tracking
}

interface UsersResponse {
  message: string;
  data: User[];
  metadata: {
    last_time: string;
    remainingItems: number;
    remainingPages: number;
  };
}

function SuspendUserContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [suspensionTime, setSuspensionTime] = useState('1');
  const [suspensionDescription, setSuspensionDescription] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [suspending, setSuspending] = useState(false);
  const usersPerPage = 6;

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/profile', {
          credentials: 'include',
        });
        
        if (response.status === 401) {
          setIsAuthenticated(false);
          window.location.href = '/login';
          return;
        }
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        window.location.href = '/login';
      }
    };

    checkAuth();
  }, []);

  // Fetch users from API
  const fetchUsers = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      setUsers([]);

      let allUsers: User[] = [];
      let hasMore = true;
      let lastTime = new Date(0).toISOString();

      // Keep fetching until we have all users
      while (hasMore) {
        const url = `/api/users/get/all?created_after=${encodeURIComponent(lastTime)}&limit=50`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: UsersResponse = await response.json();
        
        // Add new users to our collection
        allUsers = [...allUsers, ...data.data];
        
        // Update pagination state
        hasMore = data.metadata.remainingItems > 0;
        lastTime = data.metadata.last_time;
      }

      // Set all users at once
      setUsers(allUsers);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load users when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7; // Show max 7 page numbers
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 4) {
        // Show first 5 pages + ellipsis + last page
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show first page + ellipsis + last 5 pages
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handleSuspendUser = async () => {
    if (selectedUser) {
      try {
        setSuspending(true);
        
        const response = await fetch('/api/users/suspend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            user_id: selectedUser.id,
            days: parseInt(suspensionTime),
            description: suspensionDescription.trim() || undefined
          }),
        });

        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.message || 'Failed to suspend user';
          
          // Handle specific error cases
          if (errorData.message === 'User is already suspended') {
            toast.error('Este usuario ya está suspendido');
          } else if (errorData.message === 'User not found') {
            toast.error('Usuario no encontrado');
          } else if (errorData.message === 'Validation error') {
            toast.error(errorData.details || 'Error de validación');
          } else {
            toast.error(errorMessage);
          }
          return;
        }

        const data = await response.json();
        
        // Update local state to reflect the suspension
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, is_active: false, suspensionDays: parseInt(suspensionTime) }
            : user
        ));
        
        setShowModal(false);
        setSuspensionDescription(''); // Reset description
        toast.success(`Usuario ${selectedUser.full_name} suspendido por ${suspensionTime} ${parseInt(suspensionTime) === 1 ? 'día' : 'días'}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error al suspender usuario');
      } finally {
        setSuspending(false);
      }
    }
  };

  const handleActivateUser = () => {
    if (selectedUser) {
      try {
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, is_active: true, suspensionDays: 0 }
            : user
        ));
        setShowActivateModal(false);
        toast.success(`Usuario ${selectedUser.full_name} activado exitosamente`);
      } catch (error) {
        toast.error('Error al activar usuario');
      }
    }
  };

  // Show loading state
  if (isAuthenticated === null || loading) {
    return (
      <div className="w-full max-w-[95vw] mx-auto px-4">
        <h1 className="text-2xl font-bold text-[#204C6F]">Suspender Usuarios</h1>
        <div className="mt-8 text-center">
          <div className="text-gray-600">Loading users...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full max-w-[95vw] mx-auto px-4">
        <h1 className="text-2xl font-bold text-[#204C6F]">Suspender Usuarios</h1>
        <div className="mt-8 text-center">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[95vw] mx-auto px-4">
      <h1 className="text-2xl font-bold text-[#249dd8]">Suspender Usuarios</h1>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative mt-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 text-gray-600 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#2980B9] focus:border-[#2980B9] sm:text-sm shadow-md"
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="mt-8">
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full bg-white shadow-md">
            <thead className="bg-[#249dd8]/10">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días de Suspensión</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr key={`${user.id}-${index}`} className="hover:bg-gray-50">
                    <td className="text-[#2980B9] px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                          {user.profile_picture ? (
                            <img
                              src={user.profile_picture}
                              alt={`${user.full_name} profile`}
                              className="w-full h-full object-cover block"
                              style={{ aspectRatio: '1/1', minWidth: '3rem', minHeight: '3rem', maxWidth: '3rem', maxHeight: '3rem' }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = 'data:image/svg+xml;utf8,<svg width=\"48\" height=\"48\" viewBox=\"0 0 48 48\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"24\" cy=\"24\" r=\"24\" fill=\"%239CA3AF\"/><path d=\"M24 24c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6zm0 3c-4 0-12 2-12 6v3h24v-3c0-4-8-6-12-6z\" fill=\"white\"/></svg>';
                              }}
                            />
                          ) : (
                            <img
                              src={'data:image/svg+xml;utf8,<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="24" fill="%239CA3AF"/><path d="M24 24c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6zm0 3c-4 0-12 2-12 6v3h24v-3c0-4-8-6-12-6z" fill="white"/></svg>'}
                              alt="placeholder"
                              className="w-full h-full object-cover block"
                              style={{ aspectRatio: '1/1', minWidth: '3rem', minHeight: '3rem', maxWidth: '3rem', maxHeight: '3rem' }}
                            />
                          )}
                        </div>
                        <span>{user.full_name}</span>
                      </div>
                    </td>
                    <td className="text-gray-900 px-4 sm:px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="text-gray-900 px-4 sm:px-6 py-4 whitespace-nowrap">{user.username}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-[#609000]/20 text-[#609000]'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-red-500">
                      {!user.is_active && user.suspensionDays ? `${user.suspensionDays} ${user.suspensionDays === 1 ? 'día' : 'días'}` : ''}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {user.is_active ? (
                        <span 
                          className="px-2 inline-flex text-xs leading-5 rounded-full border border-red-700 text-red-700 hover:bg-red-700 hover:text-white transition-all duration-300 cursor-pointer"
                          onClick={() => {
                            setSelectedUser(user);
                            setSuspensionDescription(''); // Reset description when opening modal
                            setShowModal(true);
                          }}
                        >
                          Suspender
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-gray-500">
                    {searchQuery.trim() ? (
                      `No se encontraron usuarios con "${searchQuery}" en email, nombre o username`
                    ) : (
                      'No hay usuarios disponibles'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            <button
              aria-label="previous"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-xl ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#249dd8] text-white hover:bg-[#1b87b9]'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
                disabled={page === '...'}
                className={`px-3 py-1 rounded-xl ${
                  page === '...'
                    ? 'bg-transparent text-gray-400 cursor-default'
                    : currentPage === page
                    ? 'bg-[#249dd8] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              aria-label="next"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-xl ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#249dd8] text-white hover:bg-[#1b87b9]'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}

        {showModal && (
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
              }
            }}
            data-testid="modal-overlay"
          >
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm shadow-xl" role="dialog" aria-labelledby="suspend-modal-title">
              <h2 id="suspend-modal-title" className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Está apunto de suspender al siguiente usuario: {selectedUser?.full_name}
              </h2>
              <p className="text-gray-600 mb-4 text-center">Por favor, elija el tiempo de suspensión:</p>
              
              <select 
                className="w-full p-2 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-1 focus:ring-[#2980B9] focus:border-[#2980B9] text-gray-500"
                value={suspensionTime}
                onChange={(e) => setSuspensionTime(e.target.value)}
              >
                <option value="1" className="text-gray-500">1 día</option>
                <option value="3" className="text-gray-500">3 días</option>
                <option value="7" className="text-gray-500">7 días</option>
              </select>

              <div className="mb-4">
                <label htmlFor="suspension-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Razón de la suspensión (opcional)
                </label>
                <textarea
                  id="suspension-description"
                  className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2980B9] focus:border-[#2980B9] text-gray-500 resize-none"
                  rows={3}
                  placeholder="Describa la razón de la suspensión..."
                  value={suspensionDescription}
                  onChange={(e) => setSuspensionDescription(e.target.value)}
                  maxLength={500}
                />
                <div className="text-xs text-gray-400 mt-1 text-right" data-testid="suspension-description-count">
                  {suspensionDescription.length}/500 caracteres
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button 
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowModal(false)}
                  disabled={suspending}
                >
                  Cancelar
                </button>
                <button 
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  onClick={handleSuspendUser}
                  disabled={suspending}
                >
                  {suspending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Suspendiéndo...
                    </>
                  ) : (
                    'Suspender'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {showActivateModal && (
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowActivateModal(false);
              }
            }}
            data-testid="modal-overlay"
          >
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm shadow-xl" role="dialog" aria-labelledby="activate-modal-title">
              <h2 id="activate-modal-title" className="text-xl font-semibold text-gray-800 mb-4 text-center">
                ¿Está seguro que quiere activar al usuario {selectedUser?.full_name}?
              </h2>

              <div className="flex justify-center gap-4 mt-6">
                <button 
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
                  onClick={() => setShowActivateModal(false)}
                >
                  Cancelar
                </button>
                <button 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                  onClick={handleActivateUser}
                > 
                  Activar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuspendUser() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuspendUserContent />
    </Suspense>
  );
}