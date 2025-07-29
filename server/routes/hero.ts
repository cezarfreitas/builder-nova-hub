import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import {
  getHeroFromDatabase,
  saveHeroToDatabase,
  createHeroTable,
  migrateHeroDataFromJson
} from "../database/hero-migration";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Caminho para o arquivo JSON do hero (mantido para compatibilidade)
const HERO_DATA_PATH = path.join(__dirname, "../data/hero.json");

// Configurações padrão do hero
const defaultHeroSettings = {
  title: "SEJA UM {ecko}REVENDEDOR{/ecko} OFICIAL",
  subtitle: "O maior programa de parceria do streetwear",
  description:
    "Transforme sua paixão por streetwear em um negócio lucrativo. Junte-se a milhares de revendedores que já fazem parte da família {ecko}Ecko{/ecko} e descobra como vender produtos autênticos com margens exclusivas.",
  background_image: "",
  background_color: "#000000",
  text_color: "#ffffff",
  cta_primary_text: "QUERO SER {ecko}REVENDEDOR{/ecko}",
  cta_secondary_text: "DESCUBRA {blue}COMO{/blue}",
  cta_color: "#dc2626",
  cta_text_color: "#ffffff",
  overlay_color: "#000000",
  overlay_opacity: 70,
  overlay_blend_mode: "normal",
  overlay_gradient_enabled: false,
  overlay_gradient_start: "#000000",
  overlay_gradient_end: "#333333",
  overlay_gradient_direction: "to bottom",
  logo_url: "",
};

// Função para garantir que o diretório existe
function ensureDataDirectory() {
  const dataDir = path.dirname(HERO_DATA_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Função para carregar configurações do hero do banco de dados
async function loadHeroSettings() {
  try {
    const heroData = await getHeroFromDatabase();

    // Converter dados do banco para o formato esperado
    return {
      title: heroData.title,
      subtitle: heroData.subtitle,
      description: heroData.description,
      background_image: heroData.background_image,
      background_color: heroData.background_color,
      text_color: heroData.text_color,
      cta_primary_text: heroData.cta_primary_text,
      cta_secondary_text: heroData.cta_secondary_text,
      cta_color: heroData.cta_color,
      cta_text_color: heroData.cta_text_color,
      overlay_color: heroData.overlay_color,
      overlay_opacity: heroData.overlay_opacity,
      overlay_blend_mode: heroData.overlay_blend_mode,
      overlay_gradient_enabled: heroData.overlay_gradient_enabled,
      overlay_gradient_start: heroData.overlay_gradient_start,
      overlay_gradient_end: heroData.overlay_gradient_end,
      overlay_gradient_direction: heroData.overlay_gradient_direction,
      logo_url: heroData.logo_url,
    };
  } catch (error) {
    console.error("Erro ao carregar configurações do hero do banco:", error);

    // Fallback para configurações padrão
    return defaultHeroSettings;
  }
}

// Função para salvar configurações do hero no banco de dados
async function saveHeroSettings(settings: any) {
  try {
    // Garantir que apenas propriedades válidas sejam salvas
    const validSettings = {
      ...defaultHeroSettings,
      ...settings,
    };

    await saveHeroToDatabase(validSettings);

    // Também salvar no JSON para backup (opcional)
    try {
      ensureDataDirectory();
      fs.writeFileSync(HERO_DATA_PATH, JSON.stringify(validSettings, null, 2));
    } catch (jsonError) {
      console.warn("Aviso: Não foi possível salvar backup em JSON:", jsonError);
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar configurações do hero:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// GET /api/hero - Buscar configurações do hero
router.get("/", async (req, res) => {
  try {
    const settings = await loadHeroSettings();
    res.json(settings);
  } catch (error) {
    console.error("Erro ao buscar configurações do hero:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

// POST /api/hero - Salvar configurações do hero
router.post("/", async (req, res) => {
  try {
    const settings = req.body;

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({
        error: "Dados inválidos",
        details: "As configurações devem ser um objeto válido",
      });
    }

    const result = await saveHeroSettings(settings);

    if (result.success) {
      res.json({
        success: true,
        message: "Configurações do hero salvas com sucesso no banco de dados",
        data: settings,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Erro ao salvar configurações",
        details: result.error,
      });
    }
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

// PUT /api/hero - Atualizar configurações específicas do hero
router.put("/", async (req, res) => {
  try {
    const updates = req.body;

    if (!updates || typeof updates !== "object") {
      return res.status(400).json({
        error: "Dados inválidos",
        details: "As atualizações devem ser um objeto válido",
      });
    }

    // Carregar configurações atuais
    const currentSettings = await loadHeroSettings();

    // Aplicar atualizações
    const updatedSettings = {
      ...currentSettings,
      ...updates,
    };

    const result = await saveHeroSettings(updatedSettings);

    if (result.success) {
      res.json({
        success: true,
        message: "Configurações do hero atualizadas com sucesso no banco de dados",
        data: updatedSettings,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Erro ao atualizar configurações",
        details: result.error,
      });
    }
  } catch (error) {
    console.error("Erro ao processar requisição de atualização:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

// DELETE /api/hero - Resetar para configurações padrão
router.delete("/", (req, res) => {
  try {
    const result = saveHeroSettings(defaultHeroSettings);

    if (result.success) {
      res.json({
        success: true,
        message: "Configurações do hero resetadas para o padrão",
        data: defaultHeroSettings,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Erro ao resetar configurações",
        details: result.error,
      });
    }
  } catch (error) {
    console.error("Erro ao resetar configurações:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

// GET /api/hero/verify - Verificar integridade completa do hero
router.get("/verify", (req, res) => {
  try {
    const settings = loadHeroSettings();
    const verification = {
      configExists: true,
      backgroundImage: {
        configured: !!settings.background_image,
        path: settings.background_image,
        exists: false,
      },
      logo: {
        configured: !!settings.logo_url,
        path: settings.logo_url,
        exists: false,
      },
      uploadDirectory: {
        exists: false,
        imageCount: 0,
        images: [],
      },
    };

    // Verificar se imagens existem
    if (settings.background_image) {
      const bgPath = path.join(
        process.cwd(),
        "public",
        settings.background_image,
      );
      verification.backgroundImage.exists = fs.existsSync(bgPath);
    }

    if (settings.logo_url) {
      const logoPath = path.join(process.cwd(), "public", settings.logo_url);
      verification.logo.exists = fs.existsSync(logoPath);
    }

    // Verificar diretório de uploads
    const uploadsPath = path.join(process.cwd(), "public", "uploads", "hero");
    if (fs.existsSync(uploadsPath)) {
      verification.uploadDirectory.exists = true;
      const images = fs.readdirSync(uploadsPath);
      verification.uploadDirectory.imageCount = images.length;
      verification.uploadDirectory.images = images.map((img) => ({
        name: img,
        size: fs.statSync(path.join(uploadsPath, img)).size,
        url: `/uploads/hero/${img}`,
      }));
    }

    res.json({
      success: true,
      message: "Verificação completa do hero",
      data: settings,
      verification,
    });
  } catch (error) {
    console.error("Erro na verificação do hero:", error);
    res.status(500).json({
      success: false,
      error: "Erro na verificação",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

export default router;
