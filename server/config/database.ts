import mysql from "mysql2/promise";

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// Configuração do banco de dados usando variáveis de ambiente
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || "5.161.52.206",
  port: parseInt(process.env.DB_PORT || "3040"),
  user: process.env.DB_USER || "lpdb",
  password: process.env.DB_PASSWORD || "52ba0e00cff2c44683f2",
  database: process.env.DB_NAME || "lpdb",
};

let pool: mysql.Pool | null = null;

export function getDatabase(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function testConnection(): Promise<boolean> {
  try {
    const db = getDatabase();
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    console.log("✅ Conexão com MySQL estabelecida com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar com o banco de dados:", error);
    return false;
  }
}

export async function initializeDatabase(): Promise<mysql.Pool> {
  const db = getDatabase();

  try {
    // Tabela de configurações da LP
    await db.execute(`
      CREATE TABLE IF NOT EXISTS lp_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type ENUM('text', 'json', 'boolean', 'number') DEFAULT 'text',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de leads
    await db.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefone VARCHAR(20),
        cidade VARCHAR(100),
        empresa VARCHAR(255),
        experiencia_revenda ENUM('sim', 'nao', 'interessado') DEFAULT 'interessado',
        tipo_loja ENUM('fisica', 'online', 'ambas') DEFAULT NULL,
        is_duplicate BOOLEAN DEFAULT FALSE,
        source VARCHAR(100),
        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(100),
        ip_address VARCHAR(45),
        user_agent TEXT,
        webhook_sent BOOLEAN DEFAULT FALSE,
        webhook_response TEXT,
        webhook_status ENUM('pending', 'success', 'error') DEFAULT 'pending',
        webhook_attempts INT DEFAULT 0,
        last_webhook_attempt TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_created_at (created_at),
        INDEX idx_webhook_status (webhook_status)
      )
    `);

    // Migração: Adicionar coluna tipo_loja se não existir
    try {
      await db.execute(`
        ALTER TABLE leads
        ADD COLUMN tipo_loja ENUM('fisica', 'online', 'ambas') DEFAULT NULL
      `);
      console.log("✅ Coluna tipo_loja adicionada à tabela leads");
    } catch (error: any) {
      // Se a coluna já existir, apenas log (não é erro)
      if (error.code !== "ER_DUP_FIELDNAME") {
        console.log("⚠️ Coluna tipo_loja já existe ou erro:", error.message);
      }
    }

    // Migração: Adicionar coluna form_origin para tracking da origem
    try {
      await db.execute(`
        ALTER TABLE leads
        ADD COLUMN form_origin VARCHAR(100) DEFAULT NULL
      `);
      console.log("✅ Coluna form_origin adicionada à tabela leads");
    } catch (error: any) {
      if (error.code !== "ER_DUP_FIELDNAME") {
        console.log("⚠️ Coluna form_origin já existe ou erro:", error.message);
      }
    }

    // Migração: Adicionar campos de endereço (exceto cidade que já existe)
    const addressColumns = [
      "ADD COLUMN cep VARCHAR(10) DEFAULT NULL",
      "ADD COLUMN endereco VARCHAR(255) DEFAULT NULL",
      "ADD COLUMN numero VARCHAR(10) DEFAULT NULL",
      "ADD COLUMN complemento VARCHAR(100) DEFAULT NULL",
      "ADD COLUMN bairro VARCHAR(100) DEFAULT NULL",
      "ADD COLUMN estado VARCHAR(2) DEFAULT NULL",
    ];

    for (const column of addressColumns) {
      try {
        await db.execute(`ALTER TABLE leads ${column}`);
      } catch (error: any) {
        if (error.code !== "ER_DUP_FIELDNAME") {
          console.log(`⚠️ Erro ao adicionar coluna: ${error.message}`);
        }
      }
    }
    console.log(
      "✅ Colunas de endereço verificadas/adicionadas à tabela leads",
    );

    // Tabela de eventos do pixel/analytics
    await db.execute(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        event_type VARCHAR(50) NOT NULL,
        event_data JSON,
        session_id VARCHAR(100),
        user_id VARCHAR(100),
        ip_address VARCHAR(45),
        user_agent TEXT,
        referrer TEXT,
        page_url TEXT,
        duration_seconds INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_event_type (event_type),
        INDEX idx_session_id (session_id),
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      )
    `);

    // Tabela de depoimentos
    await db.execute(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        role VARCHAR(255),
        content TEXT NOT NULL,
        avatar_url VARCHAR(500),
        rating INT DEFAULT 5,
        is_active BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_is_active (is_active),
        INDEX idx_display_order (display_order),
        INDEX idx_created_at (created_at)
      )
    `);

    // Tabela de galeria/lifestyle
    await db.execute(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500) NOT NULL,
        alt_text VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_is_active (is_active),
        INDEX idx_display_order (display_order),
        INDEX idx_created_at (created_at)
      )
    `);

    // Migração: Adicionar coluna duration_seconds se não existir
    try {
      await db.execute(`
        ALTER TABLE analytics_events
        ADD COLUMN duration_seconds INT DEFAULT 0
      `);
      console.log(
        "✅ Coluna duration_seconds adicionada à tabela analytics_events",
      );
    } catch (error: any) {
      if (error.code !== "ER_DUP_FIELDNAME") {
        console.log(
          "⚠️ Coluna duration_seconds já existe ou erro:",
          error.message,
        );
      }
    }

    // Tabela de origens de tráfego
    await db.execute(`
      CREATE TABLE IF NOT EXISTS traffic_sources (
        id INT PRIMARY KEY AUTO_INCREMENT,
        session_id VARCHAR(100) NOT NULL,
        user_id VARCHAR(100),
        referrer TEXT,
        source_name VARCHAR(100),
        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(100),
        utm_term VARCHAR(100),
        utm_content VARCHAR(100),
        current_url TEXT,
        page_title VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_session_id (session_id),
        INDEX idx_source_name (source_name),
        INDEX idx_utm_source (utm_source),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log("✅ Tabela traffic_sources criada/verificada com sucesso!");

    // Inserir configurações padrão se não existirem
    await insertDefaultSettings(db);

    console.log("✅ Banco de dados inicializado com sucesso!");
    return db;
  } catch (error) {
    console.error("❌ Erro ao inicializar banco de dados:", error);
    throw error;
  }
}

async function insertDefaultSettings(db: mysql.Pool): Promise<void> {
  const defaultSettings = [
    // SEO Settings
    {
      key: "seo_title",
      value:
        "Seja uma Revenda Autorizada da Ecko | Tenha os Melhores Produtos em sua Loja",
      type: "text",
    },
    {
      key: "seo_description",
      value:
        "Seja uma revenda autorizada da Ecko e tenha os melhores produtos de streetwear em sua loja. Transforme sua paixão em lucro com exclusividade territorial e suporte completo.",
      type: "text",
    },
    {
      key: "seo_keywords",
      value:
        "revenda autorizada ecko, melhores produtos streetwear, lojista autorizado",
      type: "text",
    },
    {
      key: "seo_canonical_url",
      value: "https://revendedores.ecko.com.br/",
      type: "text",
    },
    {
      key: "seo_og_image",
      value: "https://estyle.vteximg.com.br/arquivos/ecko_mosaic5.png",
      type: "text",
    },

    // Webhook Settings
    { key: "webhook_url", value: "", type: "text" },
    { key: "webhook_secret", value: "", type: "text" },
    { key: "webhook_timeout", value: "30", type: "number" },
    { key: "webhook_retries", value: "3", type: "number" },

    // Design Settings
    { key: "theme_primary_color", value: "#dc2626", type: "text" },
    { key: "theme_secondary_color", value: "#111827", type: "text" },
    { key: "theme_background_color", value: "#000000", type: "text" },
    { key: "theme_text_color", value: "#ffffff", type: "text" },
    { key: "theme_font_heading", value: "inter", type: "text" },
    { key: "theme_font_body", value: "inter", type: "text" },

    // Content Settings
    {
      key: "hero_title",
      value: "TRANSFORME SUA PAIXÃO EM LUCRO",
      type: "text",
    },
    {
      key: "hero_subtitle",
      value:
        "Seja uma revenda autorizada da Ecko e tenha os melhores produtos de streetwear em sua loja!",
      type: "text",
    },

    // Analytics/Pixel Settings
    { key: "facebook_pixel_id", value: "1234567890", type: "text" },
    { key: "google_analytics_id", value: "G-XXXXXXXXXX", type: "text" },
    { key: "google_tag_manager_id", value: "GTM-XXXXXXX", type: "text" },
  ];

  for (const setting of defaultSettings) {
    await db.execute(
      `INSERT IGNORE INTO lp_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)`,
      [setting.key, setting.value, setting.type],
    );
  }
}
