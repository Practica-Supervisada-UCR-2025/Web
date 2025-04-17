'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-8">Lo sentimos, la página que estás buscando no existe.</p>
        <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
} 