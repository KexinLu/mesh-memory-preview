# mesh-memory setup guide

## What you get

mesh-memory is a shared memory substrate for your dev team's AI agents. It stores decisions, patterns, tribal knowledge, and working context so Claude Code sessions share institutional memory.

## Quick start

### 1. Get the files

You need two files — `docker-compose.yml` and `.env.example`. Place them in `~/.config/mesh-memory/`:

```bash
mkdir -p ~/.config/mesh-memory
cp docker-compose.yml .env.example ~/.config/mesh-memory/
cd ~/.config/mesh-memory
cp .env.example .env
```

### 2. Configure

Edit `~/.config/mesh-memory/.env`:

```bash
# Required: pick your LLM provider
LLM_PROVIDER=qwen
DASHSCOPE_API_KEY=sk-your-key-here

# Or use mock mode (no LLM needed, good for testing)
LLM_PROVIDER=mock
```

### 3. Start the stack

```bash
cd ~/.config/mesh-memory
docker compose up -d
```

### 4. Provision an API key

```bash
docker compose exec mesh-server /mesh-server provision-key --label my-key --role architect
```

Save the printed token — you cannot recover it later.

### 5. Configure Claude Code

Add the MCP bridge to `~/.claude.json`:

```json
{
  "mcpServers": {
    "mem-mcp": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i", "--network", "host",
        "-e", "MESH_API_URL=http://127.0.0.1:9080/graphql",
        "-e", "MESH_API_TOKEN=YOUR_TOKEN_HERE",
        "kexinlu/mesh-memory:mcp-latest"
      ]
    }
  }
}
```

Replace `YOUR_TOKEN_HERE` with the token from step 4.

### 6. Install slash commands

Copy the commands to your Claude Code commands directory:

```bash
cp commands/mem-*.md ~/.claude/commands/
```

This gives you: `/mem-setup`, `/mem-recall`, `/mem-this`, `/mem-status`.

### 7. Restart Claude Code

Restart your Claude Code session so it picks up the new MCP server.

### 8. Verify

In Claude Code, type `/mem-status` or just say "mem recall" to check the connection.

## Add to your project's CLAUDE.md

Paste this snippet into your project's CLAUDE.md so Claude Code knows how to use mesh-memory:

```markdown
## Memory (mesh-memory)

This project uses mesh-memory for shared team knowledge. When the user says
"mem this", "remember this", or asks to store something, use the
`mcp__mem-mcp__*` tools.

Workflow:
1. `list_memory_kinds` — check available kinds
2. `list_anchor_namespaces` / `list_anchor_values` — discover anchors
3. `recall` with relevant filters — check if it already exists
4. `write_memory_direct` — write with optional `supersedes` for updates
```

## Troubleshooting

- **"graphql response decode" error**: Token is invalid. Re-provision with `provision-key`.
- **Connection refused**: Check `docker compose ps` — is mesh-server running?
- **MCP tools not showing**: Restart Claude Code session after editing `~/.claude.json`.
