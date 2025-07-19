import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  submitLead,
  getLeads,
  updateLeadStatus,
  deleteLead,
} from "./routes/leads";
import { testConnection, initializeDatabase } from "./database";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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

  return app;
}
