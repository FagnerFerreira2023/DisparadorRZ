# Documentação do Fluxo de Envio Atual & API de Integrações

## 1. Fluxo Atual ("Disparos")
O frontend (`app.js`) realiza chamadas diretas para a API interna em `/v1/messages`.

| Endpoint Interno | Payload Principal | Lógica (Resumida) |
| :--- | :--- | :--- |
| `POST /send_menu` | `to`, `title`, `text`, `options`, `footer` | Valida instância -> Limites -> Formata texto numerado -> `sock.sendMessage(text)` |
| `POST /send_buttons_helpers` | `to`, `text`, `buttons` (`id`, `text`) | Valida -> Limites -> `nativeButtons` -> `sock.sendMessage` |
| `POST /send_interactive_helpers` | `to`, `text`, `buttons` (url/copy/call) | Valida -> Limites -> `nativeButtons` (types) -> `sock.sendMessage` |
| `POST /send_list_helpers` | `to`, `text`, `buttonText`, `sections` | Valida -> Limites -> `nativeList` -> `sock.sendMessage` |
| `POST /send_poll` | `to`, `name`, `options`, `selectableCount` | Valida -> Limites -> `poll` -> `sock.sendMessage` |
| `POST /send_carousel_helpers` | `to`, `cards` | Valida -> Limites -> `nativeCarousel` -> `sock.sendMessage` |

**Localização da Lógica:**
Atualmente, toda a regra de negócio (validação, formatação do payload do Baileys, incremento de cota) está **hardcoded** dentro dos handlers do Express em `src/routes/messages.ts`.

## 2. Estratégia de Reutilização (Refatoração)
Para atender ao requisito de **não duplicar lógica**, extrairemos as regras de `src/routes/messages.ts` para um *Service* compartilhado.

**Novo Arquivo:** `src/services/dispatcher.ts`
Funções propostas:
- `sendMessageMenu(tenantId, instanceName, to, content): Promise<Result>`
- `sendMessageButtons(tenantId, instanceName, to, content): Promise<Result>`
- ... e assim por diante.

Dessa forma:
1. `src/routes/messages.ts` (API Interna) chamará `dispatcher.sendMessageMenu(...)`.
2. `src/routes/integrations.ts` (Nova API Externa) chamará `dispatcher.sendMessageMenu(...)`.

## 3. Especificação da API Externa
**Base URL:** `/api/integrations`
**Auth:** header `Authorization: Bearer <jwt_tenant>`

### `POST /send`
Payload Unificado:
```json
{
  "instance": "main",
  "to": "551199999999",
  "type": "menu", // text, buttons, interactive, list, poll, carousel
  "payload": {
    // Campos específicos de cada tipo
  }
}
```

### Validações
- `instance`: Deve pertencer ao Tenant do token.
- `to`: Deve ser numérico e >= 10 dígitos.
- `type`: Deve ser suportado.

## Próximos Passos
1. Criar `src/services/dispatcher.ts` movendo a lógica de `src/routes/messages.ts`.
2. Atualizar `src/routes/messages.ts` para usar o novo service.
3. Criar `src/routes/integrations.ts` consumindo o mesmo service.
4. Registrar rota em `src/index.ts`.
