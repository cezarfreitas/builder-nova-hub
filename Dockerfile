# Use Node.js oficial como base
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Remover devDependencies após build para reduzir tamanho
RUN npm ci --only=production && npm cache clean --force

# Expor a porta
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["npm", "start"]
