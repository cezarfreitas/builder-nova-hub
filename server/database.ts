import mysql from "mysql2/promise";

// Parsing the connection string (using original port 5432)
const connectionString =
  "mysql://mysql:DL4J4CCeRVVbaiux6Hy4d4IF5lZeZ47s8ZtrrGCZj2EBrngccMiFbxWGS516wfsQ@5.161.52.206:5432/default";

// Parse the connection URL
const url = new URL(connectionString);

const config = {
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1), // Remove the leading '/'
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false,
  },
};

// Create connection pool
const pool = mysql.createPool(config);

// Test connection function
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL connected successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ MySQL connection failed:", error);
    return false;
  }
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();

    // Create leads table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        whatsapp VARCHAR(50) NOT NULL,
        hasCnpj ENUM('sim', 'nao', 'processo') NOT NULL,
        storeType VARCHAR(100) NOT NULL,
        status ENUM('new', 'contacted', 'qualified', 'converted') DEFAULT 'new',
        is_duplicate BOOLEAN DEFAULT FALSE,
        webhook_sent BOOLEAN DEFAULT FALSE,
        webhook_response TEXT,
                webhook_sent_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_whatsapp (whatsapp),
        INDEX idx_webhook_sent (webhook_sent)
      )
    `);

    // Add missing columns if they don't exist
    try {
      await connection.execute(`
        ALTER TABLE leads
        ADD COLUMN is_duplicate BOOLEAN DEFAULT FALSE,
        ADD COLUMN webhook_sent BOOLEAN DEFAULT FALSE,
        ADD COLUMN webhook_response TEXT,
        ADD COLUMN webhook_sent_at TIMESTAMP NULL
      `);
    } catch (error: any) {
      if (error.errno !== 1060) {
        // Ignore "column already exists" error
        console.log("Columns already exist or other error:", error.message);
      }
    }

    // Create testimonials table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        role VARCHAR(255),
        content TEXT NOT NULL,
        avatar_url VARCHAR(500),
        rating INT DEFAULT 5,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create hero_settings table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS hero_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        logo_url VARCHAR(500),
        main_title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        background_image_url VARCHAR(500),
        cta_text VARCHAR(255) DEFAULT 'Descubra Como Funciona',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default hero settings if none exist
    const [heroRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM hero_settings WHERE is_active = TRUE",
    );
    const heroCount = (heroRows as any)[0].count;

    if (heroCount === 0) {
      await connection.execute(`
        INSERT INTO hero_settings (main_title, subtitle, description, cta_text) VALUES (
          'TRANSFORME SUA\nPAIXÃO\nEM LUCRO',
          'Programa de Revendedores',
          'Seja um revendedor oficial da marca de streetwear mais desejada do Brasil e multiplique suas vendas!',
          'Descubra Como Funciona'
        )
      `);
      console.log("✅ Default hero settings created");
    }

    console.log("✅ Database tables initialized and updated");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    return false;
  }
}

export default pool;
