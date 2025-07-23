import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { submitLead, getLeads, resendWebhook, deleteLead, getLeadStats } from "./routes/leads";
import { testWebhook } from "./routes/webhook-test";
import { getSettings, getSetting, updateSetting, updateSettings, deleteSetting, getHeroSettings, updateHeroSettings } from "./routes/settings";
import { upload, uploadSeoImage, deleteUploadedImage, listUploadedImages } from "./routes/uploads";
import { testDatabaseConnection, getDatabaseInfo } from "./routes/database-test";
import { getAnalyticsOverview, getDailyStats, getTimeAnalysis, getTrafficSources, trackVisit, trackDuration, exportAnalyticsData } from "./routes/analytics";
import { initializeDatabase, testConnection } from "./config/database";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Servir arquivos estáticos da pasta uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Health check
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Ecko LP Server Running!" });
  });

  // Demo route
  app.get("/api/demo", handleDemo);

  // Lead routes
  app.post("/api/leads", submitLead);
  app.get("/api/leads", getLeads);
  app.get("/api/leads/stats", getLeadStats);
  app.put("/api/leads/:id/webhook", resendWebhook);
  app.delete("/api/leads/:id", deleteLead);

  // Webhook routes
  app.post("/api/webhook/test", testWebhook);

  // Settings routes
  app.get("/api/settings", getSettings);
  app.get("/api/settings/hero", getHeroSettings);
  app.post("/api/settings/hero", updateHeroSettings);
  app.get("/api/settings/:key", getSetting);
  app.put("/api/settings/:key", updateSetting);
  app.put("/api/settings", updateSettings);
  app.delete("/api/settings/:key", deleteSetting);

  // Upload routes
  app.post("/api/uploads/seo-image", upload.single('image'), uploadSeoImage);
  app.get("/api/uploads", listUploadedImages);
  app.delete("/api/uploads/:filename", deleteUploadedImage);

  // Analytics routes
  app.get("/api/analytics/overview", getAnalyticsOverview);
  app.get("/api/analytics/daily-stats", getDailyStats);
  app.get("/api/analytics/time-analysis", getTimeAnalysis);
  app.get("/api/analytics/traffic-sources", getTrafficSources);
  app.get("/api/analytics/export-data", exportAnalyticsData);
  app.post("/api/analytics/track-visit", trackVisit);
  app.post("/api/analytics/track-duration", trackDuration);

  // Database test routes
  app.get("/api/test-db", testDatabaseConnection);
  app.get("/api/database-info", getDatabaseInfo);

  // Initialize database (non-blocking)
  setTimeout(async () => {
    try {
      console.log('🔄 Tentando conectar ao MySQL...');
      await initializeDatabase();
      console.log('✅ Banco de dados inicializado com sucesso!');
    } catch (error) {
      console.error('❌ Falha na inicialização do banco:', error);
      console.log('⚠️  O servidor continuará funcionando sem banco de dados');
    }
  }, 1000);

  return app;
}
