-- Cria o banco de dados se não existir
SELECT 'CREATE DATABASE rz_sender'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'rz_sender')\gexec

-- Concede privilégios ao usuário zpro
GRANT ALL PRIVILEGES ON DATABASE rz_sender TO zpro;
