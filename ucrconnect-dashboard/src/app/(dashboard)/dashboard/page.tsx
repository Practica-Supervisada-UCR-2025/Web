'use client';
import { useEffect, useState } from 'react';
import StatCard from '../../components/statCard';
import Link from 'next/link';
import { PostsChart, ReportsChart, UsersChart } from '../../components/charts';

import AppDynamicsRealUserMonitoring from '../../components/app_dynamics_instrumentation/AppDynamicsRealUserMonitoring'; // RUM instrumentation for AppDynamics

export default function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState([]);

  useEffect(() => {
    fetch('/data/dashboardData.json')
      .then((response) => response.json())
      .then((data) => setDashboardStats(data))
      .catch((error) => console.error('Error al cargar los datos:', error));
  }, []);

  return (
    <div className="space-y-6">
      <AppDynamicsRealUserMonitoring />
      <div className="flex justify-center">
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
      </div>

      <div className="w-full max-w-7xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Posts por categoría</h2>
          <div className="bg-white p-6 rounded-lg shadow-md h-[300px]">
            <PostsChart />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Reportes</h2>
          <div className="bg-white p-6 rounded-lg shadow-md h-[300px]">
            <ReportsChart />
          </div>
        </div>
        <div className="md:col-span-3">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Crecimiento de usuarios por mes</h2>
          <div className="bg-white p-6 rounded-lg shadow-md h-[400px]">
            <UsersChart />
          </div>
        </div>
      </div>
    </div>
  );
}
