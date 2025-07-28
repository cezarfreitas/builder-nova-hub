import { Request, Response } from "express";
import { getDatabase } from "../config/database";

// GET /api/analytics/overview - Métricas gerais
export async function getAnalyticsOverview(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { days = 30, yesterday } = req.query;

    let dateFromStr: string;
    let dateToStr: string;

    if (yesterday === "true") {
      // Para ontem: de ontem 00:00:00 até ontem 23:59:59
      const yesterday_date = new Date();
      yesterday_date.setDate(yesterday_date.getDate() - 1);
      dateFromStr = yesterday_date.toISOString().split("T")[0];
      dateToStr = dateFromStr + " 23:59:59";
      dateFromStr = dateFromStr + " 00:00:00";
    } else {
      // Data de início para o período normal
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - Number(days));
      dateFromStr = dateFrom.toISOString().split("T")[0];
      dateToStr = new Date().toISOString();
    }

    // Buscar métricas gerais
    let overviewQuery: string;
    let overviewParams: any[];

    if (yesterday === "true") {
      overviewQuery = `
        SELECT
          COUNT(*) as total_leads,
          COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads,
          COUNT(CASE WHEN is_duplicate = TRUE THEN 1 END) as duplicate_leads,
          COUNT(CASE WHEN webhook_status = 'success' THEN 1 END) as webhook_success,
          COUNT(CASE WHEN webhook_status = 'error' THEN 1 END) as webhook_errors,
          COUNT(CASE WHEN experiencia_revenda = 'sim' THEN 1 END) as leads_with_cnpj,
          COUNT(CASE WHEN tipo_loja = 'fisica' THEN 1 END) as fisica_leads,
          COUNT(CASE WHEN tipo_loja = 'online' THEN 1 END) as online_leads,
          COUNT(CASE WHEN tipo_loja = 'ambas' THEN 1 END) as ambas_leads,
          COUNT(*) as period_leads
        FROM leads
        WHERE created_at >= ? AND created_at <= ?
      `;
      overviewParams = [dateFromStr, dateToStr];
    } else {
      overviewQuery = `
        SELECT
          COUNT(*) as total_leads,
          COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads,
          COUNT(CASE WHEN is_duplicate = TRUE THEN 1 END) as duplicate_leads,
          COUNT(CASE WHEN webhook_status = 'success' THEN 1 END) as webhook_success,
          COUNT(CASE WHEN webhook_status = 'error' THEN 1 END) as webhook_errors,
          COUNT(CASE WHEN experiencia_revenda = 'sim' THEN 1 END) as leads_with_cnpj,
          COUNT(CASE WHEN tipo_loja = 'fisica' THEN 1 END) as fisica_leads,
          COUNT(CASE WHEN tipo_loja = 'online' THEN 1 END) as online_leads,
          COUNT(CASE WHEN tipo_loja = 'ambas' THEN 1 END) as ambas_leads,
          COUNT(CASE WHEN DATE(created_at) >= ? THEN 1 END) as period_leads
        FROM leads
      `;
      overviewParams = [dateFromStr];
    }

    const [overview] = await db.execute(overviewQuery, overviewParams);

    // Buscar visitas do analytics_events com métricas avançadas
    let visitsQuery: string;
    let visitsParams: any[];

    if (yesterday === "true") {
      visitsQuery = `
        SELECT
          COUNT(DISTINCT session_id) as total_sessions,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(*) as total_page_views,
          COUNT(*) as period_page_views,
          COUNT(DISTINCT CONCAT(user_id, '-', DATE(created_at))) as unique_page_views,
          AVG(duration_seconds) as avg_session_duration,
          COUNT(*) / COUNT(DISTINCT session_id) as pages_per_session
        FROM analytics_events
        WHERE event_type = 'page_view' AND created_at >= ? AND created_at <= ?
      `;
      visitsParams = [dateFromStr, dateToStr];
    } else {
      visitsQuery = `
        SELECT
          COUNT(DISTINCT session_id) as total_sessions,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(*) as total_page_views,
          COUNT(CASE WHEN DATE(created_at) >= ? THEN 1 END) as period_page_views,
          COUNT(DISTINCT CONCAT(user_id, '-', DATE(created_at))) as unique_page_views,
          AVG(duration_seconds) as avg_session_duration,
          COUNT(*) / COUNT(DISTINCT session_id) as pages_per_session
        FROM analytics_events
        WHERE event_type = 'page_view'
      `;
      visitsParams = [dateFromStr];
    }

    const [visits] = await db.execute(visitsQuery, visitsParams);

    // Buscar cliques no WhatsApp
    let whatsappQuery: string;
    let whatsappParams: any[];

    if (yesterday === "true") {
      whatsappQuery = `
        SELECT COUNT(*) as whatsapp_clicks
        FROM analytics_events
        WHERE event_type = 'whatsapp_click' AND created_at >= ? AND created_at <= ?
      `;
      whatsappParams = [dateFromStr, dateToStr];
    } else {
      whatsappQuery = `
        SELECT COUNT(*) as whatsapp_clicks
        FROM analytics_events
        WHERE event_type = 'whatsapp_click' AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      `;
      whatsappParams = [Number(days)];
    }

    const [whatsappClicks] = await db.execute(whatsappQuery, whatsappParams);

    // Buscar taxa de rejeição (sessões com apenas 1 page view)
    const [bounceRate] = await db.execute(`
      SELECT
        COUNT(CASE WHEN page_count = 1 THEN 1 END) as bounced_sessions,
        COUNT(*) as total_sessions_with_views,
        (COUNT(CASE WHEN page_count = 1 THEN 1 END) / COUNT(*)) * 100 as bounce_rate
      FROM (
        SELECT session_id, COUNT(*) as page_count
        FROM analytics_events
        WHERE event_type = 'page_view'
        GROUP BY session_id
      ) as session_stats
    `);

    const stats = (overview as any[])[0];
    const visitStats = (visits as any[])[0];
    const bounceStats = (bounceRate as any[])[0];
    const whatsappStats = (whatsappClicks as any[])[0];

    // Debug logs
    console.log("📊 Analytics Overview Debug:");
    console.log("- Leads:", stats);
    console.log("- Visits:", visitStats);
    console.log("- WhatsApp clicks:", whatsappStats);
    console.log("- Bounce stats:", bounceStats);

    // Calcular taxa de conversão
    const conversionRate =
      visitStats.total_sessions > 0
        ? ((stats.total_leads / visitStats.total_sessions) * 100).toFixed(2)
        : "0.00";

    const periodConversionRate =
      visitStats.period_page_views > 0
        ? ((stats.period_leads / visitStats.period_page_views) * 100).toFixed(2)
        : "0.00";

    res.json({
      success: true,
      data: {
        leads: {
          total: stats.total_leads,
          unique: stats.unique_leads,
          duplicates: stats.duplicate_leads,
          period: stats.period_leads,
          with_cnpj: stats.leads_with_cnpj,
        },
        store_types: {
          fisica: stats.fisica_leads,
          online: stats.online_leads,
          ambas: stats.ambas_leads,
        },
        webhooks: {
          success: stats.webhook_success,
          errors: stats.webhook_errors,
        },
        traffic: {
          total_sessions: visitStats.total_sessions,
          unique_users: visitStats.unique_users || 0,
          total_page_views: visitStats.total_page_views,
          period_page_views: visitStats.period_page_views,
          unique_page_views: visitStats.unique_page_views || 0,
          avg_session_duration: Math.round(
            visitStats.avg_session_duration || 0,
          ),
          pages_per_session: parseFloat(
            (Number(visitStats.pages_per_session) || 0).toFixed(2),
          ),
          bounce_rate: parseFloat(
            (Number(bounceStats.bounce_rate) || 0).toFixed(2),
          ),
          whatsapp_clicks: whatsappStats.whatsapp_clicks || 0,
        },
        conversion: {
          rate: parseFloat(conversionRate),
          period_rate: parseFloat(periodConversionRate),
        },
        period_days: yesterday === "true" ? 0 : Number(days),
        period_label: yesterday === "true" ? "ontem" : `últimos ${days} dias`,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar overview analytics:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

// GET /api/analytics/daily-stats - Estatísticas diárias
export async function getDailyStats(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { days = 30, yesterday } = req.query;

    // Buscar leads por dia
    let dailyLeadsQuery: string;
    let dailyLeadsParams: any[];

    if (yesterday === "true") {
      const yesterday_date = new Date();
      yesterday_date.setDate(yesterday_date.getDate() - 1);
      const dateStr = yesterday_date.toISOString().split("T")[0];

      dailyLeadsQuery = `
        SELECT
          DATE(created_at) as date,
          COUNT(*) as total_leads,
          COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads,
          COUNT(CASE WHEN is_duplicate = TRUE THEN 1 END) as duplicates,
          COUNT(CASE WHEN webhook_status = 'success' THEN 1 END) as webhook_success,
          COUNT(CASE WHEN experiencia_revenda = 'sim' THEN 1 END) as with_cnpj
        FROM leads
        WHERE DATE(created_at) = ?
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
      dailyLeadsParams = [dateStr];
    } else {
      dailyLeadsQuery = `
        SELECT
          DATE(created_at) as date,
          COUNT(*) as total_leads,
          COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads,
          COUNT(CASE WHEN is_duplicate = TRUE THEN 1 END) as duplicates,
          COUNT(CASE WHEN webhook_status = 'success' THEN 1 END) as webhook_success,
          COUNT(CASE WHEN experiencia_revenda = 'sim' THEN 1 END) as with_cnpj
        FROM leads
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
      dailyLeadsParams = [Number(days)];
    }

    const [dailyLeads] = await db.execute(dailyLeadsQuery, dailyLeadsParams);

    // Buscar visitas por dia
    let dailyVisitsQuery: string;
    let dailyVisitsParams: any[];

    if (yesterday === "true") {
      const yesterday_date = new Date();
      yesterday_date.setDate(yesterday_date.getDate() - 1);
      const dateStr = yesterday_date.toISOString().split("T")[0];

      dailyVisitsQuery = `
        SELECT
          DATE(created_at) as date,
          COUNT(DISTINCT session_id) as sessions,
          COUNT(*) as page_views
        FROM analytics_events
        WHERE event_type = 'page_view' AND DATE(created_at) = ?
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
      dailyVisitsParams = [dateStr];
    } else {
      dailyVisitsQuery = `
        SELECT
          DATE(created_at) as date,
          COUNT(DISTINCT session_id) as sessions,
          COUNT(*) as page_views
        FROM analytics_events
        WHERE event_type = 'page_view'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
      dailyVisitsParams = [Number(days)];
    }

    const [dailyVisits] = await db.execute(dailyVisitsQuery, dailyVisitsParams);

    // Combinar dados de leads e visitas
    const dailyStatsMap = new Map();

    // Inicializar com dados de leads
    (dailyLeads as any[]).forEach((lead) => {
      dailyStatsMap.set(lead.date, {
        date: lead.date,
        total_leads: lead.total_leads,
        unique_leads: lead.unique_leads,
        duplicates: lead.duplicates,
        webhook_success: lead.webhook_success,
        with_cnpj: lead.with_cnpj,
        sessions: 0,
        page_views: 0,
        conversion_rate: 0,
      });
    });

    // Adicionar dados de visitas
    (dailyVisits as any[]).forEach((visit) => {
      const existing = dailyStatsMap.get(visit.date) || {
        date: visit.date,
        total_leads: 0,
        unique_leads: 0,
        duplicates: 0,
        webhook_success: 0,
        with_cnpj: 0,
        sessions: 0,
        page_views: 0,
        conversion_rate: 0,
      };

      existing.sessions = visit.sessions;
      existing.page_views = visit.page_views;
      existing.conversion_rate =
        existing.sessions > 0
          ? parseFloat(
              ((existing.total_leads / existing.sessions) * 100).toFixed(2),
            )
          : 0;

      dailyStatsMap.set(visit.date, existing);
    });

    const dailyStats = Array.from(dailyStatsMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    res.json({
      success: true,
      data: dailyStats,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas diárias:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

// GET /api/analytics/time-analysis - Análise de melhor horário e dia
export async function getTimeAnalysis(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { days = 30, yesterday } = req.query;

    // Análise por hora do dia
    const [hourlyStats] = await db.execute(
      `
      SELECT 
        HOUR(created_at) as hour,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads
      FROM leads 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY HOUR(created_at)
      ORDER BY hour
    `,
      [Number(days)],
    );

    // Análise por dia da semana (1=Segunda, 7=Domingo)
    const [weekdayStats] = await db.execute(
      `
      SELECT
        weekday_num,
        weekday_num + 1 as weekday,
        CASE weekday_num
          WHEN 0 THEN 'Segunda-feira'
          WHEN 1 THEN 'Terça-feira'
          WHEN 2 THEN 'Quarta-feira'
          WHEN 3 THEN 'Quinta-feira'
          WHEN 4 THEN 'Sexta-feira'
          WHEN 5 THEN 'Sábado'
          WHEN 6 THEN 'Domingo'
        END as weekday_name,
        total_leads,
        unique_leads
      FROM (
        SELECT
          WEEKDAY(created_at) as weekday_num,
          COUNT(*) as total_leads,
          COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads
        FROM leads
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY WEEKDAY(created_at)
      ) as weekday_data
      ORDER BY weekday_num
    `,
      [Number(days)],
    );

    // Encontrar melhor hora e dia - com proteção contra arrays vazios
    const bestHour =
      (hourlyStats as any[]).length > 0
        ? (hourlyStats as any[]).reduce((prev, current) =>
            prev.total_leads > current.total_leads ? prev : current,
          )
        : { hour: 0, total_leads: 0 };

    const bestWeekday =
      (weekdayStats as any[]).length > 0
        ? (weekdayStats as any[]).reduce((prev, current) =>
            prev.total_leads > current.total_leads ? prev : current,
          )
        : { weekday_name: "N/A", total_leads: 0 };

    res.json({
      success: true,
      data: {
        hourly_stats: hourlyStats,
        weekday_stats: weekdayStats,
        best_hour: {
          hour: bestHour.hour,
          total_leads: bestHour.total_leads,
          formatted: `${bestHour.hour}:00 - ${bestHour.hour + 1}:00`,
        },
        best_weekday: {
          name: bestWeekday.weekday_name,
          total_leads: bestWeekday.total_leads,
        },
      },
    });
  } catch (error) {
    console.error("Erro ao buscar análise temporal:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// GET /api/analytics/traffic-sources - Análise de origem do tráfego
export async function getTrafficSources(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { days = 30, yesterday } = req.query;

    // Determinar data para consulta
    const dateCondition =
      yesterday === "true"
        ? "DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)"
        : "created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)";
    const queryParams = yesterday === "true" ? [] : [Number(days)];

    // Análise por UTM source
    const [utmSources] = await db.execute(
      `
      SELECT
        COALESCE(NULLIF(utm_source, ''), 'Direct') as source,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads,
        COUNT(CASE WHEN webhook_status = 'success' THEN 1 END) as successful_webhooks
      FROM leads
      WHERE ${dateCondition}
      GROUP BY utm_source
      ORDER BY total_leads DESC
    `,
      queryParams,
    );

    // Análise por UTM medium
    const [utmMediums] = await db.execute(
      `
      SELECT 
        COALESCE(NULLIF(utm_medium, ''), 'Unknown') as medium,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads
      FROM leads 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY utm_medium
      ORDER BY total_leads DESC
    `,
      [Number(days)],
    );

    // Análise por UTM campaign
    const [utmCampaigns] = await db.execute(
      `
      SELECT 
        COALESCE(NULLIF(utm_campaign, ''), 'No Campaign') as campaign,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads
      FROM leads 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY utm_campaign
      ORDER BY total_leads DESC
      LIMIT 10
    `,
      [Number(days)],
    );

    // Análise por source (referrer)
    const [sources] = await db.execute(
      `
      SELECT 
        CASE 
          WHEN source = 'direct' THEN 'Acesso Direto'
          WHEN source LIKE '%google%' THEN 'Google'
          WHEN source LIKE '%facebook%' THEN 'Facebook'
          WHEN source LIKE '%instagram%' THEN 'Instagram'
          WHEN source LIKE '%whatsapp%' THEN 'WhatsApp'
          ELSE COALESCE(source, 'Unknown')
        END as source_name,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads
      FROM leads 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY source_name
      ORDER BY total_leads DESC
    `,
      [Number(days)],
    );

    res.json({
      success: true,
      data: {
        utm_sources: utmSources,
        utm_mediums: utmMediums,
        utm_campaigns: utmCampaigns,
        sources: sources,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar fontes de tráfego:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

// GET /api/analytics/form-origins - Análise de origem dos formulários
export async function getFormOrigins(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { days = 30, yesterday } = req.query;

    // Determinar condição de data
    let dateCondition: string;
    let queryParams: any[];

    if (yesterday === "true") {
      dateCondition = "DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
      queryParams = [];
    } else {
      dateCondition = "created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)";
      queryParams = [Number(days)];
    }

    // Buscar dados de origem do formulário
    const [formOrigins] = await db.execute(
      `
      SELECT
        COALESCE(NULLIF(form_origin, ''), 'Não Identificado') as origin,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads,
        COUNT(CASE WHEN experiencia_revenda = 'sim' THEN 1 END) as with_cnpj,
        COUNT(CASE WHEN webhook_status = 'success' THEN 1 END) as successful_webhooks,
        ROUND((COUNT(CASE WHEN experiencia_revenda = 'sim' THEN 1 END) / COUNT(*)) * 100, 2) as cnpj_rate
      FROM leads
      WHERE ${dateCondition}
      GROUP BY form_origin
      ORDER BY total_leads DESC
    `,
      queryParams,
    );

    // Buscar conversão por origem no tempo
    const [dailyByOrigin] = await db.execute(
      `
      SELECT
        DATE(created_at) as date,
        COALESCE(NULLIF(form_origin, ''), 'Não Identificado') as origin,
        COUNT(*) as leads_count
      FROM leads
      WHERE ${dateCondition}
      GROUP BY DATE(created_at), form_origin
      ORDER BY date DESC, leads_count DESC
    `,
      queryParams,
    );

    res.json({
      success: true,
      data: {
        form_origins: formOrigins,
        daily_by_origin: dailyByOrigin,
        period_days: yesterday === "true" ? 0 : Number(days),
        period_label: yesterday === "true" ? "ontem" : `últimos ${days} dias`,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar origens do formulário:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

// POST /api/analytics/track-visit - Rastrear visita na página
export async function trackVisit(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const {
      session_id,
      user_id,
      page_url,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      user_agent,
      duration_seconds,
      event_type,
    } = req.body;

    const ip_address = req.ip || req.connection.remoteAddress || "";

    // Gerar user_id baseado no IP + User Agent se não fornecido
    const computedUserId =
      user_id ||
      Buffer.from(`${ip_address}-${user_agent || ""}`)
        .toString("base64")
        .slice(0, 50);

    // Debug logs
    console.log(`📊 [TRACKING] Evento: ${event_type || "page_view"}`);
    console.log(`📊 [TRACKING] Session: ${session_id}`);
    console.log(`📊 [TRACKING] User: ${computedUserId}`);
    console.log(`📊 [TRACKING] Page: ${page_url || "N/A"}`);
    console.log(`📊 [TRACKING] IP: ${ip_address}`);
    console.log(`📊 [TRACKING] Timestamp: ${new Date().toISOString()}`);

    // Inserir evento de visita
    await db.execute(
      `
      INSERT INTO analytics_events (
        event_type, event_data, session_id, user_id, ip_address,
        user_agent, referrer, page_url, duration_seconds, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
      [
        event_type || "page_view",
        JSON.stringify({
          utm_source: utm_source || "",
          utm_medium: utm_medium || "",
          utm_campaign: utm_campaign || "",
        }),
        session_id,
        computedUserId,
        ip_address,
        user_agent || "",
        referrer || "",
        page_url || "",
        duration_seconds || 0,
      ],
    );

    console.log(`✅ [DATABASE] Evento ${event_type || "page_view"} salvo com sucesso`);
    console.log(`✅ [DATABASE] Session ${session_id} registrada na tabela analytics_events`);

    res.json({
      success: true,
      message: "Visita rastreada com sucesso",
      user_id: computedUserId,
    });
  } catch (error) {
    console.error("Erro ao rastrear visita:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

// GET /api/analytics/export-data - Exportar todos os dados para Excel
export async function exportAnalyticsData(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { days = 30, yesterday } = req.query;

    // Determinar condição de data
    let dateCondition: string;
    let queryParams: any[];

    if (yesterday === "true") {
      dateCondition = "DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
      queryParams = [];
    } else {
      dateCondition = "created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)";
      queryParams = [Number(days)];
    }

    // Buscar leads detalhados
    const [leads] = await db.execute(
      `
      SELECT
        id, nome, telefone, experiencia_revenda, tipo_loja,
        is_duplicate, source, utm_source, utm_medium, utm_campaign,
        webhook_status, webhook_response, created_at
      FROM leads
      WHERE ${dateCondition}
      ORDER BY created_at DESC
    `,
      queryParams,
    );

    // Buscar eventos de analytics
    const [events] = await db.execute(
      `
      SELECT
        session_id, user_id, event_type, ip_address,
        referrer, page_url, duration_seconds, created_at
      FROM analytics_events
      WHERE ${dateCondition}
      ORDER BY created_at DESC
    `,
      queryParams,
    );

    // Buscar estatísticas por hora
    const [hourlyStats] = await db.execute(
      `
      SELECT
        HOUR(created_at) as hour,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads
      FROM leads
      WHERE ${dateCondition}
      GROUP BY HOUR(created_at)
      ORDER BY hour
    `,
      queryParams,
    );

    res.json({
      success: true,
      data: {
        leads,
        events,
        hourly_stats: hourlyStats,
        export_date: new Date().toISOString(),
        period_days: yesterday === "true" ? 0 : Number(days),
        period_label: yesterday === "true" ? "ontem" : `últimos ${days} dias`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar dados analytics:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

// POST /api/analytics/track-duration - Atualizar duração da sessão
export async function trackDuration(req: Request, res: Response) {
  try {
    const db = getDatabase();

    // Dados vindos do fetch normal (JSON) ou sendBeacon (URLSearchParams)
    const { session_id, duration_seconds } = req.body;

    // Atualizar duração da última visita desta sessão
    await db.execute(
      `
      UPDATE analytics_events
      SET duration_seconds = ?
      WHERE session_id = ? AND event_type = 'page_view'
      ORDER BY created_at DESC
      LIMIT 1
    `,
      [duration_seconds, session_id],
    );

    res.json({
      success: true,
      message: "Duração atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar duração:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

// GET /api/analytics/conversion-by-location - Conversão por localização da página
export async function getConversionByLocation(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { days = 30, yesterday } = req.query;

    let dateFromStr: string;
    let dateToStr: string;

    if (yesterday === "true") {
      const yesterday_date = new Date();
      yesterday_date.setDate(yesterday_date.getDate() - 1);
      dateFromStr = yesterday_date.toISOString().split("T")[0] + " 00:00:00";
      dateToStr = yesterday_date.toISOString().split("T")[0] + " 23:59:59";
    } else {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - Number(days));
      dateFromStr = dateFrom.toISOString().split("T")[0];
      dateToStr = new Date().toISOString();
    }

    // Buscar conversão por origem da página (form_origin)
    const [locationConversion] = await db.execute(
      `
      SELECT
        form_origin,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads,
        COUNT(CASE WHEN webhook_status = 'success' THEN 1 END) as successful_webhooks,
        COUNT(CASE WHEN experiencia_revenda = 'sim' THEN 1 END) as with_cnpj,
        ROUND(AVG(CASE WHEN webhook_status = 'success' THEN 100 ELSE 0 END), 2) as webhook_success_rate
      FROM leads
      WHERE created_at >= ? AND created_at <= ?
        AND form_origin IS NOT NULL
        AND form_origin != ''
      GROUP BY form_origin
      ORDER BY total_leads DESC
    `,
      [dateFromStr, dateToStr],
    );

    // Buscar dados de analytics por evento para calcular conversão
    const [analyticsEvents] = await db.execute(
      `
      SELECT
        event_type,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(*) as total_events
      FROM analytics_events
      WHERE created_at >= ? AND created_at <= ?
      GROUP BY event_type
      ORDER BY total_events DESC
    `,
      [dateFromStr, dateToStr],
    );

    // Mapear nomes amigáveis para as origens
    const getOriginLabel = (origin: string): string => {
      const originLabels: Record<string, string> = {
        "hero-cta-secondary": "Hero - Descubra",
        "form-inline": "Formulário Principal",
        "benefits-cta": "Seção Vantagens",
        "testimonials-cta": "Depoimentos",
        "gallery-cta": "Galeria Produtos",
        "main-cta": "CTA Principal",
        "stats-cta": "Seção Estatísticas",
        "faq-cta": "Seção FAQ",
        "whatsapp-float": "WhatsApp Flutuante",
      };
      return originLabels[origin] || origin;
    };

    const formattedLocationData = (locationConversion as any[]).map((row) => ({
      location: row.form_origin,
      location_label: getOriginLabel(row.form_origin),
      total_leads: row.total_leads,
      unique_leads: row.unique_leads,
      successful_webhooks: row.successful_webhooks,
      with_cnpj: row.with_cnpj,
      webhook_success_rate: row.webhook_success_rate,
    }));

    res.json({
      success: true,
      data: {
        location_conversion: formattedLocationData,
        analytics_events: analyticsEvents,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar conversão por localização:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

// GET /api/analytics/conversion-by-geography - Conversão por cidades e estados
export async function getConversionByGeography(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { days = 30, yesterday } = req.query;

    let dateFromStr: string;
    let dateToStr: string;

    if (yesterday === "true") {
      const yesterday_date = new Date();
      yesterday_date.setDate(yesterday_date.getDate() - 1);
      dateFromStr = yesterday_date.toISOString().split("T")[0] + " 00:00:00";
      dateToStr = yesterday_date.toISOString().split("T")[0] + " 23:59:59";
    } else {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - Number(days));
      dateFromStr = dateFrom.toISOString().split("T")[0];
      dateToStr = new Date().toISOString();
    }

    // Conversão por estados
    const [stateConversion] = await db.execute(
      `
      SELECT
        estado,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads,
        COUNT(CASE WHEN webhook_status = 'success' THEN 1 END) as successful_webhooks,
        COUNT(CASE WHEN experiencia_revenda = 'sim' THEN 1 END) as with_cnpj,
        COUNT(CASE WHEN tipo_loja = 'fisica' THEN 1 END) as fisica_leads,
        COUNT(CASE WHEN tipo_loja = 'online' THEN 1 END) as online_leads,
        COUNT(CASE WHEN tipo_loja = 'ambas' THEN 1 END) as ambas_leads,
        ROUND(AVG(CASE WHEN webhook_status = 'success' THEN 100 ELSE 0 END), 2) as webhook_success_rate
      FROM leads
      WHERE created_at >= ? AND created_at <= ?
        AND estado IS NOT NULL
        AND estado != ''
      GROUP BY estado
      ORDER BY total_leads DESC
      LIMIT 20
    `,
      [dateFromStr, dateToStr],
    );

    // Conversão por cidades (top 15)
    const [cityConversion] = await db.execute(
      `
      SELECT
        cidade,
        estado,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads,
        COUNT(CASE WHEN webhook_status = 'success' THEN 1 END) as successful_webhooks,
        COUNT(CASE WHEN experiencia_revenda = 'sim' THEN 1 END) as with_cnpj,
        COUNT(CASE WHEN tipo_loja = 'fisica' THEN 1 END) as fisica_leads,
        COUNT(CASE WHEN tipo_loja = 'online' THEN 1 END) as online_leads,
        COUNT(CASE WHEN tipo_loja = 'ambas' THEN 1 END) as ambas_leads,
        ROUND(AVG(CASE WHEN webhook_status = 'success' THEN 100 ELSE 0 END), 2) as webhook_success_rate
      FROM leads
      WHERE created_at >= ? AND created_at <= ?
        AND cidade IS NOT NULL
        AND cidade != ''
      GROUP BY cidade, estado
      ORDER BY total_leads DESC
      LIMIT 15
    `,
      [dateFromStr, dateToStr],
    );

    res.json({
      success: true,
      data: {
        state_conversion: stateConversion,
        city_conversion: cityConversion,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar conversão por geografia:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

// POST /api/analytics/test-pixel - Testar Facebook Pixel
export async function testFacebookPixel(req: Request, res: Response) {
  try {
    const { pixel_id, access_token, test_event_code } = req.body;

    if (!pixel_id) {
      return res.status(400).json({
        success: false,
        message: "Pixel ID é obrigatório",
      });
    }

    // Simular evento de teste
    const testEventData = {
      data: [
        {
          event_name: "Lead",
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: "https://revendedores.ecko.com.br/",
          user_data: {
            client_ip_address: req.ip || "127.0.0.1",
            client_user_agent: req.get("User-Agent") || "",
            fbp: `fb.1.${Date.now()}.123456789`,
            fbc: `fb.1.${Date.now()}.test_conversion`,
          },
          custom_data: {
            content_name: "Lead Form Test",
            content_category: "lead_generation",
            value: 1.0,
            currency: "BRL",
          },
        },
      ],
      test_event_code: test_event_code || undefined,
    };

    // Se access_token foi fornecido, tentar enviar para Conversions API
    if (access_token) {
      try {
        const conversionResponse = await fetch(
          `https://graph.facebook.com/v18.0/${pixel_id}/events`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${access_token}`,
            },
            body: JSON.stringify(testEventData),
          },
        );

        const conversionResult = await conversionResponse.json();

        if (conversionResponse.ok) {
          res.json({
            success: true,
            message: "Teste de Pixel e Conversions API executado com sucesso",
            facebook_response: conversionResult,
            test_data: testEventData,
          });
        } else {
          res.status(400).json({
            success: false,
            message: `Erro da API do Facebook: ${conversionResult.error?.message || "Erro desconhecido"}`,
            facebook_error: conversionResult.error,
          });
        }
      } catch (fetchError) {
        console.error("Erro ao chamar Facebook API:", fetchError);
        res.status(500).json({
          success: false,
          message: "Erro ao conectar com a API do Facebook",
          error: fetchError.message,
        });
      }
    } else {
      // Sem access token, apenas retornar sucesso simulado
      res.json({
        success: true,
        message: "Teste de Pixel simulado com sucesso (sem Conversions API)",
        simulated_data: testEventData,
        note: "Para testar Conversions API, configure o Access Token",
      });
    }
  } catch (error) {
    console.error("Erro no teste de pixel:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
}
