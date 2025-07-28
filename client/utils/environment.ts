// Configurações de ambiente para desenvolvimento/produção

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Função para logging condicional (apenas em desenvolvimento)
export const devLog = (message: string, ...args: any[]) => {
  if (isDevelopment) {
    console.log(message, ...args);
  }
};

export const devWarn = (message: string, ...args: any[]) => {
  if (isDevelopment) {
    console.warn(message, ...args);
  }
};

export const devError = (message: string, ...args: any[]) => {
  if (isDevelopment) {
    console.error(message, ...args);
  }
};

// Configurações específicas por ambiente
export const config = {
  // Timeouts mais agressivos em produção
  apiTimeout: isProduction ? 5000 : 10000,

  // Retry logic menos agressivo em produção
  maxRetries: isProduction ? 2 : 3,

  // Intervalo de auto-refresh
  autoRefreshInterval: isProduction ? 300000 : 120000, // 5min prod, 2min dev

  // Logs detalhados apenas em dev
  enableDetailedLogs: isDevelopment,

  // Credenciais de demo (removidas em produção)
  showDemoCredentials: isDevelopment,
};

// Função para sanitizar dados sensíveis em produção
export const sanitizeForProduction = (data: any) => {
  if (isProduction) {
    // Remove informações sensíveis em produção
    const sanitized = { ...data };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    delete sanitized.api_key;
    return sanitized;
  }
  return data;
};
