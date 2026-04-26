# Runtime decision — MagicRouter

> Registro de decisão arquitetural. Atualizar conforme discovery real.

## 1. Problema de decisão

Precisamos decidir **como** encaixar o MagicRouter no host real da Ruptur sem brigar com o runtime já existente.

## 2. Opções consideradas

### opção A — Traefik + Docker Compose + LiteLLM Proxy
**Status inicial:** recomendada, pendente de confirmação remota.

**Prós**
- alinhada ao baseline local já documentado no estaleiro
- encaixa bem com padrão `/opt/ruptur`
- fácil de publicar atrás do Traefik
- boa aderência ao problema de chaves, budgets, auth e roteamento

**Contras**
- depende de Compose estar realmente consolidado no host
- adiciona mais um serviço ao runtime

### opção B — systemd + binário/uv no host
**Status inicial:** fallback se o host do Ollama já estiver fortemente em systemd e sem compose operacional para novos módulos.

**Prós**
- pode ser mais simples se o host já estiver todo em systemd
- menos camadas se não houver Docker disponível

**Contras**
- menos aderente ao baseline local documentado
- mais trabalho manual para borda e rollback

### opção C — novo proxy separado (Nginx/Caddy/etc.)
**Status inicial:** rejeitada por padrão.

**Prós**
- só considerar se o discovery provar necessidade real

**Contras**
- conflita com a regra de reaproveitar a borda existente
- aumenta superfície operacional sem necessidade

## 3. Critérios de escolha

A decisão final deve priorizar, nesta ordem:
1. aderência ao padrão real do host
2. menor atrito operacional
3. segurança
4. simplicidade de rollback
5. capacidade de emitir chaves e operar o gateway

## 4. Decisão provisória atual

Até prova em contrário pelo discovery remoto, a decisão provisória é:

**host dedicado de IA + Docker Compose + Ollama + LiteLLM Proxy**

### detalhe importante do caminho de execução

- **Paperclip / OpenCode:** falar com o Ollama direto por rede privada sempre que o objetivo for validar loop de tools com o menor atrito possível
- **OpenClaw / AIOSX / Jarvis / ADK / A2A / apps OpenAI-compatible:** consumir o gateway MagicRouter/LiteLLM
- **fallback premium:** entrar depois via chaves GCP no gateway, não no primeiro smoke test do Paperclip

## 5. Evidências locais que sustentam a decisão provisória

- `ruptur-lab-main/infra/ansible/README.md` aponta Traefik + Docker Engine como baseline
- `ruptur-lab-main/infra/ansible/inventories/production/group_vars/all.yml` usa diretórios `/opt/ruptur/*`
- a role `jarvis` já segue padrão de módulo opcional via Compose
- `ruptur-main/state/infrastructure/ruptur_shipyard.md` registra Traefik como borda do host canônico

## 6. Revalidação obrigatória no host

Antes da implementação final, confirmar:
- [ ] Compose realmente ativo para módulos novos
- [ ] Traefik realmente ativo e gerenciando domínios
- [ ] local do Ollama e forma de bind
- [ ] redes/labels necessárias para o módulo
