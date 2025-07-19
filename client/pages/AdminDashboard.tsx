import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import AdminLayout from "../components/AdminLayout";
import {
  Users,
  Settings as SettingsIcon,
  BarChart3,
  Image,
  MessageSquare,
  HelpCircle,
  Palette,
  Search,
  Globe,
  Webhook,
  TrendingUp,
  Activity,
  AlertTriangle,
  Eye,
  RefreshCw,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DailyStatsResponse } from "@shared/api";

export default function AdminDashboard() {
  const [dailyStats, setDailyStats] = useState<DailyStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyStats();
  }, []);

  const fetchDailyStats = async () => {
    try {
      const response = await fetch("/api/analytics/daily?days=7");
      const data: DailyStatsResponse = await response.json();
      setDailyStats(data);
    } catch (error) {
      console.error("Error fetching daily stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Analytics de Leads",
      description: "Análise detalhada com gráficos e conversões",
      icon: BarChart3,
      color: "bg-blue-600 hover:bg-blue-700",
      href: "/admin/analytics",
    },
    {
      title: "Configurações",
      description: "Webhook, SEO, Tema e outras configurações",
      icon: SettingsIcon,
      color: "bg-gray-600 hover:bg-gray-700",
      href: "/admin/settings",
    },
    {
      title: "Gerenciar Hero",
      description: "Configurar seção principal da landing page",
      icon: Eye,
      color: "bg-purple-600 hover:bg-purple-700",
      href: "/admin/hero",
    },
    {
      title: "Gerenciar Galeria",
      description: "Upload e organização de imagens",
      icon: Image,
      color: "bg-green-600 hover:bg-green-700",
      href: "/admin/gallery",
    },
    {
      title: "Gerenciar Depoimentos",
      description: "Adicionar e editar depoimentos de clientes",
      icon: MessageSquare,
      color: "bg-red-600 hover:bg-red-700",
      href: "/admin/testimonials",
    },
    {
      title: "Gerenciar FAQs",
      description: "Perguntas frequentes da landing page",
      icon: HelpCircle,
      color: "bg-indigo-600 hover:bg-indigo-700",
      href: "/admin/faqs",
    },
  ];

  const settingsCards = [
    {
      title: "Configurações de Webhook",
      description: "URL, timeout e configurações de envio",
      icon: Webhook,
      color: "text-blue-600",
      href: "/admin/settings?tab=webhook",
    },
    {
      title: "Tema e Cores",
      description: "Personalizar paleta de cores da LP",
      icon: Palette,
      color: "text-purple-600",
      href: "/admin/settings?tab=theme",
    },
    {
      title: "Configurações SEO",
      description: "Meta tags, título e otimizações",
      icon: Globe,
      color: "text-green-600",
      href: "/admin/settings?tab=seo",
    },
  ];

  const recentStats = dailyStats?.stats.slice(0, 7) || [];
  const today = recentStats[0];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Painel Administrativo
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie todos os aspectos da sua landing page Ecko
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchDailyStats}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total de Leads
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {loading ? "..." : dailyStats?.summary.total_leads || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {loading
                      ? "..."
                      : `+${dailyStats?.summary.today_leads || 0} hoje`}
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
                  <p className="text-3xl font-bold text-green-600">15%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Baseado nos últimos 30 dias
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Webhooks Pendentes
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {loading
                      ? "..."
                      : dailyStats?.summary.webhooks_pending || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Necessitam reenvio
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Leads Duplicados
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {loading
                      ? "..."
                      : dailyStats?.summary.duplicates_today || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Detectados hoje</p>
                </div>
                <Activity className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`p-3 rounded-lg ${action.color} transition-colors`}
                      >
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {action.description}
                        </p>
                        <div className="flex items-center mt-3 text-sm text-blue-600 group-hover:text-blue-700">
                          Acessar
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Settings Quick Access */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Configurações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {settingsCards.map((setting, index) => (
              <Link key={index} to={setting.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <setting.icon className={`w-8 h-8 ${setting.color}`} />
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {setting.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {setting.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Leads dos Últimos 7 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : recentStats.length > 0 ? (
                <div className="space-y-3">
                  {recentStats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">
                          {new Date(stat.date).toLocaleDateString("pt-BR", {
                            weekday: "short",
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">
                          {stat.total_leads} leads
                        </Badge>
                        <Badge
                          variant={
                            stat.webhook_sent > 0 ? "default" : "secondary"
                          }
                          className={
                            stat.webhook_sent > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {stat.webhook_sent} webhooks
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  Nenhum dado encontrado
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database</span>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Landing Page</span>
                  <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Webhook Service</span>
                  <Badge className="bg-green-100 text-green-800">
                    Funcionando
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Analytics</span>
                  <Badge className="bg-green-100 text-green-800">
                    Coletando
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Backup</span>
                  <Badge variant="outline">
                    Último: {new Date().toLocaleDateString("pt-BR")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
