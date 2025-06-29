// lib/analyticsApi.ts
function reverseDateFormat(dateStr: string): string {
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}-${mm}-${yyyy}`;
}

export async function fetchAnalytics({interval,startDate,endDate,graphType,cumulative = true,}: 
  {interval: string;startDate: string;endDate: string;graphType: string;cumulative?: boolean;
}) {
  const query = new URLSearchParams({ interval, startDate, endDate }).toString();
  const start_date = reverseDateFormat(startDate);
  const end_date = reverseDateFormat(endDate);
  const query2 = new URLSearchParams({ start_date, end_date, period: interval }).toString();

  let res: Response;

  switch (graphType) {
    case "growth": {
      const path = cumulative
        ? `/api/analytics/user-stats/growth?${query}`
        : `/api/analytics/user-stats/growth/non-cumulative?${query}`;
      res = await fetch(path);
      break;
    }

    case "total":
      res = await fetch(`/api/analytics/posts/stats/${graphType}?${query2}`);
      break;

    case "volume":
      res = await fetch(`/api/analytics/reports-stats/${graphType}?${query}`);
      break;

    case "reported":
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