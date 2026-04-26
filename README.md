# MagicRouter

Gateway privado OpenAI-compatible para o ecossistema Ruptur, pensado para colocar o Ollama da VPS GCP atrás de uma camada segura de roteamento, chaves por app/agente e observabilidade operacional.

## Objetivo

Entregar um endpoint estável em `https://magicrouter.ruptur.clocodeud/v1` para consumo por:
- Paperclip
- agentes internos
- projetos de desenvolvimento
- futuros módulos premium da Ruptur

## Verdade operacional

Ollama resolve inferência local, mas **não** resolve sozinho o problema de:
- chaves por agente/app
- escopo e revogação de acesso
- rate limit
- quotas
- logs centralizados
- fallback entre providers
- observabilidade de roteamento

Por isso o MagicRouter existe como **gateway soberano em frente ao Ollama**.

## Direção recomendada do módulo

Com base no contexto local encontrado neste workspace, a direção inicial recomendada para o deploy é:

```text
Paperclip / apps / agentes
        ↓
magicrouter.ruptur.cloud (Traefik)
        ↓
MagicRouter gateway (recomendado: LiteLLM Proxy)
        ↓
Ollama local + fallbacks premium opcionais
```

O domínio e a UX pública continuam sendo `magicrouter.ruptur.cloud`; o motor interno pode ser trocado se o discovery do host mostrar opção melhor já padronizada no estaleiro.

## Baseline local já identificado

A partir dos repositórios irmãos em `/Users/diego/dev/ruptur-cloud`, o baseline conhecido hoje é:
- VM canônica: `ruptur-shipyard-01`
- GCP / Debian 11
- Traefik na borda
- padrão forte de Docker Compose + `/opt/ruptur/*`
- Ansible como source of truth do host/runtime
- segredos fora do Git
- Jarvis já encaixado como módulo Ansible separado

Esse baseline está documentado em:
- `docs/PRD.md`
- `docs/ANTIGRAVITY_AGENT_PROMPT.md`
- `docs/discovery-report.md`
- `docs/deployment-plan.md`
- `docs/runtime-decision.md`
- `docs/paperclip-integration.md`
- `docs/ops-runbook.md`

## Layout atual

```text
infra/ansible/
services/magicrouter-web/
docs/
```

## Estratégia de execução

1. discovery primeiro
2. não substituir stack funcionando sem motivo
3. reaproveitar proxy/orquestração já ativa no host
4. manter Ollama privado
5. expor apenas o gateway OpenAI-compatible
6. emitir chaves escopadas para Paperclip e projetos de dev

## Deploy

Este repositório ainda está em fase de preparação documental/operacional para um deploy adaptativo via agente.

Ponto de entrada do playbook:

```bash
cd infra/ansible
ansible-playbook -i inventories/production/hosts.yml playbooks/site.yml --tags magicrouter
```

## Resultado esperado

Ao final do trabalho do Antigravity, este módulo deve entregar:
- `/v1/models`
- `/v1/chat/completions`
- chaves por app/agente
- roteamento local-first para Ollama
- fallback opcional para providers premium
- mirror UI / console operacional
- trilha de operação clara no repo
