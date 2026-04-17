Set up mesh-memory for this machine. Follow these steps in order:

1. Check if Docker is running: `docker info`
2. Check if mesh-memory is already running: `docker ps --filter name=mesh`
3. If not running, look for docker-compose.yml and .env in ~/.config/mesh-memory/. If missing, tell the user to copy them from the deploy kit.
4. Start the stack: `cd ~/.config/mesh-memory && docker compose up -d`
5. Wait for healthy: `docker compose -f ~/.config/mesh-memory/docker-compose.yml ps`
6. Provision an API key: `docker compose -f ~/.config/mesh-memory/docker-compose.yml exec mesh-server /mesh-server provision-key --label claude-code --role architect`
7. Save the token. Configure the MCP bridge in ~/.claude.json under mcpServers:
   ```json
   {
     "mcpServers": {
       "mem-mcp": {
         "type": "docker",
         "command": "docker",
         "args": ["run", "--rm", "-i", "--network", "host",
                  "-e", "MESH_API_URL=http://127.0.0.1:9080/graphql",
                  "-e", "MESH_API_TOKEN=<the-token-from-step-6>",
                  "kexinlu/mesh-memory:mcp-latest"]
       }
     }
   }
   ```
8. Tell the user to restart their Claude Code session so the MCP server is picked up.
9. Verify by calling `mcp__mem-mcp__recall` with no filters.

Report each step's result as you go. If anything fails, diagnose and suggest fixes before continuing.
