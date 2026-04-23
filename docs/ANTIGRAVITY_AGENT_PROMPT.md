# Antigravity Agent Prompt — Discovery + Adaptive Deploy for MagicRouter

You are operating inside the `rupturcloud/magicrouter` repository.

## Mission
Implement MagicRouter on the existing GCP VPS environment in an adaptive way.

This is not a greenfield deployment.
Do not invent a new stack unless absolutely required.
Do not assume docker-compose, nginx, traefik, caddy, pm2, or any specific runtime.
Do not replace existing working Ruptur infrastructure by default.

Your job is to:
1. discover the current VPS runtime and deployment shape
2. identify how Ollama is currently exposed internally
3. identify how Paperclip should consume the routed endpoint
4. implement MagicRouter as an Ansible-first bounded module
5. keep the host convergent with current Ruptur standards
6. leave a clear operational trail in repo docs

## Core product truth
MagicRouter exists so that local Ollama-backed models can be consumed through a stable OpenAI-compatible gateway with scoped keys/tokens for apps such as Paperclip and dev projects.

## Direct answers that must guide implementation
- Ollama itself does not natively provide per-agent API keys in the way OpenAI/OpenRouter do.
- Therefore, if the goal is to issue tokens for Paperclip and dev projects, a gateway layer must exist in front of Ollama.
- That gateway must expose OpenAI-compatible endpoints and support scoped API keys.
- The implementation must remain local-first and route to the GCP-hosted Ollama runtime first.

## Recommended model strategy
Use these defaults unless discovery proves a better already-installed option exists:

### local-first / coding
- qwen coder 7b/14b/32b class
- deepseek coder class

### local-first / general chat
- qwen class
- gemma class
- llama class when already installed

### premium optional fallback
- Claude class for strong reasoning and writing
- GPT class for tool ecosystem compatibility

## Non-goals
- Do not build a marketing site
- Do not redesign the whole Ruptur SaaS
- Do not force a brand new proxy stack if one already exists
- Do not expose Ollama port 11434 publicly
- Do not hardcode secrets in repo

## Discovery checklist
Produce a discovery report before changing runtime wiring.

### host/runtime
- detect OS
- detect running services
- detect process manager
- detect existing reverse proxy
- detect existing cert/TLS handling
- detect container runtime if present
- detect service layout under /opt, /srv, /var/lib, systemd, or current Ruptur paths

### ollama
- confirm Ollama is installed and reachable
- detect listening address/port
- detect installed models
- detect whether OpenAI-compatible endpoint is already used internally
- detect local callers already using Ollama

### Ruptur ecosystem fit
- detect Paperclip runtime and existing config surface
- detect Jarvis/HITL/AIOX integration points if present
- detect current auth and secret patterns
- detect current logs/observability path

## Required outputs in repo
Create or update these as you work:
- docs/discovery-report.md
- docs/deployment-plan.md
- docs/runtime-decision.md
- docs/paperclip-integration.md
- docs/ops-runbook.md

## Deployment intent
Implement an adaptive gateway module that can:
- sit in front of Ollama
- expose `/v1/models` and `/v1/chat/completions`
- issue scoped tokens/keys for apps
- allow future routing/fallback expansion
- support a small operator web mirror

## Adaptive runtime rules
1. Reuse existing proxy if present.
2. Reuse existing service orchestration pattern if present.
3. Use Ansible to converge configuration.
4. If multiple viable runtime choices exist, document them and pick the one closest to the current Ruptur standard already active on the host.
5. Every decision must be justified in `docs/runtime-decision.md`.

## Paperclip target shape
Paperclip must be able to use:
- Base URL: `https://magicrouter.ruptur.cloud/v1`
- API key: generated/scoped key from the gateway layer

## Acceptance criteria
- local models behind the gateway are callable through OpenAI-compatible endpoints
- scoped keys exist for Paperclip and dev projects
- Ollama remains private
- deployment fits existing VPS runtime rather than fighting it
- ansible artifacts are the source of truth
- repo documents exactly how to operate the module

## Execution style
- be surgical
- preserve working infra
- prefer integration over replacement
- write down assumptions
- show evidence for runtime choices
- keep the module bounded and operational
