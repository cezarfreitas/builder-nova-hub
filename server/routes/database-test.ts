import { Request, Response } from "express";
import { getDatabase, testConnection } from "../config/database";

// GET /api/test-db - Testar conexão com banco
export async function testDatabaseConnection(req: Request, res: Response) {
  try {
    console.log("🔍 Testando conexão com MySQL...");

    // Testar conexão básica
    const isConnected = await testConnection();

    if (!isConnected) {
      return res.status(500).json({
        success: false,
        message: "Não foi possível conectar ao banco de dados",
        details: "Timeout ou credenciais inválidas",
      });
    }

    // Testar consulta simples
    const db = getDatabase();
    const [result] = await db.execute("SELECT 1 as test");

    // Verificar se as tabelas existem
    const [tables] = await db.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'lpdb'
    `);

    res.json({
      success: true,
      message: "Conexão com MySQL estabelecida com sucesso!",
      data: {
        connection: "OK",
        test_query: result,
        tables: tables,
        config: {
          host: "5.161.52.206",
          port: 3040,
          database: "lpdb",
          user: "lpdb",
        },
      },
    });
  } catch (error) {
    console.error("❌ Erro no teste de conexão:", error);

    res.status(500).json({
      success: false,
      message: "Erro ao testar conexão com banco",
      error: {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        code: (error as any)?.code,
        errno: (error as any)?.errno,
        sqlState: (error as any)?.sqlState,
      },
    });
  }
}

// GET /api/database-info - Informações do banco
export async function getDatabaseInfo(req: Request, res: Response) {
  try {
    const db = getDatabase();

    // Informações das tabelas
    const [tables] = await db.execute(`
      SELECT 
        TABLE_NAME,
        TABLE_ROWS,
        DATA_LENGTH,
        CREATE_TIME,
        UPDATE_TIME
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'lpdb'
      ORDER BY TABLE_NAME
    `);

    // Informações específicas da tabela lp_settings
    let settingsInfo = null;
    try {
      const [settingsCount] = await db.execute(
        "SELECT COUNT(*) as total FROM lp_settings",
      );
      const [settingsSample] = await db.execute(
        "SELECT * FROM lp_settings LIMIT 5",
      );

      settingsInfo = {
        total_records: (settingsCount as any[])[0]?.total || 0,
        sample_data: settingsSample,
      };
    } catch (err) {
      settingsInfo = {
        error: "Tabela lp_settings não existe ou não pode ser acessada",
      };
    }

    // Informações específicas da tabela leads
    let leadsInfo = null;
    try {
      const [leadsCount] = await db.execute(
        "SELECT COUNT(*) as total FROM leads",
      );
      const [leadsSample] = await db.execute(
        "SELECT id, nome, email, created_at FROM leads ORDER BY created_at DESC LIMIT 5",
      );

      leadsInfo = {
        total_records: (leadsCount as any[])[0]?.total || 0,
        sample_data: leadsSample,
      };
    } catch (err) {
      leadsInfo = { error: "Tabela leads não existe ou não pode ser acessada" };
    }

    // Informações específicas da tabela traffic_sources
    let trafficInfo = null;
    try {
      const [trafficCount] = await db.execute(
        "SELECT COUNT(*) as total FROM traffic_sources",
      );
      const [trafficSample] = await db.execute(
        "SELECT id, session_id, source_name, created_at FROM traffic_sources ORDER BY created_at DESC LIMIT 5",
      );

      trafficInfo = {
        total_records: (trafficCount as any[])[0]?.total || 0,
        sample_data: trafficSample,
      };
    } catch (err) {
      trafficInfo = {
        error: `Tabela traffic_sources não existe ou não pode ser acessada: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
      };
    }

    res.json({
      success: true,
      data: {
        database: "lpdb",
        tables: tables,
        lp_settings: settingsInfo,
        leads: leadsInfo,
        traffic_sources: trafficInfo,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Erro ao obter informações do banco:", error);

    res.status(500).json({
      success: false,
      message: "Erro ao obter informações do banco",
      error: {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        code: (error as any)?.code,
      },
    });
  }
}
