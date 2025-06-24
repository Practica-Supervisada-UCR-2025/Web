'use client';

import { useState } from 'react';
import { fetchAnalytics } from '@/lib/analyticsApi';
import Chart from '@/app/components/analytics/chart';

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

const today = new Date();
const maxDate = formatDate(today);
const minDate = formatDate(new Date(today.getFullYear() - 5, today.getMonth(), today.getDate()));
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(today.getMonth() - 6);

export default function Analytics() {
  const [graphType, setGraphType] = useState('growth');
  const [interval, setInterval] = useState('daily');
  const [startDate, setStartDate] = useState(formatDate(sixMonthsAgo));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = 'w-full rounded-xl px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#249dd8] focus:border-[#249dd8] text-gray-800 shadow-sm appearance-none';

  const fetchData = async () => {
    if (startDate > endDate) {
      setError('La fecha de inicio debe ser anterior o igual a la fecha de fin');
      return;
    }

    setLoading(true);
    setError(null);

    try { 
      const response = await fetchAnalytics({ interval, startDate, endDate, graphType });
      let normalizedData = [];

      if (response.data?.series) {
        normalizedData = response.data.series.map((item: any) => ({
          date: item.date,
          count: item.count,
        }));
      } else if (response.data?.data) {
        normalizedData = response.data.data.map((item: any) => ({
          date: item.label,
          count: item.count,
        }));
      } else {
        throw new Error('Formato de datos no reconocido');
      }

      setData(normalizedData);

      switch (graphType) {
        case 'growth':
        case 'total':
          setChartType('line');
          break;
        case 'volume':
          setChartType('bar');
          break;
        default:
          setChartType('line');
      }
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
      setData([]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white shadow-xl rounded-2xl p-10">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">Panel de Métricas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Tipo de gráfico */}
        <div>
          <label htmlFor="graphType" className="block text-sm font-semibold text-[#249dd8] mb-1">
            Tipo de gráfico
          </label>
          <div className="relative">
            <select
              id="graphType"
              value={graphType}
              onChange={(e) => setGraphType(e.target.value)}
              className={`${inputClass} pr-10`}
            >
              <option value="growth">Crecimiento de Usuarios</option>
              <option value="total">Total de Publicaciones</option>
              <option value="volume">Volumen de reportes</option>
            </select>
            <svg
              className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Intervalo */}
        <div>
          <label htmlFor="interval" className="block text-sm font-semibold text-[#249dd8] mb-1">
            Intervalo
          </label>
          <div className="relative">
            <select
              id="interval"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className={`${inputClass} pr-10`}
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
            <svg
              className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Fecha de inicio */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-semibold text-[#249dd8] mb-1">Inicio</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            min={minDate}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`${inputClass} [appearance:textfield]`}
          />
        </div>

        {/* Fecha de fin */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-semibold text-[#249dd8] mb-1">Fin</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            min={startDate < minDate ? minDate : startDate}
            max={maxDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`${inputClass} [appearance:textfield]`}
          />
        </div>
      </div>

      <div className="flex justify-center mb-10">
        <button
          onClick={fetchData}
          className="bg-[#249dd8] text-white px-10 py-3 rounded-full shadow hover:bg-[#1b87b9] transition"
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Solicitar'}
        </button>
      </div>

      {error && (
        <p className="text-center text-red-600 mb-4 font-semibold">{error}</p>
      )}

      <div className="h-[450px] border rounded p-4">
        {!loading && data.length === 0 && !error && (
          <p className="text-center text-gray-600">No hay datos para mostrar.</p>
        )}

        {data.length > 0 && (
          <Chart data={data} type={chartType} xKey="date" yKey="count" />
        )}
      </div>
    </div>
  );
}
