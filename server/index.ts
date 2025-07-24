import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { submitLead, getLeads, resendWebhook, deleteLead, getLeadStats } from "./routes/leads";
import { testWebhook } from "./routes/webhook-test";
import { getSettings, getSetting, updateSetting, updateSettings, deleteSetting, getHeroSettings, updateHeroSettings } from "./routes/settings";
import { upload, uploadAvatar, uploadHero, uploadGallery, uploadSeoImage, uploadGalleryImage, deleteUploadedImage, listUploadedImages } from "./routes/uploads";
import { testDatabaseConnection, getDatabaseInfo } from "./routes/database-test";
import { getAnalyticsOverview, getDailyStats, getTimeAnalysis, getTrafficSources, getFormOrigins, trackVisit, trackDuration, exportAnalyticsData, getConversionByLocation, getConversionByGeography } from "./routes/analytics";
import { getTestimonials, getTestimonial, createTestimonial, updateTestimonial, deleteTestimonial, toggleTestimonial, reorderTestimonials } from "./routes/testimonials";
import { getGalleryImages, getGalleryImage, createGalleryImage, updateGalleryImage, deleteGalleryImage, toggleGalleryImage, reorderGalleryImages } from "./routes/gallery";
import { initializeDatabase, testConnection } from "./config/database";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
  app.post("/api/uploads/avatar", uploadAvatar.single('image'), uploadSeoImage);
  app.post("/api/uploads/hero", uploadHero.single('image'), uploadSeoImage);
  app.post("/api/upload/gallery", uploadGallery.single('image'), uploadGalleryImage);
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
