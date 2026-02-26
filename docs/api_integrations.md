# RZ Sender - API de Integrações Externas

A API do RZ Sender permite que você envie mensagens de WhatsApp utilizando suas instâncias conectadas através de chamadas REST comuns. Ideal para integrações com n8n, Typebot, CRMs e outros sistemas.

## Autenticação

Todas as requisições devem incluir o token JWT no cabeçalho:

```http
Authorization: Bearer seu_token_aqui
```

---

## Endpoints

### 1. Instâncias

**URL:** `POST /v1/instances`

- Criar ou reconectar instância.

**Corpo:**
```json
{ "instance": "nome_da_instancia" }
```

**URL:** `GET /v1/instances`

- Listar instâncias do tenant.

**Resposta:**
```json
{
  "ok": true,
  "instances": [
    { "name": "vendas", "status": "connected" },
    { "name": "suporte", "status": "disconnected" }
  ]
}
```

---

### 2. Mensagens Interativas

**URL:** `POST /v1/messages/send_menu`

- Menu de Texto

```json
{
  "instance": "main",
  "to": "5511999999999",
  "title": "Titulo",
  "text": "Corpo da mensagem",
  "footer": "Rodape",
  "options": ["Opcao 1", "Opcao 2"]
}
```

**URL:** `POST /v1/messages/send_buttons_helpers`

- Botoes de Resposta (Quick Reply)

```json
{
  "instance": "main",
  "to": "5511999999999",
  "text": "Escolha uma opcao:",
  "buttons": ["Sim", "Nao"],
  "footer": "Rodape"
}
```

**URL:** `POST /v1/messages/send_interactive_helpers`

- Botoes Interativos (CTA)

```json
{
  "instance": "main",
  "to": "5511999999999",
  "text": "Assine agora:",
  "buttons": [
    { "type": "url", "text": "Google", "url": "https://google.com" },
    { "type": "call", "text": "Ligar", "phone": "+5511..." }
  ],
  "footer": "Rodape"
}
```

**URL:** `POST /v1/messages/send_list_helpers`

- Listas (Dropdown)

```json
{
  "instance": "main",
  "to": "5511999999999",
  "text": "Selecione:",
  "buttonText": "Ver Opcoes",
  "sections": [
    {
      "title": "Sessao 1",
      "rows": [
        { "title": "Item 1", "description": "Desc do item", "id": "id1" }
      ]
    }
  ],
  "footer": "Rodape"
}
```

**URL:** `POST /v1/messages/send_poll`

- Enquetes

```json
{
  "instance": "main",
  "to": "5511999999999",
  "name": "Qual sua cor favorita?",
  "options": ["Azul", "Verde"],
  "selectableCount": 1
}
```

**URL:** `POST /v1/messages/send_carousel_helpers`

- Carrossel

```json
{
  "instance": "main",
  "to": "5513981577934",
  "text": "Oferta Especial",
  "cards": [
    {
      "title": "mussa",
      "body": "25",
      "footer": "Promocao",
      "imageUrl": "https://anamariabrogui.com.br/assets/uploads/receitas/fotos/usuario-1932-5a1b7911dfda6e3c351c30de564da267.jpg",
      "buttons": [{ "id": "mussa_1", "text": "Ver Oferta" }]
    },
    {
      "title": "cala",
      "body": "30",
      "footer": "Promocao",
      "imageUrl": "https://receitaskidelicia.com.br/wp-content/uploads/2025/09/pizza-de-liquidificador-de-calabresa.jpg",
      "buttons": [{ "id": "cala_1", "text": "Ver Oferta" }]
    }
  ]
}
```

---

## Suporte
WhatsApp: **(13) 98157-7934**
