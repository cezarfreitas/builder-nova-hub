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

    // Create faqs table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS faqs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active_order (is_active, display_order)
      )
    `);

    // Insert default FAQs if none exist
    const [faqRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM faqs",
    );
    const faqCount = (faqRows as any)[0].count;

    if (faqCount === 0) {
      await connection.execute(`
        INSERT INTO faqs (question, answer, display_order) VALUES
        ('Como funciona o programa de revendedores Ecko?', 'O programa permite que você se torne um revendedor oficial da marca Ecko, com acesso a produtos exclusivos, margens atrativas e suporte completo da nossa equipe.', 1),
        ('Preciso ter CNPJ para ser revendedor?', 'Sim, é obrigatório ter CNPJ ativo para participar do programa de revendedores oficiais da Ecko.', 2),
        ('Qual o investimento mínimo para começar?', 'O investimento mínimo varia conforme o tipo de loja e região. Nossa equipe comercial irá apresentar as condições específicas após a análise do seu perfil.', 3),
        ('Como funciona a entrega dos produtos?', 'Trabalhamos com logística própria e parcerias estratégicas para garantir entregas rápidas e seguras em todo o Brasil.', 4),
        ('Há suporte para marketing e vendas?', 'Sim, oferecemos materiais de marketing, treinamentos e suporte completo para ajudar você a maximizar suas vendas.', 5)
      `);
      console.log("✅ Default FAQs created");
    }

    // Create gallery table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500) NOT NULL,
        alt_text VARCHAR(255),
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active_order (is_active, display_order)
      )
    `);

    // Insert sample gallery images if none exist
    const [galleryRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM gallery",
    );
    const galleryCount = (galleryRows as any)[0].count;

    if (galleryCount === 0) {
      await connection.execute(`
        INSERT INTO gallery (title, description, image_url, alt_text, display_order, is_active) VALUES
        ('Camiseta Ecko Classic Logo', 'Camiseta com logo clássico da Ecko, 100% algodão, várias cores disponíveis', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center', 'Camiseta Ecko com logo clássico', 1, TRUE),
        ('Moletom Ecko Streetwear', 'Moletom com capuz da linha streetwear, design moderno e confortável', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&crop=center', 'Moletom Ecko streetwear com capuz', 2, TRUE),
        ('Bermuda Ecko Sport', 'Bermuda esportiva ideal para atividades físicas e uso casual', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center', 'Bermuda esportiva Ecko', 3, TRUE),
        ('Tênis Ecko Limited Edition', 'Edição limitada de tênis com design exclusivo da marca', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center', 'Tênis Ecko edição limitada', 4, TRUE),
        ('Boné Ecko Original', 'Boné aba reta com bordado original da marca Ecko', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop&crop=center', 'Boné Ecko aba reta original', 5, TRUE),
        ('Jaqueta Ecko Bomber', 'Jaqueta bomber style com detalhes únicos da marca', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center', 'Jaqueta bomber Ecko', 6, TRUE),
        ('Regata Ecko Fitness', 'Regata técnica para academia e atividades esportivas', 'https://images.unsplash.com/photo-1583743814966-8936f37f1052?w=400&h=400&fit=crop&crop=center', 'Regata técnica Ecko fitness', 7, TRUE),
        ('Calça Ecko Jogger', 'Calça jogger com ajuste moderno e confortável', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop&crop=center', 'Calça jogger Ecko', 8, TRUE),
        ('Mochila Ecko Urban', 'Mochila urbana com compartimentos funcionais', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center', 'Mochila urbana Ecko', 9, TRUE)
      `);
      console.log("✅ Sample gallery images created");
    }

    // Insert sample leads if none exist
    const [leadRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM leads",
    );
    const leadCount = (leadRows as any)[0].count;

    if (leadCount === 0) {
      await connection.execute(`
        INSERT INTO leads (name, whatsapp, hasCnpj, storeType, status, is_duplicate, webhook_sent) VALUES
        ('João Silva', '11999888777', 'sim', 'Loja Física', 'new', FALSE, FALSE),
        ('Maria Santos', '11988777666', 'sim', 'E-commerce', 'contacted', FALSE, TRUE),
        ('Pedro Costa', '11977666555', 'sim', 'Loja Física', 'qualified', FALSE, TRUE),
        ('Ana Oliveira', '11966555444', 'sim', 'Multi-canal', 'converted', FALSE, TRUE),
        ('Carlos Souza', '11955444333', 'sim', 'E-commerce', 'new', FALSE, FALSE)
      `);
      console.log("✅ Sample leads created");
    }

    // Create seo_settings table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS seo_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_title VARCHAR(255) NOT NULL,
        meta_description TEXT,
        meta_keywords TEXT,
        og_title VARCHAR(255),
        og_description TEXT,
        og_image VARCHAR(500),
        canonical_url VARCHAR(500),
        robots VARCHAR(100) DEFAULT 'index, follow',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default SEO settings if none exist
    const [seoRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM seo_settings WHERE is_active = TRUE",
    );
    const seoCount = (seoRows as any)[0].count;

    if (seoCount === 0) {
      await connection.execute(`
        INSERT INTO seo_settings (page_title, meta_description, meta_keywords, og_title, og_description) VALUES (
          'Ecko - Programa de Revendedores | Seja um Parceiro Oficial',
          'Torne-se um revendedor oficial da Ecko, a marca de streetwear mais desejada do Brasil. Produtos exclusivos, margens atrativas e suporte completo.',
          'ecko, revendedor, streetwear, moda urbana, programa revendedores, atacado',
          'Ecko - Programa de Revendedores Oficial',
          'Seja um revendedor oficial da marca Ecko e multiplique suas vendas com produtos de streetwear exclusivos.'
        )
      `);
      console.log("✅ Default SEO settings created");
    }

    // Create theme_settings table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS theme_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        primary_color VARCHAR(7) DEFAULT '#DC2626',
        primary_light VARCHAR(7) DEFAULT '#F87171',
        primary_dark VARCHAR(7) DEFAULT '#991B1B',
        secondary_color VARCHAR(7) DEFAULT '#1F2937',
        background_color VARCHAR(7) DEFAULT '#000000',
        text_color VARCHAR(7) DEFAULT '#FFFFFF',
        accent_color VARCHAR(7) DEFAULT '#EF4444',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default theme settings if none exist
    const [themeRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM theme_settings WHERE is_active = TRUE",
    );
    const themeCount = (themeRows as any)[0].count;

    if (themeCount === 0) {
      await connection.execute(`
        INSERT INTO theme_settings (primary_color, primary_light, primary_dark, secondary_color, background_color, text_color, accent_color) VALUES (
          '#DC2626', '#F87171', '#991B1B', '#1F2937', '#000000', '#FFFFFF', '#EF4444'
        )
      `);
      console.log("✅ Default theme settings created");
    }

    // Create webhook_logs table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        webhook_url VARCHAR(500),
        request_payload TEXT,
        response_status INT,
        response_body TEXT,
        response_headers TEXT,
        attempt_number INT DEFAULT 1,
        success BOOLEAN DEFAULT FALSE,
        error_message TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        INDEX idx_lead_id (lead_id),
        INDEX idx_success (success),
        INDEX idx_sent_at (sent_at)
      )
    `);

    // Create uploaded_files table for image uploads
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        alt_text VARCHAR(255),
        used_for VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_used_for (used_for),
        INDEX idx_created_at (created_at),
        INDEX idx_filename (filename)
      )
    `);

    // Create sessions table for tracking user sessions
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_agent TEXT,
        ip_address VARCHAR(45),
        referrer VARCHAR(500),
        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(100),
        utm_term VARCHAR(100),
        utm_content VARCHAR(100),
        country VARCHAR(50),
        region VARCHAR(100),
        city VARCHAR(100),
        device_type ENUM('desktop', 'mobile', 'tablet') DEFAULT 'desktop',
        browser VARCHAR(100),
        os VARCHAR(100),
        screen_resolution VARCHAR(20),
        language VARCHAR(10),
        timezone VARCHAR(50),
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP NULL,
        duration_seconds INT DEFAULT 0,
        page_views INT DEFAULT 0,
        bounce BOOLEAN DEFAULT TRUE,
        conversion BOOLEAN DEFAULT FALSE,
        INDEX idx_started_at (started_at),
        INDEX idx_conversion (conversion),
        INDEX idx_utm_source (utm_source),
        INDEX idx_device_type (device_type)
      )
    `);

    // Create events table for tracking user actions
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(36) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        event_category VARCHAR(100),
        event_action VARCHAR(100),
        event_label VARCHAR(100),
        event_value TEXT,
        page_url VARCHAR(500),
        page_title VARCHAR(255),
        element_id VARCHAR(100),
        element_class VARCHAR(100),
        element_text VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        INDEX idx_session_id (session_id),
        INDEX idx_event_type (event_type),
        INDEX idx_timestamp (timestamp),
        INDEX idx_event_category (event_category)
      )
    `);

    // Create conversions table for tracking conversion events
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS conversions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(36) NOT NULL,
        lead_id INT,
        conversion_type ENUM('lead_form', 'phone_click', 'email_click', 'social_click', 'no_store_indication') NOT NULL,
        conversion_value TEXT,
        form_data TEXT,
        page_url VARCHAR(500),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
        INDEX idx_session_id (session_id),
        INDEX idx_conversion_type (conversion_type),
        INDEX idx_timestamp (timestamp),
        INDEX idx_lead_id (lead_id)
      )
    `);

    console.log("✅ Database tables initialized and updated");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    return false;
  }
}

export default pool;
