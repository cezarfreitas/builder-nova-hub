import express from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const router = express.Router();

const SEO_SETTINGS_PATH = join(__dirname, "../data/seo-settings.json");

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

// Função para ler configurações de SEO
function readSeoSettings(): SeoSettings {
  try {
    if (!existsSync(SEO_SETTINGS_PATH)) {
      // Cria o arquivo com configurações padrão se não existir
      writeFileSync(
        SEO_SETTINGS_PATH,
        JSON.stringify(defaultSeoSettings, null, 2),
        "utf8",
      );
      return defaultSeoSettings;
    }

    const data = readFileSync(SEO_SETTINGS_PATH, "utf8");
    const settings = JSON.parse(data);

    // Garante que todas as propriedades existam (merge com defaults)
    return { ...defaultSeoSettings, ...settings };
  } catch (error) {
    console.error("Erro ao ler configurações de SEO:", error);
    return defaultSeoSettings;
  }
}

// Função para salvar configurações de SEO
function writeSeoSettings(settings: SeoSettings): void {
  try {
    writeFileSync(SEO_SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf8");
  } catch (error) {
    console.error("Erro ao salvar configurações de SEO:", error);
    throw error;
  }
}

// GET /api/seo-settings - Buscar configurações
router.get("/", (req, res) => {
  try {
    const settings = readSeoSettings();
    res.json({
      success: true,
      data: settings,
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
router.put("/", (req, res) => {
  try {
    const settings = req.body;

    // Validação básica
    if (!settings || typeof settings !== "object") {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
      });
    }

    // Merge com configurações existentes
    const currentSettings = readSeoSettings();
    const updatedSettings: SeoSettings = { ...currentSettings, ...settings };

    // Salva as configurações
    writeSeoSettings(updatedSettings);

    res.json({
      success: true,
      data: updatedSettings,
      message: "Configurações de SEO salvas com sucesso",
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
router.patch("/", (req, res) => {
  try {
    const { field, value } = req.body;

    if (!field || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Campo e valor são obrigatórios",
      });
    }

    const currentSettings = readSeoSettings();
    const updatedSettings = { ...currentSettings, [field]: value };

    writeSeoSettings(updatedSettings);

    res.json({
      success: true,
      data: updatedSettings,
      message: "Configuração atualizada com sucesso",
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
