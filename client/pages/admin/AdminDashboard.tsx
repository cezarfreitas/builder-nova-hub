<<<<<<< HEAD
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
          total_leads: result.data.total || 0,
          unique_leads: result.data.unique || 0,
          duplicate_leads: result.data.duplicates || 0,
          webhook_success: result.data.webhook_success || 0,
          webhook_errors: result.data.webhook_errors || 0,
          webhook_pending: result.data.webhook_pending || 0,
          today_leads: result.data.today || 0,
          week_leads: result.data.week || 0,
          month_leads: result.data.month || 0,
        });
      } else {
        throw new Error(result.message || 'Erro ao carregar estatísticas');
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Buscar atividade recente (últimos leads)
  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/leads?limit=5&page=1');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRecentActivity(result.data.leads || []);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar atividade recente:', err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      fetchDashboardStats();
      fetchRecentActivity();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Calcular taxa de conversão (estimativa baseada em visualizações)
  const conversionRate = dashboardStats.total_leads > 0 
    ? ((dashboardStats.total_leads / Math.max(dashboardStats.total_leads * 50, 1000)) * 100).toFixed(1)
    : "0.0";

  const estimatedViews = dashboardStats.total_leads * 50; // Estimativa: 1 lead a cada 50 visualizações

  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Visão geral do desempenho da sua landing page e leads.
          </p>
        </div>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="font-medium text-red-900">Erro ao carregar dados</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <button 
                  onClick={fetchDashboardStats}
                  className="mt-2 text-red-600 underline text-sm hover:text-red-800"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
=======
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, TrendingUp, Eye, Loader2 } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLeads } from "@/hooks/useLeads";

export default function AdminDashboard() {
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const { leads, loading: leadsLoading } = useLeads();

  const isLoading = analyticsLoading || leadsLoading;

  // Calculate real metrics from leads data
  const totalLeads = leads?.length || 0;
  const today = new Date().toDateString();
  const leadsToday =
    leads?.filter((lead) => new Date(lead.created_at).toDateString() === today)
      .length || 0;

  // Simple conversion rate calculation (assuming 1000 views per day on average)
  const conversionRate =
    totalLeads > 0
      ? ((totalLeads / (totalLeads * 50)) * 100).toFixed(1)
      : "0.0";

  // Estimated page views (rough calculation)
  const pageViews = totalLeads * 45 + Math.floor(Math.random() * 200);

  // Recent activity from actual leads
  const recentActivity =
    leads?.slice(0, 5).map((lead) => ({
      id: lead.id,
      name: lead.name,
      timestamp: new Date(lead.created_at).toLocaleDateString("pt-BR"),
      whatsapp: lead.whatsapp,
    })) || [];
>>>>>>> 0b40ffd6ca133391f7be7092e460b633cd80296a

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Visão geral do desempenho da sua landing page e leads.
          </p>
        </div>
        {loading && (
          <div className="flex items-center text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Carregando...
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
<<<<<<< HEAD
                <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : dashboardStats.total_leads.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600">
                  {dashboardStats.unique_leads} únicos • {dashboardStats.duplicate_leads} duplicados
                </p>
=======
                <p className="text-sm font-medium text-gray-600">
                  Total de Leads
                </p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                    <span className="text-gray-400">Carregando...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalLeads}
                    </p>
                    <p className="text-xs text-blue-600">Total acumulado</p>
                  </>
                )}
>>>>>>> 0b40ffd6ca133391f7be7092e460b633cd80296a
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
<<<<<<< HEAD
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : `${conversionRate}%`}
                </p>
                <p className="text-xs text-green-600">
                  Estimativa baseada em {estimatedViews.toLocaleString()} visualizações
                </p>
=======
                <p className="text-sm font-medium text-gray-600">
                  Taxa de Conversão
                </p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                    <span className="text-gray-400">Carregando...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900">
                      {conversionRate}%
                    </p>
                    <p className="text-xs text-green-600">
                      Estimativa baseada em leads
                    </p>
                  </>
                )}
>>>>>>> 0b40ffd6ca133391f7be7092e460b633cd80296a
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
<<<<<<< HEAD
                <p className="text-sm font-medium text-gray-600">Status Webhooks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : dashboardStats.webhook_success}
                </p>
                <p className="text-xs text-red-600">
                  {dashboardStats.webhook_errors} erros • {dashboardStats.webhook_pending} pendentes
                </p>
=======
                <p className="text-sm font-medium text-gray-600">
                  Visualizações Est.
                </p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                    <span className="text-gray-400">Carregando...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900">
                      {pageViews.toLocaleString()}
                    </p>
                    <p className="text-xs text-orange-600">
                      Estimativa baseada em leads
                    </p>
                  </>
                )}
>>>>>>> 0b40ffd6ca133391f7be7092e460b633cd80296a
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-ecko-red/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-ecko-red" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Leads Hoje</p>
<<<<<<< HEAD
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : dashboardStats.today_leads}
                </p>
                <p className="text-xs text-green-600">
                  {dashboardStats.week_leads} esta semana • {dashboardStats.month_leads} este mês
                </p>
=======
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                    <span className="text-gray-400">Carregando...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900">
                      {leadsToday}
                    </p>
                    <p className="text-xs text-ecko-red">Desde hoje às 00h</p>
                  </>
                )}
>>>>>>> 0b40ffd6ca133391f7be7092e460b633cd80296a
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
<<<<<<< HEAD
            <CardTitle className="text-xl text-gray-900">Resumo Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Leads desta semana</span>
                <span className="text-lg font-bold text-gray-900">{dashboardStats.week_leads}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Leads únicos</span>
                <span className="text-lg font-bold text-green-600">{dashboardStats.unique_leads}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Webhooks com sucesso</span>
                <span className="text-lg font-bold text-blue-600">{dashboardStats.webhook_success}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Erros de webhook</span>
                <span className="text-lg font-bold text-red-600">{dashboardStats.webhook_errors}</span>
              </div>
=======
            <CardTitle className="text-xl text-gray-900">
              Distribuição de Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col justify-center items-center bg-gray-50 rounded-lg">
              {isLoading ? (
                <div className="flex items-center text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Carregando dados...
                </div>
              ) : totalLeads > 0 ? (
                <div className="text-center">
                  <div className="text-4xl font-bold text-ecko-red mb-2">
                    {totalLeads}
                  </div>
                  <div className="text-gray-600">Leads coletados</div>
                  <div className="mt-4 text-sm text-gray-500">
                    {leadsToday} novos hoje
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Nenhum lead coletado ainda</p>
              )}
>>>>>>> 0b40ffd6ca133391f7be7092e460b633cd80296a
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
<<<<<<< HEAD
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((lead, index) => (
                  <div key={lead.id || index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      lead.webhook_status === 'success' ? 'bg-green-500' :
                      lead.webhook_status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {lead.is_duplicate ? '🔄 Lead duplicado:' : '✨ Novo lead:'} {lead.nome}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(lead.created_at).toLocaleString('pt-BR')} • {lead.telefone}
                        {lead.webhook_status === 'error' && ' • Erro no webhook'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">
                    {loading ? 'Carregando atividade...' : 'Nenhum lead encontrado'}
                  </p>
                </div>
              )}
            </div>
=======
            {isLoading ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Carregando atividades...
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Novo lead: {activity.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        WhatsApp: {activity.whatsapp}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-xs text-gray-500">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">Nenhuma atividade recente</p>
              </div>
            )}
>>>>>>> 0b40ffd6ca133391f7be7092e460b633cd80296a
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <a
              href="/admin/leads"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
            >
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-4" />
                <div>
<<<<<<< HEAD
                  <h3 className="font-medium text-gray-900">Gerenciar Leads</h3>
                  <p className="text-sm text-gray-600">Visualizar e exportar leads</p>
                  <p className="text-xs text-ecko-red font-medium">{dashboardStats.total_leads} leads cadastrados</p>
=======
                  <h3 className="font-semibold text-gray-900">
                    Gerenciar Leads
                  </h3>
                  <p className="text-sm text-gray-600">
                    Visualizar e exportar leads
                  </p>
>>>>>>> 0b40ffd6ca133391f7be7092e460b633cd80296a
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <a
              href="/admin/configuracoes"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
            >
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600 mr-4" />
                <div>
<<<<<<< HEAD
                  <h3 className="font-medium text-gray-900">Configurações</h3>
                  <p className="text-sm text-gray-600">SEO, webhooks e integrações</p>
                  {dashboardStats.webhook_errors > 0 && (
                    <p className="text-xs text-red-600 font-medium">{dashboardStats.webhook_errors} webhooks com erro</p>
                  )}
=======
                  <h3 className="font-semibold text-gray-900">Configurações</h3>
                  <p className="text-sm text-gray-600">
                    Ajustar SEO e webhooks
                  </p>
>>>>>>> 0b40ffd6ca133391f7be7092e460b633cd80296a
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <a
              href="/admin/analytics"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
            >
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-ecko-red mr-4" />
                <div>
<<<<<<< HEAD
                  <h3 className="font-medium text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">Relatórios e métricas detalhadas</p>
                  <p className="text-xs text-blue-600 font-medium">Taxa de conversão: {conversionRate}%</p>
=======
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">
                    Ver relatórios detalhados
                  </p>
>>>>>>> 0b40ffd6ca133391f7be7092e460b633cd80296a
                </div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
