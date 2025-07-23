import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useLeads } from "../../hooks/useLeads";
import { useToast } from "../../hooks/use-toast";
import { Users } from "lucide-react";

export default function AdminLeads() {
  const { toast } = useToast();
  
  // Hook para gerenciar leads
  const { 
    leads, 
    stats, 
    loading: leadsLoading, 
    pagination, 
    fetchLeads, 
    resendWebhook, 
    deleteLead, 
    exportLeads, 
    refreshStats 
  } = useLeads();

  // Estados para filtros de leads
  const [leadFilter, setLeadFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("30");
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);

  // Funções para ações de leads
  const handleFilterChange = (filter: string) => {
    setLeadFilter(filter);
    const dateFrom = getDateFromFilter(dateFilter);
    fetchLeads({ 
      page: 1, 
      filter, 
      search: searchTerm,
      date_from: dateFrom 
    });
  };

  const handleDateFilterChange = (period: string) => {
    setDateFilter(period);
    const dateFrom = getDateFromFilter(period);
    fetchLeads({ 
      page: 1, 
      filter: leadFilter, 
      search: searchTerm,
      date_from: dateFrom 
    });
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    fetchLeads({ 
      page: 1, 
      filter: leadFilter, 
      search,
      date_from: getDateFromFilter(dateFilter) 
    });
  };

  const handleResendWebhook = async (leadId: number) => {
    setSaving(true);
    try {
      const success = await resendWebhook(leadId);
      if (success) {
        toast({
          title: "✅ Webhook reenviado!",
          description: "Webhook foi reenviado com sucesso",
          variant: "success",
        });
        refreshStats();
      } else {
        toast({
          title: "❌ Erro",
          description: "Erro ao reenviar webhook",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Erro ao reenviar webhook",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = async () => {
    setSaving(true);
    try {
      await exportLeads(leadFilter);
      toast({
        title: "✅ Exportação concluída!",
        description: "Arquivo CSV baixado com sucesso",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Erro ao exportar leads",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResendAllWebhooks = async () => {
    setSaving(true);
    try {
      const webhookErrorLeads = leads.filter(lead => lead.webhook_status === 'error');
      let successCount = 0;
      
      for (const lead of webhookErrorLeads) {
        const success = await resendWebhook(lead.id);
        if (success) successCount++;
      }
      
      toast({
        title: "✅ Reenvio concluído!",
        description: `${successCount} de ${webhookErrorLeads.length} webhooks reenviados com sucesso`,
        variant: "success",
      });
      
      refreshStats();
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Erro ao reenviar webhooks",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLead = async (leadId: number, leadName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o lead "${leadName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setSaving(true);
    try {
      const success = await deleteLead(leadId);
      if (success) {
        toast({
          title: "✅ Lead excluído!",
          description: `Lead "${leadName}" foi excluído com sucesso`,
          variant: "success",
        });
      } else {
        toast({
          title: "❌ Erro",
          description: "Erro ao excluir lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Erro ao excluir lead",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getDateFromFilter = (period: string): string => {
    const now = new Date();
    switch (period) {
      case '1':
        return now.toISOString().split('T')[0];
      case '7':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sevenDaysAgo.toISOString().split('T')[0];
      case '30':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return thirtyDaysAgo.toISOString().split('T')[0];
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      default:
        return '';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">✅ Sucesso</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">❌ Erro</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⏳ Pendente</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">-</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Leads</h1>
        <p className="text-gray-600 mt-2">
          Visualize, gerencie e exporte todos os leads capturados pela landing page.
        </p>
      </div>

      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leadsLoading ? '...' : stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Leads Únicos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leadsLoading ? '...' : stats.unique}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Duplicados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leadsLoading ? '...' : stats.duplicates}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-ecko-red/10 rounded-lg">
                <svg className="w-6 h-6 text-ecko-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Erros Webhook</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leadsLoading ? '...' : stats.webhook_errors}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex gap-3">
              <select 
                value={leadFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
              >
                <option value="all">Todos os leads</option>
                <option value="unique">Leads únicos</option>
                <option value="duplicate">Leads duplicados</option>
                <option value="webhook_error">Com erro no webhook</option>
              </select>

              <select 
                value={dateFilter}
                onChange={(e) => handleDateFilterChange(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
              >
                <option value="30">Últimos 30 dias</option>
                <option value="7">Últimos 7 dias</option>
                <option value="1">Hoje</option>
                <option value="month">Este mês</option>
              </select>

              <input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ecko-red focus:border-ecko-red min-w-[250px]"
              />
            </div>

            <div className="flex gap-3 sm:ml-auto">
              <Button 
                variant="outline" 
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={handleExportCSV}
                disabled={saving}
              >
                {saving ? 'Exportando...' : 'Exportar CSV'}
              </Button>
              <Button 
                className="bg-ecko-red hover:bg-ecko-red-dark text-white"
                onClick={handleResendAllWebhooks}
                disabled={saving || stats.webhook_errors === 0}
              >
                {saving ? 'Reenviando...' : 'Reenviar Todos Webhooks'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Leads */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 flex items-center">
            <Users className="w-6 h-6 mr-2 text-ecko-red" />
            Lista de Leads
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo Loja
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Webhook
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leadsLoading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ecko-red"></div>
                        <span className="ml-2 text-gray-600">Carregando leads...</span>
                      </div>
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Nenhum lead encontrado</p>
                        <p className="text-sm">Tente ajustar os filtros ou aguarde novos leads.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      {/* Nome */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-ecko-red flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {lead.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{lead.nome}</div>
                            <div className="text-sm text-gray-500">ID: {lead.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* WhatsApp */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{lead.telefone}</div>
                        <div className="text-sm text-gray-500">WhatsApp</div>
                      </td>

                      {/* CNPJ */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.experiencia_revenda === 'sim' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✅ Tem CNPJ
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⚠️ Não tem
                          </span>
                        )}
                      </td>

                      {/* Tipo de Loja */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {lead.tipo_loja ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {lead.tipo_loja === 'fisica' ? '🏪 Física' :
                               lead.tipo_loja === 'online' ? '💻 Online' :
                               lead.tipo_loja === 'ambas' ? '🏪💻 Ambas' :
                               lead.tipo_loja}
                            </span>
                          ) : (
                            <span className="text-gray-500">Não informado</span>
                          )}
                        </div>
                      </td>

                      {/* Origem do Formulário */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lead.form_origin ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              📍 {getOriginLabel(lead.form_origin)}
                            </span>
                          ) : (
                            <span className="text-gray-500">Não identificado</span>
                          )}
                        </div>
                      </td>

                      {/* Status (Duplicado) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!lead.is_duplicate ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Único
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Duplicado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(lead.webhook_status)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={lead.webhook_response}>
                          {lead.webhook_response || 'Nenhuma resposta'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleResendWebhook(lead.id)}
                            disabled={saving}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 disabled:opacity-50"
                            title="Reenviar Webhook"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              toast({
                                title: "📋 Detalhes do Lead",
                                description: `${lead.nome} - WhatsApp: ${lead.telefone} - CNPJ: ${lead.experiencia_revenda === 'sim' ? 'Sim' : 'Não'} - Fonte: ${lead.source}`,
                                variant: "default",
                              });
                            }}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Ver Detalhes"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id, lead.nome)}
                            disabled={saving}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                            title="Excluir Lead"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button 
                  variant="outline" 
                  onClick={() => fetchLeads({ page: Math.max(1, pagination.page - 1), filter: leadFilter, search: searchTerm, date_from: getDateFromFilter(dateFilter) })}
                  disabled={pagination.page <= 1 || leadsLoading}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Anterior
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => fetchLeads({ page: Math.min(pagination.total_pages, pagination.page + 1), filter: leadFilter, search: searchTerm, date_from: getDateFromFilter(dateFilter) })}
                  disabled={pagination.page >= pagination.total_pages || leadsLoading}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Próximo
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> a{' '}
                    <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> de{' '}
                    <span className="font-medium">{pagination.total}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button 
                      variant="outline" 
                      onClick={() => fetchLeads({ page: Math.max(1, pagination.page - 1), filter: leadFilter, search: searchTerm, date_from: getDateFromFilter(dateFilter) })}
                      disabled={pagination.page <= 1 || leadsLoading}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </Button>
                    
                    {/* Páginas dinâmicas */}
                    {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                      const pageNum = Math.max(1, pagination.page - 2) + i;
                      if (pageNum > pagination.total_pages) return null;
                      
                      return (
                        <Button 
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          onClick={() => fetchLeads({ page: pageNum, filter: leadFilter, search: searchTerm, date_from: getDateFromFilter(dateFilter) })}
                          disabled={leadsLoading}
                          className={pageNum === pagination.page 
                            ? "bg-ecko-red border-ecko-red text-white relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                            : "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button 
                      variant="outline" 
                      onClick={() => fetchLeads({ page: Math.min(pagination.total_pages, pagination.page + 1), filter: leadFilter, search: searchTerm, date_from: getDateFromFilter(dateFilter) })}
                      disabled={pagination.page >= pagination.total_pages || leadsLoading}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
