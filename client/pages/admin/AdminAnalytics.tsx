import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useAnalytics } from "../../hooks/useAnalytics";
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  TrendingUp,
  Users,
  Eye,
  Target,
  Clock,
  Calendar,
  Globe,
  MousePointer,
  RefreshCw,
  ChevronDown,
  Download,
  MessageCircle,
  MapPin,
  BarChart3,
  Loader2
} from "lucide-react";

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const { overview, dailyStats, timeAnalysis, trafficSources, locationConversion, geographyConversion, loading, error, refreshData } = useAnalytics(selectedPeriod);

  const isLoading = loading;

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh dos dados de analytics...');
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  const handlePeriodChange = (days: number) => {
    setSelectedPeriod(days);
  };

  const exportToExcel = async () => {
    try {
      // Buscar dados brutos da API
      const queryParam = selectedPeriod === 0 ? 'yesterday=true' : `days=${selectedPeriod}`;
      const response = await fetch(`/api/analytics/export-data?${queryParam}`);

      if (!response.ok) {
        throw new Error('Erro ao buscar dados para exportação');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar dados');
      }

      const { leads, events } = result.data;

      // Criar workbook
      const wb = XLSX.utils.book_new();

      // Aba 1: Dados Brutos dos Leads
      if (leads && leads.length > 0) {
        const leadsData = [
          [
            'ID', 'Nome', 'Telefone/WhatsApp', 'Tem CNPJ', 'Tipo Loja',
            'É Duplicado', 'Fonte', 'UTM Source', 'UTM Medium', 'UTM Campaign',
            'Status Webhook', 'Resposta Webhook', 'Data/Hora Criação'
          ]
        ];

        leads.forEach(lead => {
          leadsData.push([
            lead.id,
            lead.nome,
            lead.telefone,
            lead.experiencia_revenda === 'sim' ? 'Sim' : 'Não',
            lead.tipo_loja || 'Não informado',
            lead.is_duplicate ? 'Sim' : 'Não',
            lead.source || 'Direto',
            lead.utm_source || '',
            lead.utm_medium || '',
            lead.utm_campaign || '',
            lead.webhook_status || 'Pendente',
            lead.webhook_response || '',
            new Date(lead.created_at).toLocaleString('pt-BR')
          ]);
        });

        const ws1 = XLSX.utils.aoa_to_sheet(leadsData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Leads (Dados Brutos)');
      }

      // Aba 2: Dados Brutos de Eventos/Visitas
      if (events && events.length > 0) {
        const eventsData = [
          [
            'Session ID', 'User ID', 'Tipo Evento', 'IP Address',
            'Referrer', 'URL Página', 'Duração (segundos)', 'Data/Hora'
          ]
        ];

        events.forEach(event => {
          eventsData.push([
            event.session_id,
            event.user_id || '',
            event.event_type,
            event.ip_address || '',
            event.referrer || 'Direto',
            event.page_url || '',
            event.duration_seconds || 0,
            new Date(event.created_at).toLocaleString('pt-BR')
          ]);
        });

        const ws2 = XLSX.utils.aoa_to_sheet(eventsData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Eventos (Dados Brutos)');
      }

      // Aba 3: Resumo Executivo (dados agregados para referência)
      const summaryData = [
        ['Métrica', 'Valor'],
        ['Total de Leads', leads?.length || 0],
        ['Leads Únicos', leads?.filter(l => !l.is_duplicate).length || 0],
        ['Leads Duplicados', leads?.filter(l => l.is_duplicate).length || 0],
        ['Leads com CNPJ', leads?.filter(l => l.experiencia_revenda === 'sim').length || 0],
        ['Total de Eventos', events?.length || 0],
        ['Cliques WhatsApp', events?.filter(e => e.event_type === 'whatsapp_click').length || 0],
        ['Visualizações Únicas', overview?.traffic.unique_page_views || 0],
        ['Sessões Únicas', new Set(events?.map(e => e.session_id) || []).size],
        ['Usuários Únicos', new Set(events?.map(e => e.user_id) || []).size],
        ['Loja Física', leads?.filter(l => l.tipo_loja === 'fisica').length || 0],
        ['Loja Online', leads?.filter(l => l.tipo_loja === 'online').length || 0],
        ['Ambas', leads?.filter(l => l.tipo_loja === 'ambas').length || 0],
        ['', ''],
        ['Período Exportado', selectedPeriod === 0 ? 'Ontem' : selectedPeriod === 1 ? 'Hoje' : `Últimos ${selectedPeriod} dias`],
        ['Data da Exportação', new Date().toLocaleString('pt-BR')],
      ];

      const ws3 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Resumo Executivo');

      // Gerar e baixar arquivo
      const periodText = selectedPeriod === 1 ? 'hoje' :
                         selectedPeriod === 0 ? 'ontem' :
                         `ultimos_${selectedPeriod}_dias`;
      const fileName = `dados_brutos_ecko_${periodText}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

    } catch (error) {
      console.error('Erro ao exportar dados brutos:', error);
      alert('Erro ao gerar arquivo Excel com dados brutos. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ecko-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Erro ao carregar dados'}</p>
          <Button onClick={refreshData} className="bg-ecko-red hover:bg-ecko-red-dark">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Dados para gráfico de leads diários
  const dailyLeadsData = {
    labels: dailyStats.map(stat => {
      const date = new Date(stat.date);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }),
    datasets: [
      {
        label: 'Total de Leads',
        data: dailyStats.map(stat => stat.total_leads),
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Leads Únicos',
        data: dailyStats.map(stat => stat.unique_leads),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  // Dados para gráfico de conversão
  const conversionData = {
    labels: dailyStats.map(stat => {
      const date = new Date(stat.date);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }),
    datasets: [
      {
        label: 'Taxa de Conversão (%)',
        data: dailyStats.map(stat => stat.conversion_rate),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  // Dados para gráfico de horários
  const hourlyData = timeAnalysis && timeAnalysis.hourly_stats && timeAnalysis.hourly_stats.length > 0 ? {
    labels: timeAnalysis.hourly_stats.map(stat => `${stat.hour}:00`),
    datasets: [
      {
        label: 'Leads por Hora',
        data: timeAnalysis.hourly_stats.map(stat => stat.total_leads),
        backgroundColor: 'rgba(220, 38, 38, 0.7)',
        borderColor: '#dc2626',
        borderWidth: 1,
      }
    ],
  } : null;

  // Dados para gráfico de dias da semana
  const weekdayData = timeAnalysis && timeAnalysis.weekday_stats && timeAnalysis.weekday_stats.length > 0 ? {
    labels: timeAnalysis.weekday_stats.map(stat => stat.weekday_name),
    datasets: [
      {
        label: 'Leads por Dia da Semana',
        data: timeAnalysis.weekday_stats.map(stat => stat.total_leads),
        backgroundColor: [
          '#dc2626', '#16a34a', '#2563eb', '#ca8a04',
          '#7c3aed', '#dc2626', '#6b7280'
        ],
        borderWidth: 0,
      }
    ],
  } : null;

  // Dados para gráfico de tipos de loja
  const storeTypesData = {
    labels: ['Loja Física', 'Online', 'Ambas'],
    datasets: [
      {
        data: [overview.store_types.fisica, overview.store_types.online, overview.store_types.ambas],
        backgroundColor: ['#dc2626', '#16a34a', '#2563eb'],
        borderWidth: 0,
      }
    ],
  };

  // Dados para gráfico de fontes de tráfego
  const trafficSourcesData = trafficSources ? {
    labels: trafficSources.sources.slice(0, 5).map(source => source.source_name),
    datasets: [
      {
        data: trafficSources.sources.slice(0, 5).map(source => source.total_leads),
        backgroundColor: ['#dc2626', '#16a34a', '#2563eb', '#ca8a04', '#7c3aed'],
        borderWidth: 0,
      }
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Análise completa de conversão, tráfego e performance da landing page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
          >
            <option value={1}>Hoje</option>
            <option value={0}>Ontem</option>
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={60}>Últimos 60 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
          
          <Button
            onClick={exportToExcel}
            variant="outline"
            size="sm"
            className="border-green-300 text-green-700 hover:bg-green-50"
            disabled={loading || !overview}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados Brutos
          </Button>

          <Button
            onClick={() => {
              try {
                const trafficData = JSON.parse(localStorage.getItem('traffic_sources') || '[]');
                console.table(trafficData);
                alert(`${trafficData.length} origens de tráfego encontradas. Veja o console para detalhes.`);
              } catch (e) {
                alert('Erro ao carregar dados de tráfego');
              }
            }}
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Globe className="w-4 h-4 mr-2" />
            Ver Origens
          </Button>

          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Leads */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total de Leads</p>
                <p className="text-2xl font-bold text-blue-900">{overview.leads.total}</p>
                <p className="text-xs text-blue-600">
                  +{overview.leads.period} nos últimos {overview.period_days} dias
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Conversão */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-green-900">{overview.conversion.rate}%</p>
                <p className="text-xs text-green-600">
                  {overview.conversion.period_rate}% no período
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usuários Únicos */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Usuários Únicos</p>
                <p className="text-2xl font-bold text-purple-900">{overview.traffic.unique_users}</p>
                <p className="text-xs text-purple-600">
                  {overview.traffic.avg_sessions_per_user} sessões/usuário
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total de Sessões */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-600">Total Sessões</p>
                <p className="text-2xl font-bold text-orange-900">{overview.traffic.total_sessions}</p>
                <p className="text-xs text-orange-600">
                  {Math.floor(overview.traffic.avg_session_duration / 60)}m {overview.traffic.avg_session_duration % 60}s média
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de métricas - Segmentação de Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Usuários Novos */}
        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-cyan-500 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-cyan-600">Usuários Novos</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                    <span className="text-gray-400">Carregando...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-cyan-900">{overview.traffic.new_users}</p>
                    <p className="text-xs text-cyan-600">
                      {overview.traffic.unique_users > 0 ? ((overview.traffic.new_users / overview.traffic.unique_users) * 100).toFixed(1) : 0}% do total
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usuários Recorrentes */}
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-teal-500 rounded-lg">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-teal-600">Usuários Recorrentes</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                    <span className="text-gray-400">Carregando...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-teal-900">{overview.traffic.returning_users}</p>
                    <p className="text-xs text-teal-600">
                      {overview.traffic.unique_users > 0 ? ((overview.traffic.returning_users / overview.traffic.unique_users) * 100).toFixed(1) : 0}% do total
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Rejeição */}
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-amber-600">Taxa de Rejeição</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                    <span className="text-gray-400">Carregando...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-amber-900">{overview.traffic.bounce_rate}%</p>
                    <p className="text-xs text-amber-600">
                      Sessões de página única
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for grid alignment */}
        <div></div>
      </div>

      {/* Terceira linha de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Cliques WhatsApp */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Cliques WhatsApp</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold text-green-900">{overview.traffic.whatsapp_clicks}</p>
                  <button
                    onClick={() => {
                      console.log('🔄 Atualizando dados...');
                      refreshData();
                    }}
                    className="text-xs text-green-600 underline hover:text-green-800"
                  >
                    Atualizar
                  </button>
                </div>
                <p className="text-xs text-green-600">
                  Interesse demonstrado
                </p>
                <button
                  onClick={() => {
                    try {
                      const clicks = JSON.parse(localStorage.getItem('whatsapp_clicks') || '[]');
                      console.log('📱 Cliques locais:', clicks.length);
                      alert(`Cliques salvos localmente: ${clicks.length}`);
                    } catch (e) {
                      alert('Erro ao verificar cliques locais');
                    }
                  }}
                  className="text-xs text-blue-600 underline mt-1 block"
                >
                  Ver cliques locais
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visualizações Únicas por Page view total */}
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-600">Visualizações Únicas</p>
                <p className="text-2xl font-bold text-indigo-900">
                  {overview.traffic.unique_page_views} / {overview.traffic.total_page_views}
                </p>
                <p className="text-xs text-indigo-600">
                  {overview.traffic.total_page_views > 0
                    ? `${((overview.traffic.unique_page_views / overview.traffic.total_page_views) * 100).toFixed(1)}% de unicidade`
                    : 'Sem dados de p��gina'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Leads Únicos */}
        <Card className="bg-gradient-to-br from-ecko-red/10 to-ecko-red/20 border-ecko-red/30">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-ecko-red rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ecko-red">Leads Únicos</p>
                <p className="text-2xl font-bold text-ecko-red-dark">{overview.leads.unique}</p>
                <p className="text-xs text-ecko-red">
                  {overview.leads.duplicates} duplicados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Leads Diários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-ecko-red" />
              Leads Diários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Line data={dailyLeadsData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Taxa de Conversão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Line data={conversionData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise Temporal */}
      {timeAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Melhor Horário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Análise por Horário
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge className="bg-blue-100 text-blue-800">
                  Melhor horário: {timeAnalysis.best_hour.formatted}
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  {timeAnalysis.best_hour.total_leads} leads
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ height: '250px' }}>
                {hourlyData ? (
                  <Bar data={hourlyData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Sem dados suficientes para análise por horário</p>
                      <p className="text-sm">Aguarde mais leads serem coletados</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Melhor Dia da Semana */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Análise por Dia da Semana
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge className="bg-purple-100 text-purple-800">
                  Melhor dia: {timeAnalysis.best_weekday.name}
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  {timeAnalysis.best_weekday.total_leads} leads
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ height: '250px' }}>
                {weekdayData ? (
                  <Doughnut data={weekdayData} options={doughnutOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Sem dados suficientes para análise por dia da semana</p>
                      <p className="text-sm">Aguarde mais leads serem coletados</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Análise de Tipos de Loja e Tráfego */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tipos de Loja */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MousePointer className="w-5 h-5 mr-2 text-orange-600" />
              Distribuição por Tipo de Loja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '250px' }}>
              <Doughnut data={storeTypesData} options={doughnutOptions} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-ecko-red">{overview.store_types.fisica}</p>
                <p className="text-sm text-gray-600">Física</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{overview.store_types.online}</p>
                <p className="text-sm text-gray-600">Online</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{overview.store_types.ambas}</p>
                <p className="text-sm text-gray-600">Ambas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fontes de Tráfego */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-indigo-600" />
              Fontes de Tráfego
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              {trafficSources ? `${trafficSources.total_visits} visitas rastreadas` : 'Dados de origem do tráfego'}
            </p>
          </CardHeader>
          <CardContent>
            <div style={{ height: '250px' }}>
              {trafficSourcesData && <Doughnut data={trafficSourcesData} options={doughnutOptions} />}
            </div>
            {trafficSources && trafficSources.sources.length > 0 ? (
              <div className="mt-4 space-y-3">
                {trafficSources.sources.slice(0, 5).map((source, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{
                        backgroundColor: ['#dc2626', '#16a34a', '#2563eb', '#ca8a04', '#7c3aed'][index] || '#6b7280'
                      }}></div>
                      <span className="font-medium text-gray-900">{source.source_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        {source.total_visits} visitas
                      </Badge>
                      <span className="text-sm text-gray-500">{source.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-center text-gray-500">
                <Globe className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma fonte de tráfego rastreada ainda</p>
                <p className="text-sm">Aguarde visitantes para ver as origens</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Análise Detalhada de Origens de Tráfego */}
      {trafficSources && trafficSources.referrers && trafficSources.referrers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2 text-cyan-600" />
              Análise Detalhada de Origens
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Detalhamento completo de onde seus visitantes vieram
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Referrers Principais */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">🌐 Principais Referrers</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {trafficSources.referrers.slice(0, 10).map((ref, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center min-w-0 flex-1">
                        <span className="text-2xl mr-3">
                          {ref.referrer === 'Direto' ? '🔗' :
                           ref.referrer === 'Google' ? '🔍' :
                           ref.referrer === 'Facebook' ? '📘' :
                           ref.referrer === 'Instagram' ? '📷' :
                           ref.referrer === 'WhatsApp' ? '💬' :
                           ref.referrer === 'YouTube' ? '📺' : '🌐'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">
                            {ref.referrer === 'Direto' ? 'Acesso Direto' : ref.referrer}
                          </p>
                          <p className="text-sm text-gray-500">
                            {ref.referrer === 'Direto' ? 'URL digitada diretamente' : 'Referido por este site'}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-cyan-100 text-cyan-800 ml-2">
                        {ref.visits}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo de Canais */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">📊 Resumo por Canal</h4>
                <div className="space-y-3">
                  {trafficSources.sources.map((source, index) => {
                    const percentage = parseFloat(source.percentage);
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{source.source_name}</span>
                          <span className="text-sm font-bold text-gray-900">{source.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: ['#dc2626', '#16a34a', '#2563eb', '#ca8a04', '#7c3aed'][index] || '#6b7280'
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">{source.total_visits} visitas</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detalhes UTM e Campanhas */}
      {trafficSources && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-cyan-600" />
              Análise Detalhada de Tráfego
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* UTM Sources */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Fontes UTM</h4>
                <div className="space-y-2">
                  {trafficSources.utm_sources.slice(0, 5).map((source, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{source.source}</span>
                      <Badge variant="outline">{source.total_leads}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* UTM Mediums */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Mídias UTM</h4>
                <div className="space-y-2">
                  {trafficSources.utm_mediums.slice(0, 5).map((medium, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{medium.medium}</span>
                      <Badge variant="outline">{medium.total_leads}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* UTM Campaigns */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Campanhas UTM</h4>
                <div className="space-y-2">
                  {trafficSources.utm_campaigns.slice(0, 5).map((campaign, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{campaign.campaign}</span>
                      <Badge variant="outline">{campaign.total_leads}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversão por Localização da Página */}
      {locationConversion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-violet-600" />
              Conversão por Localização da Página
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Análise de conversão por seção da landing page onde o lead foi gerado
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-700">Localização</th>
                    <th className="text-center p-3 font-medium text-gray-700">Total Leads</th>
                    <th className="text-center p-3 font-medium text-gray-700">Leads Únicos</th>
                    <th className="text-center p-3 font-medium text-gray-700">Com CNPJ</th>
                    <th className="text-center p-3 font-medium text-gray-700">Webhook Success</th>
                    <th className="text-center p-3 font-medium text-gray-700">Taxa Sucesso</th>
                  </tr>
                </thead>
                <tbody>
                  {locationConversion.location_conversion.map((location, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-violet-500 mr-2"></div>
                          <span className="font-medium">{location.location_label}</span>
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <Badge className="bg-blue-100 text-blue-800">{location.total_leads}</Badge>
                      </td>
                      <td className="text-center p-3">
                        <Badge className="bg-green-100 text-green-800">{location.unique_leads}</Badge>
                      </td>
                      <td className="text-center p-3">
                        <Badge className="bg-purple-100 text-purple-800">{location.with_cnpj}</Badge>
                      </td>
                      <td className="text-center p-3">
                        <Badge className="bg-emerald-100 text-emerald-800">{location.successful_webhooks}</Badge>
                      </td>
                      <td className="text-center p-3">
                        <Badge className="bg-orange-100 text-orange-800">{location.webhook_success_rate}%</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversão por Geografia (Estados e Cidades) */}
      {geographyConversion && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversão por Estados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-600" />
                Conversão por Estado
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Top {Math.min(10, geographyConversion.state_conversion.length)} estados com mais leads
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {geographyConversion.state_conversion.slice(0, 10).map((state, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-red-600">{state.estado}</span>
                      </div>
                      <div>
                        <p className="font-medium">{state.estado}</p>
                        <p className="text-xs text-gray-500">
                          {state.with_cnpj} com CNPJ • {state.webhook_success_rate}% sucesso
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-red-100 text-red-800 mb-1">{state.total_leads}</Badge>
                      <div className="text-xs text-gray-500">
                        {state.unique_leads} únicos
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conversão por Cidades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Conversão por Cidade
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Top {Math.min(10, geographyConversion.city_conversion.length)} cidades com mais leads
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {geographyConversion.city_conversion.slice(0, 10).map((city, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{city.cidade}</p>
                        <p className="text-xs text-gray-500">
                          {city.estado} • {city.with_cnpj} com CNPJ • {city.webhook_success_rate}% sucesso
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-100 text-blue-800 mb-1">{city.total_leads}</Badge>
                      <div className="text-xs text-gray-500">
                        {city.unique_leads} únicos
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
