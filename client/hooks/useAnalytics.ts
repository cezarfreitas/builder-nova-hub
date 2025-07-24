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

export function useAnalytics(selectedPeriod: number = 30) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real data states
  const [overview, setOverview] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [timeAnalysis, setTimeAnalysis] = useState(null);
  const [trafficSources, setTrafficSources] = useState(null);
  const [locationConversion, setLocationConversion] = useState(null);
  const [geographyConversion, setGeographyConversion] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch analytics overview data from database
      const overviewResponse = await fetch(`/api/analytics/overview?days=${selectedPeriod}`);
      if (!overviewResponse.ok) {
        throw new Error(`Erro ao buscar overview: ${overviewResponse.status}`);
      }
      const overviewResult = await overviewResponse.json();
      
      if (!overviewResult.success) {
        throw new Error(overviewResult.message || 'Erro na API de overview');
      }
      
      console.log('✅ Dados do banco carregados:', overviewResult.data);
      setOverview(overviewResult.data);

      // Fetch daily stats
      const dailyResponse = await fetch(`/api/analytics/daily-stats?days=${selectedPeriod}`);
      if (dailyResponse.ok) {
        const dailyResult = await dailyResponse.json();
        if (dailyResult.success) {
          setDailyStats(dailyResult.data || []);
        }
      }

      // Fetch time analysis
      const timeResponse = await fetch(`/api/analytics/time-analysis?days=${selectedPeriod}`);
      if (timeResponse.ok) {
        const timeResult = await timeResponse.json();
        if (timeResult.success) {
          setTimeAnalysis(timeResult.data);
        }
      }

      // Fetch traffic sources
      const trafficResponse = await fetch(`/api/traffic/sources?days=${selectedPeriod}`);
      if (trafficResponse.ok) {
        const trafficResult = await trafficResponse.json();
        if (trafficResult.success) {
          setTrafficSources(trafficResult.data);
        }
      }

      // Fetch location conversion
      const locationResponse = await fetch(`/api/analytics/conversion-by-location?days=${selectedPeriod}`);
      if (locationResponse.ok) {
        const locationResult = await locationResponse.json();
        if (locationResult.success) {
          setLocationConversion(locationResult.data);
        }
      }

      // Fetch geography conversion
      const geographyResponse = await fetch(`/api/analytics/conversion-by-geography?days=${selectedPeriod}`);
      if (geographyResponse.ok) {
        const geographyResult = await geographyResponse.json();
        if (geographyResult.success) {
          setGeographyConversion(geographyResult.data);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao carregar analytics:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      // Set empty/zero data instead of mock data
      setOverview({
        leads: { total: 0, unique: 0, duplicates: 0, with_cnpj: 0, period: 0 },
        conversion: { rate: 0, period_rate: 0 },
        traffic: {
          unique_users: 0,
          new_users: 0,
          returning_users: 0,
          total_sessions: 0,
          avg_sessions_per_user: 0,
          avg_session_duration: 0,
          whatsapp_clicks: 0,
          unique_page_views: 0,
          total_page_views: 0,
          bounce_rate: 0
        },
        store_types: { fisica: 0, online: 0, ambas: 0 },
        period_days: selectedPeriod
      });
      setDailyStats([]);
      setTimeAnalysis(null);
      setTrafficSources(null);
      setLocationConversion(null);
      setGeographyConversion(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchAnalytics();
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

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
