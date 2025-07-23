import { Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { z } from 'zod';

// Schema para validação das configurações
const SettingSchema = z.object({
  setting_key: z.string().min(1).max(100),
  setting_value: z.string().optional(),
  setting_type: z.enum(['text', 'json', 'boolean', 'number']).default('text')
});

const BulkSettingsSchema = z.array(SettingSchema);

// Schema para configurações do hero
const HeroSettingsSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  cta_text: z.string().min(1).max(50),
  cta_secondary_text: z.string().max(50).optional(),
  background_image: z.string().url().optional().or(z.literal('')),
  background_color: z.string().min(4).max(9), // hex color
  text_color: z.string().min(4).max(9), // hex color
  cta_color: z.string().min(4).max(9), // hex color
  logo_url: z.string().url().optional().or(z.literal('')),
  video_url: z.string().url().optional().or(z.literal('')),
  enabled: z.boolean().default(true)
});

// GET /api/settings - Obter todas as configurações
export async function getSettings(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const [rows] = await db.execute(
      `SELECT setting_key, setting_value, setting_type, updated_at FROM lp_settings ORDER BY setting_key`
    );
    
    // Transformar array em objeto para facilitar uso no frontend
    const settings: Record<string, any> = {};
    (rows as any[]).forEach(row => {
      let value = row.setting_value;
      
      // Converter tipos conforme necessário
      switch (row.setting_type) {
        case 'boolean':
          value = value === 'true' || value === '1';
          break;
        case 'number':
          value = parseFloat(value) || 0;
          break;
        case 'json':
          try {
            value = JSON.parse(value);
          } catch {
            value = {};
          }
          break;
        default:
          // text - manter como string
          break;
      }
      
      settings[row.setting_key] = {
        value,
        type: row.setting_type,
        updated_at: row.updated_at
      };
    });

    res.json({
      success: true,
      data: settings
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
    const db = getDatabase();
    
    const [rows] = await db.execute(
      `SELECT setting_value, setting_type, updated_at FROM lp_settings WHERE setting_key = ?`,
      [key]
    );
    
    if ((rows as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Configuração não encontrada'
      });
    }
    
    const row = (rows as any[])[0];
    let value = row.setting_value;
    
    // Converter tipo conforme necessário
    switch (row.setting_type) {
      case 'boolean':
        value = value === 'true' || value === '1';
        break;
      case 'number':
        value = parseFloat(value) || 0;
        break;
      case 'json':
        try {
          value = JSON.parse(value);
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
        type: row.setting_type,
        updated_at: row.updated_at
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
    
    const db = getDatabase();
    
    // Converter valor para string conforme o tipo
    let stringValue = String(value);
    if (type === 'json') {
      stringValue = JSON.stringify(value);
    }
    
    await db.execute(
      `INSERT INTO lp_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), setting_type = VALUES(setting_type)`,
      [key, stringValue, type]
    );
    
    res.json({
      success: true,
      message: 'Configuração atualizada com sucesso',
      data: { key, value, type }
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
    const { settings } = req.body;
    
    if (!Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        message: 'Settings deve ser um array'
      });
    }
    
    // Validar todas as configurações
    const validation = BulkSettingsSchema.safeParse(settings);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: validation.error.errors
      });
    }
    
    const db = getDatabase();
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const setting of settings) {
        let stringValue = setting.setting_value || '';
        if (setting.setting_type === 'json') {
          stringValue = JSON.stringify(setting.setting_value);
        }
        
        await connection.execute(
          `INSERT INTO lp_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), setting_type = VALUES(setting_type)`,
          [setting.setting_key, stringValue, setting.setting_type]
        );
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Configurações atualizadas com sucesso',
        updated_count: settings.length
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
    const db = getDatabase();
    
    const [result] = await db.execute(
      `DELETE FROM lp_settings WHERE setting_key = ?`,
      [key]
    );
    
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Configuração não encontrada'
      });
    }
    
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
