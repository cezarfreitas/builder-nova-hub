import { useState, useEffect, useCallback } from 'react';

export interface Lead {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cidade?: string;
  empresa?: string;
  experiencia_revenda: string;
  is_duplicate: boolean;
  source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  ip_address: string;
  user_agent?: string;
  webhook_sent: boolean;
  webhook_response?: string;
  webhook_status: string;
  webhook_attempts: number;
  last_webhook_attempt?: string;
  created_at: string;
  updated_at: string;
  tipo_loja?: string;
  form_origin?: string;
}

export interface LeadStats {
  total: number;
  unique: number;
  duplicates: number;
  webhook_errors: number;
}

export interface LeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface UseLeadsReturn {
  leads: Lead[];
  stats: LeadStats;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  fetchLeads: (params?: {
    page?: number;
    limit?: number;
    filter?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  }) => Promise<void>;
  resendWebhook: (leadId: number) => Promise<boolean>;
  deleteLead: (leadId: number) => Promise<boolean>;
  exportLeads: (filter?: string) => Promise<void>;
  refreshStats: () => Promise<void>;
}

export function useLeads(): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    unique: 0,
    duplicates: 0,
    webhook_errors: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });

  const fetchLeads = useCallback(async (params: {
    page?: number;
    limit?: number;
    filter?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.filter) searchParams.set('filter', params.filter);
      if (params.search) searchParams.set('search', params.search);
      if (params.date_from) searchParams.set('date_from', params.date_from);
      if (params.date_to) searchParams.set('date_to', params.date_to);

      const response = await fetch(`/api/leads?${searchParams.toString()}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error('Resposta inválida do servidor');
      }

      if (result.success) {
        setLeads(result.data.leads);
        setPagination(result.data.pagination);
      } else {
        throw new Error(result.message || 'Erro ao carregar leads');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar leads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const response = await fetch('/api/leads/stats');

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error('Resposta inválida do servidor');
      }

      if (result.success) {
        setStats({
          total: result.data.total,
          unique: result.data.unique,
          duplicates: result.data.duplicates,
          webhook_errors: result.data.webhook_errors
        });
      } else {
        console.error('Erro ao carregar estatísticas:', result.message);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, []);

  const resendWebhook = useCallback(async (leadId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/leads/${leadId}/webhook`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Verificar se a resposta é válida antes de tentar ler o body
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error('Resposta inválida do servidor');
      }

      if (result.success) {
        // Atualizar o lead na lista local
        setLeads(prevLeads =>
          prevLeads.map(lead =>
            lead.id === leadId
              ? {
                  ...lead,
                  webhook_status: result.webhook_status,
                  webhook_response: result.webhook_response,
                  webhook_attempts: lead.webhook_attempts + 1,
                  last_webhook_attempt: new Date().toISOString()
                }
              : lead
          )
        );
        return true;
      } else {
        throw new Error(result.message || 'Erro ao reenviar webhook');
      }
    } catch (err) {
      console.error('Erro ao reenviar webhook:', err);
      return false;
    }
  }, []);

  const deleteLead = useCallback(async (leadId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error('Resposta inválida do servidor');
      }

      if (result.success) {
        // Remover o lead da lista local
        setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
        refreshStats();
        return true;
      } else {
        throw new Error(result.message || 'Erro ao deletar lead');
      }
    } catch (err) {
      console.error('Erro ao deletar lead:', err);
      return false;
    }
  }, [refreshStats]);

  const exportLeads = useCallback(async (filter: string = 'all') => {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('filter', filter);
      searchParams.set('limit', '1000'); // Exportar até 1000 leads

      const response = await fetch(`/api/leads?${searchParams.toString()}`);
      const result = await response.json();

      if (result.success) {
        const csvData = convertToCSV(result.data.leads);
        downloadCSV(csvData, `leads_${filter}_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        throw new Error(result.message || 'Erro ao exportar leads');
      }
    } catch (err) {
      console.error('Erro ao exportar leads:', err);
      throw err;
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    fetchLeads();
    refreshStats();
  }, [fetchLeads, refreshStats]);

  return {
    leads,
    stats,
    loading,
    error,
    pagination,
    fetchLeads,
    resendWebhook,
    deleteLead,
    exportLeads,
    refreshStats,
  };
}

// Função para converter leads para CSV
function convertToCSV(leads: Lead[]): string {
  const headers = [
    'ID',
    'Nome',
    'Email',
    'Telefone',
    'Cidade',
    'Empresa',
    'Experiência Revenda',
    'Duplicado',
    'Fonte',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'IP',
    'Webhook Enviado',
    'Status Webhook',
    'Tentativas Webhook',
    'Último Webhook',
    'Data Criação'
  ];

  const csvRows = [
    headers.join(','),
    ...leads.map(lead => [
      lead.id,
      `"${lead.nome}"`,
      `"${lead.email}"`,
      `"${lead.telefone}"`,
      `"${lead.cidade || ''}"`,
      `"${lead.empresa || ''}"`,
      `"${lead.experiencia_revenda}"`,
      lead.is_duplicate ? 'Sim' : 'Não',
      `"${lead.source}"`,
      `"${lead.utm_source || ''}"`,
      `"${lead.utm_medium || ''}"`,
      `"${lead.utm_campaign || ''}"`,
      `"${lead.ip_address}"`,
      lead.webhook_sent ? 'Sim' : 'Não',
      `"${lead.webhook_status}"`,
      lead.webhook_attempts,
      `"${lead.last_webhook_attempt ? new Date(lead.last_webhook_attempt).toLocaleString('pt-BR') : ''}"`,
      `"${new Date(lead.created_at).toLocaleString('pt-BR')}"`
    ].join(','))
  ];

  return csvRows.join('\n');
}

// Função para download do CSV
function downloadCSV(csvData: string, filename: string) {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
