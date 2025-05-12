'use client';
import { useState } from 'react';

interface User {
  name: string;
  email: string;
  type: string;
  status: string;
}

export default function SuspendUser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [suspensionTime, setSuspensionTime] = useState('1');
  const [users, setUsers] = useState<User[]>([
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
      <h1 className="text-2xl font-bold text-[#204C6F]">Suspender Usuarios</h1>
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
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white rounded-xl overflow-hidden shadow-md">
          <thead className="bg-[#204C6F]/10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
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
                  <span className={`px-2 inline-flex text-xs leading-5 rounded-full ${
                    user.status === 'Activo' 
                      ? 'bg-[#609000]/20 text-[#609000]'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.status === 'Activo' ? (
                    <span 
                      className="px-2 inline-flex text-xs leading-5 rounded-full border border-red-700 text-red-700 hover:bg-red-700 hover:text-white transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(true);
                      }}
                    >
                      Suspender
                    </span>
                  ) : (
                    <span 
                      className="px-2 inline-flex text-xs leading-5 rounded-full border border-[#609000] text-[#609000] hover:bg-[#609000] hover:text-white transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowActivateModal(true);
                      }}
                    >
                      Activar
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
          data-testid="modal-overlay"
        >
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl" role="dialog" aria-labelledby="suspend-modal-title">
            <h2 id="suspend-modal-title" className="text-xl font-semibold text-[#204C6F] mb-4 text-center">
              Está apunto de suspender al siguiente usuario: {selectedUser?.name}
            </h2>
            <p className="text-gray-600 mb-4 text-center">Por favor, elija el tiempo de suspensión:</p>
            
            <select 
              className="w-full p-2 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-1 focus:ring-[#2980B9] focus:border-[#2980B9] text-gray-500"
              value={suspensionTime}
              onChange={(e) => setSuspensionTime(e.target.value)}
            >
              <option value="1" className="text-gray-500">1 día</option>
              <option value="3" className="text-gray-500">3 días</option>
              <option value="7" className="text-gray-500">7 días</option>
            </select>

            <div className="flex justify-center gap-4">
              <button 
                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="px-4 py-2 bg-[#204C6F] text-white rounded-lg hover:bg-[#2980B9] transition-colors"
                onClick={() => {
                  // TODO: Implement suspension logic
                  setShowModal(false);
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {showActivateModal && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowActivateModal(false);
            }
          }}
          data-testid="modal-overlay"
        >
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl" role="dialog" aria-labelledby="activate-modal-title">
            <h2 id="activate-modal-title" className="text-xl font-semibold text-[#204C6F] mb-4 text-center">
              ¿Está seguro que quiere activar al usuario {selectedUser?.name}?
            </h2>

            <div className="flex justify-center gap-4 mt-6">
              <button 
                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                onClick={() => setShowActivateModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="px-4 py-2 bg-[#204C6F] text-white rounded-lg hover:bg-[#2980B9] transition-colors"
                onClick={() => {
                  // TODO: Implement activation logic
                  setShowActivateModal(false);
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}