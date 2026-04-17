# mesh-memory setup

A shared memory substrate for your dev team's AI agents. Stores decisions,
patterns, tribal knowledge, and working context so Claude Code sessions
share institutional memory.

> **This kit is a starting point, not a product.** The slash commands
> and the reference taxonomy describe how *we* think about team memory.
> Your team's handoffs are different — you are expected to read the
> commands, edit them, and design your own memory kinds and anchor
> namespaces. `/mem-onboard` will walk you through it.

## What you need

- Docker + Docker Compose
- **An LLM API key** — see below (required for any real use)
- Claude Code with MCP support
- 5 minutes

## About the LLM key (required)

Every `write_memory` call routes through an LLM that classifies the note
(kind, lane, anchors, decay). Without a working provider, writes can't
be classified.

Supported providers (any OpenAI-compatible endpoint works):

| Provider | Where to get a key | Base URL |
|---|---|---|
| DashScope (Qwen, default) | <https://dashscope.console.aliyun.com/> | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| OpenAI | <https://platform.openai.com/> | `https://api.openai.com/v1` |
| Ollama (local) | run `ollama serve` locally | `http://host.docker.internal:11434/v1` |
| vLLM (local) | run `vllm serve …` locally | `http://host.docker.internal:8000/v1` |

> `LLM_PROVIDER=mock` exists **for mesh-memory's own development only** —
> it returns dummy classifications. Do not run a team on it.

## Install

### 1. Get the kit

You need `docker-compose.yml` and `.env.example`. Drop them somewhere
stable:

```bash
mkdir -p ~/.config/mesh-memory
cp docker-compose.yml .env.example ~/.config/mesh-memory/
cd ~/.config/mesh-memory
cp .env.example .env
```

### 2. Configure

Edit `~/.config/mesh-memory/.env` and set at minimum:

```bash
LLM_PROVIDER=qwen               # or openai / ollama / vllm
LLM_MODEL=qwen-plus             # any model your provider serves
DASHSCOPE_API_KEY=sk-…          # your key
# DASHSCOPE_BASE_URL=…          # override if not using DashScope
```

### 3. Start the stack

```bash
docker compose up -d
docker compose ps               # both services should be healthy
```

### 4. Mint an API token

```bash
docker compose exec mesh-server \
    /mesh-server provision-key --label my-laptop --role architect
```

Copy the printed token — **it is not recoverable**. Roles today are
coarse (`architect`, `lead`, `worker`); pick `architect` for a personal
key.

### 5. Wire the MCP bridge into Claude Code

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "mem-mcp": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i", "--network", "host",
        "-e", "MESH_API_URL=http://127.0.0.1:9080/graphql",
        "-e", "MESH_API_TOKEN=PASTE_TOKEN_HERE",
        "kexinlu/mesh-memory:mcp-latest"
      ]
    }
  }
}
```

### 6. Install the starter slash commands

```bash
cp commands/mem-*.md ~/.claude/commands/
```

You get `/mem-onboard`, `/mem-setup`, `/mem-recall`, `/mem-this`,
`/mem-status`. **These are templates.** See "Customize the commands"
below.

### 7. Restart Claude Code

So the new MCP server and commands get picked up.

### 8. Verify

```text
/mem-status
```

You should see containers up, server healthy, MCP connected, `0` memories.

## Design your taxonomy

mesh-memory ships empty. You decide what lives in it.

There are two registries you populate once per tenant:

- **Memory kinds** — the categories (`decision`, `pattern`, `finding`,
  `blocker`, …). Define what's worth recording and how long it should
  live.
- **Anchor namespaces** — how memories are indexed and found
  (`topic:*`, `workstream:*`, `gh:issue/###`, …). Anchors are how recall
  finds the right memory without full-text fishing.

Our reference shape for a foreman/worker dev team lives at
[`docs/memory-kinds/multi-agent-dev-team.md`](../docs/memory-kinds/multi-agent-dev-team.md).
It is an example, not a schema. A solo IC, a research team, or a
support rotation would each want a different shape.

**Easiest path:** in Claude Code, run `/mem-onboard`. It reads the
reference doc, interviews you about your team's handoff patterns, and
calls `create_memory_kind` + `create_anchor_namespace` for you.

**Manual path:** call the MCP tools yourself
(`create_memory_kind`, `create_anchor_namespace`). See
`list_memory_kinds` and `list_anchor_namespaces` to inspect current
state.

## Customize the commands

Open `~/.claude/commands/mem-*.md` and edit them. The shipped versions
describe *our* intended workflow — yours will differ. Examples:

- If your team uses a `spinoff` kind, teach `/mem-this` to suggest it
  when the note smells like a sidequest.
- If you always anchor to `gh:issue/###`, hard-code that lookup into
  `/mem-this` so recall stays consistent.
- If you don't run a foreman/worker split, rewrite `/mem-recall` to
  group by whatever roles *your* team actually has.

The commands are prompts, not code. You don't need to know Rust to
change them.

## Add to your project's CLAUDE.md

Paste into each project that should use mesh-memory, so Claude Code
reaches for the tools automatically:

```markdown
## Memory (mesh-memory)

This project uses mesh-memory for shared team knowledge. When the user
says "mem this", "remember this", or asks to store something, use the
`mcp__mem-mcp__*` tools.

Workflow:
1. `list_memory_kinds` — check available kinds
2. `list_anchor_namespaces` / `list_anchor_values` — discover anchors
3. `recall` with relevant filters — check if it already exists
4. `write_memory_direct` — write with optional `supersedes` for updates
```

## Troubleshooting

- **"classification error" on write** — LLM provider isn't reachable.
  Check `DASHSCOPE_API_KEY` and `DASHSCOPE_BASE_URL` in `.env`, then
  `docker compose restart mesh-server`.
- **"graphql response decode" error** — token is invalid. Re-provision
  with `provision-key`.
- **Connection refused** — `docker compose ps`; is `mesh-server`
  running and healthy?
- **MCP tools not showing** — restart Claude Code after editing
  `~/.claude.json`.
- **Writes succeed but recall finds nothing** — your kinds registry is
  empty. Run `/mem-onboard`.
