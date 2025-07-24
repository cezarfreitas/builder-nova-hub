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

export function useAnalytics(): UseAnalyticsReturn {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const today = new Date();
      const mockData: AnalyticsData = {
        totalLeads: 0,
        leadsToday: 0,
        conversionRate: 0,
        pageViews: 0,
        leadsByDay: [],
        recentActivity: [],
        trends: {
          leadsChange: 0,
          conversionChange: 0,
          viewsChange: 0
        }
      };

      setAnalytics(mockData);
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

  return {
    analytics,
    loading,
    error,
    refreshAnalytics
  };
}
