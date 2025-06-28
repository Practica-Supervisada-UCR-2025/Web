'use client';

import { useState } from 'react';
import { fetchAnalytics } from '@/lib/analyticsApi';
import Chart from '@/app/components/analytics/chart';
import { Dropdown } from '@/components/ui/dropdown';
import { Button } from '@/components/ui/button';

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
  const [cumulative, setCumulative] = useState(true);
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (startDate > endDate) {
      setError('La fecha de inicio debe ser anterior o igual a la fecha de fin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchAnalytics({
        interval,
        startDate,
        endDate,
        graphType,
        cumulative
      });

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

      if (graphType === 'growth') {
        setChartType(cumulative ? 'line' : 'bar');
      } else if (graphType === 'total') {
        setChartType('line');
      } else if (graphType === 'volume') {
        setChartType('bar');
      } else {
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
      
      <div className="flex flex-col items-center gap-6 mb-8">
      <div className={`grid gap-6 ${graphType === 'growth' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-4'}`}>
        <Dropdown
          id="graphType"
          label="Tipo de gráfico"
          value={graphType}
          options={[
            { label: 'Crecimiento de Usuarios', value: 'growth' },
            { label: 'Total de Publicaciones', value: 'total' },
            { label: 'Volumen de reportes', value: 'volume' },
          ]}
          onChange={setGraphType}
        />

        <Dropdown
          id="interval"
          label="Intervalo"
          value={interval}
          options={[
            { label: 'Diario', value: 'daily' },
            { label: 'Semanal', value: 'weekly' },
            { label: 'Mensual', value: 'monthly' },
          ]}
          onChange={setInterval}
        />

          {graphType === 'growth' ? (
            <Dropdown
              id="growthMode"
              label="Crecimiento"
              value={cumulative ? 'cumulative' : 'non-cumulative'}
              options={[
                { label: 'Acumulado', value: 'cumulative' },
                { label: 'Por periodo', value: 'non-cumulative' },
              ]}
              onChange={(value) => setCumulative(value === 'cumulative')}
            />
          ) : (
            <>
              <div>
                <label htmlFor="startDate" className="block text-sm font-semibold text-[#249dd8] mb-1">
                  Inicio
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  min={minDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#249dd8] focus:border-[#249dd8] text-gray-800 shadow-sm"
                />
              </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-semibold text-[#249dd8] mb-1">
                Fin
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate < minDate ? minDate : startDate}
                max={maxDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#249dd8] focus:border-[#249dd8] text-gray-800 shadow-sm [appearance:textfield]"
              />
            </div>
          </>
        )}
      </div>

      {graphType === 'growth' && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-semibold text-[#249dd8] mb-1">Inicio</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              min={minDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#249dd8] focus:border-[#249dd8] text-gray-800 shadow-sm [appearance:textfield]"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-semibold text-[#249dd8] mb-1">
              Fin
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              min={startDate < minDate ? minDate : startDate}
              max={maxDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#249dd8] focus:border-[#249dd8] text-gray-800 shadow-sm [appearance:textfield]"
            />
          </div>
        </div>
      )}
    </div>

      <div className="flex justify-center mb-10">
        <Button
          onClick={fetchData}
          type="button"
          isLoading={loading}
          disabled={false}
        >
          Solicitar
        </Button>
      </div>

      {error && (
        <p className="text-center text-red-600 mb-4 font-semibold">{error}</p>
      )}

      <div className="h-[450px] border rounded p-4">
      {!loading && data.length === 0 && !error && (
        <p className="text-center text-gray-600">No hay datos para mostrar.</p>
      )}

      {data.length > 0 && !loading && (
        <>
          <Chart data={data} type={chartType} xKey="date" yKey="count" />
          {interval === 'weekly' && (
            <p className="mt-4 text-sm text-center text-gray-500 italic">W = Semana</p>
          )}
        </>
      )}
    </div>
    </div>
  );
}
