import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { BarChart3, Users, TrendingUp, Eye, Loader2, AlertCircle } from "lucide-react";
import { useLeads } from "../../hooks/useLeads";
import { useAnalytics } from "../../hooks/useAnalytics";

interface DashboardStats {
  total_leads: number;
  unique_leads: number;
  duplicate_leads: number;
  webhook_success: number;
  webhook_errors: number;
  webhook_pending: number;
  today_leads: number;
  week_leads: number;
  month_leads: number;
}

export default function AdminDashboard() {
  const { stats: leadStats, loading: leadsLoading, error: leadsError, refreshStats } = useLeads();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_leads: 0,
    unique_leads: 0,
    duplicate_leads: 0,
    webhook_success: 0,
    webhook_errors: 0,
    webhook_pending: 0,
    today_leads: 0,
    week_leads: 0,
    month_leads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Buscar estatísticas detalhadas do dashboard
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/leads/stats');
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setDashboardStats({
          total_leads: result.data.total_leads || 0,
          unique_leads: result.data.unique_leads || 0,
          duplicate_leads: result.data.duplicate_leads || 0,
          webhook_success: result.data.webhook_success || 0,
          webhook_errors: result.data.webhook_errors || 0,
          webhook_pending: result.data.webhook_pending || 0,
          today_leads: result.data.today_leads || 0,
          week_leads: result.data.week_leads || 0,
          month_leads: result.data.month_leads || 0,
        });
      } else {
        throw new Error(result.message || 'Erro ao buscar dados');
      }
    } catch (err) {
      console.error('❌ Erro ao buscar stats:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Calcular taxa de conversão estimada
  const estimatedViews = Math.max(dashboardStats.total_leads * 50, 1000);
  const conversionRate = dashboardStats.total_leads > 0 
    ? ((dashboardStats.total_leads / estimatedViews) * 100).toFixed(2)
    : "0.00";

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">Erro ao carregar dashboard: {error}</p>
          <button 
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral dos leads e atividades</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : dashboardStats.total_leads.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600">
                  {dashboardStats.unique_leads} únicos • {dashboardStats.duplicate_leads} duplicados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : `${conversionRate}%`}
                </p>
                <p className="text-xs text-green-600">
                  Estimativa baseada em {estimatedViews.toLocaleString()} visualizações
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Leads Hoje</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : dashboardStats.today_leads}
                </p>
                <p className="text-xs text-yellow-600">
                  Esta semana: {dashboardStats.week_leads}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Webhooks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : dashboardStats.webhook_success}
                </p>
                <p className="text-xs text-purple-600">
                  Sucessos • {dashboardStats.webhook_errors} erros
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividade recente */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg mr-4">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
