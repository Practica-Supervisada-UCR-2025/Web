// lib/analyticsApi.ts
export async function fetchAnalytics({interval, startDate, endDate, graphType}: {interval: string; startDate: string; endDate: string; graphType: string;}) {
  const query = new URLSearchParams({ interval, startDate, endDate }).toString();
  let res: Response;

  switch (graphType) {
    case "growth":
      res = await fetch(`/api/analytics/user-stats/${graphType}?${query}`);
      break;
    case "volume":
      res = await fetch(`/api/analytics/posts-stats/${graphType}?${query}`);
      break;
    default:
      throw new Error(`Tipo de gráfico no soportado: ${graphType}`);
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Error al obtener datos");
  }

  const json = await res.json();
  return json.data;
}