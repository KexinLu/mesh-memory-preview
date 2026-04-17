Template — customize for your team's workflow. This starter walks a new
mesh-memory tenant through designing their own memory-kind taxonomy and
anchor namespaces by interviewing the user. It is **not** a one-shot
provisioning script — it is a conversation. Do not skip ahead.

---

# Goal

Help the user design and register:

1. A **memory-kind registry** — the categories of notes this team cares
   about (e.g. `decision`, `finding`, `blocker`), with a decay lane for
   each (L1 scratch / L2 working / L3 canonical).
2. An **anchor-namespace registry** — how those notes get indexed for
   recall (e.g. `topic:*`, `gh:issue/###`, `workstream:*`).

Then call `mcp__mem-mcp__create_memory_kind` and
`mcp__mem-mcp__create_anchor_namespace` to persist the result.

# Preflight

Before interviewing, do these in order:

1. **Confirm MCP is reachable.** Call
   `mcp__mem-mcp__list_memory_kinds`. If this errors, stop and tell
   the user to check `docker compose ps` and their `~/.claude.json`
   MCP config; `/mem-status` can help diagnose.
2. **Check existing state.** If the registry already has kinds or
   namespaces, show them to the user and ask whether they want to
   **extend** or **start over**. Do not silently overwrite.
3. **Confirm how writes will be classified.** Ask which
   `LLM_PROVIDER` the stack is running with:
   - **`qwen`** (default): the server classifies every write. Confirm
     they've set `DASHSCOPE_API_KEY` (or their provider's key) in
     `~/.config/mesh-memory/.env` and restarted. Without it, writes
     fail with "classification error." Do not create kinds for a stack
     that can't actually write.
   - **`none`**: agent-as-gate mode — only `writeMemoryDirect` is
     available. No LLM key is needed, but the calling agent (the
     customized `/mem-this`) must pick kind/lane/anchors itself.
   - **`mock`**: flag it as dev-only and suggest switching before
     provisioning a real taxonomy.

# Concepts to teach (keep it brief)

Explain in your own words, tailored to the user's level:

- **Kind** = the *category* of the note. Chosen per-write. Drives
  which role is allowed to write it and how long it lives.
- **Lane** = decay band. L1 disposable (hours/days), L2 working
  (days/weeks, tied to a ticket), L3 canonical (long-lived —
  decisions, constraints, patterns). Each kind has a primary lane.
- **Anchor** = a structured tag the memory is filed under. Always
  `namespace:value` (e.g. `topic:auth_migration`, `gh:issue/1423`).
  Recall is anchor-driven; without good anchors, `recall` can't find
  what you wrote. Namespaces are registered centrally so typos and
  naming drift are rejected at write time.

Point them at the reference taxonomy for a concrete worked example:

> A foreman/worker dev-team example lives at
> `docs/memory-kinds/multi-agent-dev-team.md` in the mesh-memory
> repo. It's one shape — yours will differ.

# The interview

Ask these one at a time, not as a batch. Adjust based on answers.

1. **Who writes memories?** Solo IC, pair, small team, multi-role
   (architect / lead / worker / ops)? How many distinct "roles" does
   the user recognize in their own workflow?
2. **Where are the handoff points?** PR review? Sprint planning?
   On-call rotation? Standup? Incident retros? Each durable handoff
   is a candidate kind.
3. **What do you lose today?** Ask: "What's the thing you wish your
   teammate or future-self had written down three months ago?" Listen
   for: decisions, gotchas, why-we-didn't-do-X, tribal knowledge
   about a system. These map to L3 kinds.
4. **What's noisy but useful short-term?** Mid-flight questions,
   status updates, raw findings — these map to L1.
5. **What external systems have stable IDs?** GitHub issues, Linear,
   Jira, Slack threads, internal ticket tools, RFC docs? Each stable
   ID source is a candidate anchor namespace.
6. **Any team-internal slugs?** Workstream names, project codenames,
   product areas? These become anchor namespaces too
   (`workstream:*`, `area:*`).

# Propose a draft

Based on the conversation, draft a table and show it to the user:

```
Kinds
─────
name            lane   writer    reader    purpose
decision        L3     anyone    anyone    why we chose X
pattern         L3     anyone    anyone    reusable recipe
finding         L1     worker    self      raw observation, may rot
blocker         L2     anyone    lead      progress is blocked
…

Anchor namespaces
─────────────────
name        description
topic       free-form slug per subject area
gh          GitHub issue/PR references (gh:issue/123, gh:pr/456)
workstream  team-internal workstream slug
…
```

**Iterate.** Ask: "Does this match how you actually work? What's
missing? What should we cut?" Revise until the user confirms.

# Create

For each approved kind, call:

```
mcp__mem-mcp__create_memory_kind
    name: "<name>"
    description: "<one-line purpose, lane hint, writer/reader>"
```

Names must match `^[a-z][a-z0-9_]{0,62}$` — lowercase, underscores
allowed, no spaces or hyphens.

For each approved namespace, call:

```
mcp__mem-mcp__create_anchor_namespace
    name: "<name>"
    description: "<what values look like, e.g. 'gh:issue/### or gh:pr/###'>"
```

If any call fails with "already exists", skip it — the user said
they wanted to extend, not overwrite.

# Verify

After all creates, call `mcp__mem-mcp__list_memory_kinds` and
`mcp__mem-mcp__list_anchor_namespaces` and show the final registry
to the user.

# Next step

Tell the user:

> Your tenant's taxonomy is registered. Try `/mem-this` on something
> you want to remember — it will call `list_memory_kinds` to pick
> the right kind, then write. If the kind you wanted isn't there,
> come back to this command and extend.

**Remember:** this command itself is a template. If the interview
questions above don't fit how your team actually talks about
memory, edit this file.
