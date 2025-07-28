// Configurações específicas para produção

module.exports = {
  // Configurações de segurança
  security: {
    // Headers de segurança
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
    },
    
    // Rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // 100 requests por IP por window
      message: 'Muitas requisições, tente novamente em 15 minutos'
    },
    
    // Admin rate limiting (mais restritivo)
    adminRateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 20, // 20 tentativas de login por IP por window
      message: 'Muitas tentativas de login, tente novamente em 15 minutos'
    }
  },
  
  // Configurações do banco de dados
  database: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false
  },
  
  // Configurações de cache
  cache: {
    maxAge: 3600, // 1 hora para assets estáticos
    publicMaxAge: 86400, // 1 dia para conteúdo público
    apiCacheAge: 300 // 5 minutos para APIs
  },
  
  // Configurações de compressão
  compression: {
    enabled: true,
    level: 6,
    threshold: 1024
  },
  
  // Configurações de logging
  logging: {
    level: 'warn', // Apenas warnings e erros em produção
    enableConsole: false,
    enableFile: true,
    maxFiles: '10d',
    maxSize: '10m'
  },
  
  // Configurações de performance
  performance: {
    // Timeouts mais agressivos
    apiTimeout: 5000,
    maxRetries: 2,
    
    // Limites de upload
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    
    // Paginação
    defaultPageSize: 20,
    maxPageSize: 100
  }
};
