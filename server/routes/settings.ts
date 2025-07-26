import { Request, Response } from "express";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";

// Schema para validação das configurações
const SettingSchema = z.object({
  setting_key: z.string().min(1).max(100),
  setting_value: z.string().optional(),
  setting_type: z.enum(["text", "json", "boolean", "number"]).default("text"),
});

const BulkSettingsSchema = z.array(SettingSchema);

// Caminho para o arquivo de configurações
const SETTINGS_FILE = path.join(process.cwd(), "server/data/settings.json");

// Configurações padrão
const DEFAULT_SETTINGS = {
  seo_title: {
    value: "Seja uma Revenda Autorizada da Ecko | Tenha os Melhores Produtos",
    type: "text",
    updated_at: new Date().toISOString(),
  },
  seo_description: {
    value:
      "Seja uma revenda autorizada da Ecko e tenha os melhores produtos de streetwear em sua loja. Transforme sua paixão em lucro com exclusividade territorial e suporte completo.",
    type: "text",
    updated_at: new Date().toISOString(),
  },
  seo_keywords: {
    value:
      "revenda autorizada ecko, melhores produtos streetwear, lojista autorizado",
    type: "text",
    updated_at: new Date().toISOString(),
  },
  seo_canonical_url: {
    value: "https://revendedores.ecko.com.br/",
    type: "text",
    updated_at: new Date().toISOString(),
  },
  og_title: {
    value: "Seja uma Revenda Autorizada da Ecko",
    type: "text",
    updated_at: new Date().toISOString(),
  },
  og_description: {
    value:
      "Transforme sua paixão em lucro! Seja um revendedor autorizado Ecko e tenha acesso aos melhores produtos de streetwear do mercado.",
    type: "text",
    updated_at: new Date().toISOString(),
  },
  og_image: {
    value: "https://estyle.vteximg.com.br/arquivos/ecko_mosaic5.png",
    type: "text",
    updated_at: new Date().toISOString(),
  },
  og_site_name: {
    value: "Ecko Revendedores",
    type: "text",
    updated_at: new Date().toISOString(),
  },
  webhook_url: {
    value: "",
    type: "text",
    updated_at: new Date().toISOString(),
  },
  webhook_secret: {
    value: "",
    type: "text",
    updated_at: new Date().toISOString(),
  },
  webhook_timeout: {
    value: "30",
    type: "number",
    updated_at: new Date().toISOString(),
  },
  webhook_retries: {
    value: "3",
    type: "number",
    updated_at: new Date().toISOString(),
  },
  schema_company_name: {
    value: "Ecko Unltd",
    type: "text",
    updated_at: new Date().toISOString(),
  },
  schema_contact_phone: {
    value: "",
    type: "text",
    updated_at: new Date().toISOString(),
  },
  schema_contact_email: {
    value: "",
    type: "text",
    updated_at: new Date().toISOString(),
  },
  schema_address_street: {
    value: "",
    type: "text",
    updated_at: new Date().toISOString(),
  },
  schema_address_city: {
    value: "",
    type: "text",
    updated_at: new Date().toISOString(),
  },
  schema_address_state: {
    value: "",
    type: "text",
    updated_at: new Date().toISOString(),
  },
};

// Função para ler configurações do arquivo JSON
export async function readSettingsFromFile(): Promise<Record<string, any>> {
  try {
    console.log("📖 Tentando ler configurações do arquivo:", SETTINGS_FILE);

    // Verificar se o arquivo existe primeiro
    try {
      await fs.access(SETTINGS_FILE);
    } catch {
      console.log("📁 Arquivo não existe, criando com configurações padrão...");
      await writeSettingsToFile(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }

    const data = await fs.readFile(SETTINGS_FILE, "utf-8");
    const settings = JSON.parse(data);
    console.log("✅ Configurações carregadas com sucesso");
    return settings;
  } catch (error) {
    console.error("❌ Erro ao ler configurações:", error);
    console.log("🔄 Usando configurações padrão como fallback");
    await writeSettingsToFile(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
}

// Função para escrever configurações no arquivo JSON
async function writeSettingsToFile(
  settings: Record<string, any>,
): Promise<void> {
  try {
    console.log("💾 Salvando configurações no arquivo:", SETTINGS_FILE);

    // Garantir que o diretório existe
    const dir = path.dirname(SETTINGS_FILE);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(
      SETTINGS_FILE,
      JSON.stringify(settings, null, 2),
      "utf-8",
    );
    console.log("✅ Configurações salvas com sucesso");
  } catch (error) {
    console.error("❌ Erro ao salvar configurações:", error);
    throw error;
  }
}

// GET /api/settings - Obter todas as configurações
export async function getSettings(req: Request, res: Response) {
  try {
    console.log("🔄 Requisição GET /api/settings recebida");

    const settings = await readSettingsFromFile();

    // Processar tipos de dados
    const processedSettings: Record<string, any> = {};
    Object.entries(settings).forEach(([key, setting]: [string, any]) => {
      // Verificar se o setting tem a estrutura correta
      if (!setting || typeof setting !== "object") {
        console.warn(`⚠️ Setting inválido para chave ${key}:`, setting);
        processedSettings[key] = {
          value: setting || "",
          type: "text",
          updated_at: new Date().toISOString(),
        };
        return;
      }

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
      `✅ Retornando ${Object.keys(processedSettings).length} configurações`,
    );

    res.json({
      success: true,
      data: processedSettings,
      source: "json_file",
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

    const settings = await readSettingsFromFile();

    if (!settings[key]) {
      return res.status(404).json({
        success: false,
        message: "Configuração não encontrada",
      });
    }

    const setting = settings[key];
    let value = setting.value;

    // Converter tipo conforme necessário
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

    res.json({
      success: true,
      data: {
        key,
        value,
        type: setting.type,
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

    // Ler configurações atuais
    const settings = await readSettingsFromFile();

    // Converter valor para string conforme o tipo
    let finalValue = value;
    if (type === "json") {
      finalValue = typeof value === "string" ? value : JSON.stringify(value);
    } else {
      finalValue = String(value);
    }

    // Atualizar configuração
    settings[key] = {
      value: finalValue,
      type,
      updated_at: new Date().toISOString(),
    };

    // Salvar no arquivo
    await writeSettingsToFile(settings);

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

    // Ler configurações atuais
    const currentSettings = await readSettingsFromFile();

    // Atualizar configurações
    for (const setting of settingsArray) {
      let finalValue = setting.setting_value || "";
      if (setting.setting_type === "json") {
        finalValue =
          typeof setting.setting_value === "string"
            ? setting.setting_value
            : JSON.stringify(setting.setting_value);
      }

      currentSettings[setting.setting_key] = {
        value: finalValue,
        type: setting.setting_type,
        updated_at: new Date().toISOString(),
      };
    }

    // Salvar no arquivo
    await writeSettingsToFile(currentSettings);

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

    // Ler configurações atuais
    const settings = await readSettingsFromFile();

    if (!settings[key]) {
      return res.status(404).json({
        success: false,
        message: "Configuração não encontrada",
      });
    }

    // Remover configuração
    delete settings[key];

    // Salvar no arquivo
    await writeSettingsToFile(settings);

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

    const settings = await readSettingsFromFile();

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
    const settings = await readSettingsFromFile();

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

    // Atualizar cada configuração
    for (const setting of settingsToSave) {
      settings[setting.key] = {
        value: setting.value,
        type: setting.type,
        updated_at: new Date().toISOString(),
      };
    }

    // Salvar no arquivo
    await writeSettingsToFile(settings);

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
