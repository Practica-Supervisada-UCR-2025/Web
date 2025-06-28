// lib/analyticsApi.ts
function reverseDateFormat(dateStr: string): string {
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}-${mm}-${yyyy}`;
}

export async function fetchAnalytics({interval, startDate, endDate, graphType}: {interval: string; startDate: string; endDate: string; graphType: string;}) {
  const query = new URLSearchParams({ interval, startDate, endDate }).toString();
  
  const start_date = reverseDateFormat(startDate);
  const end_date = reverseDateFormat(endDate);
  const query2 = new URLSearchParams({ start_date, end_date, period: interval }).toString();
  
  let res: Response;

  switch (graphType) {
    case "growth":
      res = await fetch(`/api/analytics/user-stats/${graphType}?${query}`);
      break;
    case "volume":
      res = await fetch(`/api/analytics/reports-stats/${graphType}?${query}`);
      break;
    case "total":
      res = await fetch(`/api/analytics/posts/stats/${graphType}?${query2}`);
      break;
    default:
      throw new Error(`Tipo de gráfico no soportado: ${graphType}?${query}`);
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Error al obtener datos");
  }

  const json = await res.json();
  return json.data;
}