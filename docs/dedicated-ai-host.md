# Dedicated AI host — plano operacional lean

## 1. Objetivo

Separar a inferência e o gateway de modelos do host do Paperclip.

Arquitetura alvo:

```text
Paperclip host
  ├─ Paperclip
  ├─ OpenCode
  └─ RTK
          ↓ (privado)
Dedicated AI host
  ├─ Ollama
  └─ MagicRouter / LiteLLM
          ↓
Serviços consumidores
  ├─ OpenClaw
  ├─ AIOSX
  ├─ Jarvis
  ├─ HITL x Google ADK
  └─ A2A
```

## 2. Regra de roteamento recomendada

### 2.1 Caminho crítico do Paperclip

Para o Paperclip, priorizar:

```text
Paperclip → OpenCode → Ollama direto (IP privado / tailnet)
```

Motivo:
- reduz moving pieces
- evita o problema conhecido de loop de tool-call via `opencode_local` + LiteLLM + Ollama
- facilita validar utilidade do Paperclip em ciclos curtos

### 2.2 Caminho gateway para os demais serviços

Para OpenClaw, AIOSX, Jarvis, ADK, A2A e integrações OpenAI-compatible:

```text
serviço → MagicRouter/LiteLLM → Ollama / fallback premium
```

Motivo:
- centraliza auth, budgets, chaves e observabilidade
- permite fallback para modelos mais fortes com chaves GCP

## 3. Mitigação dos pontos que mais quebram

### A. Modelo descreve comando em texto, mas não chama tool

Mitigação:
- usar OpenCode no host do Paperclip
- usar modelos com melhor histórico de tool-calling (baseline lean: Qwen 3.5)
- validar tool-calling direto no Ollama antes do primeiro heartbeat do Paperclip

### B. Config/local runtime reseta entre heartbeats

Mitigação:
- manter config persistente em arquivo estável
- não usar `/tmp` para DB, config, workspace ou backup
- separar dados do gateway e do Ollama em `/opt/ruptur/data/*`
- manter Paperclip e IA em hosts diferentes para reduzir interferência

### C. LiteLLM → Ollama pode atrapalhar loop de tools

Mitigação:
- não colocar LiteLLM no primeiro teste lean do Paperclip
- para Paperclip: OpenCode → Ollama direto
- para gateway OpenAI-compatible: LiteLLM com `drop_params: true`
- usar LiteLLM principalmente para apps/agentes não críticos ao loop de tools do Paperclip

### D. Bootstrap/contexto grande demais gera token burn

Mitigação:
- operar com tarefas pequenas e heartbeat curto
- usar RTK no runtime para reduzir ruído de terminal
- limitar o teste a 1 agente + 1 tarefa por ciclo
- evitar threads gigantes de comentário na fase de validação
- usar resumo operacional externo (Jarvis / mapas / estado) como memória de verdade

### E. Muitos moving pieces ao mesmo tempo

Mitigação:
- primeiro provar Paperclip em modo lean
- só depois acoplar gateway completo, fallback premium e mais serviços

## 4. Ordem de validação hoje

### ciclo 0 — infra
- Ollama sobe no host dedicado
- MagicRouter sobe no host dedicado
- OpenCode sobe no host do Paperclip
- RTK ativo no runtime do agente

### ciclo 1 — tool-calling puro
- testar Ollama direto com tools
- testar um modelo apenas

### ciclo 2 — Paperclip lean
- 1 agente
- 1 tarefa
- 1 a 2 tools
- critério: completar sem babysitting excessivo

### ciclo 3 — gateway
- smoke test em `/v1/models`
- smoke test em `/v1/chat/completions`
- conectar OpenClaw/AIOSX/Jarvis gradualmente

## 5. Modelo inicial recomendado

Para começar lean:

- `qwen3:8b` → geral / Paperclip lean
- `qwen2.5-coder:7b` → coding lean / OpenClaw lean
- `qwen3:4b` → fallback leve

Somente depois:
- modelos maiores locais
- fallback premium por chave GCP

## 6. Contrato Ansible do host dedicado

A role atual foi adaptada para:

- subir Ollama no mesmo compose do gateway
- persistir dados em `/opt/ruptur/data/ollama`
- pré-carregar modelos opcionais
- manter o gateway publicável via Traefik
- permitir que Paperclip bypass o gateway e fale direto com o Ollama privado

### exemplo de variáveis para o primeiro deploy lean

```yaml
magicrouter_enable_ollama: true
magicrouter_enable_gateway: true
magicrouter_publish_via_traefik: true

magicrouter_master_key: "{{ vault_magicrouter_master_key }}"

magicrouter_ollama_bind_host: 127.0.0.1
magicrouter_ollama_models_to_pull:
  - qwen3:8b
  - qwen2.5-coder:7b
  - qwen3:4b

magicrouter_models:
  - alias: paperclip-lean
    target: ollama/qwen3:8b
  - alias: openclaw-lean
    target: ollama/qwen2.5-coder:7b
  - alias: fallback-light
    target: ollama/qwen3:4b
```

### comando de deploy

```bash
cd infra/ansible
ansible-playbook -i inventories/production/hosts.yml playbooks/site.yml --tags magicrouter
```

## 7. Critério de go / no-go

### go
- Paperclip conclui tarefas simples em poucos heartbeats
- sem reset de runtime
- sem tool-call falso recorrente
- sem token burn grotesco

### no-go / pivot
- agente descreve mais do que executa
- babysitting alto
- loop ruim mesmo com OpenCode + modelo certo
- Paperclip adiciona atrito em vez de coordenação

Se der no-go:
- manter Ollama + MagicRouter + Jarvis + RTK
- reduzir ou retirar o Paperclip do caminho
