import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { submitLead } from "./routes/leads";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Ecko LP Server Running!" });
  });

  // Demo route
  app.get("/api/demo", handleDemo);

  // Lead submission for landing page form
  app.post("/api/leads", submitLead);

  return app;
}
