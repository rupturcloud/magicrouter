# MagicRouter

Private OpenAI-compatible AI router for the Ruptur ecosystem, with a local-first model gateway and a lightweight web mirror inspired by Ollama/OpenRouter.

## Scope
- Ansible deploy
- LiteLLM + PostgreSQL
- Nginx reverse proxy for magicrouter.ruptur.cloud
- Web mirror UI
- Ollama + cloud provider routing
- Example inventory and vars

## Layout
```text
infra/ansible/
services/magicrouter-web/
```

## Deploy
```bash
cd infra/ansible
ansible-playbook -i inventories/production/hosts.yml playbooks/site.yml --tags magicrouter
```

## Endpoints
- API: https://magicrouter.ruptur.cloud/v1
- Web: https://magicrouter.ruptur.cloud/
- Health: https://magicrouter.ruptur.cloud/health

## Web mirror
- model catalog
- health status
- playground chat
- request inspector
- active routing visibility
