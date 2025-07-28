# 🚀 Deploy em Produção - Sistema Admin Ecko

## 📋 Pré-requisitos

- Node.js 18+
- MySQL 8.0+
- Ambiente com SSL/HTTPS
- Proxy reverso (Nginx recomendado)

## 🔐 Credenciais de Acesso

### Admin Principal

- **Usuário:** `admin`
- **Senha:** `Designer@13`

> ⚠️ **IMPORTANTE**: As credenciais de demonstração são ocultas automaticamente em produção.

## 🛠️ Configuração do Ambiente

### 1. Variáveis de Ambiente

Crie um arquivo `.env` com as seguintes variáveis:

```bash
# Ambiente
NODE_ENV=production

# Banco de Dados (configurar com seus dados reais)
DB_HOST=seu-host-mysql
DB_PORT=3306
DB_USER=seu-usuario
DB_PASSWORD=sua-senha-segura
DB_NAME=nome-do-banco
DB_SSL=true

# Segurança
SESSION_SECRET=sua-chave-secreta-muito-segura-aqui
ADMIN_SESSION_DURATION=86400000

# URLs
BASE_URL=https://seu-dominio.com
API_BASE_URL=https://seu-dominio.com/api

# Uploads
UPLOAD_MAX_SIZE=10485760
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
ADMIN_RATE_LIMIT_MAX=20
```

### 2. Configuração do Banco de Dados

Certifique-se de que o banco MySQL está configurado com:

- Conexões SSL habilitadas
- Usuário com permissões apropriadas
- Backup automático configurado
- Monitoramento ativo

## 🚀 Deploy

### 1. Build para Produção

```bash
# Instalar dependências
npm install --production

# Build otimizado para produção
npm run build:prod

# Verificar tipos (opcional)
npm run typecheck
```

### 2. Iniciar Aplicação

```bash
# Modo produção
npm run start:prod

# Ou usar PM2 (recomendado)
pm2 start "npm run start:prod" --name "ecko-admin"
pm2 save
pm2 startup
```

### 3. Configuração do Nginx (recomendado)

```nginx
server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    # SSL Configuration
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=admin:10m rate=10r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;

    # Admin routes (rate limited)
    location /admin {
        limit_req zone=admin burst=5 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API routes (rate limited)
    location /api {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files with caching
    location /assets {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

## 📊 Monitoramento

### 1. Health Check

A aplicação expõe endpoints para monitoramento:

- `GET /health` - Status da aplicação
- `GET /api/database-test` - Status do banco de dados

### 2. Logs

Em produção, os logs são otimizados:

- Apenas warnings e erros são registrados
- Dados sensíveis são automaticamente removidos
- Console logs de desenvolvimento são desabilitados

### 3. Métricas

O sistema automaticamente:

- Reduz frequência de auto-refresh (5min vs 2min dev)
- Aplica timeouts mais agressivos (5s vs 10s dev)
- Limit retries (2 vs 3 dev)

## 🔧 Manutenção

### Backup do Banco

```bash
# Backup diário automático (adicionar ao cron)
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > backup_$(date +%Y%m%d).sql
```

### Logs da Aplicação

```bash
# Ver logs do PM2
pm2 logs ecko-admin

# Ver logs com filtro
pm2 logs ecko-admin --lines 100
```

### Atualizações

```bash
# 1. Backup do banco
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > backup_pre_update.sql

# 2. Pull das atualizações
git pull origin main

# 3. Instalar dependências
npm install --production

# 4. Rebuild
npm run build:prod

# 5. Restart da aplicação
pm2 restart ecko-admin
```

## 🛡️ Segurança

### Checklist de Segurança

- [ ] SSL/HTTPS configurado
- [ ] Headers de segurança ativos
- [ ] Rate limiting configurado
- [ ] Banco com SSL
- [ ] Credenciais de demo ocultas
- [ ] Logs sensíveis removidos
- [ ] Backup automático ativo
- [ ] Monitoramento configurado
- [ ] Firewall configurado
- [ ] Updates automáticos de segurança

### Hardening Adicional

1. **Firewall**: Apenas portas necessárias abertas (80, 443, 3306 para DB)
2. **Updates**: Sistema operacional sempre atualizado
3. **Monitoring**: Alertas para tentativas de login suspeitas
4. **Backup**: Backup offsite e testado regularmente

## 📈 Performance

Em produção, o sistema é otimizado para:

- ⚡ **Timeouts reduzidos**: 5s vs 10s dev
- 🔄 **Menos retries**: 2 vs 3 dev
- ⏱️ **Auto-refresh menos frequente**: 5min vs 2min dev
- 🗜️ **Compressão ativa**: Gzip para todos assets
- 💾 **Cache otimizado**: 1h para assets, 5min para APIs
- 📊 **Logs reduzidos**: Apenas warnings/erros

## 🆘 Troubleshooting

### Problemas Comuns

1. **500 Internal Server Error**
   - Verificar logs: `pm2 logs ecko-admin`
   - Verificar conexão com banco
   - Verificar variáveis de ambiente

2. **Timeout de Database**
   - Verificar status do MySQL
   - Verificar configurações de SSL
   - Verificar firewall

3. **High CPU/Memory**
   - Verificar logs para loops infinitos
   - Verificar queries lentas no banco
   - Considerar escalar recursos

### Contatos de Suporte

- **Técnico**: Para problemas de infraestrutura
- **Banco de Dados**: Para problemas de performance/conectividade
- **DevOps**: Para deployment e monitoramento
