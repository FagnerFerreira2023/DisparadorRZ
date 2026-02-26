#!/bin/bash

# Exibe comandos e interrompe em caso de erro
set -e

echo "🚀 Iniciando Deploy do RZ Sender..."

# 1. Garantir que a pasta rz-sender existe
mkdir -p ~/rz-sender

# 2. Copiar arquivos necessários (Dockerfile, docker-compose.yml, .env.production, setup_db.sql)
# Assumindo que os arquivos já foram enviados para a pasta ~/rz-sender

cd ~/rz-sender

# 3. Renomear o env de produção
cp .env.production .env

# 4. Criar o banco de dados (usando o docker exec no container postgresql)
echo "🐘 Configurando Banco de Dados..."
# Tentamos criar o banco. Usamos o usuário zpro fornecido.
echo "SELECT 'CREATE DATABASE rz_sender' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'rz_sender')\gexec" | docker exec -i postgresql psql -U zpro -d postgres

# 5. Build e Up do Docker
echo "🐳 Subindo Containers..."
docker-compose up -d --build

echo "✅ RZ Sender rodando na porta 8787!"
echo "🔗 Configure o Nginx Proxy Manager para disparador.reidozap.com.br -> http://localhost:8787"
