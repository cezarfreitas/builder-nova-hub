import express from "express";
import { migrateHeroToLpSettings, getHeroFromLpSettings, dropHeroTable } from "../database/lp-settings-migration";

const router = express.Router();

// GET /api/test-migration - Test the migration process
router.get("/", async (req, res) => {
  try {
    console.log('🧪 Iniciando teste de migração...');

    // 1. Executar migração
    console.log('1️⃣ Executando migração...');
    const migrationResult = await migrateHeroToLpSettings();
    
    // 2. Verificar dados migrados
    console.log('2️⃣ Verificando dados migrados...');
    const heroData = await getHeroFromLpSettings();
    
    // 3. Excluir tabela hero_settings
    console.log('3️⃣ Excluindo tabela hero_settings...');
    const dropResult = await dropHeroTable();
    
    // 4. Verificar se ainda consegue ler dados após exclusão da tabela
    console.log('4️⃣ Verificando leitura após exclusão da tabela...');
    const heroDataAfter = await getHeroFromLpSettings();

    res.json({
      success: true,
      message: "Migração concluída com sucesso!",
      results: {
        migration: migrationResult,
        dataBeforeCleanup: heroData,
        tableDrop: dropResult,
        dataAfterCleanup: heroDataAfter
      },
      summary: {
        migratedCount: migrationResult.migratedCount,
        heroTableDropped: dropResult.success,
        dataAccessible: !!heroDataAfter.title
      }
    });

  } catch (error) {
    console.error('❌ Erro durante o teste de migração:', error);
    res.status(500).json({
      success: false,
      error: "Erro durante teste de migração",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});

export default router;
