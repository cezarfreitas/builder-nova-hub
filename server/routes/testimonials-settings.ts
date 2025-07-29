import { Request, Response } from "express";
import { getTestimonialsFromLpSettings, saveTestimonialsToLpSettings } from "../database/lp-settings-migration";

// GET /api/testimonials-settings
export async function getTestimonialsSettings(req: Request, res: Response) {
  try {
    console.log('🔄 Buscando configurações dos testimonials...');
    
    const testimonialsSettings = await getTestimonialsFromLpSettings();
    
    console.log('✅ Configurações dos testimonials carregadas:', Object.keys(testimonialsSettings));
    
    res.json({
      success: true,
      data: testimonialsSettings,
      source: 'lp_settings'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar configurações dos testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// POST /api/testimonials-settings  
export async function saveTestimonialsSettings(req: Request, res: Response) {
  try {
    console.log('🔄 Salvando configurações dos testimonials...');
    
    const settings = req.body;
    
    // Validação básica
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Dados das configurações são obrigatórios'
      });
    }

    const result = await saveTestimonialsToLpSettings(settings);
    
    if (result.success) {
      console.log('✅ Configurações dos testimonials salvas com sucesso');
      res.json({
        success: true,
        message: 'Configurações salvas com sucesso',
        data: result.data
      });
    } else {
      throw new Error(result.error || 'Falha ao salvar configurações');
    }
  } catch (error) {
    console.error('❌ Erro ao salvar configurações dos testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
