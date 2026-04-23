# PRD — MagicRouter as Ruptur Internal Premium Module

## Positioning
MagicRouter is not a standalone SaaS. It is a premium internal module inside the Ruptur SaaS ecosystem, operating as a micro-SaaS within the broader platform.

It exists to provide:
- sovereign AI routing
- unified model access
- local-first inference
- tenant-aware API keys
- model catalog and playground
- operational visibility for apps, agents, and internal operators

## Product role inside Ruptur
MagicRouter becomes the AI infrastructure plane for:
- Paperclip
- Jarvis
- HITL panel
- internal agents
- future tenant-facing AI features

## Core surfaces
1. Gateway API
2. Admin/operator console
3. Tenant-scoped keys and model policies
4. Routing rules
5. Usage and observability

## Premium console requirements
- model catalog with tags, provider, latency, pricing class, and health
- playground with chat/completions streaming
- tenant/app token management
- request logs and replay
- routing strategy editor
- fallback visibility
- provider enable/disable
- usage charts per tenant/app/model
- curated presets for code, chat, vision, and agent tasks

## Internal module principles
- do not break existing Ruptur SaaS assumptions
- expose MagicRouter as one bounded context/module
- keep integration points explicit
- local models are first-class citizens
- cloud models are optional augmenters

## Module boundaries
MagicRouter owns:
- provider registry
- API compatibility layer
- key issuance
- routing policies
- request telemetry

MagicRouter does not own:
- tenant billing core
- global auth for the whole Ruptur SaaS
- CRM, WhatsApp, or campaign orchestration
- broader app shell navigation decisions

## Immediate build target
Build Console v1 as the premium operational face of MagicRouter inside Ruptur.

## Console v1 pages
- Overview
- Models
- Playground
- Keys
- Logs
- Routes
- Health

## UX direction
- premium internal ops feel
- dark-first
- dense but readable
- operator-grade, not marketing-grade

## Acceptance criteria
- internal operator can inspect all configured models
- internal operator can test prompts from the browser
- internal operator can create and revoke scoped keys
- internal operator can inspect recent request history
- internal operator can understand which provider answered each request
- console can be embedded or framed inside the Ruptur SaaS shell later
