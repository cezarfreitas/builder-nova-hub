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
      `✅ ${heroCount} configurações do hero encontradas em lp_settings`,
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

// Função para migrar dados do footer para lp_settings
export async function migrateFooterToLpSettings() {
  try {
    const db = await initializeDatabase();

    console.log("🔄 Iniciando migração do footer para lp_settings...");

    // 1. Tentar ler dados do arquivo content.json
    let footerData: any = null;
    try {
      const jsonPath = path.join(process.cwd(), "client/data/content.json");
      if (fs.existsSync(jsonPath)) {
        const jsonContent = fs.readFileSync(jsonPath, "utf8");
        const contentData = JSON.parse(jsonContent);
        footerData = contentData.footer;
        console.log("✅ Dados encontrados no arquivo content.json");
      }
    } catch (error) {
      console.log("ℹ️ Arquivo content.json não encontrado ou inválido");
    }

    // 2. Se não tem dados, usar dados padrão
    if (!footerData) {
      footerData = {
        copyright: "© 2024 Ecko. Todos os direitos reservados. Seja um revendedor oficial e transforme seu negócio.",
        social_links: {
          facebook: "https://facebook.com/ecko",
          instagram: "https://instagram.com/ecko"
        }
      };
      console.log("ℹ️ Usando dados padrão do footer");
    }

    // 3. Converter dados do footer para formato de lp_settings
    const footerSettings = [
      { key: "footer_copyright", value: footerData.copyright || "", type: "text" },
      { key: "footer_social_links", value: JSON.stringify(footerData.social_links || {}), type: "json" }
    ];

    // 4. Inserir/atualizar dados na tabela lp_settings
    for (const setting of footerSettings) {
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

    console.log("✅ Dados do footer migrados para lp_settings com sucesso!");

    // 5. Verificar se a migração foi bem-sucedida
    const [verifyResults] = await db.execute(
      "SELECT COUNT(*) as count FROM lp_settings WHERE setting_key LIKE 'footer_%'",
    );

    const footerCount = (verifyResults as any)[0].count;
    console.log(
      `✅ ${footerCount} configurações do footer encontradas em lp_settings`,
    );

    return { success: true, migratedCount: footerCount };
  } catch (error) {
    console.error("❌ Erro na migração do footer para lp_settings:", error);
    throw error;
  }
}

// Funções para operações CRUD do footer usando lp_settings
export async function getFooterFromLpSettings() {
  try {
    const db = await initializeDatabase();

    const [results] = await db.execute(`
      SELECT setting_key, setting_value, setting_type
      FROM lp_settings
      WHERE setting_key LIKE 'footer_%'
    `);

    const footerData: any = {};

    // Converter resultados para formato objeto
    (results as any).forEach((row: any) => {
      const key = row.setting_key.replace("footer_", "");
      let value = row.setting_value;

      // Converter tipos conforme necessário
      if (row.setting_type === "json") {
        try {
          value = JSON.parse(value);
        } catch {
          value = {};
        }
      }

      footerData[key] = value;
    });

    // Se não há dados, inserir dados padrão
    if (Object.keys(footerData).length === 0) {
      console.log(
        "ℹ️ Nenhum dado do footer encontrado, inserindo dados padrão...",
      );
      await migrateFooterToLpSettings();
      return await getFooterFromLpSettings();
    }

    return footerData;
  } catch (error) {
    console.error("❌ Erro ao buscar footer do lp_settings:", error);
    throw error;
  }
}

export async function saveFooterToLpSettings(footerData: any) {
  try {
    const db = await initializeDatabase();

    // Converter dados do footer para formato de lp_settings
    const footerSettings = [
      { key: "footer_copyright", value: footerData.copyright || "", type: "text" },
      { key: "footer_social_links", value: JSON.stringify(footerData.social_links || {}), type: "json" }
    ];

    // Atualizar/inserir cada configuração
    for (const setting of footerSettings) {
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

    console.log("✅ Footer salvo em lp_settings com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar footer em lp_settings:", error);
    throw error;
  }
}

// Função para migrar dados do benefits para lp_settings
export async function migrateBenefitsToLpSettings() {
  try {
    const db = await initializeDatabase();

    console.log("🔄 Iniciando migração do benefits para lp_settings...");

    // 1. Tentar ler dados do arquivo content.json
    let benefitsData: any = null;
    try {
      const jsonPath = path.join(process.cwd(), "client/data/content.json");
      if (fs.existsSync(jsonPath)) {
        const jsonContent = fs.readFileSync(jsonPath, "utf8");
        const contentData = JSON.parse(jsonContent);
        benefitsData = contentData.benefits;
        console.log("�� Dados encontrados no arquivo content.json");
      }
    } catch (error) {
      console.log("ℹ️ Arquivo content.json não encontrado ou inválido");
    }

    // 2. Se não tem dados, usar dados padrão
    if (!benefitsData) {
      benefitsData = {
        section_tag: "Por que escolher a Ecko?",
        section_title: "VANTAGENS EXCLUSIVAS",
        section_subtitle: "para nossos parceiros",
        section_description: "Descubra os benefícios únicos que fazem da Ecko a escolha certa para impulsionar seu negócio no mundo da moda streetwear",
        cards: [
          {
            id: 1,
            title: "MARCA INTERNACIONAL",
            description: "A Ecko é uma marca reconhecida mundialmente com forte presença no Brasil e grande apelo junto ao público jovem.",
            icon: "Globe"
          },
          {
            id: 2,
            title: "PRONTA ENTREGA",
            description: "Disponibilizamos mais de 100.000 produtos prontos para entrega, para impulsionar suas vendas.",
            icon: "Truck"
          },
          {
            id: 3,
            title: "SUPORTE AO LOJISTA",
            description: "Nossa equipe de especialistas está sempre à disposição para garantir que você tenha a melhor experiência.",
            icon: "HeadphonesIcon"
          },
          {
            id: 4,
            title: "TOTALMENTE ONLINE",
            description: "Oferecemos uma plataforma exclusiva de compras online, com preços de atacado e condições exclusivos.",
            icon: "Monitor"
          }
        ],
        cta_title: "Junte-se a milhares de parceiros que já confiam na Ecko",
        cta_button_text: "QUERO FAZER PARTE AGORA"
      };
      console.log("ℹ️ Usando dados padrão do benefits");
    }

    // 3. Converter dados do benefits para formato de lp_settings
    const benefitsSettings = [
      { key: "benefits_section_tag", value: benefitsData.section_tag || "", type: "text" },
      { key: "benefits_section_title", value: benefitsData.section_title || "", type: "text" },
      { key: "benefits_section_subtitle", value: benefitsData.section_subtitle || "", type: "text" },
      { key: "benefits_section_description", value: benefitsData.section_description || "", type: "text" },
      { key: "benefits_cards", value: JSON.stringify(benefitsData.cards || []), type: "json" },
      { key: "benefits_cta_title", value: benefitsData.cta_title || "", type: "text" },
      { key: "benefits_cta_button_text", value: benefitsData.cta_button_text || "", type: "text" }
    ];

    // 4. Inserir/atualizar dados na tabela lp_settings
    for (const setting of benefitsSettings) {
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

    console.log("✅ Dados do benefits migrados para lp_settings com sucesso!");

    // 5. Verificar se a migração foi bem-sucedida
    const [verifyResults] = await db.execute(
      "SELECT COUNT(*) as count FROM lp_settings WHERE setting_key LIKE 'benefits_%'",
    );

    const benefitsCount = (verifyResults as any)[0].count;
    console.log(
      `✅ ${benefitsCount} configurações do benefits encontradas em lp_settings`,
    );

    return { success: true, migratedCount: benefitsCount };
  } catch (error) {
    console.error("❌ Erro na migração do benefits para lp_settings:", error);
    throw error;
  }
}

// Funções para operações CRUD do benefits usando lp_settings
export async function getBenefitsFromLpSettings() {
  try {
    const db = await initializeDatabase();

    const [results] = await db.execute(`
      SELECT setting_key, setting_value, setting_type
      FROM lp_settings
      WHERE setting_key LIKE 'benefits_%'
    `);

    const benefitsData: any = {};

    // Converter resultados para formato objeto
    (results as any).forEach((row: any) => {
      const key = row.setting_key.replace("benefits_", "");
      let value = row.setting_value;

      // Converter tipos conforme necessário
      if (row.setting_type === "json") {
        try {
          value = JSON.parse(value);
        } catch {
          value = [];
        }
      }

      benefitsData[key] = value;
    });

    // Se não há dados, inserir dados padrão
    if (Object.keys(benefitsData).length === 0) {
      console.log(
        "ℹ️ Nenhum dado do benefits encontrado, inserindo dados padrão...",
      );
      await migrateBenefitsToLpSettings();
      return await getBenefitsFromLpSettings();
    }

    return benefitsData;
  } catch (error) {
    console.error("❌ Erro ao buscar benefits do lp_settings:", error);
    throw error;
  }
}

export async function saveBenefitsToLpSettings(benefitsData: any) {
  try {
    const db = await initializeDatabase();

    // Converter dados do benefits para formato de lp_settings
    const benefitsSettings = [
      { key: "benefits_section_tag", value: benefitsData.section_tag || "", type: "text" },
      { key: "benefits_section_title", value: benefitsData.section_title || "", type: "text" },
      { key: "benefits_section_subtitle", value: benefitsData.section_subtitle || "", type: "text" },
      { key: "benefits_section_description", value: benefitsData.section_description || "", type: "text" },
      { key: "benefits_cards", value: JSON.stringify(benefitsData.cards || []), type: "json" },
      { key: "benefits_cta_title", value: benefitsData.cta_title || "", type: "text" },
      { key: "benefits_cta_button_text", value: benefitsData.cta_button_text || "", type: "text" }
    ];

    // Atualizar/inserir cada configuração
    for (const setting of benefitsSettings) {
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

    console.log("✅ Benefits salvo em lp_settings com sucesso!");
    return true;
  } catch (error) {
    console.error("��� Erro ao salvar benefits em lp_settings:", error);
    throw error;
  }
}

// Função para migrar dados do form para lp_settings
export async function migrateFormToLpSettings() {
  try {
    const db = await initializeDatabase();

    console.log("🔄 Iniciando migração do form para lp_settings...");

    // 1. Tentar ler dados do arquivo content.json
    let formData: any = null;
    try {
      const jsonPath = path.join(process.cwd(), "client/data/content.json");
      if (fs.existsSync(jsonPath)) {
        const jsonContent = fs.readFileSync(jsonPath, "utf8");
        const contentData = JSON.parse(jsonContent);
        formData = contentData.form;
        console.log("✅ Dados encontrados no arquivo content.json");
      }
    } catch (error) {
      console.log("ℹ️ Arquivo content.json não encontrado ou inválido");
    }

    // 2. Se não tem dados, usar dados padrão
    if (!formData) {
      formData = {
        main_title: "SEJA PARCEIRO OFICIAL ECKO E TENHA SUCESSO",
        main_description: "Transforme sua paixão pelo streetwear em um negócio lucrativo",
        title: "Cadastro de Revendedor",
        subtitle: "Preencha os dados para receber nossa proposta",
        fields: {
          name_label: "Nome Completo",
          name_placeholder: "Digite seu nome completo",
          whatsapp_label: "WhatsApp",
          whatsapp_placeholder: "(11) 99999-9999",
          whatsapp_error: "Digite um número de WhatsApp válido. Ex: (11) 99999-9999",
          whatsapp_success: "✅ WhatsApp válido",
          cep_label: "CEP",
          cep_placeholder: "Digite seu CEP",
          endereco_label: "Endereço",
          endereco_placeholder: "Rua, número",
          complemento_label: "Complemento",
          complemento_placeholder: "Apto, bloco, casa...",
          bairro_label: "Bairro",
          cidade_label: "Cidade",
          estado_label: "Estado",
          cnpj_label: "Tem CNPJ?",
          cnpj_yes: "Sim",
          cnpj_no: "Não",
          cnpj_error: "Para ser um revendedor oficial da Ecko é necessário ter CNPJ.",
          store_type_label: "Tipo de Loja",
          store_type_placeholder: "Ex: Loja física, Online, Ambos..."
        },
        submit_button: "QUERO SER REVENDEDOR OFICIAL",
        submit_button_loading: "Enviando...",
        validation_messages: {
          whatsapp_invalid: "Digite um número de WhatsApp válido para contato.",
          address_incomplete: "Aguarde o carregamento do endereço ou verifique o CEP.",
          cnpj_required: "É necessário ter CNPJ para se tornar um revendedor autorizado."
        }
      };
      console.log("ℹ️ Usando dados padrão do form");
    }

    // 3. Converter dados do form para formato de lp_settings
    const formSettings = [
      { key: "form_main_title", value: formData.main_title || "", type: "text" },
      { key: "form_main_description", value: formData.main_description || "", type: "text" },
      { key: "form_title", value: formData.title || "", type: "text" },
      { key: "form_subtitle", value: formData.subtitle || "", type: "text" },
      { key: "form_fields", value: JSON.stringify(formData.fields || {}), type: "json" },
      { key: "form_submit_button", value: formData.submit_button || "", type: "text" },
      { key: "form_submit_button_loading", value: formData.submit_button_loading || "", type: "text" },
      { key: "form_validation_messages", value: JSON.stringify(formData.validation_messages || {}), type: "json" }
    ];

    // 4. Inserir/atualizar dados na tabela lp_settings
    for (const setting of formSettings) {
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

    console.log("✅ Dados do form migrados para lp_settings com sucesso!");

    // 5. Verificar se a migração foi bem-sucedida
    const [verifyResults] = await db.execute(
      "SELECT COUNT(*) as count FROM lp_settings WHERE setting_key LIKE 'form_%'",
    );

    const formCount = (verifyResults as any)[0].count;
    console.log(
      `✅ ${formCount} configurações do form encontradas em lp_settings`,
    );

    return { success: true, migratedCount: formCount };
  } catch (error) {
    console.error("❌ Erro na migração do form para lp_settings:", error);
    throw error;
  }
}

// Funções para operações CRUD do form usando lp_settings
export async function getFormFromLpSettings() {
  try {
    const db = await initializeDatabase();

    const [results] = await db.execute(`
      SELECT setting_key, setting_value, setting_type
      FROM lp_settings
      WHERE setting_key LIKE 'form_%'
    `);

    const formData: any = {};

    // Converter resultados para formato objeto
    (results as any).forEach((row: any) => {
      const key = row.setting_key.replace("form_", "");
      let value = row.setting_value;

      // Converter tipos conforme necessário
      if (row.setting_type === "json") {
        try {
          value = JSON.parse(value);
        } catch {
          value = {};
        }
      }

      formData[key] = value;
    });

    // Se não há dados, inserir dados padrão
    if (Object.keys(formData).length === 0) {
      console.log(
        "ℹ️ Nenhum dado do form encontrado, inserindo dados padrão...",
      );
      await migrateFormToLpSettings();
      return await getFormFromLpSettings();
    }

    return formData;
  } catch (error) {
    console.error("❌ Erro ao buscar form do lp_settings:", error);
    throw error;
  }
}

export async function saveFormToLpSettings(formData: any) {
  try {
    const db = await initializeDatabase();

    // Converter dados do form para formato de lp_settings
    const formSettings = [
      { key: "form_main_title", value: formData.main_title || "", type: "text" },
      { key: "form_main_description", value: formData.main_description || "", type: "text" },
      { key: "form_title", value: formData.title || "", type: "text" },
      { key: "form_subtitle", value: formData.subtitle || "", type: "text" },
      { key: "form_fields", value: JSON.stringify(formData.fields || {}), type: "json" },
      { key: "form_submit_button", value: formData.submit_button || "", type: "text" },
      { key: "form_submit_button_loading", value: formData.submit_button_loading || "", type: "text" },
      { key: "form_validation_messages", value: JSON.stringify(formData.validation_messages || {}), type: "json" }
    ];

    // Atualizar/inserir cada configuração
    for (const setting of formSettings) {
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

    console.log("✅ Form salvo em lp_settings com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar form em lp_settings:", error);
    throw error;
  }
}

// Função para migrar dados de texto da gallery para lp_settings
export async function migrateGalleryToLpSettings() {
  try {
    const db = await initializeDatabase();

    console.log("🔄 Iniciando migração da gallery para lp_settings...");

    // 1. Tentar ler dados do arquivo content.json
    let galleryData: any = null;
    try {
      const jsonPath = path.join(process.cwd(), "client/data/content.json");
      if (fs.existsSync(jsonPath)) {
        const jsonContent = fs.readFileSync(jsonPath, "utf8");
        const contentData = JSON.parse(jsonContent);
        galleryData = contentData.gallery;
        console.log("✅ Dados encontrados no arquivo content.json");
      }
    } catch (error) {
      console.log("ℹ️ Arquivo content.json não encontrado ou inválido");
    }

    // 2. Se não tem dados, usar dados padrão
    if (!galleryData) {
      galleryData = {
        section_tag: "Lifestyle Gallery",
        section_title: "COLEÇÃO LIFESTYLE",
        section_subtitle: "Viva o estilo Ecko",
        section_description: "Descubra o lifestyle autêntico da Ecko através de looks que representam a essência do streetwear e a cultura urbana que define nossa marca",
        empty_state_title: "Galeria em Construção",
        empty_state_description: "Em breve nossa galeria estará repleta de looks incríveis!",
        cta_title: "Tenha Estes Produtos em Sua Loja!",
        cta_description: "Produtos com alta demanda e excelente margem de lucro",
        cta_button_text: "QUERO ESSES PRODUTOS NA MINHA LOJA"
      };
      console.log("ℹ️ Usando dados padrão da gallery");
    }

    // 3. Migrar apenas as imagens existentes do JSON para a tabela gallery_images (se ainda não estiverem lá)
    if (galleryData.items && Array.isArray(galleryData.items) && galleryData.items.length > 0) {
      console.log(`🔄 Migrando ${galleryData.items.length} imagens da galeria para a tabela gallery_images...`);

      for (const item of galleryData.items) {
        // Verificar se a imagem já existe na tabela
        const [existingImage] = await db.execute(
          "SELECT id FROM gallery_images WHERE image_url = ?",
          [item.image_url]
        );

        if ((existingImage as any).length === 0) {
          // Inserir imagem na tabela
          await db.execute(`
            INSERT INTO gallery_images (title, description, image_url, alt_text, is_active, display_order)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            item.title || null,
            item.description || null,
            item.image_url,
            item.alt_text || null,
            item.is_active !== false,
            item.display_order || 0
          ]);
        }
      }
    }

    // 4. Converter dados de texto da gallery para formato de lp_settings
    const gallerySettings = [
      { key: "gallery_section_tag", value: galleryData.section_tag || "", type: "text" },
      { key: "gallery_section_title", value: galleryData.section_title || "", type: "text" },
      { key: "gallery_section_subtitle", value: galleryData.section_subtitle || "", type: "text" },
      { key: "gallery_section_description", value: galleryData.section_description || "", type: "text" },
      { key: "gallery_empty_state_title", value: galleryData.empty_state_title || "", type: "text" },
      { key: "gallery_empty_state_description", value: galleryData.empty_state_description || "", type: "text" },
      { key: "gallery_cta_title", value: galleryData.cta_title || "", type: "text" },
      { key: "gallery_cta_description", value: galleryData.cta_description || "", type: "text" },
      { key: "gallery_cta_button_text", value: galleryData.cta_button_text || "", type: "text" }
    ];

    // 5. Inserir/atualizar dados na tabela lp_settings
    for (const setting of gallerySettings) {
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

    console.log("✅ Dados da gallery migrados para lp_settings com sucesso!");

    // 6. Verificar se a migração foi bem-sucedida
    const [verifyResults] = await db.execute(
      "SELECT COUNT(*) as count FROM lp_settings WHERE setting_key LIKE 'gallery_%'",
    );
    const [verifyImages] = await db.execute(
      "SELECT COUNT(*) as count FROM gallery_images",
    );

    const galleryCount = (verifyResults as any)[0].count;
    const imagesCount = (verifyImages as any)[0].count;
    console.log(
      `✅ ${galleryCount} configurações de texto da gallery encontradas em lp_settings`,
    );
    console.log(
      `✅ ${imagesCount} imagens encontradas na tabela gallery_images`,
    );

    return { success: true, migratedCount: galleryCount, imagesCount: imagesCount };
  } catch (error) {
    console.error("❌ Erro na migração da gallery para lp_settings:", error);
    throw error;
  }
}

// Funções para operações CRUD dos textos da gallery usando lp_settings
export async function getGalleryFromLpSettings() {
  try {
    const db = await initializeDatabase();

    const [results] = await db.execute(`
      SELECT setting_key, setting_value, setting_type
      FROM lp_settings
      WHERE setting_key LIKE 'gallery_%'
    `);

    const galleryData: any = {};

    // Converter resultados para formato objeto
    (results as any).forEach((row: any) => {
      const key = row.setting_key.replace("gallery_", "");
      let value = row.setting_value;

      galleryData[key] = value;
    });

    // Se não há dados, inserir dados padrão
    if (Object.keys(galleryData).length === 0) {
      console.log(
        "ℹ️ Nenhum dado da gallery encontrado, inserindo dados padrão...",
      );
      await migrateGalleryToLpSettings();
      return await getGalleryFromLpSettings();
    }

    return galleryData;
  } catch (error) {
    console.error("❌ Erro ao buscar gallery do lp_settings:", error);
    throw error;
  }
}

export async function saveGalleryToLpSettings(galleryData: any) {
  try {
    const db = await initializeDatabase();

    // Converter dados da gallery para formato de lp_settings (apenas textos)
    const gallerySettings = [
      { key: "gallery_section_tag", value: galleryData.section_tag || "", type: "text" },
      { key: "gallery_section_title", value: galleryData.section_title || "", type: "text" },
      { key: "gallery_section_subtitle", value: galleryData.section_subtitle || "", type: "text" },
      { key: "gallery_section_description", value: galleryData.section_description || "", type: "text" },
      { key: "gallery_empty_state_title", value: galleryData.empty_state_title || "", type: "text" },
      { key: "gallery_empty_state_description", value: galleryData.empty_state_description || "", type: "text" },
      { key: "gallery_cta_title", value: galleryData.cta_title || "", type: "text" },
      { key: "gallery_cta_description", value: galleryData.cta_description || "", type: "text" },
      { key: "gallery_cta_button_text", value: galleryData.cta_button_text || "", type: "text" }
    ];

    // Atualizar/inserir cada configuração
    for (const setting of gallerySettings) {
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

    console.log("✅ Gallery salva em lp_settings com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar gallery em lp_settings:", error);
    throw error;
  }
}
