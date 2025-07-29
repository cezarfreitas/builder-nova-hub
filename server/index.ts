import express from "express";
import cors from "cors";
import path from "path";
import * as fs from "fs/promises";
import { handleDemo } from "./routes/demo";
import {
  submitLead,
  getLeads,
  resendWebhook,
  deleteLead,
  getLeadStats,
} from "./routes/leads";
import { testWebhook } from "./routes/webhook-test";
import {
  getSettings,
  getSetting,
  updateSetting,
  updateSettings,
  deleteSetting,
  getHeroSettings,
  updateHeroSettings,
} from "./routes/settings";
import {
  upload,
  uploadAvatar,
  uploadHero,
  uploadGallery,
  uploadSeoImage,
  uploadHeroImage,
  uploadGalleryImage,
  deleteUploadedImage,
  listUploadedImages,
} from "./routes/uploads";
import {
  testDatabaseConnection,
  getDatabaseInfo,
} from "./routes/database-test";
import {
  getAnalyticsOverview,
  getDailyStats,
  getTimeAnalysis,
  getTrafficSources,
  getFormOrigins,
  trackVisit,
  trackDuration,
  exportAnalyticsData,
  getConversionByLocation,
  getConversionByGeography,
  testFacebookPixel,
} from "./routes/analytics";
import {
  trackTrafficSource,
  getTrafficSources as getTrafficSourcesApi,
  getRecentTraffic,
} from "./routes/traffic";
import {
  getTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonial,
  reorderTestimonials,
} from "./routes/testimonials";
import {
  getGalleryImages,
  getGalleryImage,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  toggleGalleryImage,
  reorderGalleryImages,
} from "./routes/gallery";
import contentRouter from "./routes/content";
import aboutRouter from "./routes/about";
import heroRouter from "./routes/hero";
import { initializeDatabase, testConnection } from "./config/database";
import { testJsonSystem } from "./routes/test-json";
import {
  processLeadIntegrations,
  testIntegrations,
  testMetaPixelOnly,
} from "./routes/integracoes";
import {
  trackMetaEvent,
  trackMetaEventsBatch,
  testMetaTrackingEvent,
  checkMetaPixelConfig,
} from "./routes/meta-tracking";
import {
  serveRobotsTxt,
  serveSitemapXml,
  getMetaTags,
  getStructuredData,
} from "./routes/seo";
import seoSettingsRouter from "./routes/seo-settings";
import integrationsSettingsRouter from "./routes/integrations-settings";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Middleware para desabilitar cache e configurar MIME types
  app.use((req, res, next) => {
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    // Configurar MIME types corretos para JavaScript
    if (req.path.endsWith('.js') || req.path.endsWith('.mjs') || req.path.endsWith('.tsx')) {
      res.type('application/javascript');
    } else if (req.path.endsWith('.ts')) {
      res.type('application/javascript');
    }

    next();
  });

  // Servir arquivos estáticos da pasta uploads
  app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "public", "uploads")),
  );

  // Health check
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Ecko LP Server Running!" });
  });

  // Settings health check
  app.get("/api/settings/health", async (_req, res) => {
    try {
      const settingsFile = require("path").join(
        process.cwd(),
        "server/data/settings.json",
      );
      const fs = require("fs/promises");

      // Verificar se o arquivo existe e é legível
      await fs.access(settingsFile);
      const stats = await fs.stat(settingsFile);

      res.json({
        success: true,
        message: "Sistema de configurações funcionando",
        file_exists: true,
        file_size: stats.size,
        last_modified: stats.mtime,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro no sistema de configurações",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
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

  // Middleware de debug para settings
  app.use("/api/settings*", (req, res, next) => {
    console.log(`🔧 [${req.method}] ${req.path} - Body:`, req.body);
    next();
  });

  // Settings routes
  app.get("/api/settings", getSettings);
  app.get("/api/settings/hero", getHeroSettings);
  app.post("/api/settings/hero", updateHeroSettings);
  app.get("/api/settings/:key", getSetting);
  app.put("/api/settings/:key", updateSetting);
  app.put("/api/settings", updateSettings);
  app.delete("/api/settings/:key", deleteSetting);

  // Upload routes
  app.post("/api/uploads/seo-image", upload.single("image"), uploadSeoImage);
  app.post("/api/uploads/avatar", uploadAvatar.single("image"), uploadSeoImage);
  app.post("/api/uploads/hero", uploadHero.single("image"), uploadHeroImage);
  app.post(
    "/api/upload/gallery",
    uploadGallery.single("image"),
    uploadGalleryImage,
  );
  app.get("/api/uploads", listUploadedImages);
  app.delete("/api/uploads/:filename", deleteUploadedImage);

  // Analytics routes
  app.get("/api/analytics/overview", getAnalyticsOverview);
  app.get("/api/analytics/daily-stats", getDailyStats);
  app.get("/api/analytics/time-analysis", getTimeAnalysis);
  app.get("/api/analytics/traffic-sources", getTrafficSources);
  app.get("/api/analytics/form-origins", getFormOrigins);
  app.get("/api/analytics/conversion-by-location", getConversionByLocation);
  app.get("/api/analytics/conversion-by-geography", getConversionByGeography);
  app.get("/api/analytics/export-data", exportAnalyticsData);
  app.post("/api/analytics/track-visit", trackVisit);
  app.post("/api/analytics/track-duration", trackDuration);
  app.post("/api/analytics/test-pixel", testFacebookPixel);

  // Traffic tracking routes
  app.post("/api/traffic/track", trackTrafficSource);
  app.get("/api/traffic/sources", getTrafficSourcesApi);
  app.get("/api/traffic/recent", getRecentTraffic);

  // Testimonials routes
  app.get("/api/testimonials", getTestimonials);
  app.get("/api/testimonials/:id", getTestimonial);
  app.post("/api/testimonials", createTestimonial);
  app.put("/api/testimonials/:id", updateTestimonial);
  app.delete("/api/testimonials/:id", deleteTestimonial);
  app.put("/api/testimonials/:id/toggle", toggleTestimonial);
  app.put("/api/testimonials/reorder", reorderTestimonials);

  // Gallery routes
  app.get("/api/gallery", getGalleryImages);
  app.get("/api/gallery/:id", getGalleryImage);
  app.post("/api/gallery", createGalleryImage);
  app.put("/api/gallery/:id", updateGalleryImage);
  app.delete("/api/gallery/:id", deleteGalleryImage);
  app.put("/api/gallery/:id/toggle", toggleGalleryImage);
  app.put("/api/gallery/reorder", reorderGalleryImages);

  // Content routes
  app.use("/api", contentRouter);

  // About section routes
  app.use("/api/content/about", aboutRouter);

  // Hero section routes
  app.use("/api/hero", heroRouter);

  // Database test routes
  app.get("/api/test-db", testDatabaseConnection);
  app.get("/api/database-info", getDatabaseInfo);

  // JSON system test route
  app.get("/api/test-json", testJsonSystem);

  // Integration routes
  app.post("/api/integracoes/process", processLeadIntegrations);
  app.post("/api/integracoes/test", testIntegrations);
  app.post("/api/integracoes/test-meta", testMetaPixelOnly);

  // Meta tracking routes
  app.post("/api/meta/track-event", trackMetaEvent);
  app.post("/api/meta/track-events-batch", trackMetaEventsBatch);
  app.post("/api/meta/test-event", testMetaTrackingEvent);
  app.get("/api/meta/config", checkMetaPixelConfig);

  // SEO routes
  app.get("/robots.txt", serveRobotsTxt);
  app.get("/sitemap.xml", serveSitemapXml);
  app.get("/api/seo/meta-tags", getMetaTags);
  app.get("/api/seo/structured-data", getStructuredData);

  // SEO Settings routes
  app.use("/api/seo-settings", seoSettingsRouter);

  // Integrations Settings routes
  app.use("/api/integrations-settings", integrationsSettingsRouter);

  // Initialize settings file
  setTimeout(async () => {
    try {
      console.log("🔄 Inicializando sistema de configurações JSON...");

      const settingsFile = path.join(
        process.cwd(),
        "server/data/settings.json",
      );
      const settingsDir = path.dirname(settingsFile);

      // Criar diretório se não existir
      await fs.mkdir(settingsDir, { recursive: true });

      // Verificar se arquivo existe
      try {
        await fs.access(settingsFile);
        console.log("✅ Arquivo de configurações encontrado");
      } catch {
        console.log("📝 Criando arquivo de configurações padrão...");
        const defaultSettings = {
          seo_title: {
            value: "Seja uma Revenda Autorizada da Ecko",
            type: "text",
            updated_at: new Date().toISOString(),
          },
          webhook_url: {
            value: "",
            type: "text",
            updated_at: new Date().toISOString(),
          },
        };
        await fs.writeFile(
          settingsFile,
          JSON.stringify(defaultSettings, null, 2),
        );
        console.log("✅ Arquivo de configurações criado com sucesso!");
      }
    } catch (error) {
      console.error("❌ Erro ao inicializar configurações:", error);
    }
  }, 500);

  // Initialize database (non-blocking)
  setTimeout(async () => {
    try {
      console.log("🔄 Tentando conectar ao MySQL...");
      await initializeDatabase();
      console.log("✅ Banco de dados inicializado com sucesso!");
    } catch (error) {
      console.error("❌ Falha na inicialização do banco:", error);
      console.log("⚠️  O servidor continuará funcionando sem banco de dados");
    }
  }, 1000);

  return app;
}
