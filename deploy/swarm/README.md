# Stack Information

**Stack:** disparadorrz-teste3
**Super Admin:** superadmin@whatszap.cloud
**Admin:** admin@whatszap.cloud
**Password (both):** Mudar@123

# Deploy via Portainer (Docker Swarm Stack)

Este diretório contém um modelo oficial de stack para deploy do DisparadorRZ sem SSH na VPS.

## Arquivo oficial

- `stack.example.yml`

## Pré-requisitos mínimos

- Docker Swarm inicializado
- Portainer conectado ao Swarm
- Traefik rodando no Swarm
- Rede externa já existente e conectada ao Traefik (ex.: `Activa_Rede`)
- Certresolver válido no Traefik (ex.: `letsencryptresolver`)

## Passo a passo (sem terminal)

1. No Portainer, abra **Stacks**.
2. Clique em **Add stack**.
3. Em **Web editor**, cole o conteúdo de `stack.example.yml`.
4. Altere apenas domínio, rede, senhas e segredos.
5. Clique em **Deploy the stack**.

## O que o usuário precisa alterar

| Campo | Onde alterar | Exemplo |
|---|---|---|
| Domínio | `traefik.http.routers.disparadorrz.rule` | `Host(`disparo.seudominio.com`)` |
| Rede externa | `networks.Activa_Rede.name` e nos serviços | `Activa_Rede` |
| Certresolver | `traefik.http.routers.disparadorrz.tls.certresolver` | `letsencryptresolver` |
| Senha do banco | `DB_PASSWORD` e `POSTGRES_PASSWORD` | senha forte igual nos dois |
| JWT secret | `JWT_SECRET` | segredo forte |
| JWT refresh secret | `JWT_REFRESH_SECRET` | segredo forte diferente |
| Superadmin padrão | `DEFAULT_SUPERADMIN_EMAIL` / `DEFAULT_SUPERADMIN_PASSWORD` | `superadmin@pizzbot.cloud` / `Mudar@123` |
| Admin padrão | `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD` | `admin@pizzbot.cloud` / `Mudar@123` |

### Migração automática de conta antiga

O seed migra e sincroniza automaticamente a conta legada (`admin@saas.local`) para o novo padrão de superadmin.
Se você usa outro e-mail antigo, defina `LEGACY_SUPERADMIN_EMAIL` na stack.

## Observação importante sobre imagem GHCR

A stack usa a imagem oficial:

- `ghcr.io/fagnerferreira2023/disparadorrz:latest`

Se seu GHCR estiver privado, configure credencial de registry no Portainer para o deploy funcionar sem erro de pull.
