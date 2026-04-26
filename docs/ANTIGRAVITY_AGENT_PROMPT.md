# Prompt definitivo do agente Antigravity — discovery + deploy adaptativo do MagicRouter

Você está operando no repositório `rupturcloud/magicrouter`.

## Missão única
Entregar o MagicRouter como gateway soberano OpenAI-compatible em `magicrouter.ruptur.cloud`, usando o **ambiente real já existente** da Ruptur, sem inventar stack nova sem necessidade.

## Regra principal
**Não se desvie para redesign, marketing site ou experimentação paralela.**
Seu trabalho é:
1. fazer discovery real do host e do ecossistema local relevante
2. escolher o encaixe técnico mais próximo do padrão Ruptur já existente
3. implementar o deploy adaptativo com Ansible
4. deixar a operação documentada no repo
5. commitar em pequenas etapas e enviar para o remoto

## Resposta objetiva que deve guiar sua implementação
- Ollama sozinho não fornece gestão real de chaves por agente/app.
- Se o objetivo é usar modelos locais em Paperclip e em projetos de dev com tokens separados, precisa existir um gateway na frente do Ollama.
- O domínio público deve ser `https://magicrouter.ruptur.cloud`.
- O endpoint-alvo deve ser `https://magicrouter.ruptur.cloud/v1`.
- O Ollama deve continuar privado.

## Direção técnica recomendada
A recomendação inicial é:
- **Traefik existente** na borda, se confirmado no host
- **LiteLLM Proxy** como motor do gateway, se nada melhor já padronizado estiver em uso
- **Ollama** como upstream local principal
- fallback premium opcional depois
- Ansible como source of truth do módulo

Se o discovery provar que outra escolha é mais aderente ao padrão atual do host, você pode adaptar — mas tem que justificar em `docs/runtime-decision.md`.

## Fontes locais obrigatórias de contexto
Antes de alterar qualquer coisa, leia e use como evidência:

### neste repo
- `README.md`
- `docs/PRD.md`
- `docs/discovery-report.md`
- `docs/deployment-plan.md`
- `docs/runtime-decision.md`
- `docs/paperclip-integration.md`
- `docs/ops-runbook.md`

### repositórios irmãos do workspace
- `/Users/diego/dev/ruptur-cloud/ruptur-lab-main/infra/ansible/README.md`
- `/Users/diego/dev/ruptur-cloud/ruptur-lab-main/infra/ansible/inventories/production/hosts.yml`
- `/Users/diego/dev/ruptur-cloud/ruptur-lab-main/infra/ansible/inventories/production/group_vars/all.yml`
- `/Users/diego/dev/ruptur-cloud/ruptur-lab-main/infra/ansible/playbooks/site.yml`
- `/Users/diego/dev/ruptur-cloud/ruptur-lab-main/infra/ansible/roles/jarvis/defaults/main.yml`
- `/Users/diego/dev/ruptur-cloud/ruptur-lab-main/infra/ansible/roles/jarvis/tasks/main.yml`
- `/Users/diego/dev/ruptur-cloud/ruptur-main/state/infrastructure/ruptur_shipyard.md`

## Baseline local já conhecido (a confirmar no host real)
A partir do material local já inspecionado, parta destas hipóteses iniciais:
- VM canônica provável: `ruptur-shipyard-01`
- GCP projeto: `midyear-forest-493400-s3`
- host provável em Debian 11
- Traefik já é o proxy padrão do estaleiro
- padrão de diretórios forte em `/opt/ruptur`
- Compose é padrão importante no runtime do estaleiro
- Jarvis já existe como módulo Ansible separado
- inventário do estaleiro usa `~/.ssh/google_compute_engine`

## O que você deve descobrir antes de escrever runtime

### no host
- sistema operacional e versão
- serviços ativos
- se Traefik está rodando
- se Docker/Compose está rodando
- se existe systemd específico para Ollama
- como o Ollama está exposto internamente
- bind real do Ollama
- modelos já instalados
- consumo atual de RAM/CPU relevante para sizing
- redes/volumes/padrões já ativos
- como TLS e DNS estão sendo tratados

### no ecossistema
- onde o Paperclip vai consumir o endpoint
- qual adapter do Paperclip é o melhor encaixe para consumir um provider soberano
- onde ficam segredos e overrides operacionais
- qual padrão de logs/runbooks a Ruptur já usa

## Regras de implementação
1. **Discovery primeiro.** Não suba nada antes de coletar evidência.
2. **Reaproveite o proxy existente.** Se Traefik estiver ativo, não invente Nginx/Caddy.
3. **Reaproveite o padrão de orquestração.** Se Compose estiver consolidado, não force systemd-only.
4. **Não exponha a porta 11434 publicamente.**
5. **Não coloque segredos no Git.**
6. **Mantenha o módulo bounded.** Não tente refatorar o estaleiro inteiro.
7. **Cada decisão importante deve ser explicada por escrito.**
8. **Faça commits pequenos e significativos.**
9. **Empurre para o remoto atual ao finalizar cada marco importante ou ao final da execução, conforme fizer sentido.**

## Entregáveis obrigatórios no repo
Você deve criar ou atualizar, durante a execução:
- `docs/discovery-report.md`
- `docs/deployment-plan.md`
- `docs/runtime-decision.md`
- `docs/paperclip-integration.md`
- `docs/ops-runbook.md`

E também os artefatos de implementação que forem necessários dentro de:
- `infra/ansible/`
- `services/`

## Contrato do deploy
O resultado mínimo aceitável é:
- domínio `magicrouter.ruptur.cloud` publicado pela borda existente
- health endpoint funcional
- `/v1/models` funcional
- `/v1/chat/completions` funcional
- pelo menos uma chave escopada para `paperclip`
- pelo menos uma chave escopada para `dev`
- Paperclip documentado com base URL e segredo corretos
- Ollama privado

## Forma esperada do uso pelo Paperclip
Separe claramente duas coisas:

### 1. credenciais do controle do Paperclip
Exemplos:
- `PAPERCLIP_API_URL`
- `PAPERCLIP_API_KEY`

### 2. credenciais do provedor de modelo soberano
Exemplos alvo:
- `OPENAI_BASE_URL=https://magicrouter.ruptur.cloud/v1`
- `OPENAI_API_KEY=<chave-escopada-do-magicrouter>`

Não misture as duas camadas.

## Modelos padrão recomendados para começar
Se o host suportar, use este baseline inicial:

### coding / agentes de desenvolvimento
- `qwen3-coder:30b`
- `devstral:24b`
- `gpt-oss:20b`

### geral / coordenação / PM
- `qwen3:30b`
- `gemma3:27b`

### vision opcional
- `qwen3-vl:8b`

Se discovery provar limitação de memória, desça de forma explícita e documentada.

## Ordem de execução obrigatória

### etapa 1 — discovery local e remoto
- ler docs locais
- inspecionar ansible/padrões Ruptur
- acessar host real e coletar evidência
- preencher `docs/discovery-report.md`

### etapa 2 — decisão de runtime
- listar opções viáveis
- escolher a mais aderente ao padrão real
- preencher `docs/runtime-decision.md`

### etapa 3 — implementação do módulo
- criar/ajustar role, templates, vars, exemplos e serviço(s)
- manter compatibilidade com o baseline da Ruptur
- preencher `docs/deployment-plan.md`

### etapa 4 — integração Paperclip
- documentar base URL, chaves e forma de consumo
- preencher `docs/paperclip-integration.md`

### etapa 5 — operação
- documentar smoke tests, logs, rollback e troubleshooting
- preencher `docs/ops-runbook.md`

### etapa 6 — validação final
- rodar checks
- garantir health
- garantir rota funcional
- commitar
- push para o remoto

## Critério de sucesso
No final, Diego precisa conseguir:
1. abrir este repo no Antigravity e ver o trilho completo
2. aplicar o módulo com seu Ansible
3. emitir tokens separados para Paperclip e dev
4. consumir modelos locais via endpoint único OpenAI-compatible
5. operar o gateway sem expor o Ollama
