import { fetchUserGrowthDashboardData, fetchPostCountLast30Days, fetchReportsLast30Days } from '@/lib/dashboardApi';
import { fetchAnalytics } from '@/lib/analyticsApi';

jest.mock('@/lib/analyticsApi');

describe('dashboardApi', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-06-28T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserGrowthDashboardData', () => {
    it('retorna datos formateados cuando response.data.series existe', async () => {
      (fetchAnalytics as jest.Mock).mockResolvedValue({
        data: {
          series: [
            { date: '2024-07-01', count: 10 },
            { date: '2024-08-01', count: 20 },
          ],
          totalUsers: 30,
        },
      });

      const result = await fetchUserGrowthDashboardData();

      expect(fetchAnalytics).toHaveBeenCalledWith(expect.objectContaining({
        interval: 'monthly',
        graphType: 'growth',
      }));

      expect(result).toEqual({
        chartData: [
          { date: '2024-07-01', count: 10 },
          { date: '2024-08-01', count: 20 },
        ],
        totalUsers: 30,
      });
    });

    it('retorna datos formateados cuando response.data.data existe', async () => {
      (fetchAnalytics as jest.Mock).mockResolvedValue({
        data: {
          data: [
            { label: '2024-07-01', count: 5 },
            { label: '2024-08-01', count: 15 },
          ],
          totalUsers: 20,
        },
      });

      const result = await fetchUserGrowthDashboardData();

      expect(result).toEqual({
        chartData: [
          { date: '2024-07-01', count: 5 },
          { date: '2024-08-01', count: 15 },
        ],
        totalUsers: 20,
      });
    });

    it('retorna valores por defecto cuando response no tiene data', async () => {
      (fetchAnalytics as jest.Mock).mockResolvedValue({});

      const result = await fetchUserGrowthDashboardData();

      expect(result).toEqual({
        chartData: [],
        totalUsers: 0,
      });
    });
  });

  describe('fetchPostCountLast30Days', () => {
    it('retorna datos formateados correctamente', async () => {
      (fetchAnalytics as jest.Mock).mockResolvedValue({
        data: {
          series: [
            { label: '2025-05-29', count: 3 },
            { label: '2025-05-30', count: 7 },
          ],
          total: 10,
        },
      });

      const result = await fetchPostCountLast30Days();

      expect(fetchAnalytics).toHaveBeenCalledWith(expect.objectContaining({
        interval: 'weekly',
        graphType: 'total',
      }));

      expect(result).toEqual({
        data: [
          { date: '2025-05-29', count: 3 },
          { date: '2025-05-30', count: 7 },
        ],
        totalPosts: 10,
      });
    });

    it('retorna valores vacíos si no hay series', async () => {
      (fetchAnalytics as jest.Mock).mockResolvedValue({
        data: {},
      });

      const result = await fetchPostCountLast30Days();

      expect(result).toEqual({
        data: [],
        totalPosts: 0,
      });
    });
  });

  describe('fetchReportsLast30Days', () => {
    it('retorna datos formateados correctamente', async () => {
      (fetchAnalytics as jest.Mock).mockResolvedValue({
        data: {
          series: [
            { date: '2025-05-25', count: 2 },
            { date: '2025-06-01', count: 8 },
          ],
          total: 10,
        },
      });

      const result = await fetchReportsLast30Days();

      expect(fetchAnalytics).toHaveBeenCalledWith(expect.objectContaining({
        interval: 'weekly',
        graphType: 'volume',
      }));

      expect(result).toEqual({
        chartData: [
          { date: '2025-05-25', count: 2 },
          { date: '2025-06-01', count: 8 },
        ],
        totalReports: 10,
      });
    });

    it('retorna valores vacíos si no hay series', async () => {
      (fetchAnalytics as jest.Mock).mockResolvedValue({
        data: {},
      });

      const result = await fetchReportsLast30Days();

      expect(result).toEqual({
        chartData: [],
        totalReports: 0,
      });
    });
  });
});
