import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import AdminLayout from "../components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Monitor,
  Smartphone,
  Tablet,
  Users,
  Target,
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Eye,
  Clock,
  MousePointer,
  Building,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
} from "lucide-react";

interface SessionSummary {
  total_sessions: number;
  converted_sessions: number;
  avg_duration: number;
  avg_page_views: number;
  bounce_sessions: number;
  today_sessions: number;
  utm_sessions: number;
  conversion_rate: string;
  bounce_rate: string;
}

interface DailyStat {
  date: string;
  sessions: number;
  conversions: number;
  avg_duration: number;
  bounces: number;
}

interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  conversions: number;
  avg_duration: number;
}

interface DeviceStat {
  device_type: "desktop" | "mobile" | "tablet";
  sessions: number;
  conversions: number;
  avg_duration: number;
}

interface ConversionSummary {
  total_conversions: number;
  unique_sessions: number;
  form_conversions: number;
  phone_conversions: number;
  email_conversions: number;
  social_conversions: number;
  no_store_conversions: number;
  today_conversions: number;
}

interface FunnelStep {
  step: string;
  count: number;
  step_order: number;
}

interface RecentConversion {
  id: number;
  session_id: string;
  conversion_type: string;
  conversion_value?: string;
  utm_source?: string;
  utm_medium?: string;
  device_type: string;
  browser: string;
  timestamp: string;
  lead_name?: string;
  lead_whatsapp?: string;
}

export default function SessionAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("30");

  // Session data
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(
    null,
  );
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStat[]>([]);

  // Conversion data
  const [conversionSummary, setConversionSummary] =
    useState<ConversionSummary | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [recentConversions, setRecentConversions] = useState<
    RecentConversion[]
  >([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch session analytics
      const sessionResponse = await fetch(
        `/api/analytics/sessions?days=${timeRange}`,
      );
      if (!sessionResponse.ok)
        throw new Error("Failed to fetch session analytics");
      const sessionData = await sessionResponse.json();

      // Fetch conversion analytics
      const conversionResponse = await fetch(
        `/api/analytics/conversions?days=${timeRange}`,
      );
      if (!conversionResponse.ok)
        throw new Error("Failed to fetch conversion analytics");
      const conversionData = await conversionResponse.json();

      // Update state
      setSessionSummary(sessionData.summary);
      setDailyStats(sessionData.dailyStats);
      setTrafficSources(sessionData.trafficSources);
      setDeviceStats(sessionData.deviceStats);

      setConversionSummary(conversionData.summary);
      setFunnelData(conversionData.funnelData);
      setRecentConversions(conversionData.recentConversions);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load analytics",
      );
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tablet":
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getConversionTypeLabel = (type: string) => {
    switch (type) {
      case "lead_form":
        return "Formulário";
      case "phone_click":
        return "Telefone";
      case "email_click":
        return "Email";
      case "social_click":
        return "Social";
      case "no_store_indication":
        return "Sem Loja";
      default:
        return type;
    }
  };

  const getConversionTypeColor = (type: string) => {
    switch (type) {
      case "lead_form":
        return "bg-green-100 text-green-800";
      case "phone_click":
        return "bg-blue-100 text-blue-800";
      case "email_click":
        return "bg-purple-100 text-purple-800";
      case "social_click":
        return "bg-pink-100 text-pink-800";
      case "no_store_indication":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-2">Carregando analytics...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={fetchAnalytics}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics de Sessões
            </h1>
            <p className="text-gray-600 mt-1">
              Rastreamento de sessões, origens e conversões
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button
              onClick={fetchAnalytics}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Session Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total de Sessões
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {sessionSummary?.total_sessions || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Hoje: {sessionSummary?.today_sessions || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Taxa de Conversão
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {sessionSummary?.conversion_rate || "0.00"}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {sessionSummary?.converted_sessions || 0} conversões
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Taxa de Bounce
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {sessionSummary?.bounce_rate || "0.00"}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Duração média: {sessionSummary?.avg_duration || 0}s
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Páginas por Sessão
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {sessionSummary?.avg_page_views || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tráfego UTM: {sessionSummary?.utm_sessions || 0}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Formulários
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {conversionSummary?.form_conversions || 0}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Telefone</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {conversionSummary?.phone_conversions || 0}
                  </p>
                </div>
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Social</p>
                  <p className="text-2xl font-bold text-pink-600">
                    {conversionSummary?.social_conversions || 0}
                  </p>
                </div>
                <MousePointer className="w-6 h-6 text-pink-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sem Loja</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {conversionSummary?.no_store_conversions || 0}
                  </p>
                </div>
                <Building className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hoje</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {conversionSummary?.today_conversions || 0}
                  </p>
                </div>
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Sessions Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Sessões por Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-center space-x-2">
                {dailyStats.slice(-15).map((data, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="flex flex-col space-y-1 items-center">
                      <div
                        className="bg-blue-500 w-6 transition-all duration-300 hover:bg-blue-600"
                        style={{
                          height: `${Math.max((data.sessions / Math.max(...dailyStats.map((d) => d.sessions))) * 200, 4)}px`,
                        }}
                      ></div>
                      {data.conversions > 0 && (
                        <div
                          className="bg-green-500 w-6"
                          style={{
                            height: `${Math.max((data.conversions / Math.max(...dailyStats.map((d) => d.conversions))) * 50, 2)}px`,
                          }}
                        ></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-600 mt-1 rotate-45 origin-left">
                      {new Date(data.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                    <span className="text-xs font-medium text-blue-600">
                      {data.sessions}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4 space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500"></div>
                  <span className="text-xs">Sessões</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500"></div>
                  <span className="text-xs">Conversões</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                Dispositivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deviceStats.map((device) => (
                  <div
                    key={device.device_type}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      {getDeviceIcon(device.device_type)}
                      <div>
                        <p className="font-medium capitalize">
                          {device.device_type}
                        </p>
                        <p className="text-sm text-gray-600">
                          {device.sessions} sessões • {device.conversions}{" "}
                          conversões
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        {device.sessions
                          ? (
                              (device.conversions / device.sessions) *
                              100
                            ).toFixed(1)
                          : "0.0"}
                        %
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(device.avg_duration)}s avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Origens de Tráfego</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origem</TableHead>
                    <TableHead>Meio</TableHead>
                    <TableHead>Sessões</TableHead>
                    <TableHead>Conversões</TableHead>
                    <TableHead>Taxa de Conversão</TableHead>
                    <TableHead>Duração Média</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trafficSources.map((source, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {source.source}
                      </TableCell>
                      <TableCell>{source.medium}</TableCell>
                      <TableCell>{source.sessions}</TableCell>
                      <TableCell>{source.conversions}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            source.conversions > 0 ? "default" : "secondary"
                          }
                        >
                          {source.sessions
                            ? (
                                (source.conversions / source.sessions) *
                                100
                              ).toFixed(1)
                            : "0.0"}
                          %
                        </Badge>
                      </TableCell>
                      <TableCell>{Math.round(source.avg_duration)}s</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Conversions */}
        <Card>
          <CardHeader>
            <CardTitle>Conversões Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Lead</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentConversions.slice(0, 20).map((conversion) => (
                    <TableRow key={conversion.id}>
                      <TableCell>
                        <Badge
                          className={getConversionTypeColor(
                            conversion.conversion_type,
                          )}
                        >
                          {getConversionTypeLabel(conversion.conversion_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>
                            {conversion.utm_source || "Direct"} /{" "}
                            {conversion.utm_medium || "None"}
                          </p>
                          <p className="text-gray-500">{conversion.browser}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getDeviceIcon(conversion.device_type)}
                          <span className="capitalize">
                            {conversion.device_type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {conversion.lead_name ? (
                          <div className="text-sm">
                            <p className="font-medium">
                              {conversion.lead_name}
                            </p>
                            <p className="text-gray-500">
                              {conversion.lead_whatsapp}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>
                            {new Date(conversion.timestamp).toLocaleDateString(
                              "pt-BR",
                            )}
                          </p>
                          <p className="text-gray-500">
                            {new Date(conversion.timestamp).toLocaleTimeString(
                              "pt-BR",
                            )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
