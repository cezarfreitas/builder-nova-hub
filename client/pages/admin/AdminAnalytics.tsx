import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useAnalytics } from "../../hooks/useAnalytics";
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
  ChevronDown
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
  const { overview, dailyStats, timeAnalysis, trafficSources, loading, error, refreshData } = useAnalytics(selectedPeriod);

  const handlePeriodChange = (days: number) => {
    setSelectedPeriod(days);
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
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={60}>Últimos 60 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
          
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

        {/* Sessões/Visitas */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Total de Sessões</p>
                <p className="text-2xl font-bold text-purple-900">{overview.traffic.total_sessions}</p>
                <p className="text-xs text-purple-600">
                  {overview.traffic.period_page_views} visualizações no período
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
                <TrendingUp className="w-6 h-6 text-white" />
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
                {hourlyData && <Bar data={hourlyData} options={chartOptions} />}
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
                {weekdayData && <Doughnut data={weekdayData} options={doughnutOptions} />}
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
              Principais Fontes de Tráfego
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '250px' }}>
              {trafficSourcesData && <Doughnut data={trafficSourcesData} options={doughnutOptions} />}
            </div>
            {trafficSources && (
              <div className="mt-4 space-y-2">
                {trafficSources.sources.slice(0, 3).map((source, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{source.source_name}</span>
                    <Badge className="bg-gray-100 text-gray-800">
                      {source.total_leads} leads
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}
