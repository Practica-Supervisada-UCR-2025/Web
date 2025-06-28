'use client';
import { useEffect, useState, Suspense } from 'react';
import StatCard from '../../components/statCard';
import Link from 'next/link';
import { PostsChart, ReportsChart, UsersChart } from '../../components/charts';
import { mockUsers } from './mockUsers';
import { useSearchParams } from 'next/navigation';

interface User {
  id?: string;
  name: string;
  email: string;
  type: string;
  status: string;
  suspensionDays: number;
}

function UsersContent() {
  const searchParams = useSearchParams();
  const [dashboardStats, setDashboardStats] = useState([
    {
      title: 'Usuarios',
      value: mockUsers.length,
      change: 12,
      route: '/users'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

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

  const filteredUsers = mockUsers.filter((user: User) => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.id && user.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

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
            className="block w-full pl-10 pr-3 py-2 text-gray-600 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#1b87b9] focus:border-[#1b87b9] sm:text-sm shadow-md"
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Link href="/users/register" className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto border border-[#249dd8]/10 text-[#249dd8] font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-[#249dd8]/20 transition shadow-lg flex items-center justify-center gap-2">
              <div className="bg-[#1b87b9] rounded-xl p-1">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg>
              </div>
              Registrar nuevo usuario
            </button>
          </Link>
          <Link href="/users/suspend" className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto border border-[#249dd8]/10 text-[#249dd8] font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-[#249dd8]/20 transition shadow-lg flex items-center justify-center gap-2">
              <div className="bg-[#1b87b9] rounded-xl p-1">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg>
              </div>
              Suspender usuario
            </button>
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full bg-white shadow-md">
            <thead className="bg-[#249dd8]/10">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>          
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.map((user: User, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="text-[#1b87b9] px-4 sm:px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="text-gray-900 px-4 sm:px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="text-gray-900 px-4 sm:px-6 py-4 whitespace-nowrap">{user.type}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-xl ${
                      user.status === 'Activo' 
                        ? 'bg-[#609000]/20 text-[#609000]'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${
              currentPage === 1
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
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 rounded-lg ${
                currentPage === index + 1
                  ? 'bg-[#249dd8] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#249dd8] text-white hover:bg-[#1b87b9]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
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