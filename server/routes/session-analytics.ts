import { RequestHandler } from "express";
import pool from "../database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Interface for session data
interface SessionRow extends RowDataPacket {
  id: string;
  user_agent: string;
  ip_address: string;
  referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  country?: string;
  region?: string;
  city?: string;
  device_type: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  screen_resolution: string;
  language: string;
  timezone: string;
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  page_views: number;
  bounce: boolean;
  conversion: boolean;
}

interface EventRow extends RowDataPacket {
  id: number;
  session_id: string;
  event_type: string;
  event_category?: string;
  event_action?: string;
  event_label?: string;
  event_value?: string;
  page_url: string;
  page_title: string;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  timestamp: string;
}

interface ConversionRow extends RowDataPacket {
  id: number;
  session_id: string;
  lead_id?: number;
  conversion_type: string;
  conversion_value?: string;
  form_data?: string;
  page_url: string;
  timestamp: string;
}

// POST /api/analytics/session - Start new session
export const startSession: RequestHandler = async (req, res) => {
  try {
    const {
      id,
      userAgent,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      deviceType,
      browser,
      os,
      screenResolution,
      language,
      timezone,
    } = req.body;

    // Get client IP address
    const ipAddress =
      req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      "unknown";

    await pool.execute(
      `INSERT INTO sessions 
       (id, user_agent, ip_address, referrer, utm_source, utm_medium, utm_campaign, 
        utm_term, utm_content, device_type, browser, os, screen_resolution, language, timezone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id || `session-${Date.now()}`,
        userAgent || "unknown",
        ipAddress || "unknown",
        referrer || "direct",
        utmSource || null,
        utmMedium || null,
        utmCampaign || null,
        utmTerm || null,
        utmContent || null,
        deviceType || "desktop",
        browser || "unknown",
        os || "unknown",
        screenResolution || "unknown",
        language || "en",
        timezone || "UTC",
      ],
    );

    res.json({
      success: true,
      message: "Session started successfully",
      sessionId: id,
    });
  } catch (error) {
    console.error("Error starting session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start session",
    });
  }
};

// PUT /api/analytics/session/update - Update session data
export const updateSession: RequestHandler = async (req, res) => {
  try {
    const { sessionId, duration, pageViews, bounce, lastActivity } = req.body;

    // Validate required parameters
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    await pool.execute(
      `UPDATE sessions 
       SET duration_seconds = ?, page_views = ?, bounce = ?
       WHERE id = ?`,
      [duration, pageViews, bounce, sessionId],
    );

    res.json({
      success: true,
      message: "Session updated successfully",
    });
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update session",
    });
  }
};

// POST /api/analytics/session/end - End session
export const endSession: RequestHandler = async (req, res) => {
  try {
    const { sessionId, duration, pageViews, bounce } = req.body;

    await pool.execute(
      `UPDATE sessions 
       SET ended_at = NOW(), duration_seconds = ?, page_views = ?, bounce = ?
       WHERE id = ?`,
      [duration, pageViews, bounce, sessionId],
    );

    res.json({
      success: true,
      message: "Session ended successfully",
    });
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to end session",
    });
  }
};

// POST /api/analytics/event - Track event
export const trackEvent: RequestHandler = async (req, res) => {
  try {
    const {
      sessionId,
      eventType,
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      pageUrl,
      pageTitle,
      elementId,
      elementClass,
      elementText,
    } = req.body;

    await pool.execute(
      `INSERT INTO events 
       (session_id, event_type, event_category, event_action, event_label, 
        event_value, page_url, page_title, element_id, element_class, element_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId || null,
        eventType || "unknown",
        eventCategory || null,
        eventAction || null,
        eventLabel || null,
        eventValue || null,
        pageUrl || "",
        pageTitle || "",
        elementId || null,
        elementClass || null,
        elementText || null,
      ],
    );

    res.json({
      success: true,
      message: "Event tracked successfully",
    });
  } catch (error) {
    console.error("Error tracking event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track event",
    });
  }
};

// POST /api/analytics/conversion - Track conversion
export const trackConversion: RequestHandler = async (req, res) => {
  try {
    const {
      sessionId,
      leadId,
      conversionType,
      conversionValue,
      formData,
      pageUrl,
    } = req.body;

    // Insert conversion
    await pool.execute(
      `INSERT INTO conversions 
       (session_id, lead_id, conversion_type, conversion_value, form_data, page_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sessionId, leadId, conversionType, conversionValue, formData, pageUrl],
    );

    // Update session to mark as converted
    await pool.execute(`UPDATE sessions SET conversion = TRUE WHERE id = ?`, [
      sessionId,
    ]);

    res.json({
      success: true,
      message: "Conversion tracked successfully",
    });
  } catch (error) {
    console.error("Error tracking conversion:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track conversion",
    });
  }
};

// GET /api/analytics/sessions - Get session analytics
export const getSessionAnalytics: RequestHandler = async (req, res) => {
  try {
    const { days = "30", page = "1", limit = "50" } = req.query;
    const daysNum = parseInt(days as string) || 30;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const offset = (pageNum - 1) * limitNum;

    // Get session summary stats
    const [summaryResult] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN conversion = TRUE THEN 1 END) as converted_sessions,
        ROUND(AVG(duration_seconds)) as avg_duration,
        ROUND(AVG(page_views)) as avg_page_views,
        COUNT(CASE WHEN bounce = TRUE THEN 1 END) as bounce_sessions,
        COUNT(CASE WHEN DATE(started_at) = CURDATE() THEN 1 END) as today_sessions,
        COUNT(CASE WHEN utm_source IS NOT NULL THEN 1 END) as utm_sessions
       FROM sessions 
       WHERE started_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
      [daysNum],
    );

    // Get daily session stats
    const [dailyStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        DATE(started_at) as date,
        COUNT(*) as sessions,
        COUNT(CASE WHEN conversion = TRUE THEN 1 END) as conversions,
        ROUND(AVG(duration_seconds)) as avg_duration,
        COUNT(CASE WHEN bounce = TRUE THEN 1 END) as bounces,
        COUNT(DISTINCT device_type) as device_types
       FROM sessions 
       WHERE started_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(started_at)
       ORDER BY date DESC`,
      [daysNum],
    );

    // Get top traffic sources
    const [trafficSources] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COALESCE(utm_source, 'direct') as source,
        COALESCE(utm_medium, 'none') as medium,
        COUNT(*) as sessions,
        COUNT(CASE WHEN conversion = TRUE THEN 1 END) as conversions,
        ROUND(AVG(duration_seconds)) as avg_duration
       FROM sessions 
       WHERE started_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY utm_source, utm_medium
       ORDER BY sessions DESC
       LIMIT 10`,
      [daysNum],
    );

    // Get device breakdown
    const [deviceStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        device_type,
        COUNT(*) as sessions,
        COUNT(CASE WHEN conversion = TRUE THEN 1 END) as conversions,
        ROUND(AVG(duration_seconds)) as avg_duration
       FROM sessions 
       WHERE started_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY device_type
       ORDER BY sessions DESC`,
      [daysNum],
    );

    // Get recent sessions with details
    const [recentSessions] = await pool.execute<SessionRow[]>(
      `SELECT * FROM sessions 
       WHERE started_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY started_at DESC 
       LIMIT ? OFFSET ?`,
      [daysNum, limitNum, offset],
    );

    const summary = summaryResult[0];
    const conversionRate = summary.total_sessions
      ? ((summary.converted_sessions / summary.total_sessions) * 100).toFixed(2)
      : "0.00";

    res.json({
      success: true,
      summary: {
        ...summary,
        conversion_rate: conversionRate,
        bounce_rate: summary.total_sessions
          ? ((summary.bounce_sessions / summary.total_sessions) * 100).toFixed(
              2,
            )
          : "0.00",
      },
      dailyStats,
      trafficSources,
      deviceStats,
      recentSessions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: summary.total_sessions,
      },
    });
  } catch (error) {
    console.error("Error fetching session analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch session analytics",
    });
  }
};

// GET /api/analytics/events - Get event analytics
export const getEventAnalytics: RequestHandler = async (req, res) => {
  try {
    const { days = "30", eventType, eventCategory } = req.query;
    const daysNum = parseInt(days as string) || 30;

    let whereClause =
      "WHERE e.timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)";
    const params: any[] = [daysNum];

    if (eventType) {
      whereClause += " AND e.event_type = ?";
      params.push(eventType);
    }

    if (eventCategory) {
      whereClause += " AND e.event_category = ?";
      params.push(eventCategory);
    }

    // Get event summary
    const [eventSummary] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT e.session_id) as unique_sessions,
        COUNT(CASE WHEN e.event_type = 'conversion' THEN 1 END) as conversion_events,
        COUNT(CASE WHEN e.event_category = 'form' THEN 1 END) as form_events,
        COUNT(CASE WHEN e.event_action = 'button_click' THEN 1 END) as button_clicks
       FROM events e ${whereClause}`,
      params,
    );

    // Get top events
    const [topEvents] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        e.event_type,
        e.event_category,
        e.event_action,
        COUNT(*) as event_count,
        COUNT(DISTINCT e.session_id) as unique_sessions
       FROM events e ${whereClause}
       GROUP BY e.event_type, e.event_category, e.event_action
       ORDER BY event_count DESC
       LIMIT 20`,
      params,
    );

    // Get conversion events specifically
    const [conversionEvents] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        c.conversion_type,
        COUNT(*) as conversion_count,
        COUNT(DISTINCT c.session_id) as unique_sessions,
        DATE(c.timestamp) as date
       FROM conversions c 
       WHERE c.timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY c.conversion_type, DATE(c.timestamp)
       ORDER BY date DESC, conversion_count DESC`,
      [daysNum],
    );

    // Get "no store" conversions specifically
    const [noStoreSessions] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        s.id as session_id,
        s.utm_source,
        s.utm_medium,
        s.device_type,
        s.started_at,
        c.timestamp as conversion_time,
        c.conversion_value
       FROM conversions c
       JOIN sessions s ON c.session_id = s.id
       WHERE c.conversion_type = 'no_store_indication'
       AND c.timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY c.timestamp DESC`,
      [daysNum],
    );

    res.json({
      success: true,
      summary: eventSummary[0],
      topEvents,
      conversionEvents,
      noStoreSessions,
    });
  } catch (error) {
    console.error("Error fetching event analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event analytics",
    });
  }
};

// GET /api/analytics/conversions - Get conversion analytics
export const getConversionAnalytics: RequestHandler = async (req, res) => {
  try {
    const { days = "30" } = req.query;
    const daysNum = parseInt(days as string) || 30;

    // Get conversion summary
    const [conversionSummary] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_conversions,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(CASE WHEN conversion_type = 'lead_form' THEN 1 END) as form_conversions,
        COUNT(CASE WHEN conversion_type = 'phone_click' THEN 1 END) as phone_conversions,
        COUNT(CASE WHEN conversion_type = 'email_click' THEN 1 END) as email_conversions,
        COUNT(CASE WHEN conversion_type = 'social_click' THEN 1 END) as social_conversions,
        COUNT(CASE WHEN conversion_type = 'no_store_indication' THEN 1 END) as no_store_conversions,
        COUNT(CASE WHEN DATE(timestamp) = CURDATE() THEN 1 END) as today_conversions
       FROM conversions 
       WHERE timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
      [daysNum],
    );

    // Get daily conversion breakdown
    const [dailyConversions] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        DATE(timestamp) as date,
        conversion_type,
        COUNT(*) as conversions
       FROM conversions 
       WHERE timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(timestamp), conversion_type
       ORDER BY date DESC, conversions DESC`,
      [daysNum],
    );

    // Get conversion funnel data
    const [funnelData] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        'sessions' as step,
        COUNT(DISTINCT s.id) as count,
        1 as step_order
       FROM sessions s
       WHERE s.started_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       
       UNION ALL
       
       SELECT 
        'form_interactions' as step,
        COUNT(DISTINCT e.session_id) as count,
        2 as step_order
       FROM events e
       WHERE e.event_category = 'form' 
       AND e.timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       
       UNION ALL
       
       SELECT 
        'conversions' as step,
        COUNT(DISTINCT c.session_id) as count,
        3 as step_order
       FROM conversions c
       WHERE c.timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       
       ORDER BY step_order`,
      [daysNum, daysNum, daysNum],
    );

    // Get recent conversions with session details
    const [recentConversions] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        c.*,
        s.utm_source,
        s.utm_medium,
        s.device_type,
        s.browser,
        s.started_at as session_start,
        l.name as lead_name,
        l.whatsapp as lead_whatsapp
       FROM conversions c
       JOIN sessions s ON c.session_id = s.id
       LEFT JOIN leads l ON c.lead_id = l.id
       WHERE c.timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY c.timestamp DESC
       LIMIT 50`,
      [daysNum],
    );

    res.json({
      success: true,
      summary: conversionSummary[0],
      dailyConversions,
      funnelData,
      recentConversions,
    });
  } catch (error) {
    console.error("Error fetching conversion analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversion analytics",
    });
  }
};
