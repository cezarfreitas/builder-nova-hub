import { Router } from "express";
import pool from "../database";
import { z } from "zod";
import { SEOSettings, SEOResponse, SEOUpdateResponse } from "@shared/api";

const router = Router();

// Validation schema
const seoSchema = z.object({
  page_title: z.string().min(1, "Page title is required"),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  og_title: z.string().optional(),
  og_description: z.string().optional(),
  og_image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  canonical_url: z
    .string()
    .url("Invalid canonical URL")
    .optional()
    .or(z.literal("")),
  robots: z.string().default("index, follow"),
  is_active: z.boolean().default(true),
});

const updateSeoSchema = seoSchema.partial();

// GET /api/seo - Get current SEO settings
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM seo_settings WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1",
    );

    const seoSettings = rows as SEOSettings[];

    if (seoSettings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "SEO settings not found",
      });
    }

    const response: SEOResponse = {
      success: true,
      seo: seoSettings[0],
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching SEO settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch SEO settings",
    });
  }
});

// PUT /api/seo - Update SEO settings
router.put("/", async (req, res) => {
  try {
    const validatedData = updateSeoSchema.parse(req.body);

    // Deactivate current active settings
    await pool.execute(
      "UPDATE seo_settings SET is_active = FALSE WHERE is_active = TRUE",
    );

    // Create new active settings
    const [result] = await pool.execute(
      `INSERT INTO seo_settings (page_title, meta_description, meta_keywords, og_title, og_description, og_image, canonical_url, robots, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        validatedData.page_title || null,
        validatedData.meta_description || null,
        validatedData.meta_keywords || null,
        validatedData.og_title || null,
        validatedData.og_description || null,
        validatedData.og_image || null,
        validatedData.canonical_url || null,
        validatedData.robots || "index, follow",
      ],
    );

    const insertResult = result as any;
    const newSeoId = insertResult.insertId;

    // Fetch the created settings
    const [rows] = await pool.execute(
      "SELECT * FROM seo_settings WHERE id = ?",
      [newSeoId],
    );

    const newSeo = (rows as SEOSettings[])[0];

    const response: SEOUpdateResponse = {
      success: true,
      message: "SEO settings updated successfully",
      seo: newSeo,
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating SEO settings:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update SEO settings",
    });
  }
});

// POST /api/seo/reset - Reset to default SEO settings
router.post("/reset", async (req, res) => {
  try {
    // Deactivate current active settings
    await pool.execute(
      "UPDATE seo_settings SET is_active = FALSE WHERE is_active = TRUE",
    );

    // Create default settings
    const [result] = await pool.execute(
      `INSERT INTO seo_settings (page_title, meta_description, meta_keywords, og_title, og_description, robots, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [
        "Ecko - Programa de Revendedores | Seja um Parceiro Oficial",
        "Torne-se um revendedor oficial da Ecko, a marca de streetwear mais desejada do Brasil. Produtos exclusivos, margens atrativas e suporte completo.",
        "ecko, revendedor, streetwear, moda urbana, programa revendedores, atacado",
        "Ecko - Programa de Revendedores Oficial",
        "Seja um revendedor oficial da marca Ecko e multiplique suas vendas com produtos de streetwear exclusivos.",
        "index, follow",
      ],
    );

    const insertResult = result as any;
    const newSeoId = insertResult.insertId;

    // Fetch the created settings
    const [rows] = await pool.execute(
      "SELECT * FROM seo_settings WHERE id = ?",
      [newSeoId],
    );

    const newSeo = (rows as SEOSettings[])[0];

    const response: SEOUpdateResponse = {
      success: true,
      message: "SEO settings reset to default",
      seo: newSeo,
    };

    res.json(response);
  } catch (error) {
    console.error("Error resetting SEO settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset SEO settings",
    });
  }
});

export default router;
