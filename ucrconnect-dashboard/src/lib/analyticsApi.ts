// lib/analyticsApi.ts
export async function fetchUserStatsGrowth({ interval, startDate, endDate }: { interval: string; startDate: string; endDate: string }) {
  const query = new URLSearchParams({ interval, startDate, endDate }).toString();
  const res = await fetch(`/api/analytics/user-stats/growth?${query}`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al obtener datos de crecimiento');
  }

  const json = await res.json();
  return json.data;
}