import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import {
  getBenefitsFromLpSettings,
  saveBenefitsToLpSettings,
  migrateBenefitsToLpSettings
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

// GET - Buscar configurações da seção Benefits do lp_settings
router.get("/", async (req, res) => {
  try {
    const benefitsSettings = await getBenefitsFromLpSettings();
    res.json(benefitsSettings);
  } catch (error) {
    console.error("Erro ao buscar configurações Benefits do lp_settings:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST - Salvar configurações da seção Benefits no lp_settings
router.post("/", async (req, res) => {
  try {
    const benefitsSettings = req.body;
    
    // Validação básica
    if (!benefitsSettings || typeof benefitsSettings !== "object") {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    // Salvar no lp_settings
    await saveBenefitsToLpSettings(benefitsSettings);

    console.log("✅ Configurações Benefits salvas apenas no MySQL");

    res.json({
      success: true,
      message: "Configurações Benefits salvas com sucesso no MySQL",
      data: benefitsSettings
    });
  } catch (error) {
    console.error("Erro ao salvar configurações Benefits:", error);
    res.status(500).json({ error: "Erro ao salvar configurações" });
  }
});

export default router;
