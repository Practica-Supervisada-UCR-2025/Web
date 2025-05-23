'use client';
import { useEffect, useState } from 'react';
import StatCard from '../../components/statCard';
import Link from 'next/link';
import { PostsChart, ReportsChart, UsersChart } from '../../components/charts';

export default function Users() {
  const [dashboardStats, setDashboardStats] = useState([
    {
      title: 'Usuarios',
      value: 1234,
      change: 12,
      route: '/users'
    }
  ]);

  // TODO: cambiar a buscar usuarios reales 
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([
    {
      name: 'Juan Pérez',
      email: 'juan.perez@ucr.ac.cr',
      type: 'Estudiante',
      status: 'Activo'
    },
    {
      name: 'María Rodríguez',
      email: 'maria.rodriguez@ucr.ac.cr',
      type: 'Profesor',
      status: 'Activo'
    },
    {
      name: 'Carlos Méndez',
      email: 'carlos.mendez@ucr.ac.cr',
      type: 'Estudiante',
      status: 'Suspendido'
    }
  ]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
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

      <div className="flex items-center gap-4 relative mt-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <input
          type="text"
          className="block w-96 pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#2980B9] focus:border-[#2980B9] sm:text-sm shadow-md"
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Link href="/users/register" className="flex items-center gap-1">
          <button className="border border-[#204C6F]/10 text-[#204C6F] font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-[#204C6F]/20 transition shadow-lg flex items-center gap-2">
            <div className="bg-[#2980B9] rounded-full p-1">
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg>
            </div>
            Registrar nuevo usuario
          </button>
        </Link>
        <Link href="/users/suspend" className="flex items-center gap-1">
          <button className="border border-[#204C6F]/10 text-[#204C6F] font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-[#204C6F]/20 transition shadow-lg flex items-center gap-2">
            <div className="bg-[#2980B9] rounded-full p-1">
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg>
            </div>
            Suspender usuario
          </button>
        </Link>
      </div>

      <div className="mt-8">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl overflow-hidden shadow-md">
            <thead className="bg-[#204C6F]/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="text-[#2980B9] px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="text-gray-900 px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="text-gray-900 px-6 py-4 whitespace-nowrap">{user.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'Activo' 
                        ? 'border border-[#609000] text-[#609000]'
                        : 'border border-red-700 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-[#2980B9] hover:text-[#204C6F]">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-[#2980B9] hover:text-[#204C6F]">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}