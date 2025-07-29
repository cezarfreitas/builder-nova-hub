import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import {
  getGalleryFromLpSettings,
  saveGalleryToLpSettings,
  migrateGalleryToLpSettings
} from "../database/lp-settings-migration";

const router = Router();

const CONTENT_FILE_PATH = path.join(process.cwd(), "client/data/content.json");

// Garantir que o diretório existe
async function ensureDataDirectory() {
  const dataDir = path.dirname(CONTENT_FILE_PATH);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// GET - Buscar configurações de texto da Gallery do lp_settings
router.get("/", async (req, res) => {
  try {
    const gallerySettings = await getGalleryFromLpSettings();
    res.json(gallerySettings);
  } catch (error) {
    console.error("Erro ao buscar configurações Gallery do lp_settings:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST - Salvar configurações de texto da Gallery no lp_settings
router.post("/", async (req, res) => {
  try {
    const gallerySettings = req.body;
    
    // Validação básica
    if (!gallerySettings || typeof gallerySettings !== "object") {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    // Salvar no lp_settings (apenas textos)
    await saveGalleryToLpSettings(gallerySettings);

    // Também atualizar no content.json principal para compatibilidade (apenas textos)
    try {
      await ensureDataDirectory();
      const contentData = await fs.readFile(CONTENT_FILE_PATH, "utf-8");
      const content = JSON.parse(contentData);
      
      // Manter as imagens existentes, atualizar apenas textos
      content.gallery = {
        ...content.gallery,
        section_tag: gallerySettings.section_tag,
        section_title: gallerySettings.section_title,
        section_subtitle: gallerySettings.section_subtitle,
        section_description: gallerySettings.section_description,
        empty_state_title: gallerySettings.empty_state_title,
        empty_state_description: gallerySettings.empty_state_description,
        cta_title: gallerySettings.cta_title,
        cta_description: gallerySettings.cta_description,
        cta_button_text: gallerySettings.cta_button_text
      };
      
      await fs.writeFile(CONTENT_FILE_PATH, JSON.stringify(content, null, 2), "utf-8");
    } catch (error) {
      console.warn("Aviso: Não foi possível atualizar content.json:", error);
    }

    res.json({ 
      success: true, 
      message: "Configurações Gallery salvas com sucesso em lp_settings",
      data: gallerySettings
    });
  } catch (error) {
    console.error("Erro ao salvar configurações Gallery:", error);
    res.status(500).json({ error: "Erro ao salvar configurações" });
  }
});

export default router;
