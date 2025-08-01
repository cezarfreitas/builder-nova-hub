import { Router } from "express";
import {
  getGalleryFromLpSettings,
  saveGalleryToLpSettings,
  migrateGalleryToLpSettings,
} from "../database/lp-settings-migration";

const router = Router();

// GET - Buscar configurações de texto da Gallery do lp_settings
router.get("/", async (req, res) => {
  try {
    const gallerySettings = await getGalleryFromLpSettings();
    res.json(gallerySettings);
  } catch (error) {
    console.error(
      "Erro ao buscar configurações Gallery do lp_settings:",
      error,
    );
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

    console.log("✅ Configurações Gallery salvas apenas no MySQL");

    res.json({
      success: true,
      message: "Configurações Gallery salvas com sucesso no MySQL",
      data: gallerySettings,
    });
  } catch (error) {
    console.error("Erro ao salvar configurações Gallery:", error);
    res.status(500).json({ error: "Erro ao salvar configurações" });
  }
});

export default router;
