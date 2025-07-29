import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import {
  getAboutFromLpSettings,
  saveAboutToLpSettings,
  migrateAboutToLpSettings
} from "../database/lp-settings-migration";

const router = Router();

const ABOUT_FILE_PATH = path.join(process.cwd(), "server/data/about.json");

// Garantir que o diretório existe
async function ensureDataDirectory() {
  const dataDir = path.dirname(ABOUT_FILE_PATH);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// GET - Buscar configurações da seção About do lp_settings
router.get("/", async (req, res) => {
  try {
    const aboutSettings = await getAboutFromLpSettings();
    res.json(aboutSettings);
  } catch (error) {
    console.error("Erro ao buscar configurações About do lp_settings:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST - Salvar configurações da seção About no lp_settings
router.post("/", async (req, res) => {
  try {
    const aboutSettings = req.body;

    // Validação básica
    if (!aboutSettings || typeof aboutSettings !== "object") {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    // Salvar no lp_settings
    await saveAboutToLpSettings(aboutSettings);

    // Também salvar no arquivo JSON para backup (opcional)
    try {
      await ensureDataDirectory();
      await fs.writeFile(ABOUT_FILE_PATH, JSON.stringify(aboutSettings, null, 2), "utf-8");
    } catch (jsonError) {
      console.warn("Aviso: Não foi possível salvar backup em JSON:", jsonError);
    }

    // Também atualizar no content.json principal para compatibilidade
    try {
      const contentPath = path.join(process.cwd(), "client/data/content.json");
      const contentData = await fs.readFile(contentPath, "utf-8");
      const content = JSON.parse(contentData);

      content.about = aboutSettings;

      await fs.writeFile(contentPath, JSON.stringify(content, null, 2), "utf-8");
    } catch (error) {
      console.warn("Aviso: Não foi possível atualizar content.json:", error);
    }

    res.json({
      success: true,
      message: "Configurações About salvas com sucesso em lp_settings",
      data: aboutSettings
    });
  } catch (error) {
    console.error("Erro ao salvar configurações About:", error);
    res.status(500).json({ error: "Erro ao salvar configurações" });
  }
});

export default router;
