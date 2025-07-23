import { useState, useEffect } from 'react';

export interface AnalyticsOverview {
  leads: {
    total: number;
    unique: number;
    duplicates: number;
    period: number;
    with_cnpj: number;
  };
  store_types: {
    fisica: number;
    online: number;
    ambas: number;
  };
  webhooks: {
    success: number;
    errors: number;
  };
  traffic: {
    total_sessions: number;
    unique_users: number;
    total_page_views: number;
    period_page_views: number;
    unique_page_views: number;
    avg_session_duration: number;
    pages_per_session: number;
    bounce_rate: number;
    whatsapp_clicks: number;
  };
  conversion: {
    rate: number;
    period_rate: number;
  };
  period_days: number;
}

export interface DailyStat {
  date: string;
  total_leads: number;
  unique_leads: number;
  duplicates: number;
  webhook_success: number;
  with_cnpj: number;
  sessions: number;
  page_views: number;
  conversion_rate: number;
}

export interface TimeAnalysis {
  hourly_stats: Array<{
    hour: number;
    total_leads: number;
    unique_leads: number;
  }>;
  weekday_stats: Array<{
    weekday: number;
    weekday_name: string;
    total_leads: number;
    unique_leads: number;
  }>;
  best_hour: {
    hour: number;
    total_leads: number;
    formatted: string;
  };
  best_weekday: {
    name: string;
    total_leads: number;
  };
}

export interface TrafficSources {
  utm_sources: Array<{
    source: string;
    total_leads: number;
    unique_leads: number;
    successful_webhooks: number;
  }>;
  utm_mediums: Array<{
    medium: string;
    total_leads: number;
    unique_leads: number;
  }>;
  utm_campaigns: Array<{
    campaign: string;
    total_leads: number;
    unique_leads: number;
  }>;
  sources: Array<{
    source_name: string;
    total_leads: number;
    unique_leads: number;
  }>;
}

export interface LocationConversion {
  location_conversion: Array<{
    location: string;
    location_label: string;
    total_leads: number;
    unique_leads: number;
    successful_webhooks: number;
    with_cnpj: number;
    webhook_success_rate: number;
  }>;
  analytics_events: Array<{
    event_type: string;
    unique_sessions: number;
    total_events: number;
  }>;
}

export interface GeographyConversion {
  state_conversion: Array<{
    estado: string;
    total_leads: number;
    unique_leads: number;
    successful_webhooks: number;
    with_cnpj: number;
    fisica_leads: number;
    online_leads: number;
    ambas_leads: number;
    webhook_success_rate: number;
  }>;
  city_conversion: Array<{
    cidade: string;
    estado: string;
    total_leads: number;
    unique_leads: number;
    successful_webhooks: number;
    with_cnpj: number;
    fisica_leads: number;
    online_leads: number;
    ambas_leads: number;
    webhook_success_rate: number;
  }>;
}

export function useAnalytics(days: number = 30) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [timeAnalysis, setTimeAnalysis] = useState<TimeAnalysis | null>(null);
  const [trafficSources, setTrafficSources] = useState<TrafficSources | null>(null);
  const [locationConversion, setLocationConversion] = useState<LocationConversion | null>(null);
  const [geographyConversion, setGeographyConversion] = useState<GeographyConversion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      // Tratar caso especial para "ontem" (days = 0)
      const queryParam = days === 0 ? 'yesterday=true' : `days=${days}`;
      const url = `/api/analytics/overview?${queryParam}`;
      console.log('Fetching overview from:', url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setOverview(result.data);
      } else {
        throw new Error(result.message || result.error || 'Erro ao buscar overview');
      }
    } catch (err) {
      console.error('Erro ao buscar overview:', err);
      setError(`Erro ao carregar dados gerais: ${err.message}`);
    }
  };

  const fetchDailyStats = async () => {
    try {
      const queryParam = days === 0 ? 'yesterday=true' : `days=${days}`;
      const response = await fetch(`/api/analytics/daily-stats?${queryParam}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setDailyStats(result.data);
      } else {
        throw new Error(result.message || result.error || 'Erro ao buscar estatísticas diárias');
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas diárias:', err);
      setError(`Erro ao carregar estatísticas diárias: ${err.message}`);
    }
  };

  const fetchTimeAnalysis = async () => {
    try {
      const queryParam = days === 0 ? 'yesterday=true' : `days=${days}`;
      const response = await fetch(`/api/analytics/time-analysis?${queryParam}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setTimeAnalysis(result.data);
      } else {
        throw new Error(result.message || result.error || 'Erro ao buscar análise temporal');
      }
    } catch (err) {
      console.error('Erro ao buscar análise temporal:', err);
      setError(`Erro ao carregar análise temporal: ${err.message}`);
    }
  };

  const fetchTrafficSources = async () => {
    try {
      const queryParam = days === 0 ? 'yesterday=true' : `days=${days}`;
      const response = await fetch(`/api/analytics/traffic-sources?${queryParam}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setTrafficSources(result.data);
      } else {
        throw new Error(result.message || result.error || 'Erro ao buscar fontes de tráfego');
      }
    } catch (err) {
      console.error('Erro ao buscar fontes de tráfego:', err);
      setError(`Erro ao carregar fontes de tráfego: ${err.message}`);
    }
  };

  const trackVisit = async (sessionId: string) => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const visitData = {
        session_id: sessionId,
        page_url: window.location.href,
        referrer: document.referrer,
        utm_source: urlParams.get('utm_source') || '',
        utm_medium: urlParams.get('utm_medium') || '',
        utm_campaign: urlParams.get('utm_campaign') || '',
        user_agent: navigator.userAgent
      };

      await fetch('/api/analytics/track-visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(visitData)
      });
    } catch (err) {
      console.error('Erro ao rastrear visita:', err);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Executar todas as requisições em paralelo, mas tratar erros individualmente
      const promises = [
        fetchOverview().catch(err => console.error('Erro overview:', err)),
        fetchDailyStats().catch(err => console.error('Erro daily stats:', err)),
        fetchTimeAnalysis().catch(err => console.error('Erro time analysis:', err)),
        fetchTrafficSources().catch(err => console.error('Erro traffic sources:', err))
      ];

      await Promise.allSettled(promises);
    } catch (err) {
      console.error('Erro geral ao atualizar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [days]);

  return {
    overview,
    dailyStats,
    timeAnalysis,
    trafficSources,
    loading,
    error,
    refreshData,
    trackVisit
  };
}

// Hook para gerar session ID único
export function useSessionId() {
  const [sessionId] = useState(() => {
    // Verificar se já existe um session ID no localStorage
    let sessionId = localStorage.getItem('analytics_session_id');
    
    if (!sessionId) {
      // Gerar novo session ID
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_session_id', sessionId);
    }
    
    return sessionId;
  });

  return sessionId;
}
