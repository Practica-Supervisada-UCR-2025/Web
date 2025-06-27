'use client';
import { useEffect, useState, Suspense } from 'react';
import StatCard from '../../components/statCard';
import Link from 'next/link';
import { PostsChart, ReportsChart, UsersChart } from '../../components/charts';
import { useSearchParams } from 'next/navigation';

interface User {
  id: string;
  email: string;
  full_name: string;
  username: string;
  profile_picture: string;
  is_active: boolean;
  created_at: string;
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

function UsersContent() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const [lastTime, setLastTime] = useState<string | null>(null);
  const [remainingItems, setRemainingItems] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [dashboardStats, setDashboardStats] = useState([
    {
      title: 'Usuarios',
      value: 0,
      change: 12,
      route: '/users'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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

  // Set initial search query from URL parameters
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const searchParam = searchParams.get('search');
    
    // Prioritize email search when coming from a post
    if (emailParam) {
      setSearchQuery(emailParam);
    } else if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Fetch users from API
  const fetchUsers = async (createdAfter?: string, limit: number = 50) => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/users/get/all';
      const params = new URLSearchParams();

      // Always use pagination parameters for the API call
      if (createdAfter && limit) {
        params.append('created_after', createdAfter);
        params.append('limit', limit.toString());
      } else {
        // Initial load - get first page
        const initialDate = new Date(0).toISOString(); // Start from beginning
        params.append('created_after', initialDate);
        params.append('limit', '50');
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UsersResponse = await response.json();
      
      // Always append users for pagination, search filtering happens client-side
      if (createdAfter) {
        // Append new users, avoiding duplicates
        setUsers(prev => {
          const existingIds = new Set(prev.map(user => user.id));
          const newUsers = data.data.filter(user => !existingIds.has(user.id));
          return [...prev, ...newUsers];
        });
      } else {
        // Initial load - replace all users
        setUsers(data.data);
      }
      setHasMoreUsers(data.metadata.remainingItems > 0);
      setLastTime(data.metadata.last_time);
      setRemainingItems(data.metadata.remainingItems);

      // Update total count for stats
      const totalCount = data.data.length + data.metadata.remainingItems;
      setTotalUsers(totalCount);
      setDashboardStats(prev => prev.map(stat => 
        stat.title === 'Usuarios' ? { ...stat, value: totalCount } : stat
      ));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load ALL users upfront
  const loadAllUsers = async () => {
    // Don't load users if not authenticated
    if (!isAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUsers([]);
      setHasMoreUsers(true);
      setLastTime(null);
      setRemainingItems(0);

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
          // Redirect to login if unauthorized
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
        setRemainingItems(data.metadata.remainingItems);
      }

      // Set all users at once
      setUsers(allUsers);
      setHasMoreUsers(false);
      setLastTime(null);
      setRemainingItems(0);

      // Update total count for stats
      setTotalUsers(allUsers.length);
      setDashboardStats(prev => prev.map(stat => 
        stat.title === 'Usuarios' ? { ...stat, value: allUsers.length } : stat
      ));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all users');
      console.error('Error fetching all users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load initial users only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllUsers();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setCurrentPage(1);
    }
  }, [searchQuery]);

  const filteredUsers = users.filter((user: User) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      user.full_name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    );
  });

  // Calculate pagination for current page display
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Calculate total pages - now based on filtered results
  const totalAvailablePages = totalPages;

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7; // Show max 7 page numbers
    
    if (totalAvailablePages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalAvailablePages; i++) {
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
        pages.push(totalAvailablePages);
      } else if (currentPage >= totalAvailablePages - 3) {
        // Show first page + ellipsis + last 5 pages
        pages.push(1);
        pages.push('...');
        for (let i = totalAvailablePages - 4; i <= totalAvailablePages; i++) {
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
        pages.push(totalAvailablePages);
      }
    }
    
    return pages;
  };

  if (loading && users.length === 0) {
    return (
      <div className="w-full max-w-[95vw] mx-auto px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[95vw] mx-auto px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="w-full max-w-[95vw] mx-auto px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect to login)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full max-w-[95vw] mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {dashboardStats.map(({ title, value, change, route }, index) => {
          const isUsuarios = title === 'Usuarios';
          const customBgStyle = isUsuarios
            ? 'bg-gradient-to-tr from-[#249DD8] to-[#41ADE7BF] text-white'
            : undefined;

          return (
            <div
              key={title + index}
              className="transition-transform transform hover:scale-104 cursor-pointer"
            >
              <Link href={route || '#'} passHref>
                <StatCard title={title} value={value} change={change} route={route} bgStyle={customBgStyle} />
              </Link>
            </div>
          );
        })}
      </div>

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
            placeholder="Buscar usuarios por email, nombre o username..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Link href="/users/register" className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto border border-[#204C6F]/10 text-[#204C6F] font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-[#204C6F]/20 transition shadow-lg flex items-center justify-center gap-2">
              <div className="bg-[#2980B9] rounded-full p-1">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg>
              </div>
              Registrar nuevo usuario
            </button>
          </Link>
          <Link href="/users/suspend" className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto border border-[#204C6F]/10 text-[#204C6F] font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-[#204C6F]/20 transition shadow-lg flex items-center justify-center gap-2">
              <div className="bg-[#2980B9] rounded-full p-1">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg>
              </div>
              Suspender usuario
            </button>
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full bg-white shadow-md">
            <thead className="bg-[#204C6F]/10">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>          
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.length > 0 ? (
                currentUsers.map((user: User, index: number) => (
                  <tr key={`${user.id}-${startIndex + index}`} className="hover:bg-gray-50">
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 sm:px-6 py-8 text-center text-gray-500">
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

        {/* Pagination - only show if there are users and multiple pages */}
        {users.length > 0 && totalAvailablePages > 1 && (
          <>
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#204C6F] text-white hover:bg-[#2980B9]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>

              {getPageNumbers().map((page, index) => (
            <button
              key={index}
                  onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
                  disabled={page === '...'}
              className={`px-3 py-1 rounded-lg ${
                    page === '...'
                      ? 'bg-transparent text-gray-400 cursor-default'
                      : currentPage === page
                  ? 'bg-[#204C6F] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
                  {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalAvailablePages}
            className={`p-2 rounded-lg ${
                  currentPage === totalAvailablePages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#204C6F] text-white hover:bg-[#2980B9]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>

            {/* Show loading indicator only during initial load */}
            {loading && (
              <div className="flex justify-center mt-4">
                <div className="text-sm text-gray-600">Loading all users...</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Users() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UsersContent />
    </Suspense>
  );
}