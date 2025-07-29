import { Router } from "express";
import {
  getAboutFromLpSettings,
  saveAboutToLpSettings,
  migrateAboutToLpSettings
} from "../database/lp-settings-migration";

const router = Router();

// GET - Buscar configura��ões da seção About do lp_settings
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

    console.log("✅ Configurações About salvas apenas no MySQL");

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
