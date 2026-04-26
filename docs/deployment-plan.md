# Deployment plan — MagicRouter

> Documento de trabalho. Atualizar conforme discovery e implementação avançarem.

## 1. Estratégia alvo

### proposta inicial
```text
Paperclip host
    ├─ Paperclip
    ├─ OpenCode
    └─ RTK
             ↓ (privado)
host dedicado de IA
    ├─ Ollama
    └─ MagicRouter gateway (LiteLLM Proxy)
             ↓
magicrouter.ruptur.cloud
```

### nota operacional
- Paperclip deve validar primeiro via `OpenCode -> Ollama direto`
- LiteLLM deve entrar primeiro como gateway dos demais serviços e só depois ser testado no loop crítico do Paperclip

## 2. Etapas

### etapa 0 — discovery
- [ ] confirmar host, proxy e runtime
- [ ] confirmar Ollama real
- [ ] confirmar modelo(s) disponíveis

### etapa 1 — contrato Ansible
- [ ] definir inventory/vars do módulo
- [ ] definir contrato de segredos
- [ ] definir diretórios sob `/opt/ruptur`

### etapa 2 — gateway
- [ ] subir serviço do gateway
- [ ] configurar upstream Ollama
- [ ] configurar healthcheck
- [ ] configurar `/v1/models`
- [ ] configurar `/v1/chat/completions`

### etapa 3 — borda
- [ ] publicar rota `magicrouter.ruptur.cloud`
- [ ] validar TLS
- [ ] garantir que Ollama continue privado

### etapa 4 — chaves
- [ ] criar chave `paperclip`
- [ ] criar chave `dev`
- [ ] documentar escopos

### etapa 5 — integração
- [ ] smoke test via curl/OpenAI SDK
- [ ] smoke test para Paperclip
- [ ] registrar evidências

### etapa 6 — operação
- [ ] logs
- [ ] runbook
- [ ] rollback

## 3. Artefatos esperados

### Ansible
- role `magicrouter`
- defaults
- tasks
- templates
- exemplos de segredos

### serviços
- gateway runtime
- web mirror mínimo, se ainda fizer sentido no v1

### documentação
- `docs/discovery-report.md`
- `docs/runtime-decision.md`
- `docs/paperclip-integration.md`
- `docs/ops-runbook.md`

## 4. Smoke tests mínimos

```bash
curl -sS https://magicrouter.ruptur.cloud/health
curl -sS https://magicrouter.ruptur.cloud/v1/models \
  -H "Authorization: Bearer <KEY>"
curl -sS https://magicrouter.ruptur.cloud/v1/chat/completions \
  -H "Authorization: Bearer <KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3-coder:30b",
    "messages": [{"role": "user", "content": "responda ok"}]
  }'
```

## 5. Riscos de execução
- discovery remoto divergir do baseline local
- footprint do modelo principal não caber na VPS
- proxy existente estar fora do padrão esperado
- Paperclip usar adapter inadequado para LLM soberano
