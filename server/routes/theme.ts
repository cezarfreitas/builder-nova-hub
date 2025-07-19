import { Router } from "express";
import pool from "../database";
import { z } from "zod";
import { ThemeSettings, ThemeResponse, ThemeUpdateResponse } from "@shared/api";

const router = Router();

// Validation schema
const themeSchema = z.object({
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  primary_light: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  primary_dark: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  background_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  text_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  accent_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  is_active: z.boolean().default(true),
});

const updateThemeSchema = themeSchema.partial();

// GET /api/theme - Get current theme settings
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM theme_settings WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1",
    );

    const themeSettings = rows as ThemeSettings[];

    if (themeSettings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Theme settings not found",
      });
    }

    const response: ThemeResponse = {
      success: true,
      theme: themeSettings[0],
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching theme settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch theme settings",
    });
  }
});

// PUT /api/theme - Update theme settings
router.put("/", async (req, res) => {
  try {
    const validatedData = updateThemeSchema.parse(req.body);

    // Deactivate current active settings
    await pool.execute(
      "UPDATE theme_settings SET is_active = FALSE WHERE is_active = TRUE",
    );

    // Create new active settings
    const [result] = await pool.execute(
      `INSERT INTO theme_settings (primary_color, primary_light, primary_dark, secondary_color, background_color, text_color, accent_color, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        validatedData.primary_color || "#DC2626",
        validatedData.primary_light || "#F87171",
        validatedData.primary_dark || "#991B1B",
        validatedData.secondary_color || "#1F2937",
        validatedData.background_color || "#000000",
        validatedData.text_color || "#FFFFFF",
        validatedData.accent_color || "#EF4444",
      ],
    );

    const insertResult = result as any;
    const newThemeId = insertResult.insertId;

    // Fetch the created settings
    const [rows] = await pool.execute(
      "SELECT * FROM theme_settings WHERE id = ?",
      [newThemeId],
    );

    const newTheme = (rows as ThemeSettings[])[0];

    const response: ThemeUpdateResponse = {
      success: true,
      message: "Theme settings updated successfully",
      theme: newTheme,
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating theme settings:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update theme settings",
    });
  }
});

// POST /api/theme/reset - Reset to default theme settings
router.post("/reset", async (req, res) => {
  try {
    // Deactivate current active settings
    await pool.execute(
      "UPDATE theme_settings SET is_active = FALSE WHERE is_active = TRUE",
    );

    // Create default settings
    const [result] = await pool.execute(
      `INSERT INTO theme_settings (primary_color, primary_light, primary_dark, secondary_color, background_color, text_color, accent_color, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        "#DC2626", // primary_color
        "#F87171", // primary_light
        "#991B1B", // primary_dark
        "#1F2937", // secondary_color
        "#000000", // background_color
        "#FFFFFF", // text_color
        "#EF4444", // accent_color
      ],
    );

    const insertResult = result as any;
    const newThemeId = insertResult.insertId;

    // Fetch the created settings
    const [rows] = await pool.execute(
      "SELECT * FROM theme_settings WHERE id = ?",
      [newThemeId],
    );

    const newTheme = (rows as ThemeSettings[])[0];

    const response: ThemeUpdateResponse = {
      success: true,
      message: "Theme settings reset to default",
      theme: newTheme,
    };

    res.json(response);
  } catch (error) {
    console.error("Error resetting theme settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset theme settings",
    });
  }
});

// GET /api/theme/presets - Get predefined theme presets
router.get("/presets", async (req, res) => {
  try {
    const presets = [
      {
        name: "Ecko Original",
        primary_color: "#DC2626",
        primary_light: "#F87171",
        primary_dark: "#991B1B",
        secondary_color: "#1F2937",
        background_color: "#000000",
        text_color: "#FFFFFF",
        accent_color: "#EF4444",
      },
      {
        name: "Blue Modern",
        primary_color: "#2563EB",
        primary_light: "#60A5FA",
        primary_dark: "#1D4ED8",
        secondary_color: "#1F2937",
        background_color: "#000000",
        text_color: "#FFFFFF",
        accent_color: "#3B82F6",
      },
      {
        name: "Green Fresh",
        primary_color: "#059669",
        primary_light: "#34D399",
        primary_dark: "#047857",
        secondary_color: "#1F2937",
        background_color: "#000000",
        text_color: "#FFFFFF",
        accent_color: "#10B981",
      },
      {
        name: "Purple Luxury",
        primary_color: "#7C3AED",
        primary_light: "#A78BFA",
        primary_dark: "#6D28D9",
        secondary_color: "#1F2937",
        background_color: "#000000",
        text_color: "#FFFFFF",
        accent_color: "#8B5CF6",
      },
    ];

    res.json({
      success: true,
      presets,
    });
  } catch (error) {
    console.error("Error fetching theme presets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch theme presets",
    });
  }
});

export default router;
