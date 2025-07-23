import mysql from 'mysql2/promise';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// Configuração do banco de dados a partir da URL fornecida
// mysql://lpdb:52ba0e00cff2c44683f2@main.idenegociosdigitais.com.br:3040/lpdb
const dbConfig: DatabaseConfig = {
  host: 'main.idenegociosdigitais.com.br',
  port: 3040,
  user: 'lpdb',
  password: '52ba0e00cff2c44683f2',
  database: 'lpdb'
};

let pool: mysql.Pool | null = null;

export function getDatabase(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0
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
    console.log('✅ Conexão com MySQL estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    return false;
  }
}

export async function initializeDatabase(): Promise<void> {
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_event_type (event_type),
        INDEX idx_session_id (session_id),
        INDEX idx_created_at (created_at)
      )
    `);

    // Inserir configurações padrão se não existirem
    await insertDefaultSettings(db);
    
    console.log('✅ Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

async function insertDefaultSettings(db: mysql.Pool): Promise<void> {
  const defaultSettings = [
    // SEO Settings
    { key: 'seo_title', value: 'Seja uma Revenda Autorizada da Ecko | Tenha os Melhores Produtos em sua Loja', type: 'text' },
    { key: 'seo_description', value: 'Seja uma revenda autorizada da Ecko e tenha os melhores produtos de streetwear em sua loja. Transforme sua paixão em lucro com exclusividade territorial e suporte completo.', type: 'text' },
    { key: 'seo_keywords', value: 'revenda autorizada ecko, melhores produtos streetwear, lojista autorizado', type: 'text' },
    { key: 'seo_canonical_url', value: 'https://revendedores.ecko.com.br/', type: 'text' },
    { key: 'seo_og_image', value: 'https://estyle.vteximg.com.br/arquivos/ecko_mosaic5.png', type: 'text' },
    
    // Webhook Settings
    { key: 'webhook_url', value: '', type: 'text' },
    { key: 'webhook_secret', value: '', type: 'text' },
    { key: 'webhook_timeout', value: '30', type: 'number' },
    { key: 'webhook_retries', value: '3', type: 'number' },
    
    // Design Settings
    { key: 'theme_primary_color', value: '#dc2626', type: 'text' },
    { key: 'theme_secondary_color', value: '#111827', type: 'text' },
    { key: 'theme_background_color', value: '#000000', type: 'text' },
    { key: 'theme_text_color', value: '#ffffff', type: 'text' },
    { key: 'theme_font_heading', value: 'inter', type: 'text' },
    { key: 'theme_font_body', value: 'inter', type: 'text' },
    
    // Content Settings
    { key: 'hero_title', value: 'TRANSFORME SUA PAIXÃO EM LUCRO', type: 'text' },
    { key: 'hero_subtitle', value: 'Seja uma revenda autorizada da Ecko e tenha os melhores produtos de streetwear em sua loja!', type: 'text' },
    
    // Analytics/Pixel Settings
    { key: 'facebook_pixel_id', value: '1234567890', type: 'text' },
    { key: 'google_analytics_id', value: 'G-XXXXXXXXXX', type: 'text' },
    { key: 'google_tag_manager_id', value: 'GTM-XXXXXXX', type: 'text' }
  ];

  for (const setting of defaultSettings) {
    await db.execute(
      `INSERT IGNORE INTO lp_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)`,
      [setting.key, setting.value, setting.type]
    );
  }
}
