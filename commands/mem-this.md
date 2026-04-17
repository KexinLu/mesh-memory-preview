Template — customize for your team's workflow. This starter uses a
generic kind/lane/anchor heuristic. Once you've run `/mem-onboard`
and registered *your* taxonomy, edit this file: teach it which kinds
your team actually writes, which anchor namespaces to always attach,
and which lane each handoff typically lands in.

---

Write a memory to mesh-memory about whatever the user just discussed or is currently working on.

Steps:
1. Use `mcp__mem-mcp__list_memory_kinds` to see available kinds
2. Use `mcp__mem-mcp__list_anchor_namespaces` to see available anchor namespaces
3. Use `mcp__mem-mcp__recall` with relevant anchors/query to check if this memory already exists
4. If it exists, use `mcp__mem-mcp__write_memory_direct` with `supersedes` set to the existing memory id
5. If new, use `mcp__mem-mcp__write_memory_direct` to create it

Pick the most appropriate kind and lane:
- L1 (scratch): ephemeral — questions, status, findings
- L2 (working): medium-lived — briefs, plans, discoveries, blockers
- L3 (canonical): long-lived — decisions, patterns, constraints, tribal knowledge

Always add at least one `topic` anchor. Add `workstream` or `gh` anchors if relevant.
