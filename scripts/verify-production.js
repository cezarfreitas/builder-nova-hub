const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🔍 Verificação de Produção - Hero Section');
console.log('=========================================');

// 1. Verificar arquivos locais
console.log('\n📁 Verificando arquivos locais...');

const localChecks = [
  { path: 'server/data/hero.json', name: 'Configurações Hero' },
  { path: 'public/uploads/hero', name: 'Diretório de imagens' },
  { path: 'dist/spa/index.html', name: 'Build SPA' }
];

localChecks.forEach(check => {
  if (fs.existsSync(check.path)) {
    console.log(`✅ ${check.name}: ${check.path}`);
    
    if (check.path === 'server/data/hero.json') {
      try {
        const heroData = JSON.parse(fs.readFileSync(check.path, 'utf8'));
        console.log(`   📸 Background: ${heroData.background_image || 'Não definido'}`);
        console.log(`   🎨 Logo: ${heroData.logo_url || 'Não definido'}`);
        
        // Verificar se as imagens existem
        if (heroData.background_image) {
          const bgPath = path.join('public', heroData.background_image);
          if (fs.existsSync(bgPath)) {
            console.log(`   ✅ Imagem de fundo existe: ${bgPath}`);
          } else {
            console.log(`   ❌ Imagem de fundo não encontrada: ${bgPath}`);
          }
        }
        
        if (heroData.logo_url) {
          const logoPath = path.join('public', heroData.logo_url);
          if (fs.existsSync(logoPath)) {
            console.log(`   ✅ Logo existe: ${logoPath}`);
          } else {
            console.log(`   ❌ Logo não encontrado: ${logoPath}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Erro ao ler JSON: ${error.message}`);
      }
    }
    
    if (check.path === 'public/uploads/hero') {
      const images = fs.readdirSync(check.path);
      console.log(`   📸 ${images.length} imagens no diretório hero`);
      images.forEach(img => {
        const size = fs.statSync(path.join(check.path, img)).size;
        console.log(`      - ${img} (${(size/1024).toFixed(1)}KB)`);
      });
    }
  } else {
    console.log(`❌ ${check.name}: ${check.path} não encontrado`);
  }
});

// 2. Instruções de deploy
console.log('\n📋 Lista de Verificação para Deploy:');
console.log('====================================');

console.log('\n🚀 Antes do Deploy:');
console.log('1. ✅ Execute: npm run backup-data');
console.log('2. ✅ Execute: npm run deploy-check');
console.log('3. ✅ Verifique se todas as verificações passaram');

console.log('\n📦 Durante o Deploy:');
console.log('1. 📁 Copie todo o diretório public/uploads/ para o servidor');
console.log('2. 📄 Copie todo o diretório server/data/ para o servidor');
console.log('3. 🔧 Configure as variáveis de ambiente');
console.log('4. 🏗️  Execute o build: npm run build:prod');

console.log('\n✅ Após o Deploy:');
console.log('1. 🌐 Teste a URL do site para ver se carrega');
console.log('2. 🖼️  Verifique se as imagens do hero aparecem');
console.log('3. 📱 Teste o admin em /admin');
console.log('4. 🔧 Verifique os logs do servidor');

console.log('\n🛠️  Comandos úteis para debug:');
console.log('- curl https://seusite.com/api/data-status');
console.log('- curl https://seusite.com/api/hero');
console.log('- curl -I https://seusite.com/uploads/hero/[nome-da-imagem]');

console.log('\n⚠️  IMPORTANTE:');
console.log('==============');
console.log('🔸 O diretório public/uploads/ deve ter permissão de escrita');
console.log('🔸 O diretório server/data/ deve ter permissão de escrita');
console.log('🔸 As imagens devem ser acessíveis via HTTP');
console.log('🔸 O servidor deve conseguir ler os arquivos JSON');

// 3. Criar arquivo de status para deploy
const deployStatus = {
  timestamp: new Date().toISOString(),
  localVerification: true,
  heroConfigExists: fs.existsSync('server/data/hero.json'),
  uploadsExists: fs.existsSync('public/uploads/hero'),
  buildExists: fs.existsSync('dist/spa/index.html'),
  readyForDeploy: false
};

if (deployStatus.heroConfigExists && deployStatus.uploadsExists && deployStatus.buildExists) {
  deployStatus.readyForDeploy = true;
  console.log('\n🎉 Status: PRONTO PARA DEPLOY');
} else {
  console.log('\n⚠️  Status: NÃO PRONTO - Verifique os itens marcados com ❌');
}

// Salvar status
fs.writeFileSync('deploy-status.json', JSON.stringify(deployStatus, null, 2));
console.log('\n💾 Status salvo em: deploy-status.json');
