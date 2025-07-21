# Use Node.js oficial como base
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Expor a porta
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["npm", "start"]
