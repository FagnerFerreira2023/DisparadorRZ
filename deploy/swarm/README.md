# DisparadorRZ no Docker Swarm (Portainer)

Este guia sobe o `rz-sender-final` no Swarm usando Stack do Portainer.

## 1) Pré-requisitos

- Docker Swarm inicializado (`docker swarm init`)
- Portainer conectado ao Swarm
- Traefik já rodando na rede externa `Activa_Rede`
- DNS apontando para o manager (exemplo: `disparador.tudoautomatizado.com`)

## 2) Criar rede e volumes externos

Execute uma vez no node manager:

```bash
docker network create --driver overlay --attachable Activa_Rede
docker volume create disparadorrz_auth
docker volume create disparadorrz_postgres_data
```

## 3) Stack no Portainer

Use o arquivo `stack-disparadorrz.yml`.

Antes de subir, troque obrigatoriamente:

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `DB_PASSWORD`
- Host da rota Traefik: `disparador.tudoautomatizado.com`

## 4) Observações importantes

- O container roda migração automaticamente com:

```bash
node dist/db/migrate.js && node dist/index.js
```

- Sessões WhatsApp ficam persistidas no volume `disparadorrz_auth`.
- Banco PostgreSQL fica persistido no volume `disparadorrz_postgres_data`.

## 5) Primeiro acesso

Após subir o stack e estabilizar:

- URL: `https://disparador.tudoautomatizado.com`
- Healthcheck: `https://disparador.tudoautomatizado.com/health`

## 6) Comandos úteis

```bash
docker service ls
docker service logs -f <stack>_disparadorrz_api
docker service ps <stack>_disparadorrz_api
```

## 7) Publicação de imagem (GHCR)

O stack usa:

```text
ghcr.io/fagnerferreira2023/disparadorrz:latest
```

Publique a imagem antes de subir o stack.
