const { migrateHeroToLpSettings, getHeroFromLpSettings, dropHeroTable } = require('./server/database/lp-settings-migration.ts');

async function testMigration() {
  console.log('🧪 Testando migração do hero para lp_settings...\n');

  try {
    // 1. Executar migração
    console.log('1️⃣ Executando migração...');
    const migrationResult = await migrateHeroToLpSettings();
    console.log('✅ Migração completa:', migrationResult);
    console.log('');

    // 2. Verificar dados migrados
    console.log('2️⃣ Verificando dados migrados...');
    const heroData = await getHeroFromLpSettings();
    console.log('✅ Dados do hero encontrados em lp_settings:');
    console.log(JSON.stringify(heroData, null, 2));
    console.log('');

    // 3. Excluir tabela hero_settings
    console.log('3️⃣ Excluindo tabela hero_settings...');
    const dropResult = await dropHeroTable();
    console.log('✅ Tabela excluída:', dropResult);
    console.log('');

    // 4. Verificar se ainda consegue ler dados após exclusão da tabela
    console.log('4️⃣ Verificando leitura após exclusão da tabela...');
    const heroDataAfter = await getHeroFromLpSettings();
    console.log('✅ Dados ainda disponíveis em lp_settings:');
    console.log(`- Title: ${heroDataAfter.title}`);
    console.log(`- Background Image: ${heroDataAfter.background_image}`);
    console.log(`- Logo URL: ${heroDataAfter.logo_url}`);
    console.log('');

    console.log('🎉 Migração concluída com sucesso!');
    console.log('📊 Resumo:');
    console.log(`   - Dados migrados: ${migrationResult.migratedCount} configurações`);
    console.log('   - Tabela hero_settings: excluída');
    console.log('   - Dados acessíveis via lp_settings: ✅');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  }
}

// Executar teste
testMigration().catch(console.error);
