import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import {
  getFormFromLpSettings,
  saveFormToLpSettings,
  migrateFormToLpSettings
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

// GET - Buscar configurações da seção Form do lp_settings
router.get("/", async (req, res) => {
  try {
    const formSettings = await getFormFromLpSettings();
    res.json(formSettings);
  } catch (error) {
    console.error("Erro ao buscar configurações Form do lp_settings:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST - Salvar configurações da seção Form no lp_settings
router.post("/", async (req, res) => {
  try {
    const formSettings = req.body;
    
    // Validação básica
    if (!formSettings || typeof formSettings !== "object") {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    // Salvar no lp_settings
    await saveFormToLpSettings(formSettings);

    // Também atualizar no content.json principal para compatibilidade
    try {
      await ensureDataDirectory();
      const contentData = await fs.readFile(CONTENT_FILE_PATH, "utf-8");
      const content = JSON.parse(contentData);
      
      content.form = formSettings;
      
      await fs.writeFile(CONTENT_FILE_PATH, JSON.stringify(content, null, 2), "utf-8");
    } catch (error) {
      console.warn("Aviso: Não foi possível atualizar content.json:", error);
    }

    res.json({ 
      success: true, 
      message: "Configurações Form salvas com sucesso em lp_settings",
      data: formSettings
    });
  } catch (error) {
    console.error("Erro ao salvar configurações Form:", error);
    res.status(500).json({ error: "Erro ao salvar configurações" });
  }
});

export default router;
