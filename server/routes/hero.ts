import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Caminho para o arquivo JSON do hero
const HERO_DATA_PATH = path.join(__dirname, '../data/hero.json');

// Configurações padrão do hero
const defaultHeroSettings = {
  title: "SEJA UM {ecko}REVENDEDOR{/ecko} OFICIAL",
  subtitle: "O maior programa de parceria do streetwear",
  description: "Transforme sua paixão por streetwear em um negócio lucrativo. Junte-se a milhares de revendedores que já fazem parte da família {ecko}Ecko{/ecko} e descobra como vender produtos autênticos com margens exclusivas.",
  background_image: "",
  background_color: "#000000",
  text_color: "#ffffff",
  cta_primary_text: "QUERO SER {ecko}REVENDEDOR{/ecko}",
  cta_secondary_text: "DESCUBRA {blue}COMO{/blue}",
  cta_color: "#dc2626",
  cta_text_color: "#ffffff",
  overlay_color: "#000000",
  overlay_opacity: 70,
  overlay_blend_mode: "normal",
  overlay_gradient_enabled: false,
  overlay_gradient_start: "#000000",
  overlay_gradient_end: "#333333",
  overlay_gradient_direction: "to bottom",
  logo_url: ""
};

// Função para garantir que o diretório existe
function ensureDataDirectory() {
  const dataDir = path.dirname(HERO_DATA_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Função para carregar configurações do hero
function loadHeroSettings() {
  try {
    ensureDataDirectory();
    
    if (!fs.existsSync(HERO_DATA_PATH)) {
      // Se o arquivo não existe, criar com configurações padrão
      fs.writeFileSync(HERO_DATA_PATH, JSON.stringify(defaultHeroSettings, null, 2));
      return defaultHeroSettings;
    }

    const data = fs.readFileSync(HERO_DATA_PATH, 'utf8');
    const settings = JSON.parse(data);
    
    // Garantir que todas as propriedades necessárias existam
    return {
      ...defaultHeroSettings,
      ...settings
    };
  } catch (error) {
    console.error('Erro ao carregar configurações do hero:', error);
    return defaultHeroSettings;
  }
}

// Função para salvar configurações do hero
function saveHeroSettings(settings: any) {
  try {
    ensureDataDirectory();
    
    // Garantir que apenas propriedades válidas sejam salvas
    const validSettings = {
      ...defaultHeroSettings,
      ...settings
    };

    fs.writeFileSync(HERO_DATA_PATH, JSON.stringify(validSettings, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar configurações do hero:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

// GET /api/hero - Buscar configurações do hero
router.get('/', (req, res) => {
  try {
    const settings = loadHeroSettings();
    res.json(settings);
  } catch (error) {
    console.error('Erro ao buscar configurações do hero:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// POST /api/hero - Salvar configurações do hero
router.post('/', (req, res) => {
  try {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: 'As configurações devem ser um objeto válido'
      });
    }

    const result = saveHeroSettings(settings);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Configurações do hero salvas com sucesso',
        data: settings
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro ao salvar configurações',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// PUT /api/hero - Atualizar configurações específicas do hero
router.put('/', (req, res) => {
  try {
    const updates = req.body;
    
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: 'As atualizações devem ser um objeto válido'
      });
    }

    // Carregar configurações atuais
    const currentSettings = loadHeroSettings();
    
    // Aplicar atualizações
    const updatedSettings = {
      ...currentSettings,
      ...updates
    };

    const result = saveHeroSettings(updatedSettings);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Configurações do hero atualizadas com sucesso',
        data: updatedSettings
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar configurações',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Erro ao processar requisição de atualização:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// DELETE /api/hero - Resetar para configurações padrão
router.delete('/', (req, res) => {
  try {
    const result = saveHeroSettings(defaultHeroSettings);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Configurações do hero resetadas para o padrão',
        data: defaultHeroSettings
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro ao resetar configurações',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Erro ao resetar configurações:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export default router;
