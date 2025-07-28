import express from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const router = express.Router();

const INTEGRATIONS_SETTINGS_PATH = join(
  __dirname,
  "../data/integrations-settings.json",
);

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

// Função para ler configurações de integrações
function readIntegrationsSettings(): IntegrationsSettings {
  try {
    if (!existsSync(INTEGRATIONS_SETTINGS_PATH)) {
      // Cria o arquivo com configurações padrão se não existir
      writeFileSync(
        INTEGRATIONS_SETTINGS_PATH,
        JSON.stringify(defaultIntegrationsSettings, null, 2),
        "utf8",
      );
      return defaultIntegrationsSettings;
    }

    const data = readFileSync(INTEGRATIONS_SETTINGS_PATH, "utf8");
    const settings = JSON.parse(data);

    // Garante que todas as propriedades existam (merge com defaults)
    return { ...defaultIntegrationsSettings, ...settings };
  } catch (error) {
    console.error("Erro ao ler configurações de integrações:", error);
    return defaultIntegrationsSettings;
  }
}

// Função para salvar configurações de integrações
function writeIntegrationsSettings(settings: IntegrationsSettings): void {
  try {
    writeFileSync(
      INTEGRATIONS_SETTINGS_PATH,
      JSON.stringify(settings, null, 2),
      "utf8",
    );
  } catch (error) {
    console.error("Erro ao salvar configurações de integrações:", error);
    throw error;
  }
}

// GET /api/integrations-settings - Buscar configurações
router.get("/", (req, res) => {
  try {
    const settings = readIntegrationsSettings();
    res.json({
      success: true,
      data: settings,
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
router.put("/", (req, res) => {
  try {
    const settings = req.body;

    // Validação básica
    if (!settings || typeof settings !== "object") {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
      });
    }

    // Merge com configurações existentes
    const currentSettings = readIntegrationsSettings();
    const updatedSettings: IntegrationsSettings = {
      ...currentSettings,
      ...settings,
    };

    // Salva as configurações
    writeIntegrationsSettings(updatedSettings);

    res.json({
      success: true,
      data: updatedSettings,
      message: "Configurações de integrações salvas com sucesso",
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
