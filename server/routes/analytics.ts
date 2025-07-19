import { RequestHandler } from "express";
import { DailyStats, DailyStatsResponse } from "@shared/api";
import pool from "../database";
import { RowDataPacket } from "mysql2";

// Interface for MySQL daily stats rows
interface DailyStatsRow extends RowDataPacket {
  date: string;
  total_leads: number;
  new_leads: number;
  duplicates: number;
  webhook_sent: number;
  webhook_failed: number;
}

interface SummaryRow extends RowDataPacket {
  total_leads: number;
  today_leads: number;
  duplicates_today: number;
  webhooks_pending: number;
}

// GET /api/analytics/daily - Get daily lead statistics
export const getDailyStats: RequestHandler = async (req, res) => {
  try {
    const { days = "30" } = req.query;
    const daysNum = parseInt(days as string) || 30;

    // Get daily statistics for the last N days
    const [dailyStats] = await pool.execute<DailyStatsRow[]>(
      `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_leads,
        COUNT(*) as new_leads,
        SUM(CASE WHEN is_duplicate = TRUE THEN 1 ELSE 0 END) as duplicates,
        SUM(CASE WHEN webhook_sent = TRUE THEN 1 ELSE 0 END) as webhook_sent,
        SUM(CASE WHEN webhook_sent = FALSE THEN 1 ELSE 0 END) as webhook_failed
      FROM leads 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      `,
      [daysNum],
    );

    // Get summary statistics
    const [summaryResult] = await pool.execute<SummaryRow[]>(
      `
      SELECT 
        (SELECT COUNT(*) FROM leads) as total_leads,
        (SELECT COUNT(*) FROM leads WHERE DATE(created_at) = CURDATE()) as today_leads,
        (SELECT COUNT(*) FROM leads WHERE DATE(created_at) = CURDATE() AND is_duplicate = TRUE) as duplicates_today,
        (SELECT COUNT(*) FROM leads WHERE webhook_sent = FALSE) as webhooks_pending
      `,
    );

    const summary = summaryResult[0];

    const stats: DailyStats[] = dailyStats.map((row) => ({
      date: row.date,
      total_leads: row.total_leads,
      new_leads: row.new_leads,
      duplicates: row.duplicates,
      webhook_sent: row.webhook_sent,
      webhook_failed: row.webhook_failed,
    }));

    const response: DailyStatsResponse = {
      stats,
      summary: {
        total_leads: summary.total_leads,
        today_leads: summary.today_leads,
        duplicates_today: summary.duplicates_today,
        webhooks_pending: summary.webhooks_pending,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching daily stats:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar estatísticas diárias",
    });
  }
};

// POST /api/analytics/webhook/:id - Send webhook for specific lead
export const sendWebhook: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { webhook_url } = req.body;

    if (!webhook_url) {
      return res.status(400).json({
        success: false,
        message: "URL do webhook é obrigatória",
      });
    }

    // Get lead data
    const [leadResult] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM leads WHERE id = ?",
      [id],
    );

    if (leadResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lead não encontrado",
      });
    }

    const lead = leadResult[0];

    try {
      // Send webhook
      const webhookResponse = await fetch(webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_lead: lead.id,
          name: lead.name,
          whatsapp: lead.whatsapp,
          hasCnpj: lead.hasCnpj,
          storeType: lead.storeType,
          status: lead.status,
          created_at: lead.created_at,
        }),
        timeout: 10000, // 10 second timeout
      });

      const responseText = await webhookResponse.text();

      // Update lead with webhook result
      await pool.execute(
        `UPDATE leads 
         SET webhook_sent = TRUE, webhook_response = ?, webhook_sent_at = NOW() 
         WHERE id = ?`,
        [responseText, id],
      );

      res.json({
        success: true,
        message: "Webhook enviado com sucesso",
        webhook_response: responseText,
        status_code: webhookResponse.status,
      });
    } catch (webhookError) {
      // Update lead with webhook failure
      await pool.execute(
        `UPDATE leads 
         SET webhook_sent = FALSE, webhook_response = ?, webhook_sent_at = NOW() 
         WHERE id = ?`,
        [webhookError.message, id],
      );

      res.status(500).json({
        success: false,
        message: "Erro ao enviar webhook",
        error: webhookError.message,
      });
    }
  } catch (error) {
    console.error("Error sending webhook:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// POST /api/analytics/check-duplicates - Check for duplicate leads
export const checkDuplicates: RequestHandler = async (req, res) => {
  try {
    // Find duplicates based on whatsapp number
    const [duplicates] = await pool.execute<RowDataPacket[]>(
      `
      UPDATE leads 
      SET is_duplicate = TRUE 
      WHERE id NOT IN (
        SELECT * FROM (
          SELECT MIN(id) 
          FROM leads 
          GROUP BY whatsapp
        ) as first_leads
      )
      `,
    );

    // Get updated duplicate count
    const [duplicateCount] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM leads WHERE is_duplicate = TRUE",
    );

    res.json({
      success: true,
      message: "Verificação de duplicados concluída",
      duplicates_found: duplicateCount[0].count,
    });
  } catch (error) {
    console.error("Error checking duplicates:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao verificar duplicados",
    });
  }
};
