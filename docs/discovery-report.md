# Discovery report — MagicRouter

> Status inicial: **seedado a partir de inspeção local do workspace em 2026-04-23**.  
> Este documento deve ser atualizado pelo agente conforme o discovery real do host acontecer.

## 1. Evidências locais já verificadas

### 1.1 Este repositório
- `README.md` posiciona o MagicRouter como módulo Ansible-first.
- `infra/ansible/playbooks/site.yml` já aponta para uma role `magicrouter`.
- `services/magicrouter-web/` já existe como embrião de mirror UI.

### 1.2 Repositório `ruptur-lab-main`
- `infra/ansible/README.md` documenta baseline de host Debian com Traefik e Docker Engine.
- `infra/ansible/inventories/production/hosts.yml` aponta para um host `shipyard_lab` com chave `~/.ssh/google_compute_engine`.
- `infra/ansible/inventories/production/group_vars/all.yml` mostra padrão forte de:
  - `/opt/ruptur`
  - diretórios `compose`, `config`, `data`, `logs`, `runtime`
  - Traefik como borda
  - `shipyard_compose_autostart: false`
- role `jarvis` já sincroniza runtime, renderiza env/compose e sobe módulo opcional via Compose.

### 1.3 Repositório `ruptur-main`
- `state/infrastructure/ruptur_shipyard.md` registra:
  - VM: `ruptur-shipyard-01`
  - GCP projeto: `midyear-forest-493400-s3`
  - região: `southamerica-east1-b`
  - IP externo: `34.95.234.227`
  - SO: Debian 11
  - stack ativa: Traefik, Portainer, Postgres, Redis, n8n, MinIO
  - Jarvis hook ativo via `ruptur-lab`

## 2. Hipótese operacional inicial

A hipótese mais forte antes do discovery remoto é:
- o host real já trabalha com Traefik + Docker Compose
- o padrão de módulo ideal para o MagicRouter é se encaixar em `/opt/ruptur/*`
- segredos devem seguir override local fora do Git
- o módulo deve ser compatível com o mesmo contrato operacional já usado pelo Jarvis

## 3. Itens ainda não confirmados no host real

### host/runtime
- [ ] host real do deploy do MagicRouter
- [ ] IP atual efetivo
- [ ] usuário SSH efetivo
- [ ] status real de Docker/Compose
- [ ] status real de Traefik
- [ ] redes Docker disponíveis
- [ ] volumes e layout reais já existentes

### Ollama
- [ ] forma de instalação (compose/systemd/binário)
- [ ] bind/porta reais
- [ ] modelos realmente instalados
- [ ] consumo de memória
- [ ] clientes atuais que já consomem Ollama

### domínio e borda
- [ ] DNS de `magicrouter.ruptur.cloud`
- [ ] estratégia TLS em uso
- [ ] necessidade de label dinâmica ou arquivo dinâmico Traefik

### integração
- [ ] Paperclip alvo exato
- [ ] adapter do Paperclip a ser usado
- [ ] local dos segredos do gateway

## 4. Comandos sugeridos para discovery remoto

> Ajustar ao contexto real e registrar evidência no documento.

```bash
uname -a
cat /etc/os-release
systemctl list-units --type=service --state=running
systemctl status ollama --no-pager
ss -lntp
ps aux | egrep 'ollama|traefik|docker|podman'
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
docker network ls
docker volume ls
curl -sS http://127.0.0.1:11434/api/tags
curl -sS http://127.0.0.1:11434/v1/models
free -h
nproc
```

## 5. Saída esperada do discovery

Ao final do discovery remoto, este documento deve responder com evidência:
1. onde o Ollama está
2. como o host já organiza módulos novos
3. qual proxy/orquestração devem ser reutilizados
4. qual footprint de modelo é viável
5. qual caminho mais seguro para publicar `magicrouter.ruptur.cloud`
