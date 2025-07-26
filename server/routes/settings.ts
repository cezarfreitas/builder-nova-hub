import { Request, Response } from 'express';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

// Schema para validação das configurações
const SettingSchema = z.object({
  setting_key: z.string().min(1).max(100),
  setting_value: z.string().optional(),
  setting_type: z.enum(['text', 'json', 'boolean', 'number']).default('text')
});

const BulkSettingsSchema = z.array(SettingSchema);

// Caminho para o arquivo de configurações
const SETTINGS_FILE = path.join(process.cwd(), 'server/data/settings.json');

// Configurações padrão
const DEFAULT_SETTINGS = {
  seo_title: {
    value: "Seja uma Revenda Autorizada da Ecko | Tenha os Melhores Produtos",
    type: "text",
    updated_at: new Date().toISOString()
  },
  seo_description: {
    value: "Seja uma revenda autorizada da Ecko e tenha os melhores produtos de streetwear em sua loja. Transforme sua paixão em lucro com exclusividade territorial e suporte completo.",
    type: "text",
    updated_at: new Date().toISOString()
  },
  seo_keywords: {
    value: "revenda autorizada ecko, melhores produtos streetwear, lojista autorizado",
    type: "text",
    updated_at: new Date().toISOString()
  },
  seo_canonical_url: {
    value: "https://revendedores.ecko.com.br/",
    type: "text",
    updated_at: new Date().toISOString()
  },
  og_title: {
    value: "Seja uma Revenda Autorizada da Ecko",
    type: "text",
    updated_at: new Date().toISOString()
  },
  og_description: {
    value: "Transforme sua paixão em lucro! Seja um revendedor autorizado Ecko e tenha acesso aos melhores produtos de streetwear do mercado.",
    type: "text",
    updated_at: new Date().toISOString()
  },
  og_image: {
    value: "https://estyle.vteximg.com.br/arquivos/ecko_mosaic5.png",
    type: "text",
    updated_at: new Date().toISOString()
  },
  og_site_name: {
    value: "Ecko Revendedores",
    type: "text",
    updated_at: new Date().toISOString()
  },
  webhook_url: {
    value: "",
    type: "text",
    updated_at: new Date().toISOString()
  },
  webhook_secret: {
    value: "",
    type: "text",
    updated_at: new Date().toISOString()
  },
  webhook_timeout: {
    value: "30",
    type: "number",
    updated_at: new Date().toISOString()
  },
  webhook_retries: {
    value: "3",
    type: "number",
    updated_at: new Date().toISOString()
  },
  schema_company_name: {
    value: "Ecko Unltd",
    type: "text",
    updated_at: new Date().toISOString()
  },
  schema_contact_phone: {
    value: "",
    type: "text",
    updated_at: new Date().toISOString()
  },
  schema_contact_email: {
    value: "",
    type: "text",
    updated_at: new Date().toISOString()
  },
  schema_address_street: {
    value: "",
    type: "text",
    updated_at: new Date().toISOString()
  },
  schema_address_city: {
    value: "",
    type: "text",
    updated_at: new Date().toISOString()
  },
  schema_address_state: {
    value: "",
    type: "text",
    updated_at: new Date().toISOString()
  }
};

// Função para ler configurações do arquivo JSON
async function readSettingsFromFile(): Promise<Record<string, any>> {
  try {
    // Garantir que o diretório existe
    const dir = path.dirname(SETTINGS_FILE);
    await fs.mkdir(dir, { recursive: true });

    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('✅ Criando arquivo de configurações com valores padrão...');
    await writeSettingsToFile(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
}

// Função para escrever configurações no arquivo JSON
async function writeSettingsToFile(settings: Record<string, any>): Promise<void> {
  try {
    // Garantir que o diretório existe
    const dir = path.dirname(SETTINGS_FILE);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    console.log('✅ Configurações salvas no arquivo JSON');
  } catch (error) {
    console.error('❌ Erro ao salvar configurações no arquivo:', error);
    throw error;
  }
}

// GET /api/settings - Obter todas as configurações
export async function getSettings(req: Request, res: Response) {
  try {
    const settings = await readSettingsFromFile();

    // Processar tipos de dados
    const processedSettings: Record<string, any> = {};
    Object.entries(settings).forEach(([key, setting]: [string, any]) => {
      let value = setting.value;
      
      // Converter tipos conforme necessário
      switch (setting.type) {
        case 'boolean':
          value = value === 'true' || value === '1' || value === true;
          break;
        case 'number':
          value = parseFloat(value) || 0;
          break;
        case 'json':
          try {
            value = typeof value === 'string' ? JSON.parse(value) : value;
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
        type: setting.type,
        updated_at: setting.updated_at
      };
    });

    res.json({
      success: true,
      data: processedSettings,
      source: 'json_file'
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// GET /api/settings/:key - Obter configuração específica
export async function getSetting(req: Request, res: Response) {
  try {
    const { key } = req.params;
    const settings = await readSettingsFromFile();
    
    if (!settings[key]) {
      return res.status(404).json({
        success: false,
        message: 'Configuração não encontrada'
      });
    }
    
    const setting = settings[key];
    let value = setting.value;
    
    // Converter tipo conforme necessário
    switch (setting.type) {
      case 'boolean':
        value = value === 'true' || value === '1' || value === true;
        break;
      case 'number':
        value = parseFloat(value) || 0;
        break;
      case 'json':
        try {
          value = typeof value === 'string' ? JSON.parse(value) : value;
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
        updated_at: setting.updated_at
      }
    });
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// PUT /api/settings/:key - Atualizar configuração específica
export async function updateSetting(req: Request, res: Response) {
  try {
    const { key } = req.params;
    const { value, type = 'text' } = req.body;
    
    // Validar entrada
    const validation = SettingSchema.safeParse({
      setting_key: key,
      setting_value: String(value),
      setting_type: type
    });
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: validation.error.errors
      });
    }
    
    // Ler configurações atuais
    const settings = await readSettingsFromFile();
    
    // Converter valor para string conforme o tipo
    let finalValue = value;
    if (type === 'json') {
      finalValue = typeof value === 'string' ? value : JSON.stringify(value);
    } else {
      finalValue = String(value);
    }
    
    // Atualizar configuração
    settings[key] = {
      value: finalValue,
      type,
      updated_at: new Date().toISOString()
    };
    
    // Salvar no arquivo
    await writeSettingsToFile(settings);
    
    res.json({
      success: true,
      message: 'Configuração atualizada com sucesso',
      data: { key, value: finalValue, type }
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// PUT /api/settings - Atualizar múltiplas configurações
export async function updateSettings(req: Request, res: Response) {
  try {
    const { settings: settingsArray } = req.body;
    
    if (!Array.isArray(settingsArray)) {
      return res.status(400).json({
        success: false,
        message: 'Settings deve ser um array'
      });
    }
    
    // Validar todas as configurações
    const validation = BulkSettingsSchema.safeParse(settingsArray);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: validation.error.errors
      });
    }
    
    // Ler configurações atuais
    const currentSettings = await readSettingsFromFile();
    
    // Atualizar configurações
    for (const setting of settingsArray) {
      let finalValue = setting.setting_value || '';
      if (setting.setting_type === 'json') {
        finalValue = typeof setting.setting_value === 'string' 
          ? setting.setting_value 
          : JSON.stringify(setting.setting_value);
      }
      
      currentSettings[setting.setting_key] = {
        value: finalValue,
        type: setting.setting_type,
        updated_at: new Date().toISOString()
      };
    }
    
    // Salvar no arquivo
    await writeSettingsToFile(currentSettings);
    
    res.json({
      success: true,
      message: 'Configurações atualizadas com sucesso',
      updated_count: settingsArray.length
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// DELETE /api/settings/:key - Deletar configuração
export async function deleteSetting(req: Request, res: Response) {
  try {
    const { key } = req.params;
    
    // Ler configurações atuais
    const settings = await readSettingsFromFile();
    
    if (!settings[key]) {
      return res.status(404).json({
        success: false,
        message: 'Configuração não encontrada'
      });
    }
    
    // Remover configuração
    delete settings[key];
    
    // Salvar no arquivo
    await writeSettingsToFile(settings);
    
    res.json({
      success: true,
      message: 'Configuração removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar configuração:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}
