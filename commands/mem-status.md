Check the health of the mesh-memory stack.

1. Check if containers are running: `docker ps --filter name=mesh --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"`
2. Check mesh-server logs for errors: `docker compose -f ~/.config/mesh-memory/docker-compose.yml logs --tail 20 mesh-server 2>/dev/null || docker logs mesh-memory-mesh-server-1 --tail 20 2>/dev/null`
3. Test the GraphQL endpoint: `curl -s http://localhost:9080/graphql -X POST -H "Content-Type: application/json" -d '{"query":"{ __typename }"}'`
4. Try a recall via MCP: `mcp__mem-mcp__recall` with no filters
5. Report: containers up/down, server healthy/unhealthy, MCP connected/disconnected, memory count
