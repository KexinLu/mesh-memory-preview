Template — customize for your team's workflow. This starter imports
Claude Code's per-project auto-memory (`MEMORY.md` + its linked files)
into mesh-memory, with idempotent re-runs. The agent classifies each
entry into your tenant's taxonomy; it does **not** map 1:1 onto
Claude Code's four fixed frontmatter types. Edit this file to match
how *your* team wants personal memory to land in shared storage.

---

# Goal

A teammate has been using Claude Code's built-in memory for a while
(`~/.claude/projects/<slug>/memory/MEMORY.md` + per-memory `.md`
files). They want to port those into mesh-memory, where they'll
survive session resets and be recallable via `/mem-this`, `/mem-rollup`,
and the rest of the kit. Re-running this command should sync changes
without duplicating.

# Preflight

1. **MCP reachable?** Call `mcp__mem-mcp__list_memory_kinds`. Bail to
   `/mem-status` if it errors.
2. **Locate the source.** By default look at
   `~/.claude/projects/<current-project-slug>/memory/MEMORY.md`. If
   the user wants to import a different project's memory, ask for
   the path. Read the index + every linked `.md` file under the same
   directory.
3. **Privacy reminder (light).** Each teammate runs their own
   Postgres via `docker compose`, so imported memory stays on their
   machine. Still — warn the user if they're pointing at a project
   slug other than their own.

# Step 1 — Propose the taxonomy

Read the whole corpus before writing anything. For each file, note
the frontmatter (`name`, `description`, `type`) and skim the body.
Based on the *actual content you see*, propose:

- **4–8 memory kinds** that capture the themes. Do **not** mechanically
  map Claude Code's four fixed types (`user`, `feedback`, `project`,
  `reference`) onto kinds — some memories in `type: project` are
  really decisions, some `type: feedback` are really constraints,
  etc. Propose kinds based on what the memories are *about*.
- **2–4 anchor namespaces** for the content you see — typically
  `topic:` for subject slugs and `claude_memory:` for import
  provenance (see idempotency below). Add `workstream:`, `gh:`,
  etc. only if content justifies them.

Show the proposal as a table with the user:

```
Proposed kinds (derived from 15 imported memories):
  preference    collaboration style / terse mode / reply shape   → L3
  decision      "we chose X over Y because Z"                     → L3
  constraint    hard invariants, external reqs                    → L3
  discovery     validated finding tied to a workstream            → L2
  session_log   per-session context snapshots                     → L2

Proposed anchor namespaces:
  topic           free-form subject slug
  claude_memory   import provenance (one per source file)
  workstream      team-internal workstream
```

**Iterate.** Let the user edit names, drop kinds, merge. Then for
each kind/namespace that does **not** already exist in the registry,
call `mcp__mem-mcp__create_memory_kind` /
`mcp__mem-mcp__create_anchor_namespace`. Skip the ones that already
exist.

# Step 2 — Classify each memory

For every source file, produce a draft mesh write:

- **kind:** pick from the registry (including the ones you just
  registered). Use the frontmatter `type` as a hint, not a rule.
- **lane:** default per kind (most user/feedback/reference → L3;
  project/session → L2). Downgrade anything that reads like a
  quick-status note to L1.
- **title:** the frontmatter `name`.
- **summary:** the frontmatter `description` (or the first sentence
  of the body if missing).
- **content:** the body, prefixed with a one-line attribution:
  `_Imported from ~/.claude/projects/<slug>/memory/<filename>._`
- **anchors:** always include a stable `claude_memory:<filename-
  without-extension>` anchor; additionally pick 1–2 `topic:*`
  anchors based on content.

Show the full classification table to the user. Don't burn tokens
on individual bodies unless the user wants a spot check.

# Step 3 — Dedupe for idempotency

For each proposed write, recall against the stable anchor:

```
mcp__mem-mcp__recall
  anchors: [claude_memory:<slug>]
  limit:   1
```

Classify the outcome:

- **No match** → NEW write.
- **Match, content identical** → SKIP (report "unchanged").
- **Match, content differs** → UPDATE. The new write gets
  `supersedes: <the matched memory's id>`, and the stable
  `claude_memory:<slug>` anchor carries forward so the next re-run
  finds the latest version.

"Content identical" is a judgment call, not a hash. Small whitespace
or wording changes shouldn't churn writes; material changes should.
When unsure, ask the user per row or group.

# Step 4 — Preview

Before writing anything, show the user:

```
Import preview (source: ~/.claude/projects/<slug>/memory/)

  NEW     8   (first-time imports)
  UPDATE  2   (content drifted since last sync)
  SKIP    5   (already present, unchanged)

  Target tenant:  <tenant_id>
  Target project: <project_id or "<root — no project scope>">

Proceed? [y/n]
```

Offer the user a chance to scope the writes to a specific mesh
project (`mcp__mem-mcp__create_project` if they want a new one) so
the import doesn't pollute the tenant root.

# Step 5 — Write

On confirm, loop:

```
mcp__mem-mcp__write_memory_direct
  lane:        "<per step 2>"
  kind:        "<per step 2>"
  title:       "<name>"
  summary:     "<description>"
  content:     "<body with attribution prefix>"
  anchors:     [claude_memory:<slug>, topic:<slug>, …]
  project_id:  "<optional scope>"
  supersedes:  "<only for UPDATE>"
```

Report each write's id as you go. If one fails, stop — don't silently
leave a half-imported state.

# Step 6 — Verify

After writes, recall `anchors: [claude_memory:*]` scoped to the
target project (if any) and show the count vs. expected. This
catches the case where the write path silently dropped something.

Tell the user:

> Re-running this command later will pick up new and changed files
> under `~/.claude/projects/<slug>/memory/` and skip anything
> unchanged. The `claude_memory:<slug>` anchor is how the sync
> stays idempotent — don't remove it on the imported memories or
> you'll get duplicates next time.

**Remember:** the taxonomy-proposal step is the one most worth
editing. A team that already ran `/mem-onboard` should reuse its
existing kinds instead of letting this command invent parallel ones.
