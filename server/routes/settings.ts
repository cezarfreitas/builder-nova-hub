import { Request, Response } from "express";
import { z } from "zod";
import { getDatabase } from "../config/database";
import mysql from "mysql2/promise";

// Schema para validação das configurações
const SettingSchema = z.object({
  setting_key: z.string().min(1).max(100),
  setting_value: z.string().optional(),
  setting_type: z.enum(["text", "json", "boolean", "number"]).default("text"),
});

const BulkSettingsSchema = z.array(SettingSchema);

// Função para buscar configuração específica do banco
async function getSettingFromDB(key: string): Promise<any> {
  const db = getDatabase();
  const [rows] = await db.execute(
    `SELECT setting_value, setting_type, updated_at FROM lp_settings WHERE setting_key = ?`,
    [key]
  );
  
  const results = rows as any[];
  return results.length > 0 ? results[0] : null;
}

// Função para buscar todas as configurações do banco
async function getAllSettingsFromDB(): Promise<Record<string, any>> {
  const db = getDatabase();
  const [rows] = await db.execute(
    `SELECT setting_key, setting_value, setting_type, updated_at FROM lp_settings ORDER BY setting_key`
  );
  
  const results = rows as any[];
  const settings: Record<string, any> = {};
  
  results.forEach((row) => {
    settings[row.setting_key] = {
      value: row.setting_value,
      type: row.setting_type,
      updated_at: row.updated_at
    };
  });
  
  return settings;
}

// Função para salvar configuração no banco
async function saveSettingToDB(key: string, value: string, type: string): Promise<void> {
  const db = getDatabase();
  await db.execute(
    `INSERT INTO lp_settings (setting_key, setting_value, setting_type) 
     VALUES (?, ?, ?) 
     ON DUPLICATE KEY UPDATE 
     setting_value = VALUES(setting_value),
     setting_type = VALUES(setting_type),
     updated_at = CURRENT_TIMESTAMP`,
    [key, value, type]
  );
}

// Função para deletar configuração do banco
async function deleteSettingFromDB(key: string): Promise<boolean> {
  const db = getDatabase();
  const [result] = await db.execute(
    `DELETE FROM lp_settings WHERE setting_key = ?`,
    [key]
  );
  
  const deleteResult = result as mysql.ResultSetHeader;
  return deleteResult.affectedRows > 0;
}

// GET /api/settings - Obter todas as configurações
export async function getSettings(req: Request, res: Response) {
  try {
    console.log("🔄 Requisição GET /api/settings recebida");

    const settings = await getAllSettingsFromDB();

    // Processar tipos de dados
    const processedSettings: Record<string, any> = {};
    Object.entries(settings).forEach(([key, setting]: [string, any]) => {
      let value = setting.value;

      // Converter tipos conforme necessário
      switch (setting.type) {
        case "boolean":
          value = value === "true" || value === "1" || value === true;
          break;
        case "number":
          value = parseFloat(value) || 0;
          break;
        case "json":
          try {
            value = typeof value === "string" ? JSON.parse(value) : value;
          } catch {
            value = {};
          }
          break;
        default:
          // text - manter como string
          break;
      }

      processedSettings[key] = {
        value,
        type: setting.type || "text",
        updated_at: setting.updated_at || new Date().toISOString(),
      };
    });

    console.log(
      `✅ Retornando ${Object.keys(processedSettings).length} configurações do MySQL`,
    );

    res.json({
      success: true,
      data: processedSettings,
      source: "mysql_database",
      count: Object.keys(processedSettings).length,
    });
  } catch (error) {
    console.error("❌ Erro em GET /api/settings:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}

// GET /api/settings/:key - Obter configuração específica
export async function getSetting(req: Request, res: Response) {
  try {
    const { key } = req.params;
    console.log(`🔄 Requisição GET /api/settings/${key} recebida`);

    const setting = await getSettingFromDB(key);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Configuração não encontrada",
      });
    }

    let value = setting.setting_value;

    // Converter tipo conforme necessário
    switch (setting.setting_type) {
      case "boolean":
        value = value === "true" || value === "1" || value === true;
        break;
      case "number":
        value = parseFloat(value) || 0;
        break;
      case "json":
        try {
          value = typeof value === "string" ? JSON.parse(value) : value;
        } catch {
          value = {};
        }
        break;
    }

    res.json({
      success: true,
      data: {
        key,
        value,
        type: setting.setting_type,
        updated_at: setting.updated_at,
      },
    });
  } catch (error) {
    console.error("❌ Erro em GET /api/settings/:key:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

// PUT /api/settings/:key - Atualizar configuração específica
export async function updateSetting(req: Request, res: Response) {
  try {
    const { key } = req.params;
    const { value, type = "text" } = req.body;

    console.log(`🔄 Requisição PUT /api/settings/${key} recebida`, {
      value,
      type,
    });

    // Validar entrada
    const validation = SettingSchema.safeParse({
      setting_key: key,
      setting_value: String(value),
      setting_type: type,
    });

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: validation.error.errors,
      });
    }

    // Converter valor para string conforme o tipo
    let finalValue = value;
    if (type === "json") {
      finalValue = typeof value === "string" ? value : JSON.stringify(value);
    } else {
      finalValue = String(value);
    }

    // Salvar no banco
    await saveSettingToDB(key, finalValue, type);

    console.log(`✅ Configuração ${key} salva no MySQL`);

    res.json({
      success: true,
      message: "Configuração atualizada com sucesso",
      data: { key, value: finalValue, type },
    });
  } catch (error) {
    console.error("❌ Erro em PUT /api/settings/:key:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

// PUT /api/settings - Atualizar múltiplas configurações
export async function updateSettings(req: Request, res: Response) {
  try {
    const { settings: settingsArray } = req.body;

    console.log("🔄 Requisição PUT /api/settings recebida", {
      count: settingsArray?.length,
    });

    if (!Array.isArray(settingsArray)) {
      return res.status(400).json({
        success: false,
        message: "Settings deve ser um array",
      });
    }

    // Validar todas as configurações
    const validation = BulkSettingsSchema.safeParse(settingsArray);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: validation.error.errors,
      });
    }

    // Atualizar configurações no banco
    for (const setting of settingsArray) {
      let finalValue = setting.setting_value || "";
      if (setting.setting_type === "json") {
        finalValue =
          typeof setting.setting_value === "string"
            ? setting.setting_value
            : JSON.stringify(setting.setting_value);
      }

      await saveSettingToDB(setting.setting_key, finalValue, setting.setting_type);
    }

    console.log(`✅ ${settingsArray.length} configurações salvas no MySQL`);

    res.json({
      success: true,
      message: "Configurações atualizadas com sucesso",
      updated_count: settingsArray.length,
    });
  } catch (error) {
    console.error("❌ Erro em PUT /api/settings:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

// DELETE /api/settings/:key - Deletar configuração
export async function deleteSetting(req: Request, res: Response) {
  try {
    const { key } = req.params;

    console.log(`🔄 Requisição DELETE /api/settings/${key} recebida`);

    const deleted = await deleteSettingFromDB(key);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Configuração não encontrada",
      });
    }

    console.log(`✅ Configuração ${key} removida do MySQL`);

    res.json({
      success: true,
      message: "Configuração removida com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro em DELETE /api/settings/:key:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

// Funções para manter compatibilidade com hero settings
export async function getHeroSettings(req: Request, res: Response) {
  try {
    console.log("🔄 Requisição GET /api/settings/hero recebida");

    const settings = await getAllSettingsFromDB();

    // Configurações padrão do hero
    const defaultSettings = {
      title: "Transforme sua {ecko}PAIXÃO{/ecko} em {green}LUCRO{/green}",
      subtitle: "Oportunidade {red}única{/red} de negócio",
      description:
        "Junte-se à rede de revendedores {ecko}Ecko{/ecko} e maximize seus {green}lucros{/green} com produtos de alta qualidade e suporte completo.",
      cta_text: "Quero ser Revendedor",
      cta_secondary_text: "Descubra Como Funciona",
      background_image:
        "https://estyle.vteximg.com.br/arquivos/ecko_mosaic5.png?v=638421392678800000",
      background_color: "#dc2626",
      text_color: "#ffffff",
      cta_color: "#ffffff",
      logo_url:
        "https://www.ntktextil.com.br/wp-content/uploads/2022/08/Logo-Ecko.png",
      video_url: "",
      enabled: true,
    };

    // Aplicar configurações salvas sobre os padrões
    const finalSettings = { ...defaultSettings };
    Object.entries(settings).forEach(([key, setting]: [string, any]) => {
      if (key.startsWith("hero_")) {
        const heroKey = key.replace("hero_", "");
        let value = setting.value;

        // Converter tipos conforme necessário
        switch (setting.type) {
          case "boolean":
            value = value === "true" || value === "1" || value === true;
            break;
          case "number":
            value = parseFloat(value) || 0;
            break;
          case "json":
            try {
              value = typeof value === "string" ? JSON.parse(value) : value;
            } catch {
              value = {};
            }
            break;
        }

        if (heroKey in finalSettings) {
          finalSettings[heroKey] = value;
        }
      }
    });

    res.json({
      success: true,
      data: finalSettings,
    });
  } catch (error) {
    console.error("❌ Erro em GET /api/settings/hero:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

export async function updateHeroSettings(req: Request, res: Response) {
  try {
    console.log("🔄 Requisição POST /api/settings/hero recebida");

    const heroData = req.body;

    // Mapear configurações para o formato da tabela
    const settingsToSave = [
      { key: "hero_title", value: heroData.title || "", type: "text" },
      { key: "hero_subtitle", value: heroData.subtitle || "", type: "text" },
      {
        key: "hero_description",
        value: heroData.description || "",
        type: "text",
      },
      { key: "hero_cta_text", value: heroData.cta_text || "", type: "text" },
      {
        key: "hero_cta_secondary_text",
        value: heroData.cta_secondary_text || "",
        type: "text",
      },
      {
        key: "hero_background_image",
        value: heroData.background_image || "",
        type: "text",
      },
      {
        key: "hero_background_color",
        value: heroData.background_color || "#dc2626",
        type: "text",
      },
      {
        key: "hero_text_color",
        value: heroData.text_color || "#ffffff",
        type: "text",
      },
      {
        key: "hero_cta_color",
        value: heroData.cta_color || "#ffffff",
        type: "text",
      },
      { key: "hero_logo_url", value: heroData.logo_url || "", type: "text" },
      { key: "hero_video_url", value: heroData.video_url || "", type: "text" },
      {
        key: "hero_enabled",
        value: heroData.enabled ? "1" : "0",
        type: "boolean",
      },
    ];

    // Salvar cada configuração no banco
    for (const setting of settingsToSave) {
      await saveSettingToDB(setting.key, setting.value, setting.type);
    }

    console.log(`✅ Configurações do hero salvas no MySQL`);

    res.json({
      success: true,
      message: "Configurações do hero atualizadas com sucesso",
      data: heroData,
    });
  } catch (error) {
    console.error("❌ Erro em POST /api/settings/hero:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}
