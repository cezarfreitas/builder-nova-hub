import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Lead, LeadsResponse, DailyStatsResponse } from "@shared/api";
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
  MessageSquare,
  Settings,
  HelpCircle,
  Image,
} from "lucide-react";
import { Link } from "react-router-dom";

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

export default function Admin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [dailyStats, setDailyStats] = useState<DailyStatsResponse | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("https://webhook.site/your-url");
  const [sendingWebhook, setSendingWebhook] = useState<number | null>(null);

  useEffect(() => {
    fetchLeads();
    fetchDailyStats();
  }, [statusFilter, currentPage]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/leads?${params}`);
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
      const data: DailyStatsResponse = await response.json();
      setDailyStats(data);
    } catch (error) {
      console.error("Error fetching daily stats:", error);
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
        fetchLeads();
      }
    } catch (error) {
      console.error("Error updating lead status:", error);
    }
  };

  const deleteLead = async (leadId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este lead?")) {
      try {
        const response = await fetch(`/api/leads/${leadId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchLeads();
          fetchDailyStats();
        }
      } catch (error) {
        console.error("Error deleting lead:", error);
      }
    }
  };

  const sendWebhook = async (leadId: number) => {
    if (!webhookUrl) {
      alert("Por favor, configure a URL do webhook");
      return;
    }

    setSendingWebhook(leadId);
    try {
      const response = await fetch(`/api/analytics/webhook/${leadId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ webhook_url: webhookUrl }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Webhook enviado com sucesso!");
        fetchLeads();
      } else {
        alert(`Erro ao enviar webhook: ${result.message}`);
      }
    } catch (error) {
      console.error("Error sending webhook:", error);
      alert("Erro ao enviar webhook");
    } finally {
      setSendingWebhook(null);
    }
  };

  const checkDuplicates = async () => {
    try {
      const response = await fetch("/api/analytics/check-duplicates", {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          `Verificação concluída! ${result.duplicates_found} duplicados encontrados.`,
        );
        fetchLeads();
        fetchDailyStats();
      }
    } catch (error) {
      console.error("Error checking duplicates:", error);
    }
  };

  const exportLeads = () => {
    const csvContent = [
      [
        "Nome",
        "WhatsApp",
        "CNPJ",
        "Tipo de Loja",
        "Status",
        "Duplicado",
        "Webhook Enviado",
        "Data de Cadastro",
      ],
      ...(leads || []).map((lead) => [
        lead.name,
        lead.whatsapp,
        lead.hasCnpj === "sim"
          ? "Sim"
          : lead.hasCnpj === "nao"
            ? "Não"
            : "Em processo",
        lead.storeType || "",
        statusLabels[lead.status || "new"],
        lead.is_duplicate ? "Sim" : "Não",
        lead.webhook_sent ? "Sim" : "Não",
        lead.created_at
          ? new Date(lead.created_at).toLocaleDateString("pt-BR")
          : "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const filteredLeads = (leads || []).filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.whatsapp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.storeType?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats = {
    total: total,
    new: (leads || []).filter((lead) => lead.status === "new").length,
    contacted: (leads || []).filter((lead) => lead.status === "contacted")
      .length,
    qualified: (leads || []).filter((lead) => lead.status === "qualified")
      .length,
    converted: (leads || []).filter((lead) => lead.status === "converted")
      .length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-ecko-red to-ecko-red-dark rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-xl font-bold text-ecko-gray">
                ECKO Admin
              </span>
            </Link>
          </div>
          <Link to="/">
            <Button variant="outline">Voltar ao Site</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Daily Stats Section */}
        {dailyStats && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-ecko-red" />
              Estatísticas Diárias
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Hoje</p>
                      <p className="text-2xl font-bold text-ecko-red">
                        {dailyStats.summary.today_leads}
                      </p>
                    </div>
                    <Activity className="w-6 h-6 text-ecko-red" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Duplicados Hoje
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {dailyStats.summary.duplicates_today}
                      </p>
                    </div>
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Webhooks Pendentes
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {dailyStats.summary.webhooks_pending}
                      </p>
                    </div>
                    <Webhook className="w-6 h-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Geral
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dailyStats.summary.total_leads}
                      </p>
                    </div>
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart Area */}
            <Card>
              <CardHeader>
                <CardTitle>Últimos 7 Dias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dailyStats.stats.slice(0, 7).map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium w-20">
                          {new Date(stat.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                        <div className="flex space-x-4 text-sm">
                          <span className="text-green-600">
                            +{stat.total_leads} leads
                          </span>
                          {stat.duplicates > 0 && (
                            <span className="text-orange-600">
                              {stat.duplicates} duplicados
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Ações Rápidas
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/admin/hero">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar Hero
              </Button>
            </Link>
            <Link to="/admin/testimonials">
              <Button className="bg-ecko-red hover:bg-ecko-red-dark text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Gerenciar Depoimentos
              </Button>
            </Link>
            <Link to="/admin/faqs">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <HelpCircle className="w-4 h-4 mr-2" />
                Gerenciar FAQs
              </Button>
            </Link>
            <Button
              onClick={checkDuplicates}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar Duplicados
            </Button>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="URL do Webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-64"
              />
              <Button variant="outline" size="sm">
                Salvar URL
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total de Leads
                  </p>
                  <p className="text-3xl font-bold text-ecko-gray">
                    {stats.total}
                  </p>
                </div>
                <Users className="w-8 h-8 text-ecko-red" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Novos</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.new}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Contatados
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.contacted}
                  </p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full"></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Qualificados
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.qualified}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full"></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Convertidos
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.converted}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Gerenciar Leads</span>
              <Button
                onClick={exportLeads}
                className="bg-ecko-red hover:bg-ecko-red-dark"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
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
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrar por status" />
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
            </div>

            {/* Leads Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Tipo de Loja</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duplicado</TableHead>
                    <TableHead>Webhook</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Nenhum lead encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">
                          {lead.name}
                        </TableCell>
                        <TableCell>{lead.whatsapp}</TableCell>
                        <TableCell>
                          {lead.hasCnpj === "sim"
                            ? "Sim"
                            : lead.hasCnpj === "nao"
                              ? "Não"
                              : "Em processo"}
                        </TableCell>
                        <TableCell>{lead.storeType}</TableCell>
                        <TableCell>
                          <Select
                            value={lead.status}
                            onValueChange={(value) =>
                              updateLeadStatus(lead.id!, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue>
                                <Badge
                                  className={statusColors[lead.status || "new"]}
                                >
                                  {statusLabels[lead.status || "new"]}
                                </Badge>
                              </SelectValue>
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
                          {lead.is_duplicate ? (
                            <Badge className="bg-red-100 text-red-800">
                              Duplicado
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">
                              Único
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {lead.webhook_sent ? (
                              <Badge className="bg-green-100 text-green-800">
                                Enviado
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => sendWebhook(lead.id!)}
                                disabled={sendingWebhook === lead.id}
                                className="text-xs"
                              >
                                {sendingWebhook === lead.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <Send className="w-3 h-3 mr-1" />
                                    Enviar
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.created_at
                            ? new Date(lead.created_at).toLocaleDateString(
                                "pt-BR",
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLead(lead);
                                setShowDetails(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteLead(lead.id!)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {total > 10 && (
              <div className="flex justify-center mt-6 space-x-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {currentPage} de {Math.ceil(total / 10)}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage >= Math.ceil(total / 10)}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lead Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-ecko-red" />
                    <div>
                      <p className="font-semibold">{selectedLead.name}</p>
                      <p className="text-sm text-gray-600">Nome</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-ecko-red" />
                    <div>
                      <p className="font-semibold">{selectedLead.whatsapp}</p>
                      <p className="text-sm text-gray-600">WhatsApp</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-ecko-red" />
                    <div>
                      <p className="font-semibold">
                        {selectedLead.storeType || "Não informado"}
                      </p>
                      <p className="text-sm text-gray-600">Tipo de Loja</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-ecko-red" />
                    <div>
                      <p className="font-semibold">
                        {selectedLead.created_at
                          ? new Date(
                              selectedLead.created_at,
                            ).toLocaleDateString("pt-BR")
                          : "Não informado"}
                      </p>
                      <p className="text-sm text-gray-600">Data de Cadastro</p>
                    </div>
                  </div>

                  <div>
                    <Badge
                      className={statusColors[selectedLead.status || "new"]}
                    >
                      {statusLabels[selectedLead.status || "new"]}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">Status Atual</p>
                  </div>
                </div>
              </div>

              {/* Webhook Info */}
              {selectedLead.webhook_response && (
                <div>
                  <h4 className="font-semibold mb-2">Resposta do Webhook:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedLead.webhook_response}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  className="bg-ecko-red hover:bg-ecko-red-dark"
                  onClick={() =>
                    window.open(
                      `https://wa.me/55${selectedLead.whatsapp.replace(/\D/g, "")}`,
                      "_blank",
                    )
                  }
                >
                  <Phone className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(`tel:${selectedLead.whatsapp}`, "_blank")
                  }
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Ligar
                </Button>
                {!selectedLead.webhook_sent && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      sendWebhook(selectedLead.id!);
                      setShowDetails(false);
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Webhook
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
