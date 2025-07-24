import { useState, useEffect } from 'react';

export interface AnalyticsData {
  totalLeads: number;
  leadsToday: number;
  conversionRate: number;
  pageViews: number;
  leadsByDay: Array<{ date: string; count: number }>;
  recentActivity: Array<{
    id: string;
    type: 'lead' | 'view';
    message: string;
    timestamp: string;
  }>;
  trends: {
    leadsChange: number;
    conversionChange: number;
    viewsChange: number;
  };
}

interface UseAnalyticsReturn {
  analytics: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
}

export function useAnalytics(selectedPeriod: number = 30) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data structure for analytics
  const [overview, setOverview] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [timeAnalysis, setTimeAnalysis] = useState(null);
  const [trafficSources, setTrafficSources] = useState(null);
  const [locationConversion, setLocationConversion] = useState(null);
  const [geographyConversion, setGeographyConversion] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/analytics', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setAnalytics(result.data);
      } else {
        throw new Error(result.message || 'Erro ao carregar analytics');
      }
    } catch (err) {
      // Silently fall back to mock data
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn('⚠️ API timeout - usando dados mock de analytics');
      } else {
        console.warn('⚠️ API indisponível - usando dados mock de analytics');
      }
      
      setError(null);

      // Mock data as fallback
      const mockOverview = {
        leads: { total: 0, unique: 0, duplicates: 0, with_cnpj: 0, period: 0 },
        conversion: { rate: 0, period_rate: 0 },
        traffic: {
          unique_users: 0,
          total_sessions: 0,
          avg_session_duration: 0,
          whatsapp_clicks: 0,
          unique_page_views: 0,
          total_page_views: 0
        },
        store_types: { fisica: 0, online: 0, ambas: 0 },
        period_days: selectedPeriod
      };

      setOverview(mockOverview);
      setDailyStats([]);
      setTimeAnalysis(null);
      setTrafficSources(null);
      setLocationConversion(null);
      setGeographyConversion(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    await fetchAnalytics();
  };

  useEffect(() => {
    // Delay the initial fetch to avoid blocking page load
    const timer = setTimeout(() => {
      fetchAnalytics();
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  const refreshData = refreshAnalytics;

  return {
    overview,
    dailyStats,
    timeAnalysis,
    trafficSources,
    locationConversion,
    geographyConversion,
    loading,
    error,
    refreshData
  };
}
