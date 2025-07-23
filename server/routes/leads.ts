import { Request, Response, RequestHandler } from "express";
import { z } from "zod";
import { getDatabase } from '../config/database';

// Validation schema for lead submission
const leadSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
  hasCnpj: z.string().min(1, "Informação sobre CNPJ é obrigatória"),
  storeType: z.string().min(1, "Tipo de loja é obrigatório"),
  cep: z.string().min(8, "CEP é obrigatório"),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(2, "Estado é obrigatório"),
  email: z.string().email("Email inválido").optional(),
  empresa: z.string().optional(),
  formOrigin: z.string().optional(),
});

// POST /api/leads - Submit a new lead
export const submitLead: RequestHandler = async (req, res) => {
  try {
    const validatedData = leadSchema.parse(req.body);
    const db = getDatabase();

    // Extrair informações adicionais do request
    const ip_address = req.ip || req.connection.remoteAddress || '';
    const user_agent = req.get('User-Agent') || '';
    const source = req.get('Referer') || 'direct';

    // Headers UTM se existirem
    const utm_source = req.body.utm_source || '';
    const utm_medium = req.body.utm_medium || '';
    const utm_campaign = req.body.utm_campaign || '';

    // Verificar se é um lead duplicado (mesmo telefone)
    const telefone = validatedData.whatsapp;
    const email = `${validatedData.whatsapp}@temp.com`; // Email temporário para compatibilidade

    const [existingLeads] = await db.execute(
      `SELECT id FROM leads WHERE telefone = ? LIMIT 1`,
      [telefone]
    );

    const is_duplicate = (existingLeads as any[]).length > 0;

    // Inserir lead no banco
    const [result] = await db.execute(
      `INSERT INTO leads (
        nome, email, telefone, cep, endereco, numero, complemento,
        bairro, cidade, estado, empresa,
        experiencia_revenda, is_duplicate, source,
        utm_source, utm_medium, utm_campaign,
        ip_address, user_agent, tipo_loja, form_origin
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.name,
        email, // Email temporário para compatibilidade
        telefone,
        validatedData.cep,
        validatedData.endereco || '',
        validatedData.numero || '',
        validatedData.complemento || '',
        validatedData.bairro || '',
        validatedData.cidade,
        validatedData.estado,
        '', // empresa - não capturada no formulário
        validatedData.hasCnpj,
        is_duplicate,
        source,
        utm_source,
        utm_medium,
        utm_campaign,
        ip_address,
        user_agent,
        validatedData.storeType,
        validatedData.formOrigin || null
      ]
    );

    const leadId = (result as any).insertId;

    // Buscar configurações de webhook
    const [webhookSettings] = await db.execute(
      `SELECT setting_key, setting_value FROM lp_settings
       WHERE setting_key IN ('webhook_url', 'webhook_secret') AND setting_value != ''`
    );

    let webhookSent = false;
    let webhookResponse = '';
    let webhookStatus = 'pending';

    // Enviar webhook se configurado
    if ((webhookSettings as any[]).length > 0) {
      const settings: Record<string, string> = {};
      (webhookSettings as any[]).forEach(setting => {
        settings[setting.setting_key] = setting.setting_value;
      });

      if (settings.webhook_url) {
        try {
          const webhookPayload = {
            lead_id: leadId,
            nome: validatedData.name,
            telefone: validatedData.whatsapp,
            tem_cnpj: validatedData.hasCnpj,
            tipo_loja: validatedData.storeType,
            form_origin: validatedData.formOrigin || null,
            is_duplicate,
            source,
            utm_source: utm_source || '',
            utm_medium: utm_medium || '',
            utm_campaign: utm_campaign || '',
            ip_address,
            timestamp: new Date().toISOString()
          };

          const webhookResponse_result = await sendWebhook(
            settings.webhook_url,
            webhookPayload,
            settings.webhook_secret
          );

          webhookSent = true;
          webhookResponse = `${webhookResponse_result.status} - ${webhookResponse_result.statusText}`;
          webhookStatus = webhookResponse_result.status >= 200 && webhookResponse_result.status < 300 ? 'success' : 'error';
        } catch (error: any) {
          webhookResponse = `Error: ${error.message}`;
          webhookStatus = 'error';
        }

        // Atualizar status do webhook no banco
        await db.execute(
          `UPDATE leads SET
           webhook_sent = ?, webhook_response = ?, webhook_status = ?,
           webhook_attempts = 1, last_webhook_attempt = NOW()
           WHERE id = ?`,
          [webhookSent, webhookResponse, webhookStatus, leadId]
        );
      }
    }

    console.log("📋 Novo Lead Salvo no Banco:", {
      id: leadId,
      name: validatedData.name,
      telefone,
      email,
      is_duplicate,
      webhook_status: webhookStatus
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: "Cadastro enviado com sucesso! Nossa equipe entrará em contato em até 24h.",
      lead: {
        id: leadId,
        name: validatedData.name,
        whatsapp: telefone,
        email,
        hasCnpj: validatedData.hasCnpj,
        storeType: validatedData.storeType,
        is_duplicate,
        webhook_status: webhookStatus,
        status: "new",
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error submitting lead:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
};

// GET /api/leads - Listar leads com filtros
export async function getLeads(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const {
      page = 1,
      limit = 10,
      filter = 'all',
      search = '',
      date_from = '',
      date_to = ''
    } = req.query;

    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];

    // Filtros
    if (filter === 'unique') {
      whereClause += ' AND is_duplicate = FALSE';
    } else if (filter === 'duplicate') {
      whereClause += ' AND is_duplicate = TRUE';
    } else if (filter === 'webhook_error') {
      whereClause += ' AND webhook_status = "error"';
    }

    // Busca por nome ou email
    if (search) {
      whereClause += ' AND (nome LIKE ? OR email LIKE ? OR telefone LIKE ?)';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Filtro por data
    if (date_from) {
      whereClause += ' AND created_at >= ?';
      queryParams.push(date_from);
    }
    if (date_to) {
      whereClause += ' AND created_at <= ?';
      queryParams.push(date_to + ' 23:59:59');
    }

    // Contar total
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM leads ${whereClause}`,
      queryParams
    );
    const total = (countResult as any[])[0].total;

    // Buscar leads paginados
    const offset = (Number(page) - 1) * Number(limit);
    const [leads] = await db.execute(
      `SELECT * FROM leads ${whereClause}
       ORDER BY created_at DESC
       LIMIT ${Number(limit)} OFFSET ${offset}`,
      queryParams
    );

    res.json({
      success: true,
      data: {
        leads,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          total_pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// PUT /api/leads/:id/webhook - Reenviar webhook para um lead específico
export async function resendWebhook(req: Request, res: Response) {
  // Garantir que sempre enviamos uma resposta JSON válida
  const sendErrorResponse = (status: number, message: string) => {
    if (!res.headersSent) {
      return res.status(status).json({
        success: false,
        message,
        webhook_status: 'error',
        webhook_response: message
      });
    }
  };

  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return sendErrorResponse(400, 'ID do lead inválido');
    }

    const db = getDatabase();

    // Buscar o lead
    const [leadResult] = await db.execute(
      `SELECT * FROM leads WHERE id = ?`,
      [id]
    );

    if ((leadResult as any[]).length === 0) {
      return sendErrorResponse(404, 'Lead não encontrado');
    }

    const lead = (leadResult as any[])[0];

    // Buscar configurações de webhook
    const [webhookSettings] = await db.execute(
      `SELECT setting_key, setting_value FROM lp_settings
       WHERE setting_key IN ('webhook_url', 'webhook_secret') AND setting_value != ''`
    );

    if ((webhookSettings as any[]).length === 0) {
      return sendErrorResponse(400, 'Webhook não configurado');
    }

    const settings: Record<string, string> = {};
    (webhookSettings as any[]).forEach(setting => {
      settings[setting.setting_key] = setting.setting_value;
    });

    if (!settings.webhook_url) {
      return sendErrorResponse(400, 'URL do webhook não configurada');
    }

    // Preparar payload do webhook
    const webhookPayload = {
      lead_id: lead.id,
      nome: lead.nome,
      telefone: lead.telefone,
      tem_cnpj: lead.experiencia_revenda,
      tipo_loja: lead.tipo_loja,
      form_origin: lead.form_origin || null,
      is_duplicate: lead.is_duplicate,
      source: lead.source,
      utm_source: lead.utm_source || '',
      utm_medium: lead.utm_medium || '',
      utm_campaign: lead.utm_campaign || '',
      ip_address: lead.ip_address,
      timestamp: new Date().toISOString(),
      resend: true
    };

    // Enviar webhook
    let webhookResponse = '';
    let webhookStatus = 'error';

    try {
      const response = await sendWebhook(
        settings.webhook_url,
        webhookPayload,
        settings.webhook_secret
      );

      webhookResponse = `${response.status} - ${response.statusText}`;
      webhookStatus = response.status >= 200 && response.status < 300 ? 'success' : 'error';
    } catch (error: any) {
      webhookResponse = `Error: ${error.message}`;
    }

    // Atualizar no banco
    await db.execute(
      `UPDATE leads SET
       webhook_sent = TRUE, webhook_response = ?, webhook_status = ?,
       webhook_attempts = webhook_attempts + 1, last_webhook_attempt = NOW()
       WHERE id = ?`,
      [webhookResponse, webhookStatus, id]
    );

    if (!res.headersSent) {
      res.json({
        success: true,
        message: 'Webhook reenviado',
        webhook_status: webhookStatus,
        webhook_response: webhookResponse
      });
    }
  } catch (error) {
    console.error('Erro ao reenviar webhook:', error);
    return sendErrorResponse(500, 'Erro interno do servidor');
  }
}

// DELETE /api/leads/:id - Deletar um lead
export async function deleteLead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Verificar se o lead existe
    const [leadResult] = await db.execute(
      `SELECT id FROM leads WHERE id = ?`,
      [id]
    );

    if ((leadResult as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lead não encontrado'
      });
    }

    // Deletar o lead
    await db.execute(
      `DELETE FROM leads WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Lead excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar lead:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// GET /api/leads/stats - Buscar estatísticas de leads
export async function getLeadStats(req: Request, res: Response) {
  try {
    const db = getDatabase();

    const [statsResult] = await db.execute(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads,
        COUNT(CASE WHEN is_duplicate = TRUE THEN 1 END) as duplicate_leads,
        COUNT(CASE WHEN webhook_status = 'error' THEN 1 END) as webhook_errors,
        COUNT(CASE WHEN webhook_status = 'success' THEN 1 END) as webhook_success,
        COUNT(CASE WHEN webhook_status = 'pending' THEN 1 END) as webhook_pending,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_leads,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as week_leads,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as month_leads
      FROM leads
    `);

    const stats = (statsResult as any[])[0];

    res.json({
      success: true,
      data: {
        total: stats.total,
        unique: stats.unique_leads,
        duplicates: stats.duplicate_leads,
        webhook_errors: stats.webhook_errors,
        webhook_success: stats.webhook_success,
        webhook_pending: stats.webhook_pending,
        today: stats.today_leads,
        week: stats.week_leads,
        month: stats.month_leads
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Função auxiliar para enviar webhook
async function sendWebhook(url: string, payload: any, secret?: string): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Ecko-LP-Webhook/1.0'
  };

  if (secret) {
    // Adicionar assinatura se secret estiver configurado
    const crypto = await import('crypto');
    const signature = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    headers['X-Signature'] = `sha256=${signature}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000) // 30 segundos timeout
  });

  return {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  };
}
