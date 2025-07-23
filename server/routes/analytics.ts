import { Request, Response } from "express";
import { getDatabase } from '../config/database';

// GET /api/analytics/overview - Métricas gerais
export async function getAnalyticsOverview(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { days = 30 } = req.query;
    
    // Data de início para o período
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - Number(days));
    const dateFromStr = dateFrom.toISOString().split('T')[0];

    // Buscar métricas gerais
    const [overview] = await db.execute(`
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
    `, [dateFromStr]);

    // Buscar visitas do analytics_events com métricas avançadas
    const [visits] = await db.execute(`
      SELECT
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) as total_page_views,
        COUNT(CASE WHEN DATE(created_at) >= ? THEN 1 END) as period_page_views,
        AVG(duration_seconds) as avg_session_duration,
        COUNT(*) / COUNT(DISTINCT session_id) as pages_per_session
      FROM analytics_events
      WHERE event_type = 'page_view'
    `, [dateFromStr]);

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

    // Calcular taxa de conversão
    const conversionRate = visitStats.total_sessions > 0 
      ? ((stats.total_leads / visitStats.total_sessions) * 100).toFixed(2)
      : '0.00';

    const periodConversionRate = visitStats.period_page_views > 0
      ? ((stats.period_leads / visitStats.period_page_views) * 100).toFixed(2)
      : '0.00';

    res.json({
      success: true,
      data: {
        leads: {
          total: stats.total_leads,
          unique: stats.unique_leads,
          duplicates: stats.duplicate_leads,
          period: stats.period_leads,
          with_cnpj: stats.leads_with_cnpj
        },
        store_types: {
          fisica: stats.fisica_leads,
          online: stats.online_leads,
          ambas: stats.ambas_leads
        },
        webhooks: {
          success: stats.webhook_success,
          errors: stats.webhook_errors
        },
        traffic: {
          total_sessions: visitStats.total_sessions,
          total_page_views: visitStats.total_page_views,
          period_page_views: visitStats.period_page_views
        },
        conversion: {
          rate: parseFloat(conversionRate),
          period_rate: parseFloat(periodConversionRate)
        },
        period_days: Number(days)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar overview analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// GET /api/analytics/daily-stats - Estatísticas diárias
export async function getDailyStats(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { days = 30 } = req.query;

    // Buscar leads por dia
    const [dailyLeads] = await db.execute(`
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
    `, [Number(days)]);

    // Buscar visitas por dia
    const [dailyVisits] = await db.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT session_id) as sessions,
        COUNT(*) as page_views
      FROM analytics_events 
      WHERE event_type = 'page_view' 
      AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [Number(days)]);

    // Combinar dados de leads e visitas
    const dailyStatsMap = new Map();
    
    // Inicializar com dados de leads
    (dailyLeads as any[]).forEach(lead => {
      dailyStatsMap.set(lead.date, {
        date: lead.date,
        total_leads: lead.total_leads,
        unique_leads: lead.unique_leads,
        duplicates: lead.duplicates,
        webhook_success: lead.webhook_success,
        with_cnpj: lead.with_cnpj,
        sessions: 0,
        page_views: 0,
        conversion_rate: 0
      });
    });

    // Adicionar dados de visitas
    (dailyVisits as any[]).forEach(visit => {
      const existing = dailyStatsMap.get(visit.date) || {
        date: visit.date,
        total_leads: 0,
        unique_leads: 0,
        duplicates: 0,
        webhook_success: 0,
        with_cnpj: 0,
        sessions: 0,
        page_views: 0,
        conversion_rate: 0
      };
      
      existing.sessions = visit.sessions;
      existing.page_views = visit.page_views;
      existing.conversion_rate = existing.sessions > 0 
        ? parseFloat(((existing.total_leads / existing.sessions) * 100).toFixed(2))
        : 0;
      
      dailyStatsMap.set(visit.date, existing);
    });

    const dailyStats = Array.from(dailyStatsMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    res.json({
      success: true,
      data: dailyStats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas diárias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// GET /api/analytics/time-analysis - Análise de melhor horário e dia
export async function getTimeAnalysis(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { days = 30 } = req.query;

    // Análise por hora do dia
    const [hourlyStats] = await db.execute(`
      SELECT 
        HOUR(created_at) as hour,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads
      FROM leads 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY HOUR(created_at)
      ORDER BY hour
    `, [Number(days)]);

    // Análise por dia da semana (1=Segunda, 7=Domingo)
    const [weekdayStats] = await db.execute(`
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
    `, [Number(days)]);

    // Encontrar melhor hora e dia - com proteção contra arrays vazios
    const bestHour = (hourlyStats as any[]).length > 0
      ? (hourlyStats as any[]).reduce((prev, current) =>
          (prev.total_leads > current.total_leads) ? prev : current)
      : { hour: 0, total_leads: 0 };

    const bestWeekday = (weekdayStats as any[]).length > 0
      ? (weekdayStats as any[]).reduce((prev, current) =>
          (prev.total_leads > current.total_leads) ? prev : current)
      : { weekday_name: 'N/A', total_leads: 0 };

    res.json({
      success: true,
      data: {
        hourly_stats: hourlyStats,
        weekday_stats: weekdayStats,
        best_hour: {
          hour: bestHour.hour,
          total_leads: bestHour.total_leads,
          formatted: `${bestHour.hour}:00 - ${bestHour.hour + 1}:00`
        },
        best_weekday: {
          name: bestWeekday.weekday_name,
          total_leads: bestWeekday.total_leads
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar análise temporal:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// GET /api/analytics/traffic-sources - Análise de origem do tráfego
export async function getTrafficSources(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { days = 30 } = req.query;

    // Análise por UTM source
    const [utmSources] = await db.execute(`
      SELECT 
        COALESCE(NULLIF(utm_source, ''), 'Direct') as source,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads,
        COUNT(CASE WHEN webhook_status = 'success' THEN 1 END) as successful_webhooks
      FROM leads 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY utm_source
      ORDER BY total_leads DESC
    `, [Number(days)]);

    // Análise por UTM medium
    const [utmMediums] = await db.execute(`
      SELECT 
        COALESCE(NULLIF(utm_medium, ''), 'Unknown') as medium,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads
      FROM leads 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY utm_medium
      ORDER BY total_leads DESC
    `, [Number(days)]);

    // Análise por UTM campaign
    const [utmCampaigns] = await db.execute(`
      SELECT 
        COALESCE(NULLIF(utm_campaign, ''), 'No Campaign') as campaign,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN is_duplicate = FALSE THEN 1 END) as unique_leads
      FROM leads 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY utm_campaign
      ORDER BY total_leads DESC
      LIMIT 10
    `, [Number(days)]);

    // Análise por source (referrer)
    const [sources] = await db.execute(`
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
    `, [Number(days)]);

    res.json({
      success: true,
      data: {
        utm_sources: utmSources,
        utm_mediums: utmMediums,
        utm_campaigns: utmCampaigns,
        sources: sources
      }
    });
  } catch (error) {
    console.error('Erro ao buscar fontes de tráfego:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// POST /api/analytics/track-visit - Rastrear visita na página
export async function trackVisit(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const {
      session_id,
      page_url,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      user_agent
    } = req.body;

    const ip_address = req.ip || req.connection.remoteAddress || '';

    // Inserir evento de visita
    await db.execute(`
      INSERT INTO analytics_events (
        event_type, event_data, session_id, ip_address, 
        user_agent, referrer, page_url, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      'page_view',
      JSON.stringify({
        utm_source: utm_source || '',
        utm_medium: utm_medium || '',
        utm_campaign: utm_campaign || ''
      }),
      session_id,
      ip_address,
      user_agent || '',
      referrer || '',
      page_url || ''
    ]);

    res.json({
      success: true,
      message: 'Visita rastreada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao rastrear visita:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}
