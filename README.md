# MagicRouter

Private OpenAI-compatible AI router for the Ruptur ecosystem, with a local-first model gateway and a lightweight web mirror inspired by Ollama/OpenRouter.

## Positioning
MagicRouter is an Ansible-first module. It should adapt to the runtime already present on the target VPS/VM instead of assuming a specific stack.

## Scope
- Ansible-first deployment and reconciliation
- Runtime-agnostic installation strategy
- Local Ollama + optional cloud provider routing
- Web mirror UI for operators
- Example inventory and vars

## Rules
- Do not assume Docker Compose
- Do not assume Nginx
- Detect and reuse what already exists on the host
- Prefer convergence into the current Ruptur/GCP VPS standards
- Treat MagicRouter as a bounded module inside the wider Ruptur SaaS

## Layout
```text
infra/ansible/
services/magicrouter-web/
docs/
```

## Deploy
```bash
cd infra/ansible
ansible-playbook -i inventories/production/hosts.yml playbooks/site.yml --tags magicrouter
```

## Endpoints
The final public and private endpoints are determined by the host runtime and Ansible variables.

Typical target shape:
- API: https://magicrouter.ruptur.cloud/v1
- Web: https://magicrouter.ruptur.cloud/
- Health: https://magicrouter.ruptur.cloud/health

## Web mirror
- model catalog
- health status
- playground chat
- request inspector
- active routing visibility

## What the module must solve
- expose a stable OpenAI-compatible endpoint for Paperclip and dev projects
- allow tenant/app scoped keys through the chosen gateway implementation
- route local-first to Ollama on the GCP VPS
- support premium cloud fallback when configured
- give operators a mirror UI for testing and observability
