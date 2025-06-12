"use client";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { fetchUserStatsGrowth } from "@/lib/analyticsApi";
import  Chart  from "@/app/components/analytics/chart"

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

const today = new Date();
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(today.getMonth() - 6);

export default function Analytics() {
  const [interval, setInterval] = useState("daily");
  const [startDate, setStartDate] = useState(formatDate(sixMonthsAgo));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUserStatsGrowth({ interval, startDate, endDate });
      setData(response.data?.series || []);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white shadow-xl rounded-2xl p-10">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">Análisis de crecimiento</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">Tipo de gráfico</label>
          <select className="w-full border p-2 rounded text-gray-700 bg-gray-100" disabled>
            <option>Crecimiento de Usuarios</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">Intervalo</label>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="w-full border p-2 rounded text-gray-700"
          >
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">Inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border p-2 rounded text-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">Fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border p-2 rounded text-gray-700"
          />
        </div>
      </div>

      <div className="flex justify-center mb-10">
        <button
          onClick={fetchData}
          className="bg-[#249dd8] text-white px-10 py-3 rounded-full shadow hover:bg-[#1b87b9] transition"
          disabled={loading}
        >
          {loading ? "Cargando..." : "Solicitar"}
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
          <Chart data={data} type="line" xKey="date" yKey=""/>
        )}
      </div>
    </div>
  );
}
