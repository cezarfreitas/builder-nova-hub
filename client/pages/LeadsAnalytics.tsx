import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Phone,
  Building,
  Calendar,
  Send,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Activity,
  Webhook,
  ArrowLeft,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Lead,
  LeadsResponse,
  DailyStatsResponse,
  WebhookLogsResponse,
} from "@shared/api";

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  converted: "bg-purple-100 text-purple-800",
};

const statusLabels = {
  new: "Novo",
  contacted: "Contatado",
  qualified: "Qualificado",
  converted: "Convertido",
};

interface ChartData {
  date: string;
  leads: number;
  conversions: number;
  webhooks_sent: number;
  webhook_failures: number;
}

interface WebhookLog {
  id: number;
  lead_id: number;
  webhook_url: string;
  request_payload: string;
  response_status?: number;
  response_body?: string;
  response_headers?: string;
  attempt_number: number;
  success: boolean;
  error_message?: string;
  sent_at: string;
}

export default function LeadsAnalytics() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [dailyStats, setDailyStats] = useState<DailyStatsResponse | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [showWebhookLogs, setShowWebhookLogs] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [sendingWebhook, setSendingWebhook] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
    fetchDailyStats();
  }, [statusFilter, currentPage]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/leads?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LeadsResponse = await response.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLeads([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyStats = async () => {
    try {
      const response = await fetch("/api/analytics/daily?days=30");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DailyStatsResponse = await response.json();
      setDailyStats(data);

      // Transform data for charts
      const chartData: ChartData[] = data.stats.map((stat) => ({
        date: new Date(stat.date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        leads: stat.total_leads,
        conversions: Math.floor(stat.total_leads * 0.15), // Mock conversion rate
        webhooks_sent: stat.webhook_sent,
        webhook_failures: stat.webhook_failed,
      }));
      setChartData(chartData.reverse());
    } catch (error) {
      console.error("Error fetching daily stats:", error);
      setDailyStats(null);
      setChartData([]);
    }
  };

  const fetchWebhookLogs = async (leadId: number) => {
    try {
      const response = await fetch(`/api/analytics/webhook-logs/${leadId}`);
      if (response.ok) {
        const data: WebhookLogsResponse = await response.json();
        setWebhookLogs(data.logs || []);
        setSelectedLeadId(leadId);
        setShowWebhookLogs(true);
      }
    } catch (error) {
      console.error("Error fetching webhook logs:", error);
    }
  };

  const sendWebhook = async (leadId: number) => {
    const webhookUrl = localStorage.getItem("webhookSettings")
      ? JSON.parse(localStorage.getItem("webhookSettings")!).url
      : "https://webhook.site/your-url";

    try {
      setSendingWebhook(leadId);
      const response = await fetch(`/api/analytics/webhook/${leadId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ webhook_url: webhookUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Webhook enviado com sucesso! Status: ${data.status_code}`);
        await fetchLeads();
      } else {
        alert(`Erro ao enviar webhook: ${data.message}`);
      }
    } catch (error) {
      console.error("Error sending webhook:", error);
      alert("Erro ao enviar webhook");
    } finally {
      setSendingWebhook(null);
    }
  };

  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchLeads();
        await fetchDailyStats();
      }
    } catch (error) {
      console.error("Error updating lead status:", error);
    }
  };

  const deleteLead = async (leadId: number) => {
    if (confirm("Tem certeza que deseja excluir este lead?")) {
      try {
        const response = await fetch(`/api/leads/${leadId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchLeads();
          await fetchDailyStats();
        }
      } catch (error) {
        console.error("Error deleting lead:", error);
      }
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.whatsapp.includes(searchTerm) ||
      lead.storeType.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics de Leads
            </h1>
            <p className="text-gray-600 mt-1">
              Análise detalhada de leads e conversões
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar Dados
            </Button>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total de Leads
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {dailyStats?.summary.total_leads || 0}
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
                  <p className="text-sm font-medium text-gray-600">Hoje</p>
                  <p className="text-3xl font-bold text-green-600">
                    {dailyStats?.summary.today_leads || 0}
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
                    Duplicados
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {dailyStats?.summary.duplicates_today || 0}
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
                    Webhooks Pendentes
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {dailyStats?.summary.webhooks_pending || 0}
                  </p>
                </div>
                <Webhook className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Taxa Conversão
                  </p>
                  <p className="text-3xl font-bold text-purple-600">15%</p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Leads por Dia (Últimos 30 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-center space-x-2">
                {chartData.slice(-15).map((data, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="bg-blue-500 w-6 transition-all duration-300 hover:bg-blue-600"
                      style={{
                        height: `${Math.max((data.leads / Math.max(...chartData.map((d) => d.leads))) * 200, 4)}px`,
                      }}
                    ></div>
                    <span className="text-xs text-gray-600 mt-1 rotate-45 origin-left">
                      {data.date}
                    </span>
                    <span className="text-xs font-medium text-blue-600">
                      {data.leads}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-green-600" />
                Webhooks Success vs Failure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-center space-x-1">
                {chartData.slice(-15).map((data, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-end space-y-1"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className="bg-green-500 w-3"
                        style={{
                          height: `${Math.max((data.webhooks_sent / Math.max(...chartData.map((d) => d.webhooks_sent + d.webhook_failures))) * 180, 2)}px`,
                        }}
                      ></div>
                      <div
                        className="bg-red-500 w-3"
                        style={{
                          height: `${Math.max((data.webhook_failures / Math.max(...chartData.map((d) => d.webhooks_sent + d.webhook_failures))) * 180, 2)}px`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 rotate-45 origin-left">
                      {data.date}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4 space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500"></div>
                  <span className="text-xs">Sucesso</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500"></div>
                  <span className="text-xs">Falha</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome, WhatsApp ou tipo de loja..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="new">Novos</SelectItem>
                  <SelectItem value="contacted">Contatados</SelectItem>
                  <SelectItem value="qualified">Qualificados</SelectItem>
                  <SelectItem value="converted">Convertidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum lead encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Tipo de Loja</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Webhook</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">
                          {lead.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{lead.whatsapp}</span>
                            {lead.is_duplicate && (
                              <Badge variant="destructive" className="text-xs">
                                DUP
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              lead.hasCnpj === "sim" ? "default" : "secondary"
                            }
                          >
                            {lead.hasCnpj === "sim" ? "Sim" : "Não"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span>{lead.storeType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lead.status || "new"}
                            onValueChange={(value) =>
                              updateLeadStatus(lead.id!, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">Novo</SelectItem>
                              <SelectItem value="contacted">
                                Contatado
                              </SelectItem>
                              <SelectItem value="qualified">
                                Qualificado
                              </SelectItem>
                              <SelectItem value="converted">
                                Convertido
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                lead.webhook_sent ? "default" : "destructive"
                              }
                              className={
                                lead.webhook_sent
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {lead.webhook_sent ? "Enviado" : "Pendente"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchWebhookLogs(lead.id!)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>
                              {new Date(lead.created_at!).toLocaleDateString(
                                "pt-BR",
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLead(lead);
                                setShowDetails(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => sendWebhook(lead.id!)}
                              disabled={sendingWebhook === lead.id}
                            >
                              {sendingWebhook === lead.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteLead(lead.id!)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Webhook Logs Dialog */}
        <Dialog open={showWebhookLogs} onOpenChange={setShowWebhookLogs}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Logs do Webhook - Lead #{selectedLeadId}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {webhookLogs.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  Nenhum log de webhook encontrado para este lead.
                </p>
              ) : (
                <div className="space-y-4">
                  {webhookLogs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  log.success ? "default" : "destructive"
                                }
                                className={
                                  log.success
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }
                              >
                                {log.success ? "Sucesso" : "Falha"}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                Tentativa #{log.attempt_number}
                              </span>
                              {log.response_status && (
                                <Badge variant="outline">
                                  HTTP {log.response_status}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">
                              <strong>URL:</strong> {log.webhook_url}
                            </p>
                            <p className="text-sm">
                              <strong>Enviado em:</strong>{" "}
                              {new Date(log.sent_at).toLocaleString("pt-BR")}
                            </p>
                            {log.error_message && (
                              <p className="text-sm text-red-600">
                                <strong>Erro:</strong> {log.error_message}
                              </p>
                            )}
                            {log.response_body && (
                              <details className="text-sm">
                                <summary className="cursor-pointer font-medium">
                                  Resposta do Webhook
                                </summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                                  {log.response_body}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Lead Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Lead</DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4">
                <div>
                  <strong>Nome:</strong> {selectedLead.name}
                </div>
                <div>
                  <strong>WhatsApp:</strong> {selectedLead.whatsapp}
                </div>
                <div>
                  <strong>CNPJ:</strong> {selectedLead.hasCnpj}
                </div>
                <div>
                  <strong>Tipo de Loja:</strong> {selectedLead.storeType}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <Badge className={statusColors[selectedLead.status || "new"]}>
                    {statusLabels[selectedLead.status || "new"]}
                  </Badge>
                </div>
                <div>
                  <strong>Data de Cadastro:</strong>{" "}
                  {new Date(selectedLead.created_at!).toLocaleString("pt-BR")}
                </div>
                {selectedLead.webhook_response && (
                  <div>
                    <strong>Resposta do Webhook:</strong>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
                      {selectedLead.webhook_response}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
