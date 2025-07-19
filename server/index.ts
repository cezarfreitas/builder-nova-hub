import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  submitLead,
  getLeads,
  updateLeadStatus,
  deleteLead,
} from "./routes/leads";
import {
  getDailyStats,
  sendWebhook,
  checkDuplicates,
  getWebhookLogs,
} from "./routes/analytics";
import {
  startSession,
  updateSession,
  endSession,
  trackEvent,
  trackConversion,
  getSessionAnalytics,
  getEventAnalytics,
  getConversionAnalytics,
} from "./routes/session-analytics";
import {
  upload,
  uploadImage,
  getUploadedImages,
  deleteUploadedImage,
  updateUploadedImage,
} from "./routes/upload";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getTestimonial,
} from "./routes/testimonials";
import heroRoutes from "./routes/hero";
import faqRoutes from "./routes/faqs";
import galleryRoutes from "./routes/gallery";
import seoRoutes from "./routes/seo";
import themeRoutes from "./routes/theme";
import authRoutes from "./routes/auth";
import { testConnection, initializeDatabase } from "./database";

export function createServer() {
  const app = express();

  // Initialize database on startup
  initializeDatabase().then(() => {
    console.log("🚀 Database ready");
  });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files
  app.use("/uploads", express.static("public/uploads"));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Leads API routes
  app.post("/api/leads", submitLead);
  app.get("/api/leads", getLeads);
  app.put("/api/leads/:id", updateLeadStatus);
  app.delete("/api/leads/:id", deleteLead);

  // Analytics API routes (existing)
  app.get("/api/analytics/daily", getDailyStats);
  app.post("/api/analytics/webhook/:id", sendWebhook);
  app.post("/api/analytics/check-duplicates", checkDuplicates);
  app.get("/api/analytics/webhook-logs/:id", getWebhookLogs);

  // Session Analytics API routes
  app.post("/api/analytics/session", startSession);
  app.put("/api/analytics/session/update", updateSession);
  app.post("/api/analytics/session/end", endSession);
  app.post("/api/analytics/event", trackEvent);
  app.post("/api/analytics/conversion", trackConversion);
  app.get("/api/analytics/sessions", getSessionAnalytics);
  app.get("/api/analytics/events", getEventAnalytics);
  app.get("/api/analytics/conversions", getConversionAnalytics);

  // Upload API routes
  app.post("/api/upload/image", upload.single("image"), uploadImage);
  app.get("/api/upload/images", getUploadedImages);
  app.delete("/api/upload/image/:id", deleteUploadedImage);
  app.put("/api/upload/image/:id", updateUploadedImage);

  // Testimonials API routes
  app.get("/api/testimonials", getTestimonials);
  app.post("/api/testimonials", createTestimonial);
  app.get("/api/testimonials/:id", getTestimonial);
  app.put("/api/testimonials/:id", updateTestimonial);
  app.delete("/api/testimonials/:id", deleteTestimonial);

  // Hero API routes
  app.use("/api/hero", heroRoutes);

  // FAQ API routes
  app.use("/api/faqs", faqRoutes);

  // Gallery API routes
  app.use("/api/gallery", galleryRoutes);

  // SEO API routes
  app.use("/api/seo", seoRoutes);

  // Theme API routes
  app.use("/api/theme", themeRoutes);

  // Authentication API routes
  app.use("/api/auth", authRoutes);

  return app;
}
