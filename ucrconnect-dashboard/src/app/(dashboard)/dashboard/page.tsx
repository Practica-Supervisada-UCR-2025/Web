'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatCard from '@/app/components/statCard';
import Chart from '@/app/components/analytics/chart';
import {
  fetchUserGrowthDashboardData,
  fetchPostCountLast30Days,
  fetchReportsLast30Days
} from '@/lib/dashboardApi';

export default function Dashboard() {
  const [growthData, setGrowthData] = useState([]);
  const [postData, setPostData] = useState([]);
  const [reportData, setReportData] = useState([]);

  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalPosts, setTotalPosts] = useState<number | null>(null);
  const [totalReports, setTotalReports] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [growth, posts, reports] = await Promise.all([
          fetchUserGrowthDashboardData(),
          fetchPostCountLast30Days(),
          fetchReportsLast30Days()
        ]);

        setGrowthData(growth.chartData);
        setTotalUsers(growth.totalUsers);

        setPostData(posts.data);
        setTotalPosts(posts.totalPosts);

        setReportData(reports.chartData);
        setTotalReports(reports.totalReports);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el panel');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Usuarios',
      value: totalUsers,
      bgStyle: 'bg-gradient-to-tr from-[#249DD8] to-[#41ADE7BF] text-white',
      route: '/users'
    },
    {
      title: 'Posts/Mes',
      value: totalPosts,
      bgStyle: 'bg-gradient-to-tr from-[#b2e2c6] to-[#d9f4e3] text-gray-900',
      route: '/content'
    },
    {
      title: 'Reportes/Mes',
      value: totalReports,
      bgStyle: 'bg-gradient-to-tr from-[#ffd699] to-[#ffefcc] text-gray-900',
      route: '/content'
    }
  ];

  if (loading) {
    return <p className="text-center text-gray-500 mt-12">Cargando datos del dashboard...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 mt-12">{error}</p>;
  }

  return (
    <div className="space-y-8">
      {/* Tarjetas de resumen */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ title, value, bgStyle, route }, index) =>
          value !== null ? (
            <div
              key={title + index}
              className="transition-transform transform hover:scale-105 duration-200 ease-in-out cursor-pointer"
            >
              <Link href={route}>
                <StatCard title={title} value={value} bgStyle={bgStyle} route={route} />
              </Link>
            </div>
          ) : null
        )}
      </div>

      {/* Gráficos */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Posts últimos 30 días */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-700 mb-2 pl-4">Posts en el último mes</h2>
          <div className="bg-white p-6 rounded-xl shadow-lg h-75">
            {postData.length > 0 ? (
              <Chart data={postData} type="bar" xKey="date" yKey="count" />
            ) : (
              <p className="text-center text-gray-500">No hay datos para mostrar.</p>
            )}
          </div>
        </div>

        {/* Reportes últimas 3 semanas */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2 pl-4">Reportes en el último mes</h2>
          <div className="bg-white p-6 rounded-xl shadow-lg h-75">
            {reportData.length > 0 ? (
              <Chart data={reportData} type="pie" xKey="date" yKey="count" />
            ) : (
              <p className="text-center text-gray-500">No hay datos para mostrar.</p>
            )}
          </div>
        </div>

        {/* Crecimiento usuarios */}
        <div className="md:col-span-3 mt-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2 pl-4">Crecimiento de usuarios en el último año</h2>
          <div className="bg-white p-6 rounded-xl shadow-lg h-80">
            {growthData.length > 0 ? (
              <Chart data={growthData} type="line" xKey="date" yKey="count" />
            ) : (
              <p className="text-center text-gray-500">No hay datos para mostrar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
