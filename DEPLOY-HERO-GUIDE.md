# 🚀 Guia de Deploy - Preservação de Dados do Hero

## ✅ Status Atual Verificado

O sistema está funcionando corretamente:

- **Hero config**: ✅ server/data/hero.json
- **Imagem de fundo**: ✅ /uploads/hero/hero-1753674392487-413356357.jpg
- **Logo**: ✅ /uploads/hero/hero-1753674394918-81681447.png
- **Total de imagens**: 5 arquivos no diretório hero

## 📋 Checklist de Deploy

### 🔍 PRÉ-DEPLOY

- [ ] Execute `npm run backup-data` para criar backup
- [ ] Verifique se `server/data/hero.json` existe e contém as imagens
- [ ] Verifique se `public/uploads/hero/` contém as imagens
- [ ] Execute `npm run build:prod` para gerar build

### 📦 DURANTE O DEPLOY

- [ ] **CRÍTICO**: Copie `public/uploads/` completo para o servidor
- [ ] **CRÍTICO**: Copie `server/data/` completo para o servidor
- [ ] Copie o build `dist/spa/` para o servidor
- [ ] Configure variáveis de ambiente
- [ ] Configure permissões de escrita em:
  - `server/data/` (para salvar configurações)
  - `public/uploads/` (para upload de imagens)

### 🔧 PÓS-DEPLOY

- [ ] Teste a URL principal
- [ ] Verifique se imagens do hero carregam
- [ ] Teste admin em `/admin`
- [ ] Acesse `/api/data-status` para verificar integridade

## 🛠️ Estrutura de Arquivos Críticos

```
projeto/
├── server/data/hero.json          # ← DEVE ser preservado
├── public/uploads/hero/           # ← DEVE ser preservado
│   ├── hero-1753674392487-413356357.jpg
│   ├── hero-1753674394918-81681447.png
│   └── ...
├── dist/spa/                      # Build do frontend
└── server/                        # Backend (APIs)
```

## 🔗 APIs de Verificação

### Verificar configurações do hero:

```bash
curl https://seusite.com/api/hero
```

### Verificar status geral dos dados:

```bash
curl https://seusite.com/api/data-status
```

### Verificar se imagem está acessível:

```bash
curl -I https://seusite.com/uploads/hero/hero-1753674392487-413356357.jpg
```

## ⚠️ Problemas Comuns e Soluções

### 1. Imagens não aparecem após deploy

**Causa**: Diretório `public/uploads/` não foi copiado
**Solução**: Copiar todo o diretório uploads para o servidor

### 2. Textos voltaram ao padrão

**Causa**: Arquivo `server/data/hero.json` não foi copiado
**Solução**: Copiar arquivo de configuração para o servidor

### 3. Erro 500 ao carregar hero

**Causa**: Servidor não tem permissão de leitura em `server/data/`
**Solução**: Ajustar permissões do diretório

### 4. Upload de novas imagens não funciona

**Causa**: Servidor não tem permissão de escrita em `public/uploads/`
**Solução**: Ajustar permissões do diretório

## 🔧 Comandos de Debug

### Verificar permissões:

```bash
ls -la server/data/
ls -la public/uploads/hero/
```

### Verificar se servidor consegue ler configurações:

```bash
cat server/data/hero.json
```

### Verificar logs do servidor:

```bash
# Procurar por mensagens de integridade dos dados
tail -f logs/server.log | grep "integridade"
```

## 📁 Backup Automático

O sistema inclui backup automático:

- Execute `npm run backup-data` antes do deploy
- Backups são salvos em `production-backups/`
- Inclui todas as configurações JSON
- Inclui inventário de uploads

## 🎯 Resumo

**Para garantir que hero section funcione após deploy:**

1. **SEMPRE** copie `server/data/hero.json`
2. **SEMPRE** copie `public/uploads/hero/`
3. **SEMPRE** configure permissões corretas
4. **SEMPRE** teste `/api/data-status` após deploy

O sistema tem verificação automática na inicialização que vai:

- ✅ Verificar se arquivos existem
- ✅ Criar estrutura se necessário
- ✅ Limpar referências quebradas
- ✅ Gerar relatório de status

## 🚨 ATENÇÃO

Se as imagens sumirem após deploy, o problema está em:

1. Diretório `uploads/` não foi copiado
2. Permissões incorretas no servidor
3. Servidor web não está servindo arquivos estáticos

**A verificação no console do servidor mostra o status real dos arquivos.**
