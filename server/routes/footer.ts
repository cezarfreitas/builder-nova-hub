import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import {
  getFooterFromLpSettings,
  saveFooterToLpSettings,
  migrateFooterToLpSettings
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

// GET - Buscar configurações da seção Footer do lp_settings
router.get("/", async (req, res) => {
  try {
    const footerSettings = await getFooterFromLpSettings();
    res.json(footerSettings);
  } catch (error) {
    console.error("Erro ao buscar configurações Footer do lp_settings:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST - Salvar configurações da seção Footer no lp_settings
router.post("/", async (req, res) => {
  try {
    const footerSettings = req.body;
    
    // Validação básica
    if (!footerSettings || typeof footerSettings !== "object") {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    // Salvar no lp_settings
    await saveFooterToLpSettings(footerSettings);

    // Também atualizar no content.json principal para compatibilidade
    try {
      await ensureDataDirectory();
      const contentData = await fs.readFile(CONTENT_FILE_PATH, "utf-8");
      const content = JSON.parse(contentData);
      
      content.footer = footerSettings;
      
      await fs.writeFile(CONTENT_FILE_PATH, JSON.stringify(content, null, 2), "utf-8");
    } catch (error) {
      console.warn("Aviso: Não foi possível atualizar content.json:", error);
    }

    res.json({ 
      success: true, 
      message: "Configurações Footer salvas com sucesso em lp_settings",
      data: footerSettings
    });
  } catch (error) {
    console.error("Erro ao salvar configurações Footer:", error);
    res.status(500).json({ error: "Erro ao salvar configurações" });
  }
});

export default router;
