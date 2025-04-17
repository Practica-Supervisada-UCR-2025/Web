'use client';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Vista General</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-lg font-medium text-blue-800">Usuarios</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">1,234</p>
            <p className="text-sm text-blue-500 mt-1">+12% desde el mes pasado</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="text-lg font-medium text-green-800">Contenido</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">567</p>
            <p className="text-sm text-green-500 mt-1">+8% desde el mes pasado</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h3 className="text-lg font-medium text-purple-800">Interacciones</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">8,901</p>
            <p className="text-sm text-purple-500 mt-1">+15% desde el mes pasado</p>
          </div>
        </div>
      </div>
    </div>
  );
} 