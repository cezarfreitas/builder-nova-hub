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

    console.log("✅ Configurações Form salvas apenas no MySQL");

    res.json({
      success: true,
      message: "Configurações Form salvas com sucesso no MySQL",
      data: formSettings
    });
  } catch (error) {
    console.error("Erro ao salvar configurações Form:", error);
    res.status(500).json({ error: "Erro ao salvar configurações" });
  }
});

export default router;
