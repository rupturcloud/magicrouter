# Integração com Paperclip

## 1. Ponto principal

Paperclip é a camada de **orquestração e governança de agentes**.  
MagicRouter é a camada de **acesso soberano a modelos**.

As duas coisas se complementam, mas **não são a mesma credencial**.

## 2. Separação obrigatória de credenciais

### 2.1 Credenciais do Paperclip
Usadas pelo agente para falar com o próprio controle do Paperclip:
- `PAPERCLIP_API_URL`
- `PAPERCLIP_API_KEY`

### 2.2 Credenciais do provedor de modelo
Usadas pelo runtime do agente ou aplicação para falar com o MagicRouter:
- `OPENAI_BASE_URL=https://magicrouter.ruptur.cloud/v1`
- `OPENAI_API_KEY=<CHAVE_ESCOPADA_DO_MAGICROUTER>`

## 3. O que está confirmado pela documentação do Paperclip

- Paperclip é agnóstico ao runtime do agente.
- Ele suporta adapters como `process`, `http`, `codex_local`, `claude_local`, `gemini_local`, `opencode_local` e outros.
- O adapter `process` é um caminho seguro quando você quer executar um runtime customizado que consome um provider OpenAI-compatible.
- O adapter `http` também serve quando o agente vive fora do próprio host do Paperclip.

## 4. Caminho recomendado para usar o MagicRouter com Paperclip

### opção recomendada
Priorizar um destes caminhos para agentes que devem usar seus modelos soberanos:
1. `process` adapter, com um runtime/script que consome `OPENAI_BASE_URL` + `OPENAI_API_KEY`
2. `http` adapter, se o agente viver como serviço externo
3. `opencode_local`, quando o provider/model fizer sentido no seu setup local

### caminho a avaliar com mais cuidado
- `codex_local` / `claude_local` quando o objetivo for usar providers nativos dessas CLIs

## 5. Contrato alvo para apps e agentes

### base URL
```bash
OPENAI_BASE_URL=https://magicrouter.ruptur.cloud/v1
```

### chave escopada
```bash
OPENAI_API_KEY=<paperclip-prod-ou-dev-key>
```

### exemplo em Python (SDK compatível com OpenAI)
```python
from openai import OpenAI

client = OpenAI(
    base_url="https://magicrouter.ruptur.cloud/v1",
    api_key="<CHAVE_ESCOPADA>",
)

resp = client.chat.completions.create(
    model="qwen3-coder:30b",
    messages=[
        {"role": "user", "content": "responda apenas ok"}
    ],
)

print(resp.choices[0].message.content)
```

## 6. Tokens/chaves iniciais sugeridos

- `paperclip-prod`
- `paperclip-staging`
- `dev-shared`
- `jarvis-core`

## 7. Regras operacionais

- não reutilizar a mesma chave para todos os agentes
- separar produção de desenvolvimento
- registrar dono/finalidade de cada chave
- revogar chaves antigas quando houver troca de runtime
- manter segredos fora do Git

## 8. Smoke test funcional esperado

1. Paperclip sobe normalmente com suas próprias credenciais.
2. Um agente do tipo `process` ou `http` recebe `OPENAI_BASE_URL` e `OPENAI_API_KEY`.
3. O agente consegue chamar `https://magicrouter.ruptur.cloud/v1/chat/completions`.
4. O request chega ao gateway e é roteado ao Ollama.
