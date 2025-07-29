import express from "express";
import { getTestimonialsSettings, saveTestimonialsSettings } from "./testimonials-settings";

const router = express.Router();

// GET /api/testimonials-settings
router.get("/", getTestimonialsSettings);

// POST /api/testimonials-settings
router.post("/", saveTestimonialsSettings);

export default router;
