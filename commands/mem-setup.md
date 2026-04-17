Template — customize for your team's deployment. This starter covers
the first-time bring-up on a single machine (Docker + Docker Compose).
If your team runs a shared mesh-server, uses a non-Docker runtime, or
keeps config elsewhere, rewrite these steps.

---

Bring up mesh-memory on this machine from scratch and wire it into
Claude Code. Work through these steps in order; report each result
before moving on.

# 0. Preflight

- `docker info` — confirm Docker daemon is running.
- `docker compose version` — confirm Compose v2 is available.
- Ask the user for the path to their local clone of the
  `mesh-memory-preview` repo (default:
  `~/LocalWork/mesh-memory-preview` or whatever the user just
  cloned). If the directory has no `docker-compose.yml`, stop and
  tell them to clone it first:
  `git clone https://github.com/KexinLu/mesh-memory-preview.git`.

All subsequent commands run from inside that directory.

# 1. Configure `.env`

- If `.env` does not exist, copy the template:
  `cp .env.example .env`.
- Read the current `.env`, show the user the LLM-related lines, and
  ask whether they want:
  - **Classifier-backed** (`LLM_PROVIDER=qwen` + an API key), or
  - **Agent-as-gate** (`LLM_PROVIDER=none`, no key needed — only
    `writeMemoryDirect` is available, but that's the path the shipped
    slash commands use anyway).
- For classifier-backed, prompt for `DASHSCOPE_API_KEY` (or their
  provider's key) and set it in `.env`. Remind the user you will
  not log or transmit the key anywhere.
- For agent-as-gate, just set `LLM_PROVIDER=none` and clear any
  stale key lines.

# 2. Start the stack

- `docker compose up -d`
- Poll `docker compose ps` until both services report healthy /
  running. Abort if a service logs errors — `docker compose logs
  mesh-server` is the first place to look.

# 3. Mint an API token

- Run:
  `docker compose exec mesh-server /mesh-server provision-key --label claude-code --role architect`
- **Capture the stdout exactly.** It contains four lines:
  `tenant_id`, `role`, `label`, `token`. The token cannot be
  recovered — if we lose it now, we have to re-provision.
- Surface the token back to the user in a clearly-labeled code block
  so they can copy it:
  ```
  ╔═══ COPY THIS TOKEN — CANNOT BE RECOVERED ═══╗
    mesh_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  ╚══════════════════════════════════════════════╝
  ```

# 4. Configure the Claude Code MCP bridge

- Print the exact JSON block the user needs to add under
  `mcpServers` in `~/.claude.json`, with the token already
  substituted in:

  ```json
  "mem-mcp": {
    "type": "stdio",
    "command": "docker",
    "args": [
      "run", "--rm", "-i", "--network", "host",
      "-e", "MESH_API_URL=http://127.0.0.1:9080/graphql",
      "-e", "MESH_API_TOKEN=<the-token-from-step-3>",
      "kexinlu/mesh-memory:mcp-0.1.1-preview"
    ]
  }
  ```

- Tell the user: open `~/.claude.json`, locate the `mcpServers`
  object (create it if missing), and paste this block in. Do **not**
  write to `~/.claude.json` yourself — editing someone's shared
  Claude Code config silently is too magical. The copy-paste path
  is safer and teaches the user where the config lives.

# 5. Install the starter slash commands

- `mkdir -p ~/.claude/commands`
- `cp commands/*.md ~/.claude/commands/`
- Confirm via `ls ~/.claude/commands/mem-*.md`. These are
  templates — see `README.md` for how to customize them to your
  team's workflow.

# 6. Restart boundary

Tell the user:

> Restart your Claude Code session so the MCP bridge is picked up.
> After restart, run `/mem-status` to confirm the connection, then
> `/mem-onboard` to design your tenant's memory-kind taxonomy.

This command cannot verify the MCP connection itself — the restart
ends the session. That's what `/mem-status` is for.

---

If any step fails, stop there and diagnose. Do not try to recover
by skipping ahead — a half-configured stack is worse than a clean
abort. Common failures:

- **Docker daemon not running** → user starts Docker Desktop (macOS/
  Windows) or `systemctl start docker` (Linux).
- **Port 9080 already bound** → set `MESH_PORT=9081` (or similar) in
  `.env` and restart the stack.
- **Image pull fails** → check network; `docker pull
  kexinlu/mesh-memory:server-0.1.1-preview` directly to see the real
  error.
- **`provision-key` fails with migration errors** → the DB volume
  may be stale. `docker compose down -v` (wipes data) then restart.
