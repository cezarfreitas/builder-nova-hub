import { Router } from "express";
import {
  getFooterFromLpSettings,
  saveFooterToLpSettings,
  migrateFooterToLpSettings,
} from "../database/lp-settings-migration";

const router = Router();

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

    console.log("✅ Configurações Footer salvas apenas no MySQL");

    res.json({
      success: true,
      message: "Configurações Footer salvas com sucesso no MySQL",
      data: footerSettings,
    });
  } catch (error) {
    console.error("Erro ao salvar configurações Footer:", error);
    res.status(500).json({ error: "Erro ao salvar configurações" });
  }
});

export default router;
