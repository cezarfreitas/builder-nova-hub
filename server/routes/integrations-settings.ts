import express from "express";
import { getDatabase } from "../config/database";

export const router = express.Router();

interface IntegrationsSettings {
  ga4_measurement_id: string;
  ga4_api_secret: string;
  ga4_conversion_name: string;
  meta_pixel_id: string;
  meta_access_token: string;
  meta_conversion_name: string;
  meta_test_code: string;
  meta_tracking_enabled: string;
  meta_track_pageview: string;
  meta_track_scroll: string;
  meta_track_time: string;
  meta_track_interactions: string;
  custom_conversion_enabled: string;
  custom_conversion_event: string;
  custom_conversion_value: string;
}

const defaultIntegrationsSettings: IntegrationsSettings = {
  ga4_measurement_id: "",
  ga4_api_secret: "",
  ga4_conversion_name: "form_submit",
  meta_pixel_id: "",
  meta_access_token: "",
  meta_conversion_name: "Lead",
  meta_test_code: "",
  meta_tracking_enabled: "true",
  meta_track_pageview: "true",
  meta_track_scroll: "true",
  meta_track_time: "true",
  meta_track_interactions: "true",
  custom_conversion_enabled: "false",
  custom_conversion_event: "lead_captured",
  custom_conversion_value: "1",
};

// Função para ler configurações de integrações do MySQL
async function readIntegrationsSettings(): Promise<IntegrationsSettings> {
  try {
    const db = getDatabase();
    const [rows] = await db.execute(
      `SELECT setting_key, setting_value FROM lp_settings 
       WHERE setting_key IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "ga4_measurement_id",
        "ga4_api_secret",
        "ga4_conversion_name",
        "meta_pixel_id",
        "meta_access_token",
        "meta_conversion_name",
        "meta_test_code",
        "meta_tracking_enabled",
        "meta_track_pageview",
        "meta_track_scroll",
        "meta_track_time",
        "meta_track_interactions",
        "custom_conversion_enabled",
        "custom_conversion_event",
        "custom_conversion_value",
      ],
    );

    const results = rows as any[];
    const settings = { ...defaultIntegrationsSettings };

    // Aplicar valores do banco sobre os padrões
    results.forEach((row) => {
      if (row.setting_key in settings) {
        settings[row.setting_key as keyof IntegrationsSettings] =
          row.setting_value || "";
      }
    });

    return settings;
  } catch (error) {
    console.error("Erro ao ler configurações de integrações do MySQL:", error);
    return defaultIntegrationsSettings;
  }
}

// Função para salvar configurações de integrações no MySQL
async function writeIntegrationsSettings(
  settings: IntegrationsSettings,
): Promise<void> {
  try {
    const db = getDatabase();

    // Salvar cada configuração de integração no banco
    for (const [key, value] of Object.entries(settings)) {
      // Determinar o tipo baseado no valor
      let settingType = "text";
      if (key.includes("enabled") || value === "true" || value === "false") {
        settingType = "boolean";
      }

      await db.execute(
        `INSERT INTO lp_settings (setting_key, setting_value, setting_type) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         setting_value = VALUES(setting_value),
         setting_type = VALUES(setting_type),
         updated_at = CURRENT_TIMESTAMP`,
        [key, value || "", settingType],
      );
    }

    console.log("✅ Configurações de integrações salvas no MySQL");
  } catch (error) {
    console.error(
      "Erro ao salvar configurações de integrações no MySQL:",
      error,
    );
    throw error;
  }
}

// GET /api/integrations-settings - Buscar configurações
router.get("/", async (req, res) => {
  try {
    console.log("🔄 Buscando configurações de integrações do MySQL...");
    const settings = await readIntegrationsSettings();
    res.json({
      success: true,
      data: settings,
      source: "mysql_database",
    });
  } catch (error) {
    console.error("Erro ao buscar configurações de integrações:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// PUT /api/integrations-settings - Atualizar configurações
router.put("/", async (req, res) => {
  try {
    const settings = req.body;

    // Validação básica
    if (!settings || typeof settings !== "object") {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
      });
    }

    console.log("🔄 Atualizando configurações de integrações no MySQL...");

    // Merge com configurações existentes
    const currentSettings = await readIntegrationsSettings();
    const updatedSettings: IntegrationsSettings = {
      ...currentSettings,
      ...settings,
    };

    // Salva as configurações no MySQL
    await writeIntegrationsSettings(updatedSettings);

    res.json({
      success: true,
      data: updatedSettings,
      message: "Configurações de integrações salvas com sucesso no MySQL",
    });
  } catch (error) {
    console.error("Erro ao salvar configurações de integrações:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

export default router;
