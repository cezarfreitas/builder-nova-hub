import { Request, Response } from "express";
import { getDatabase } from "../config/database";

// POST /api/traffic/track - Rastrear origem de tráfego
export async function trackTrafficSource(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const {
      session_id,
      user_id,
      referrer,
      source_name,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      current_url,
      page_title,
    } = req.body;

    const ip_address = req.ip || req.connection.remoteAddress || "";
    const user_agent = req.get("User-Agent") || "";

    // Inserir origem de tráfego
    await db.execute(
      `
      INSERT INTO traffic_sources (
        session_id, user_id, referrer, source_name, utm_source, utm_medium,
        utm_campaign, utm_term, utm_content, current_url, page_title,
        ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
      [
        session_id,
        user_id || null,
        referrer || "",
        source_name || "Direto",
        utm_source || "",
        utm_medium || "",
        utm_campaign || "",
        utm_term || "",
        utm_content || "",
        current_url || "",
        page_title || "",
        ip_address,
        user_agent,
      ],
    );

    console.log(
      `📊 Origem de tráfego rastreada: ${source_name} (${session_id})`,
    );

    res.json({
      success: true,
      message: "Origem de tráfego rastreada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao rastrear origem de tráfego:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

// GET /api/traffic/sources - Buscar fontes de tráfego
export async function getTrafficSources(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { days = 30 } = req.query;

    // Buscar dados dos últimos X dias
    const [sources] = await db.execute(
      `
      SELECT 
        source_name,
        COUNT(*) as total_visits,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(DISTINCT user_id) as unique_users,
        ROUND((COUNT(*) / (
          SELECT COUNT(*) FROM traffic_sources 
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        )) * 100, 1) as percentage
      FROM traffic_sources 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY source_name
      ORDER BY total_visits DESC
    `,
      [Number(days), Number(days)],
    );

    // Buscar dados UTM
    const [utmSources] = await db.execute(
      `
      SELECT 
        utm_source as source,
        COUNT(*) as total_visits
      FROM traffic_sources 
      WHERE utm_source IS NOT NULL 
        AND utm_source != ''
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY utm_source
      ORDER BY total_visits DESC
      LIMIT 10
    `,
      [Number(days)],
    );

    const [utmMediums] = await db.execute(
      `
      SELECT 
        utm_medium as medium,
        COUNT(*) as total_visits
      FROM traffic_sources 
      WHERE utm_medium IS NOT NULL 
        AND utm_medium != ''
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY utm_medium
      ORDER BY total_visits DESC
      LIMIT 10
    `,
      [Number(days)],
    );

    const [utmCampaigns] = await db.execute(
      `
      SELECT 
        utm_campaign as campaign,
        COUNT(*) as total_visits
      FROM traffic_sources 
      WHERE utm_campaign IS NOT NULL 
        AND utm_campaign != ''
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY utm_campaign
      ORDER BY total_visits DESC
      LIMIT 10
    `,
      [Number(days)],
    );

    // Buscar referrers detalhados
    const [referrers] = await db.execute(
      `
      SELECT
        CASE
          WHEN referrer = '' OR referrer IS NULL THEN 'Direto'
          ELSE source_name
        END as referrer,
        COUNT(*) as visits,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM traffic_sources
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY CASE
        WHEN referrer = '' OR referrer IS NULL THEN 'Direto'
        ELSE source_name
      END
      ORDER BY visits DESC
      LIMIT 15
    `,
      [Number(days)],
    );

    // Total de visitas no período
    const [totalVisits] = await db.execute(
      `
      SELECT COUNT(*) as total
      FROM traffic_sources 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `,
      [Number(days)],
    );

    res.json({
      success: true,
      data: {
        sources,
        utm_sources: utmSources,
        utm_mediums: utmMediums,
        utm_campaigns: utmCampaigns,
        referrers,
        total_visits: (totalVisits as any)[0]?.total || 0,
        period_days: Number(days),
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

// GET /api/traffic/recent - Buscar origens recentes
export async function getRecentTraffic(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { limit = 50 } = req.query;

    const [recent] = await db.execute(
      `
      SELECT 
        id,
        session_id,
        source_name,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        current_url,
        page_title,
        ip_address,
        created_at
      FROM traffic_sources 
      ORDER BY created_at DESC
      LIMIT ?
    `,
      [Number(limit)],
    );

    res.json({
      success: true,
      data: recent,
    });
  } catch (error) {
    console.error("Erro ao buscar tráfego recente:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}
