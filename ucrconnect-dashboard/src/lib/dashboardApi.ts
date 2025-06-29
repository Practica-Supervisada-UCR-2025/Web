// lib/dashboardApi.ts
import { fetchAnalytics } from './analyticsApi';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getLast12MonthsRange() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

export async function fetchUserGrowthDashboardData() {
  const { startDate, endDate } = getLast12MonthsRange();

  const response = await fetchAnalytics({
    interval: 'monthly',
    startDate,
    endDate,
    graphType: 'growth',
  });

  let data = [];

  if (response?.data?.series) {
    data = response.data.series.map((item: any) => ({
      date: item.date,
      count: item.count,
    }));
  } else if (response?.data?.data) {
    data = response.data.data.map((item: any) => ({
      date: item.label,
      count: item.count,
    }));
  }

  return {
    chartData: data,
    totalUsers: response?.data?.totalUsers ?? 0,
  };
}

export async function fetchPostCountLast30Days() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const response = await fetchAnalytics({
    interval: 'daily',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    graphType: 'total',
  });

  const data = (response?.data?.series ?? []).map((item: any) => ({
    date: item.label,
    count: item.count,
  }));

  return {
    data,
    totalPosts: response?.data?.total ?? 0,
  };
}

export async function fetchReportsLast30Days() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const response = await fetchAnalytics({
    interval: 'weekly',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    graphType: 'volume',
  });

  const raw = response?.data?.series ?? [];

  return {
    chartData: raw.map((item: any) => ({
      date: item.date,
      count: item.count,
    })),
    totalReports: response?.data?.total ?? 0,
  };
}
