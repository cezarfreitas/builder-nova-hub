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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Database tables initialized");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    return false;
  }
}

export default pool;
