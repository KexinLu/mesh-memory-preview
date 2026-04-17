# mesh-memory — Bootstrap

You are Claude Code, and the user has asked you to install mesh-memory
from scratch. Execute the following steps **in order**. Do not skip
ahead. Report each step's result before moving on.

## 0. Preflight

- `docker info` — confirm the Docker daemon is running.
- `docker compose version` — confirm Compose v2 is available.

If either check fails, stop and tell the user to start Docker Desktop
(macOS/Windows) or `systemctl start docker` (Linux). Do not continue.

## 1. Clone (or refresh) the preview repo at `~/.mesh-memory`

- If `~/.mesh-memory/.git` does **not** exist:
  ```bash
  git clone https://github.com/KexinLu/mesh-memory-preview.git ~/.mesh-memory
  ```

- If it already exists, refresh it:
  ```bash
  cd ~/.mesh-memory && git pull --ff-only
  ```

- Working directory for all subsequent commands is `~/.mesh-memory`.

## 2. Run the setup command

Now read and execute the instructions in `~/.mesh-memory/commands/mem-setup.md`
**starting from Step 1 (Configure `.env`)**. You already handled Step 0
(preflight) and the repo-location question above, so skip those.

Key points `mem-setup.md` will walk you through:

- `.env` bootstrap (pick classifier-backed vs agent-as-gate mode)
- `docker compose up -d`
- `provision-key` — surface the token to the user in a copy-friendly box
- Print the MCP bridge JSON snippet with the token substituted
- `cp commands/*.md ~/.claude/commands/`
- Tell the user to restart Claude Code

## 3. Confirm

After the user has pasted the MCP block into `~/.claude.json` and
restarted Claude Code, they can run `/mem-status` in the new session to
verify the connection, then `/mem-onboard` to design their tenant's
memory-kind taxonomy.

---

**Invariants:**

- Never write to `~/.claude.json` programmatically — always show the
  JSON block and let the user paste. MCP configs are shared across
  servers; silent edits are dangerous.
- Never log or transmit the DashScope / OpenAI API key anywhere. It
  lives only in `~/.mesh-memory/.env`.
- If any step fails, stop and diagnose before continuing. A
  half-configured stack is worse than a clean abort.
