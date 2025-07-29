import { initializeDatabase } from "../config/database";
import fs from "fs";
import path from "path";

// Função para migrar dados do hero para lp_settings
export async function migrateHeroToLpSettings() {
  try {
    const db = await initializeDatabase();

    console.log("🔄 Iniciando migração do hero para lp_settings...");

    // 1. Buscar dados da tabela hero_settings (se existir)
    let heroData: any = null;
    try {
      const [heroResults] = await db.execute(
        "SELECT * FROM hero_settings WHERE is_active = true ORDER BY updated_at DESC LIMIT 1",
      );

      if ((heroResults as any).length > 0) {
        heroData = (heroResults as any)[0];
        console.log("✅ Dados encontrados na tabela hero_settings");
      }
    } catch (error) {
      console.log("ℹ️ Tabela hero_settings não encontrada ou sem dados");
    }

    // 2. Se não encontrou no banco, tentar ler do JSON
    if (!heroData) {
      try {
        const jsonPath = path.join(process.cwd(), "server/data/hero.json");
        if (fs.existsSync(jsonPath)) {
          const jsonContent = fs.readFileSync(jsonPath, "utf8");
          heroData = JSON.parse(jsonContent);
          console.log("✅ Dados encontrados no arquivo hero.json");
        }
      } catch (error) {
        console.log("ℹ️ Arquivo hero.json não encontrado ou inválido");
      }
    }

    // 3. Se ainda não tem dados, usar dados padrão
    if (!heroData) {
      heroData = {
        title: "SEJA UM {ecko}REVENDEDOR{/ecko} OFICIAL",
        subtitle: "O maior programa de parceria do streetwear",
        description:
          "Transforme sua paixão por streetwear em um negócio lucrativo. Junte-se a milhares de revendedores que já fazem parte da família {ecko}Ecko{/ecko} e descobra como vender produtos autênticos com margens exclusivas.",
        background_image: "",
        background_color: "#000000",
        text_color: "#ffffff",
        cta_primary_text: "QUERO SER {ecko}REVENDEDOR{/ecko}",
        cta_secondary_text: "DESCUBRA COMO",
        cta_color: "#dc2626",
        cta_text_color: "#ffffff",
        overlay_color: "#000000",
        overlay_opacity: 70,
        overlay_blend_mode: "normal",
        overlay_gradient_enabled: false,
        overlay_gradient_start: "#000000",
        overlay_gradient_end: "#333333",
        overlay_gradient_direction: "to bottom",
        logo_url: "",
      };
      console.log("ℹ️ Usando dados padrão do hero");
    }

    // 4. Converter dados do hero para formato de lp_settings
    const heroSettings = [
      { key: "hero_title", value: heroData.title || "", type: "text" },
      { key: "hero_subtitle", value: heroData.subtitle || "", type: "text" },
      {
        key: "hero_description",
        value: heroData.description || "",
        type: "text",
      },
      {
        key: "hero_background_image",
        value: heroData.background_image || "",
        type: "text",
      },
      {
        key: "hero_background_color",
        value: heroData.background_color || "#000000",
        type: "text",
      },
      {
        key: "hero_text_color",
        value: heroData.text_color || "#ffffff",
        type: "text",
      },
      {
        key: "hero_cta_primary_text",
        value: heroData.cta_primary_text || "",
        type: "text",
      },
      {
        key: "hero_cta_secondary_text",
        value: heroData.cta_secondary_text || "",
        type: "text",
      },
      {
        key: "hero_cta_color",
        value: heroData.cta_color || "#dc2626",
        type: "text",
      },
      {
        key: "hero_cta_text_color",
        value: heroData.cta_text_color || "#ffffff",
        type: "text",
      },
      {
        key: "hero_overlay_color",
        value: heroData.overlay_color || "#000000",
        type: "text",
      },
      {
        key: "hero_overlay_opacity",
        value: String(heroData.overlay_opacity || 70),
        type: "number",
      },
      {
        key: "hero_overlay_blend_mode",
        value: heroData.overlay_blend_mode || "normal",
        type: "text",
      },
      {
        key: "hero_overlay_gradient_enabled",
        value: heroData.overlay_gradient_enabled ? "true" : "false",
        type: "boolean",
      },
      {
        key: "hero_overlay_gradient_start",
        value: heroData.overlay_gradient_start || "#000000",
        type: "text",
      },
      {
        key: "hero_overlay_gradient_end",
        value: heroData.overlay_gradient_end || "#333333",
        type: "text",
      },
      {
        key: "hero_overlay_gradient_direction",
        value: heroData.overlay_gradient_direction || "to bottom",
        type: "text",
      },
      { key: "hero_logo_url", value: heroData.logo_url || "", type: "text" },
    ];

    // 5. Inserir/atualizar dados na tabela lp_settings
    for (const setting of heroSettings) {
      await db.execute(
        `
        INSERT INTO lp_settings (setting_key, setting_value, setting_type) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        setting_value = VALUES(setting_value),
        setting_type = VALUES(setting_type),
        updated_at = CURRENT_TIMESTAMP
      `,
        [setting.key, setting.value, setting.type],
      );
    }

    console.log("✅ Dados do hero migrados para lp_settings com sucesso!");

    // 6. Verificar se a migração foi bem-sucedida
    const [verifyResults] = await db.execute(
      "SELECT COUNT(*) as count FROM lp_settings WHERE setting_key LIKE 'hero_%'",
    );

    const heroCount = (verifyResults as any)[0].count;
    console.log(
      `��� ${heroCount} configurações do hero encontradas em lp_settings`,
    );

    return { success: true, migratedCount: heroCount };
  } catch (error) {
    console.error("❌ Erro na migração do hero para lp_settings:", error);
    throw error;
  }
}

// Função para excluir a tabela hero_settings
export async function dropHeroTable() {
  try {
    const db = await initializeDatabase();

    console.log("🗑️ Excluindo tabela hero_settings...");

    // Verificar se a tabela existe antes de tentar excluir
    const [tableExists] = await db.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'hero_settings'
    `);

    if ((tableExists as any)[0].count > 0) {
      // Fazer backup dos dados antes de excluir (se necessário)
      const [backupData] = await db.execute("SELECT * FROM hero_settings");

      if ((backupData as any).length > 0) {
        console.log(
          `ℹ️ Fazendo backup de ${(backupData as any).length} registros da tabela hero_settings`,
        );

        // Salvar backup em JSON
        const backupPath = path.join(
          process.cwd(),
          "server/data/hero_settings_backup.json",
        );
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
        console.log(`✅ Backup salvo em: ${backupPath}`);
      }

      // Excluir a tabela
      await db.execute("DROP TABLE hero_settings");
      console.log("✅ Tabela hero_settings excluída com sucesso!");
    } else {
      console.log(
        "ℹ️ Tabela hero_settings não existe, nenhuma ação necessária",
      );
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao excluir tabela hero_settings:", error);
    throw error;
  }
}

// Funções para operações CRUD do hero usando lp_settings
export async function getHeroFromLpSettings() {
  try {
    const db = await initializeDatabase();

    const [results] = await db.execute(`
      SELECT setting_key, setting_value, setting_type 
      FROM lp_settings 
      WHERE setting_key LIKE 'hero_%'
    `);

    const heroData: any = {};

    // Converter resultados para formato objeto
    (results as any).forEach((row: any) => {
      const key = row.setting_key.replace("hero_", "");
      let value = row.setting_value;

      // Converter tipos conforme necessário
      if (row.setting_type === "number") {
        value = parseInt(value) || 0;
      } else if (row.setting_type === "boolean") {
        value = value === "true";
      }

      heroData[key] = value;
    });

    // Se não há dados, inserir dados padrão
    if (Object.keys(heroData).length === 0) {
      console.log(
        "ℹ️ Nenhum dado do hero encontrado, inserindo dados padrão...",
      );
      await migrateHeroToLpSettings();
      return await getHeroFromLpSettings();
    }

    return heroData;
  } catch (error) {
    console.error("❌ Erro ao buscar hero do lp_settings:", error);
    throw error;
  }
}

export async function saveHeroToLpSettings(heroData: any) {
  try {
    const db = await initializeDatabase();

    // Converter dados do hero para formato de lp_settings
    const heroSettings = [
      { key: "hero_title", value: heroData.title || "", type: "text" },
      { key: "hero_subtitle", value: heroData.subtitle || "", type: "text" },
      {
        key: "hero_description",
        value: heroData.description || "",
        type: "text",
      },
      {
        key: "hero_background_image",
        value: heroData.background_image || "",
        type: "text",
      },
      {
        key: "hero_background_color",
        value: heroData.background_color || "#000000",
        type: "text",
      },
      {
        key: "hero_text_color",
        value: heroData.text_color || "#ffffff",
        type: "text",
      },
      {
        key: "hero_cta_primary_text",
        value: heroData.cta_primary_text || "",
        type: "text",
      },
      {
        key: "hero_cta_secondary_text",
        value: heroData.cta_secondary_text || "",
        type: "text",
      },
      {
        key: "hero_cta_color",
        value: heroData.cta_color || "#dc2626",
        type: "text",
      },
      {
        key: "hero_cta_text_color",
        value: heroData.cta_text_color || "#ffffff",
        type: "text",
      },
      {
        key: "hero_overlay_color",
        value: heroData.overlay_color || "#000000",
        type: "text",
      },
      {
        key: "hero_overlay_opacity",
        value: String(heroData.overlay_opacity || 70),
        type: "number",
      },
      {
        key: "hero_overlay_blend_mode",
        value: heroData.overlay_blend_mode || "normal",
        type: "text",
      },
      {
        key: "hero_overlay_gradient_enabled",
        value: heroData.overlay_gradient_enabled ? "true" : "false",
        type: "boolean",
      },
      {
        key: "hero_overlay_gradient_start",
        value: heroData.overlay_gradient_start || "#000000",
        type: "text",
      },
      {
        key: "hero_overlay_gradient_end",
        value: heroData.overlay_gradient_end || "#333333",
        type: "text",
      },
      {
        key: "hero_overlay_gradient_direction",
        value: heroData.overlay_gradient_direction || "to bottom",
        type: "text",
      },
      { key: "hero_logo_url", value: heroData.logo_url || "", type: "text" },
    ];

    // Atualizar/inserir cada configuração
    for (const setting of heroSettings) {
      await db.execute(
        `
        INSERT INTO lp_settings (setting_key, setting_value, setting_type)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        setting_value = VALUES(setting_value),
        setting_type = VALUES(setting_type),
        updated_at = CURRENT_TIMESTAMP
      `,
        [setting.key, setting.value, setting.type],
      );
    }

    console.log("✅ Hero salvo em lp_settings com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar hero em lp_settings:", error);
    throw error;
  }
}

// Função para migrar dados do about para lp_settings
export async function migrateAboutToLpSettings() {
  try {
    const db = await initializeDatabase();

    console.log("🔄 Iniciando migração do about para lp_settings...");

    // 1. Tentar ler dados do arquivo JSON
    let aboutData: any = null;
    try {
      const jsonPath = path.join(process.cwd(), "server/data/about.json");
      if (fs.existsSync(jsonPath)) {
        const jsonContent = fs.readFileSync(jsonPath, "utf8");
        aboutData = JSON.parse(jsonContent);
        console.log("✅ Dados encontrados no arquivo about.json");
      }
    } catch (error) {
      console.log("ℹ️ Arquivo about.json não encontrado ou inválido");
    }

    // 2. Se não tem dados, usar dados padrão
    if (!aboutData) {
      aboutData = {
        section_tag: "Nossa História",
        section_title: "SOBRE A {ecko}ECKO{/ecko}",
        section_subtitle: "mais de 20 anos de streetwear",
        section_description: "Conheça a trajetória de uma das marcas mais influentes do streetwear mundial",
        content: "Fundada em 1993 por Marc Milecofsky, a {ecko}Ecko{/ecko} nasceu com o propósito de dar voz à cultura urbana e ao streetwear autêntico.",
        stats: [
          {
            id: 1,
            number: "30+",
            label: "Anos de História",
            description: "Mais de três décadas construindo a cultura streetwear"
          },
          {
            id: 2,
            number: "50+",
            label: "Países",
            description: "Presença global com produtos em todos os continentes"
          },
          {
            id: 3,
            number: "1000+",
            label: "Lojas Parceiras",
            description: "Rede de revendedores oficiais no Brasil"
          },
          {
            id: 4,
            number: "100M+",
            label: "Produtos Vendidos",
            description: "Milhões de peças que marcaram gerações"
          }
        ],
        cta_title: "Faça Parte Desta {ecko}História{/ecko}",
        cta_description: "Torne-se um revendedor oficial e ajude a escrever o próximo capítulo da Ecko",
        cta_button_text: "QUERO SER PARTE DA {ecko}ECKO{/ecko}",
        background_type: "color",
        background_color: "#ffffff",
        background_image: "",
        overlay_enabled: false,
        overlay_color: "#000000",
        overlay_opacity: 50,
        overlay_blend_mode: "normal",
        overlay_gradient_enabled: false,
        overlay_gradient_start: "#000000",
        overlay_gradient_end: "#333333",
        overlay_gradient_direction: "to bottom"
      };
      console.log("ℹ️ Usando dados padrão do about");
    }

    // 3. Converter dados do about para formato de lp_settings
    const aboutSettings = [
      { key: "about_section_tag", value: aboutData.section_tag || "", type: "text" },
      { key: "about_section_title", value: aboutData.section_title || "", type: "text" },
      { key: "about_section_subtitle", value: aboutData.section_subtitle || "", type: "text" },
      { key: "about_section_description", value: aboutData.section_description || "", type: "text" },
      { key: "about_content", value: aboutData.content || "", type: "text" },
      { key: "about_stats", value: JSON.stringify(aboutData.stats || []), type: "json" },
      { key: "about_cta_title", value: aboutData.cta_title || "", type: "text" },
      { key: "about_cta_description", value: aboutData.cta_description || "", type: "text" },
      { key: "about_cta_button_text", value: aboutData.cta_button_text || "", type: "text" },
      { key: "about_background_type", value: aboutData.background_type || "color", type: "text" },
      { key: "about_background_color", value: aboutData.background_color || "#ffffff", type: "text" },
      { key: "about_background_image", value: aboutData.background_image || "", type: "text" },
      { key: "about_overlay_enabled", value: aboutData.overlay_enabled ? "true" : "false", type: "boolean" },
      { key: "about_overlay_color", value: aboutData.overlay_color || "#000000", type: "text" },
      { key: "about_overlay_opacity", value: String(aboutData.overlay_opacity || 50), type: "number" },
      { key: "about_overlay_blend_mode", value: aboutData.overlay_blend_mode || "normal", type: "text" },
      { key: "about_overlay_gradient_enabled", value: aboutData.overlay_gradient_enabled ? "true" : "false", type: "boolean" },
      { key: "about_overlay_gradient_start", value: aboutData.overlay_gradient_start || "#000000", type: "text" },
      { key: "about_overlay_gradient_end", value: aboutData.overlay_gradient_end || "#333333", type: "text" },
      { key: "about_overlay_gradient_direction", value: aboutData.overlay_gradient_direction || "to bottom", type: "text" }
    ];

    // 4. Inserir/atualizar dados na tabela lp_settings
    for (const setting of aboutSettings) {
      await db.execute(
        `
        INSERT INTO lp_settings (setting_key, setting_value, setting_type)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        setting_value = VALUES(setting_value),
        setting_type = VALUES(setting_type),
        updated_at = CURRENT_TIMESTAMP
      `,
        [setting.key, setting.value, setting.type],
      );
    }

    console.log("✅ Dados do about migrados para lp_settings com sucesso!");

    // 5. Verificar se a migração foi bem-sucedida
    const [verifyResults] = await db.execute(
      "SELECT COUNT(*) as count FROM lp_settings WHERE setting_key LIKE 'about_%'",
    );

    const aboutCount = (verifyResults as any)[0].count;
    console.log(
      `✅ ${aboutCount} configurações do about encontradas em lp_settings`,
    );

    return { success: true, migratedCount: aboutCount };
  } catch (error) {
    console.error("❌ Erro na migração do about para lp_settings:", error);
    throw error;
  }
}

// Funções para operações CRUD do about usando lp_settings
export async function getAboutFromLpSettings() {
  try {
    const db = await initializeDatabase();

    const [results] = await db.execute(`
      SELECT setting_key, setting_value, setting_type
      FROM lp_settings
      WHERE setting_key LIKE 'about_%'
    `);

    const aboutData: any = {};

    // Converter resultados para formato objeto
    (results as any).forEach((row: any) => {
      const key = row.setting_key.replace("about_", "");
      let value = row.setting_value;

      // Converter tipos conforme necessário
      if (row.setting_type === "number") {
        value = parseInt(value) || 0;
      } else if (row.setting_type === "boolean") {
        value = value === "true";
      } else if (row.setting_type === "json") {
        try {
          value = JSON.parse(value);
        } catch {
          value = [];
        }
      }

      aboutData[key] = value;
    });

    // Se não há dados, inserir dados padrão
    if (Object.keys(aboutData).length === 0) {
      console.log(
        "ℹ️ Nenhum dado do about encontrado, inserindo dados padrão...",
      );
      await migrateAboutToLpSettings();
      return await getAboutFromLpSettings();
    }

    return aboutData;
  } catch (error) {
    console.error("❌ Erro ao buscar about do lp_settings:", error);
    throw error;
  }
}

export async function saveAboutToLpSettings(aboutData: any) {
  try {
    const db = await initializeDatabase();

    // Converter dados do about para formato de lp_settings
    const aboutSettings = [
      { key: "about_section_tag", value: aboutData.section_tag || "", type: "text" },
      { key: "about_section_title", value: aboutData.section_title || "", type: "text" },
      { key: "about_section_subtitle", value: aboutData.section_subtitle || "", type: "text" },
      { key: "about_section_description", value: aboutData.section_description || "", type: "text" },
      { key: "about_content", value: aboutData.content || "", type: "text" },
      { key: "about_stats", value: JSON.stringify(aboutData.stats || []), type: "json" },
      { key: "about_cta_title", value: aboutData.cta_title || "", type: "text" },
      { key: "about_cta_description", value: aboutData.cta_description || "", type: "text" },
      { key: "about_cta_button_text", value: aboutData.cta_button_text || "", type: "text" },
      { key: "about_background_type", value: aboutData.background_type || "color", type: "text" },
      { key: "about_background_color", value: aboutData.background_color || "#ffffff", type: "text" },
      { key: "about_background_image", value: aboutData.background_image || "", type: "text" },
      { key: "about_overlay_enabled", value: aboutData.overlay_enabled ? "true" : "false", type: "boolean" },
      { key: "about_overlay_color", value: aboutData.overlay_color || "#000000", type: "text" },
      { key: "about_overlay_opacity", value: String(aboutData.overlay_opacity || 50), type: "number" },
      { key: "about_overlay_blend_mode", value: aboutData.overlay_blend_mode || "normal", type: "text" },
      { key: "about_overlay_gradient_enabled", value: aboutData.overlay_gradient_enabled ? "true" : "false", type: "boolean" },
      { key: "about_overlay_gradient_start", value: aboutData.overlay_gradient_start || "#000000", type: "text" },
      { key: "about_overlay_gradient_end", value: aboutData.overlay_gradient_end || "#333333", type: "text" },
      { key: "about_overlay_gradient_direction", value: aboutData.overlay_gradient_direction || "to bottom", type: "text" }
    ];

    // Atualizar/inserir cada configuração
    for (const setting of aboutSettings) {
      await db.execute(
        `
        INSERT INTO lp_settings (setting_key, setting_value, setting_type)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        setting_value = VALUES(setting_value),
        setting_type = VALUES(setting_type),
        updated_at = CURRENT_TIMESTAMP
      `,
        [setting.key, setting.value, setting.type],
      );
    }

    console.log("✅ About salvo em lp_settings com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar about em lp_settings:", error);
    throw error;
  }
}
