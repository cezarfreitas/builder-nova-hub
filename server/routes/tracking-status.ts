import express from "express";
import { initializeDatabase } from "../config/database";

const router = express.Router();

// GET /api/tracking-status - Verificar status geral do tracking
router.get("/", async (req, res) => {
  try {
    const db = await initializeDatabase();
    
    // Verificar eventos recentes (últimas 24 horas)
    const recentEvents = await db.query(`
      SELECT 
        event_name,
        COUNT(*) as count,
        MAX(created_at) as last_event
      FROM analytics_events 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY event_name
      ORDER BY count DESC
    `);

    // Verificar sessões ativas (últimas 2 horas)
    const activeSessions = await db.query(`
      SELECT COUNT(DISTINCT session_id) as active_sessions
      FROM analytics_events 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
    `);

    // Verificar Meta tracking (últimos eventos)
    const metaEvents = await db.query(`
      SELECT 
        COUNT(*) as total_meta_events,
        MAX(created_at) as last_meta_event
      FROM analytics_events 
      WHERE event_name LIKE '%Meta%' OR event_name LIKE '%Lead%'
      AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    // Verificar traffic sources
    const trafficSources = await db.query(`
      SELECT 
        source,
        medium,
        COUNT(*) as visits
      FROM traffic_sources 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY source, medium
      ORDER BY visits DESC
      LIMIT 5
    `);

    const status = {
      timestamp: new Date().toISOString(),
      database_connected: true,
      analytics: {
        recent_events: recentEvents,
        active_sessions: activeSessions[0]?.active_sessions || 0,
        total_events_24h: recentEvents.reduce((sum, event) => sum + Number(event.count), 0)
      },
      meta_tracking: {
        total_events_24h: metaEvents[0]?.total_meta_events || 0,
        last_event: metaEvents[0]?.last_meta_event
      },
      traffic_sources: trafficSources,
      status: 'healthy'
    };

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error("Erro ao verificar status do tracking:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao verificar status",
      details: error instanceof Error ? error.message : "Erro desconhecido",
      status: 'error'
    });
  }
});

// GET /api/tracking-status/live - Stream de eventos em tempo real
router.get("/live", async (req, res) => {
  try {
    const db = await initializeDatabase();
    
    // Últimos 10 eventos
    const liveEvents = await db.query(`
      SELECT 
        event_name,
        session_id,
        page_url,
        created_at,
        event_data
      FROM analytics_events 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        live_events: liveEvents,
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Erro ao buscar eventos live:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao buscar eventos live"
    });
  }
});

export default router;
