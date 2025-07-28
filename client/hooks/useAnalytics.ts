import { useState, useEffect, useMemo, useCallback } from "react";

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

        // Fetch analytics overview data from database
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.warn('⏰ Timeout de 10s atingido, abortando requisição');
          controller.abort();
        }, 10000); // 10s timeout

        let overviewResponse;
        try {
          overviewResponse = await fetch(
            `/api/analytics/overview?days=${selectedPeriod}`,
            {
              signal: controller.signal,
              headers: {
                "Content-Type": "application/json",
              },
              credentials: 'same-origin',
            },
          );
        } catch (fetchError) {
          clearTimeout(timeoutId);
          console.error('❌ Erro direto no fetch overview:', fetchError);
          throw new Error(`Falha na conexão com servidor: ${fetchError.message}`);
        }

        clearTimeout(timeoutId);

        if (!overviewResponse.ok) {
          throw new Error(
            `HTTP ${overviewResponse.status}: ${overviewResponse.statusText}`,
          );
        }

        const overviewResult = await overviewResponse.json();

        if (!overviewResult.success) {
          throw new Error(overviewResult.message || "Erro na API de overview");
        }

        console.log("✅ Dados do overview carregados:", overviewResult.data);
        setOverview(overviewResult.data);

        // Fetch daily stats
        try {
          const dailyResponse = await fetch(
            `/api/analytics/daily-stats?days=${selectedPeriod}`,
            { headers: { "Content-Type": "application/json" } },
          );
          if (dailyResponse.ok) {
            const dailyResult = await dailyResponse.json();
            if (dailyResult.success) {
              console.log(
                "✅ Daily stats carregados:",
                dailyResult.data?.length || 0,
                "dias",
              );
              setDailyStats(dailyResult.data || []);
            }
          } else {
            console.warn(
              "⚠️ Erro ao buscar daily stats:",
              dailyResponse.status,
            );
          }
        } catch (error) {
          console.warn("⚠️ Erro no fetch de daily stats:", error);
          setDailyStats([]); // fallback para array vazio
        }

        // Fetch time analysis (optional)
        try {
          const timeResponse = await fetch(
            `/api/analytics/time-analysis?days=${selectedPeriod}`,
            { headers: { "Content-Type": "application/json" } },
          );
          if (timeResponse.ok) {
            const timeResult = await timeResponse.json();
            if (timeResult.success) {
              console.log("✅ Time analysis carregado");
              setTimeAnalysis(timeResult.data);
            }
          }
        } catch (error) {
          console.warn("⚠️ Time analysis não disponível:", error);
        }

        // Fetch traffic sources (optional)
        try {
          const trafficResponse = await fetch(
            `/api/traffic/sources?days=${selectedPeriod}`,
            { headers: { "Content-Type": "application/json" } },
          );
          if (trafficResponse.ok) {
            const trafficResult = await trafficResponse.json();
            if (trafficResult.success) {
              console.log("✅ Traffic sources carregado");
              setTrafficSources(trafficResult.data);
            }
          }
        } catch (error) {
          console.warn("⚠️ Traffic sources não disponível:", error);
        }

        // Fetch location conversion (optional)
        try {
          const locationResponse = await fetch(
            `/api/analytics/conversion-by-location?days=${selectedPeriod}`,
            { headers: { "Content-Type": "application/json" } },
          );
          if (locationResponse.ok) {
            const locationResult = await locationResponse.json();
            if (locationResult.success) {
              console.log("✅ Location conversion carregado");
              setLocationConversion(locationResult.data);
            }
          }
        } catch (error) {
          console.warn("⚠️ Location conversion não disponível:", error);
        }

        // Fetch geography conversion (optional)
        try {
          const geographyResponse = await fetch(
            `/api/analytics/conversion-by-geography?days=${selectedPeriod}`,
            { headers: { "Content-Type": "application/json" } },
          );
          if (geographyResponse.ok) {
            const geographyResult = await geographyResponse.json();
            if (geographyResult.success) {
              console.log("✅ Geography conversion carregado");
              setGeographyConversion(geographyResult.data);
            }
          }
        } catch (error) {
          console.warn("⚠️ Geography conversion não disponível:", error);
        }
      } catch (error) {
        console.error("❌ Erro ao carregar analytics:", error);

        // Retry logic
        if (retries > 0 && error.name !== "AbortError") {
          console.log(
            `🔄 Tentando novamente em 2s... (${retries} tentativas restantes)`,
          );
          setTimeout(() => {
            fetchAnalytics(retries - 1);
          }, 2000);
          return;
        }

        // Set error after all retries exhausted
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        setError(`Falha ao carregar dados: ${errorMessage}`);
        console.error("❌ Todas as tentativas falharam:", errorMessage);

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
