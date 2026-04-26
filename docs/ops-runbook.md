# Ops runbook — MagicRouter

> Runbook inicial. Atualizar após deploy real.

## 1. Objetivo operacional

Garantir que o MagicRouter permaneça:
- acessível em `magicrouter.ruptur.cloud`
- funcional como endpoint OpenAI-compatible
- ligado ao Ollama privado
- operável sem exposição pública do runtime interno

## 2. Checks rápidos

### health
```bash
curl -sS https://magicrouter.ruptur.cloud/health
```

### listar modelos
```bash
curl -sS https://magicrouter.ruptur.cloud/v1/models \
  -H "Authorization: Bearer <KEY>"
```

### chat completion simples
```bash
curl -sS https://magicrouter.ruptur.cloud/v1/chat/completions \
  -H "Authorization: Bearer <KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3-coder:30b",
    "messages": [{"role": "user", "content": "responda apenas ok"}]
  }'
```

## 3. Checklist de incidente

### se o domínio não responde
- validar DNS de `magicrouter.ruptur.cloud`
- validar Traefik
- validar certificado/TLS
- validar rota/labels/config dinâmica

### se `/health` responde mas `/v1/models` falha
- validar processo/container do gateway
- validar configuração de upstream Ollama
- validar segredos e env vars

### se `/v1/models` responde mas `/v1/chat/completions` falha
- validar se o modelo pedido existe no Ollama
- validar latência/timeouts
- validar memória disponível
- validar se o upstream local caiu

### se a chave falha
- validar escopo/revogação
- validar header `Authorization`
- validar se a chave está apontando para o ambiente correto

## 4. Logs a consultar

> Preencher com caminhos reais após o deploy.

- logs do gateway:
  - `TODO`
- logs da borda/proxy:
  - `TODO`
- logs do Ollama:
  - `TODO`

## 5. Rollback

### rollback mínimo esperado
- remover/publicar rota anterior no Traefik
- voltar para compose/config anterior do módulo
- preservar Ollama intocado

### princípio
Rollback do MagicRouter nunca deve derrubar o Ollama ou serviços centrais do estaleiro.

## 6. Capacidade inicial recomendada

### defaults de modelo
- coding principal: `qwen3-coder:30b`
- coding alternativo: `devstral:24b`
- reasoning geral: `gpt-oss:20b`
- chat geral: `qwen3:30b` ou `gemma3:27b`

## 7. Expansão posterior

- quotas por chave
- budgets por tenant/app
- logs/replay ricos
- console premium próprio
- fallback multi-provider avançado
