Template — customize for your team's workflow. This starter describes a
generic recall flow; edit it to reflect the kinds, anchors, and lanes
*your* tenant actually uses.

---

Recall memories from mesh-memory. Use the `mcp__mem-mcp__recall` tool.

If the user provided a query or topic, pass it as the `query` parameter.
If they mentioned a kind (decision, pattern, tribal, etc.), filter by `kinds`.
If they mentioned a lane (L1, L2, L3), filter by `lanes`.
If they mentioned anchors (topic, workstream, gh), filter by `anchors`.

Default: recall all with no filters and present a summary grouped by kind.
