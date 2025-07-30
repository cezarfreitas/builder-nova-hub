import express from "express";
import { getDatabase } from "../config/database";

export const router = express.Router();

interface SeoSettings {
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_card: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  favicon_url: string;
  apple_icon_url: string;
}

const defaultSeoSettings: SeoSettings = {
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  seo_canonical_url: "",
  og_title: "",
  og_description: "",
  og_image: "",
  twitter_card: "summary_large_image",
  twitter_title: "",
  twitter_description: "",
  twitter_image: "",
  favicon_url: "",
  apple_icon_url: "",
};

// Função para ler configurações de SEO do MySQL
async function readSeoSettings(): Promise<SeoSettings> {
  try {
    const db = getDatabase();
    const [rows] = await db.execute(
      `SELECT setting_key, setting_value FROM lp_settings 
       WHERE setting_key IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "seo_title",
        "seo_description",
        "seo_keywords",
        "seo_canonical_url",
        "og_title",
        "og_description",
        "og_image",
        "twitter_card",
        "twitter_title",
        "twitter_description",
        "twitter_image",
        "favicon_url",
        "apple_icon_url",
      ],
    );

    const results = rows as any[];
    const settings = { ...defaultSeoSettings };

    // Aplicar valores do banco sobre os padrões
    results.forEach((row) => {
      if (row.setting_key in settings) {
        settings[row.setting_key as keyof SeoSettings] =
          row.setting_value || "";
      }
    });

    return settings;
  } catch (error) {
    console.error("Erro ao ler configurações de SEO do MySQL:", error);
    return defaultSeoSettings;
  }
}

// Função para salvar configurações de SEO no MySQL
async function writeSeoSettings(settings: SeoSettings): Promise<void> {
  try {
    const db = getDatabase();

    // Salvar cada configuração SEO no banco
    for (const [key, value] of Object.entries(settings)) {
      await db.execute(
        `INSERT INTO lp_settings (setting_key, setting_value, setting_type) 
         VALUES (?, ?, 'text') 
         ON DUPLICATE KEY UPDATE 
         setting_value = VALUES(setting_value),
         updated_at = CURRENT_TIMESTAMP`,
        [key, value || ""],
      );
    }

    console.log("✅ Configurações de SEO salvas no MySQL");
  } catch (error) {
    console.error("Erro ao salvar configurações de SEO no MySQL:", error);
    throw error;
  }
}

// Função para salvar configuração específica no MySQL
async function updateSeoSetting(field: string, value: string): Promise<void> {
  try {
    const db = getDatabase();
    await db.execute(
      `INSERT INTO lp_settings (setting_key, setting_value, setting_type) 
       VALUES (?, ?, 'text') 
       ON DUPLICATE KEY UPDATE 
       setting_value = VALUES(setting_value),
       updated_at = CURRENT_TIMESTAMP`,
      [field, value || ""],
    );

    console.log(`✅ Configuração SEO ${field} salva no MySQL`);
  } catch (error) {
    console.error(`Erro ao salvar configuração SEO ${field} no MySQL:`, error);
    throw error;
  }
}

// GET /api/seo-settings - Buscar configurações
router.get("/", async (req, res) => {
  try {
    console.log("🔄 Buscando configurações de SEO do MySQL...");
    const settings = await readSeoSettings();
    res.json({
      success: true,
      data: settings,
      source: "mysql_database",
    });
  } catch (error) {
    console.error("Erro ao buscar configurações de SEO:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// PUT /api/seo-settings - Atualizar configurações
router.put("/", async (req, res) => {
  try {
    const settings = req.body;

    // Validação básica
    if (!settings || typeof settings !== "object") {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
      });
    }

    console.log("🔄 Atualizando configurações de SEO no MySQL...");

    // Merge com configurações existentes
    const currentSettings = await readSeoSettings();
    const updatedSettings: SeoSettings = { ...currentSettings, ...settings };

    // Salva as configurações no MySQL
    await writeSeoSettings(updatedSettings);

    res.json({
      success: true,
      data: updatedSettings,
      message: "Configurações de SEO salvas com sucesso no MySQL",
    });
  } catch (error) {
    console.error("Erro ao salvar configurações de SEO:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// PATCH /api/seo-settings - Atualizar configuração específica
router.patch("/", async (req, res) => {
  try {
    const { field, value } = req.body;

    if (!field || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Campo e valor são obrigatórios",
      });
    }

    console.log(`🔄 Atualizando configuração SEO ${field} no MySQL...`);

    // Atualizar configuração específica no MySQL
    await updateSeoSetting(field, value);

    // Buscar configurações atualizadas
    const updatedSettings = await readSeoSettings();

    res.json({
      success: true,
      data: updatedSettings,
      message: "Configuração atualizada com sucesso no MySQL",
    });
  } catch (error) {
    console.error("Erro ao atualizar configuração de SEO:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

export default router;
