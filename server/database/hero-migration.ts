import { initializeDatabase } from "../config/database";

export async function createHeroTable() {
  try {
    const db = await initializeDatabase();
    
    // Criar tabela hero
    await db.execute(`
      CREATE TABLE IF NOT EXISTS hero_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        background_image VARCHAR(500),
        background_color VARCHAR(10) DEFAULT '#000000',
        text_color VARCHAR(10) DEFAULT '#ffffff',
        cta_primary_text TEXT,
        cta_secondary_text TEXT,
        cta_color VARCHAR(10) DEFAULT '#dc2626',
        cta_text_color VARCHAR(10) DEFAULT '#ffffff',
        overlay_color VARCHAR(10) DEFAULT '#000000',
        overlay_opacity INT DEFAULT 70,
        overlay_blend_mode VARCHAR(20) DEFAULT 'normal',
        overlay_gradient_enabled BOOLEAN DEFAULT false,
        overlay_gradient_start VARCHAR(10) DEFAULT '#000000',
        overlay_gradient_end VARCHAR(10) DEFAULT '#333333',
        overlay_gradient_direction VARCHAR(50) DEFAULT 'to bottom',
        logo_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);

    console.log("✅ Tabela hero_settings criada/verificada com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao criar tabela hero_settings:", error);
    throw error;
  }
}

export async function migrateHeroDataFromJson() {
  try {
    const db = await initializeDatabase();
    
    // Verificar se já existe dados na tabela
    const [existingData] = await db.execute("SELECT COUNT(*) as count FROM hero_settings WHERE is_active = true");
    
    if (existingData[0].count > 0) {
      console.log("ℹ️ Dados do hero já existem no banco de dados");
      return true;
    }

    // Ler dados do arquivo JSON
    const fs = require('fs');
    const path = require('path');
    const jsonPath = path.join(process.cwd(), 'server/data/hero.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.log("ℹ️ Arquivo hero.json não encontrado, usando dados padrão");
      return insertDefaultHeroData();
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Inserir dados na tabela
    await db.execute(`
      INSERT INTO hero_settings (
        title, subtitle, description, background_image, background_color,
        text_color, cta_primary_text, cta_secondary_text, cta_color,
        cta_text_color, overlay_color, overlay_opacity, overlay_blend_mode,
        overlay_gradient_enabled, overlay_gradient_start, overlay_gradient_end,
        overlay_gradient_direction, logo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      jsonData.title || "SEJA UM REVENDEDOR OFICIAL",
      jsonData.subtitle || "O maior programa de parceria do streetwear",
      jsonData.description || "Transforme sua paixão por streetwear em um negócio lucrativo.",
      jsonData.background_image || "",
      jsonData.background_color || "#000000",
      jsonData.text_color || "#ffffff",
      jsonData.cta_primary_text || "QUERO SER REVENDEDOR",
      jsonData.cta_secondary_text || "DESCUBRA COMO",
      jsonData.cta_color || "#dc2626",
      jsonData.cta_text_color || "#ffffff",
      jsonData.overlay_color || "#000000",
      jsonData.overlay_opacity || 70,
      jsonData.overlay_blend_mode || "normal",
      jsonData.overlay_gradient_enabled || false,
      jsonData.overlay_gradient_start || "#000000",
      jsonData.overlay_gradient_end || "#333333",
      jsonData.overlay_gradient_direction || "to bottom",
      jsonData.logo_url || ""
    ]);

    console.log("✅ Dados do hero migrados do JSON para o banco de dados com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao migrar dados do hero:", error);
    return insertDefaultHeroData();
  }
}

async function insertDefaultHeroData() {
  try {
    const db = await initializeDatabase();

    await db.execute(`
      INSERT INTO hero_settings (
        title, subtitle, description, background_image, background_color,
        text_color, cta_primary_text, cta_secondary_text, cta_color,
        cta_text_color, overlay_color, overlay_opacity, overlay_blend_mode,
        overlay_gradient_enabled, overlay_gradient_start, overlay_gradient_end,
        overlay_gradient_direction, logo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      "SEJA UM {ecko}REVENDEDOR{/ecko} OFICIAL",
      "O maior programa de parceria do streetwear",
      "Transforme sua paixão por streetwear em um negócio lucrativo. Junte-se a milhares de revendedores que já fazem parte da família {ecko}Ecko{/ecko} e descobra como vender produtos autênticos com margens exclusivas.",
      "",
      "#000000",
      "#ffffff",
      "QUERO SER {ecko}REVENDEDOR{/ecko}",
      "DESCUBRA COMO",
      "#dc2626",
      "#ffffff",
      "#000000",
      70,
      "normal",
      false,
      "#000000",
      "#333333",
      "to bottom",
      ""
    ]);

    console.log("✅ Dados padrão do hero inseridos no banco de dados!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao inserir dados padrão do hero:", error);
    throw error;
  }
}

// Funções para operações CRUD do hero
export async function getHeroFromDatabase() {
  try {
    const db = await initializeDatabase();
    const [results] = await db.execute("SELECT * FROM hero_settings WHERE is_active = true ORDER BY updated_at DESC LIMIT 1");
    
    if (results.length === 0) {
      // Se não há dados, migrar do JSON ou inserir dados padrão
      await migrateHeroDataFromJson();
      return await getHeroFromDatabase();
    }

    return results[0];
  } catch (error) {
    console.error("❌ Erro ao buscar hero do banco:", error);
    throw error;
  }
}

export async function saveHeroToDatabase(heroData: any) {
  try {
    const db = await initializeDatabase();
    
    // Marcar configuração atual como inativa
    await db.query("UPDATE hero_settings SET is_active = false WHERE is_active = true");
    
    // Inserir nova configuração
    await db.query(`
      INSERT INTO hero_settings (
        title, subtitle, description, background_image, background_color,
        text_color, cta_primary_text, cta_secondary_text, cta_color,
        cta_text_color, overlay_color, overlay_opacity, overlay_blend_mode,
        overlay_gradient_enabled, overlay_gradient_start, overlay_gradient_end,
        overlay_gradient_direction, logo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      heroData.title,
      heroData.subtitle,
      heroData.description,
      heroData.background_image || "",
      heroData.background_color || "#000000",
      heroData.text_color || "#ffffff",
      heroData.cta_primary_text,
      heroData.cta_secondary_text,
      heroData.cta_color || "#dc2626",
      heroData.cta_text_color || "#ffffff",
      heroData.overlay_color || "#000000",
      heroData.overlay_opacity || 70,
      heroData.overlay_blend_mode || "normal",
      heroData.overlay_gradient_enabled || false,
      heroData.overlay_gradient_start || "#000000",
      heroData.overlay_gradient_end || "#333333",
      heroData.overlay_gradient_direction || "to bottom",
      heroData.logo_url || ""
    ]);

    console.log("✅ Hero salvo no banco de dados com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar hero no banco:", error);
    throw error;
  }
}
