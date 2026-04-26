# PRD — MagicRouter como gateway soberano de IA da Ruptur

## 1. Resumo executivo

O MagicRouter será o gateway privado OpenAI-compatible da Ruptur para servir modelos locais hospedados em Ollama na VPS GCP e, opcionalmente, providers premium externos. O produto nasce para resolver um problema muito específico: **transformar um Ollama isolado em um endpoint operacional, controlável e reutilizável por apps, agentes e projetos de desenvolvimento**.

Ele não é só um proxy. Ele é a camada de:
- autenticação por chave escopada
- roteamento entre modelos/providers
- padronização de API
- observabilidade operacional
- integração estável com Paperclip e agentes internos

## 2. Problema

Hoje, o Ollama na VPS resolve inferência local, mas não entrega sozinho o contrato que aplicações e agentes precisam em produção:
- chaves por projeto/agente
- revogação de acesso
- segregação entre ambientes
- quotas e limites
- visibilidade de uso
- fallback para outros providers
- endpoint único e estável para apps

Sem isso, cada integração vira acoplamento direto ao runtime local.

## 3. Objetivo do produto

Entregar `https://magicrouter.ruptur.cloud/v1` como endpoint estável e privado para:
- Paperclip
- agentes de desenvolvimento
- automações internas
- futuros produtos Ruptur que precisem de LLM

## 4. Objetivos de negócio

- criar uma camada soberana de IA da Ruptur
- reduzir dependência direta de providers externos por padrão
- permitir uso de modelos locais com UX de provider moderno
- criar um módulo premium interno reutilizável
- organizar custos, logs e acesso por app/agente

## 5. Usuários-alvo

### 5.1 Operador / fundador
Precisa:
- saber quais modelos estão ativos
- emitir/revogar chaves
- testar requests
- entender qual provider respondeu
- operar o módulo sem expor portas internas do host

### 5.2 Paperclip
Precisa:
- endpoint estável
- chave escopada
- previsibilidade de modelo/base URL
- separação entre credenciais do controle do Paperclip e credenciais do LLM

### 5.3 Projetos de dev
Precisam:
- endpoint OpenAI-compatible
- catálogo de modelos local-first
- troca simples de modelo sem reconfigurar toda a stack

## 6. Escopo do v1

### 6.1 API Gateway
- expor `/v1/models`
- expor `/v1/chat/completions`
- suportar streaming
- padronizar erros em formato OpenAI-compatible

### 6.2 Chaves e políticas
- gerar chaves separadas por app/agente
- permitir revogação
- suportar escopo por modelo quando viável
- preparar terreno para rate limit e budget

### 6.3 Roteamento
- local-first para Ollama
- fallback premium opcional para OpenAI / Anthropic / OpenRouter / outros
- seleção explícita de modelo
- futura política por workload (`coding`, `chat`, `vision`, `reasoning`)

### 6.4 Observabilidade
- health endpoint
- logs de request/resposta com redaction adequada
- trilha de qual provider/modelo respondeu
- visibilidade mínima para operação

### 6.5 Console / mirror UI
- overview operacional
- lista de modelos
- health
- playground mínimo
- visão de upstream configurado

## 7. Não-objetivos

- não virar o painel principal de toda a Ruptur
- não substituir Paperclip
- não expor Ollama publicamente
- não reinventar provedor se o host já tiver um padrão forte reutilizável
- não hardcodar segredos no repositório

## 8. Baseline técnico já conhecido no workspace

Com base nos repositórios locais irmãos, o ambiente-alvo **provável** hoje é:
- VM `ruptur-shipyard-01`
- GCP `midyear-forest-493400-s3`
- Debian 11
- Traefik como borda
- padrão `/opt/ruptur/{compose,config,data,logs,runtime}`
- automação host/runtime via Ansible
- Jarvis já modelado como módulo Ansible separado

### Evidências locais inspecionadas
- `ruptur-lab-main/infra/ansible/README.md`
- `ruptur-lab-main/infra/ansible/inventories/production/hosts.yml`
- `ruptur-lab-main/infra/ansible/inventories/production/group_vars/all.yml`
- `ruptur-lab-main/infra/ansible/roles/jarvis/defaults/main.yml`
- `ruptur-lab-main/infra/ansible/roles/jarvis/tasks/main.yml`
- `ruptur-main/state/infrastructure/ruptur_shipyard.md`

## 9. Arquitetura recomendada para o v1

### 9.1 Decisão recomendada
Usar **LiteLLM Proxy** como motor inicial do gateway, atrás do domínio `magicrouter.ruptur.cloud`, com Ollama como upstream local principal.

### 9.2 Justificativa
Essa direção atende diretamente ao problema do produto porque o LiteLLM Proxy já oferece, de forma nativa:
- API gateway centralizado
- autenticação/autorização
- virtual keys
- multi-tenant spend tracking
- budgets por projeto/usuário
- roteamento/fallback
- dashboard/admin UI
- compatibilidade com Ollama

### 9.3 Topologia alvo
```text
Cliente / Paperclip / agentes
        ↓
Traefik existente
        ↓
MagicRouter gateway (recomendado: LiteLLM Proxy)
        ↓
Ollama privado na VPS
        ↓
Fallbacks externos opcionais
```

### 9.4 UI
- no curto prazo: usar UI do motor + web mirror mínimo do repo
- no médio prazo: UI própria do MagicRouter como console premium da Ruptur

## 10. Requisitos funcionais

1. O operador consegue listar modelos ativos.
2. O operador consegue emitir ao menos duas chaves iniciais:
   - `paperclip-prod`
   - `dev-shared`
3. Paperclip consegue consumir o endpoint via base URL estável.
4. Projetos de dev conseguem usar o endpoint com SDK OpenAI-compatible.
5. O gateway consegue apontar para Ollama privado.
6. O gateway não exige exposição pública da porta 11434.
7. O módulo pode ser reconciliado por Ansible.

## 11. Requisitos não funcionais

- manter segredos fora do Git
- reaproveitar proxy existente se confirmado
- idempotência via Ansible
- rollback simples
- logs suficientes para troubleshooting
- healthcheck simples e automatizável
- baixa fricção para adicionar/remover modelos

## 12. Requisitos de integração com o Ansible Ruptur

O módulo deve seguir o padrão já visível no estaleiro:
- inventário de produção explícito
- `group_vars` e `secrets.yml` local fora do Git
- `shipyard_compose_autostart`/equivalente controlando subida
- diretórios sob `/opt/ruptur`
- compose e config renderizados por template
- serviços atrás do Traefik quando aplicável
- documentação operacional no próprio repo

## 13. Estratégia de rollout

### Fase 0 — discovery
- confirmar host real
- confirmar se Traefik/Compose estão ativos
- confirmar como o Ollama está rodando
- confirmar modelos já instalados

### Fase 1 — gateway funcional
- subir o motor escolhido
- conectar ao Ollama
- publicar health e `/v1/models`
- smoke test de `/v1/chat/completions`

### Fase 2 — chaves e integração
- emitir chaves iniciais
- integrar com Paperclip
- documentar contratos de uso

### Fase 3 — observabilidade
- consolidar logs
- healthchecks
- runbook operacional

### Fase 4 — console premium
- reforçar mirror UI
- políticas por workload/app
- relatórios mais ricos

## 14. Modelos recomendados para este uso

### 14.1 Coding / agentes de desenvolvimento
**Ordem prática recomendada hoje:**
1. `qwen3-coder:30b` — melhor default para coding/agentic quando houver memória suficiente
2. `devstral:24b` — excelente para agentes de software e uso com ferramentas
3. `gpt-oss:20b` — boa opção de raciocínio/agentic com footprint mais amigável
4. `deepseek-coder:33b` — manter como compatibilidade se já estiver instalado, não como primeira aposta nova

### 14.2 Chat geral / coordenação / PM
1. `qwen3:30b`
2. `gemma3:27b`
3. `qwen3:14b` ou `gemma3:12b` se a máquina pedir redução de footprint

### 14.3 Vision opcional
1. `qwen3-vl:8b`
2. `qwen3-vl:30b`
3. `gemma3` multimodal quando o workload for mais leve

## 15. Critérios de aceitação

- `https://magicrouter.ruptur.cloud/v1/models` responde
- `https://magicrouter.ruptur.cloud/v1/chat/completions` responde
- Paperclip consegue usar chave escopada do MagicRouter
- pelo menos um projeto de dev consegue usar o endpoint com SDK OpenAI-compatible
- Ollama permanece privado
- Ansible fica como source of truth do deploy
- docs operacionais do repo ficam suficientes para sustentação

## 16. Riscos

- host real divergir do baseline local documentado
- Ollama estar fora do padrão esperado (porta, bind, auth, systemd, container)
- memória/CPU da VPS não sustentar o modelo desejado
- Paperclip usar um adapter que não seja o melhor caminho para LLM soberano

## 17. Perguntas abertas para discovery

- o Ollama está em systemd, compose ou binário solto?
- quais modelos já estão puxados e em uso real?
- o host real usa as mesmas redes/labels Traefik do estaleiro?
- o motor do gateway deve rodar em compose ou systemd para ficar coerente com o host?
- a UI própria do repo será usada agora ou apenas depois do gateway estável?
