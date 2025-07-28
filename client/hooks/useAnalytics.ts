import { useState, useEffect, useMemo, useCallback } from "react";
import { robustFetchJson } from "../utils/robustFetch";

export interface AnalyticsData {
  totalLeads: number;
  leadsToday: number;
  conversionRate: number;
  pageViews: number;
  leadsByDay: Array<{ date: string; count: number }>;
  recentActivity: Array<{
    id: string;
    type: "lead" | "view";
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

  const fetchAnalytics = useCallback(
    async (retries = 3) => {
      setLoading(true);
      setError(null);

      try {
        console.log(`🔄 Buscando analytics (tentativa ${4 - retries}/3)...`);

        // Verificar se estamos no ambiente correto
        if (typeof window === 'undefined') {
          throw new Error('Fetch só pode ser executado no cliente');
        }

        // Fetch analytics overview data using robust fetch
        console.log('🔄 [ANALYTICS] Buscando overview...');

        const overviewResult = await robustFetchJson(
          `/api/analytics/overview?days=${selectedPeriod}`,
          {
            timeout: 10000,
          }
        );

        if (!overviewResult.success) {
          throw new Error(overviewResult.message || "Erro na API de overview");
        }

        console.log("✅ [ANALYTICS] Dados do overview carregados:", overviewResult.data);
        setOverview(overviewResult.data);

        // Fetch daily stats
        try {
          console.log('🔄 [ANALYTICS] Buscando daily stats...');

          const dailyResult = await robustFetchJson(
            `/api/analytics/daily-stats?days=${selectedPeriod}`,
            {
              timeout: 8000,
            }
          );

          if (dailyResult.success) {
            console.log(
              "✅ [ANALYTICS] Daily stats carregados:",
              dailyResult.data?.length || 0,
              "dias",
            );
            setDailyStats(dailyResult.data || []);
          }
        } catch (error) {
          console.warn("⚠️ [ANALYTICS] Erro no fetch de daily stats:", error);
          setDailyStats([]); // fallback para array vazio
        }

        // Fetch time analysis (optional)
        try {
          console.log('🔄 [ANALYTICS] Buscando time analysis...');

          const timeResult = await robustFetchJson(
            `/api/analytics/time-analysis?days=${selectedPeriod}`,
            {
              timeout: 8000,
            }
          );

          if (timeResult.success) {
            console.log("✅ [ANALYTICS] Time analysis carregado");
            setTimeAnalysis(timeResult.data);
          }
        } catch (error) {
          console.warn("⚠️ [ANALYTICS] Time analysis não disponível:", error);
        }

        // Fetch traffic sources (optional)
        try {
          console.log('🔄 [ANALYTICS] Buscando traffic sources...');

          const trafficResult = await robustFetchJson(
            `/api/analytics/traffic-sources?days=${selectedPeriod}`,
            {
              timeout: 8000,
            }
          );

          if (trafficResult.success) {
            console.log("✅ [ANALYTICS] Traffic sources carregado");
            setTrafficSources(trafficResult.data);
          }
        } catch (error) {
          console.warn("⚠️ [ANALYTICS] Traffic sources não disponível:", error);
        }

        // Fetch location conversion (optional)
        try {
          console.log('🔄 [ANALYTICS] Buscando location conversion...');

          const locationResult = await robustFetchJson(
            `/api/analytics/conversion-by-location?days=${selectedPeriod}`,
            {
              timeout: 8000,
            }
          );

          if (locationResult.success) {
            console.log("✅ [ANALYTICS] Location conversion carregado");
            setLocationConversion(locationResult.data);
          }
        } catch (error) {
          console.warn("⚠️ [ANALYTICS] Location conversion não disponível:", error);
        }

        // Fetch geography conversion (optional)
        try {
          console.log('🔄 [ANALYTICS] Buscando geography conversion...');

          const geographyResult = await robustFetchJson(
            `/api/analytics/conversion-by-geography?days=${selectedPeriod}`,
            {
              timeout: 8000,
            }
          );

          if (geographyResult.success) {
            console.log("✅ [ANALYTICS] Geography conversion carregado");
            setGeographyConversion(geographyResult.data);
          }
        } catch (error) {
          console.warn("⚠️ [ANALYTICS] Geography conversion não disponível:", error);
        }
      } catch (error) {
        console.error("❌ [ANALYTICS] Erro ao carregar analytics:", error);

        // Retry logic - mas só se não for erro de conectividade básica
        if (retries > 0 && !error.message.includes('Failed to fetch') && error.name !== "AbortError") {
          console.log(
            `🔄 [ANALYTICS] Tentando novamente em 3s... (${retries} tentativas restantes)`,
          );
          setTimeout(() => {
            fetchAnalytics(retries - 1);
          }, 3000);
          return;
        }

        // Set error after all retries exhausted
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";

        // Verificar se é problema de conectividade
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network error')) {
          setError(`Problemas de conectividade detectados. Verifique sua conexão.`);
        } else {
          setError(`Falha ao carregar dados: ${errorMessage}`);
        }

        console.error("❌ [ANALYTICS] Todas as tentativas falharam:", errorMessage);

        // Set empty/zero data instead of mock data
        setOverview({
          leads: {
            total: 0,
            unique: 0,
            duplicates: 0,
            with_cnpj: 0,
            period: 0,
          },
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
            bounce_rate: 0,
          },
          store_types: { fisica: 0, online: 0, ambas: 0 },
          period_days: selectedPeriod,
        });
        setDailyStats([]);
        setTimeAnalysis(null);
        setTrafficSources(null);
        setLocationConversion(null);
        setGeographyConversion(null);
      } finally {
        setLoading(false);
      }
    },
    [selectedPeriod],
  );

  const refreshData = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    overview,
    dailyStats,
    timeAnalysis,
    trafficSources,
    locationConversion,
    geographyConversion,
    loading,
    error,
    refreshData,
  };
}

// Hook para gerar e manter session ID único por sessão
export function useSessionId(): string {
  const sessionId = useMemo(() => {
    // Gerar um session ID único baseado em timestamp + random
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `session_${timestamp}_${random}`;
  }, []);

  return sessionId;
}
