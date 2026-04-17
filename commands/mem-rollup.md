Template — customize for your team's workflow. This starter walks a
rollup/promotion pass: collect a cluster of shorter-lived memories,
dissect them into atomic claims, dedupe against existing memories at
the target lane, and write new or superseding memories via
`writeMemoryDirect`. The agent does all the judgment; the server does
not classify. Edit this file to match how *your* team decides what's
canon.

---

# Shape

Rollup has three conceptual steps — keep them separable in your head
even though one slash command walks through all three:

1. **Collect** — deterministic: `recall` for the source cluster and
   the existing memories at the target lane. No judgment.
2. **Provision** — judgment: dissect the cluster into atomic claims,
   dedupe against the existing set, draft the writes. Today this is
   the agent's job. A classifier-backed deployment could in future
   delegate this to a server worker (briefing-close trigger) — if so,
   the drafts would still go through a review queue before step 3.
3. **Commit** — `writeMemoryDirect`. Always the same primitive, for
   both agent-driven and (future) worker-driven provisioners.

# Goal

Promote valuable shorter-lived knowledge into a longer-lived lane.
Given a cluster of memories tied by an anchor, a briefing, or a time
window, produce:

- **new memories** at the target lane for claims not already covered
- **supersedes** for existing target-lane memories that new evidence
  updates
- **discards** for noise — notes that were useful in the moment but
  aren't worth promoting

All writes go through `mcp__mem-mcp__write_memory_direct`. This command
works whether the deployment is classifier-backed or `LLM_PROVIDER=none`.

# Preflight

1. **MCP reachable?** Call `mcp__mem-mcp__list_memory_kinds`. If it
   errors, stop and point the user at `/mem-status`.
2. **Taxonomy ready?** If the registry is empty, send the user to
   `/mem-onboard` first — you have nowhere to promote *into*.

# Pick the target lane

Ask the user: promote **to L2 or L3**?

- **Target L3 (default, "canonical rollup"):** source = L1 ∪ L2.
  Validated findings, discoveries, decisions, and patterns worth
  keeping long-term. Dedupe against existing L3.
- **Target L2 ("validate into working notes"):** source = L1 only.
  Raw findings that have been confirmed enough to survive beyond the
  current session, but not yet canonical. Dedupe against existing L2.

L2→L2 is not a rollup; skip it. Offer L3 if the user is unsure.

# Pick the grouping signal

Ask the user which cluster they want to roll up. Accept any of:

- **Anchor:** `topic:auth_migration`, `workstream:ingest_v2`,
  `gh:issue/1423`, etc.
- **Briefing ID:** a closed or closing briefing's UUID. Everything
  tagged to it is a candidate.
- **Time window:** "everything in the last 7 days" — useful for
  weekly hygiene passes.

If the user doesn't specify, offer the anchor path as default and ask
which namespace:value they care about.

# Collect

Run two recalls. Keep the filters tight — casting too wide makes the
dissection step noisy.

Use the **source lanes** determined by the target:

| Target | Source lanes |
|---|---|
| L3 | `["L1", "L2"]` |
| L2 | `["L1"]` |

1. **The cluster to promote:**
   ```
   mcp__mem-mcp__recall
     anchors:  [<the chosen anchor>]     # or omit for briefing/window mode
     lanes:    <source lanes per table above>
     limit:    50                        # raise if the user asks
   ```
2. **Existing coverage at the target lane:**
   ```
   mcp__mem-mcp__recall
     anchors: [<the chosen anchor>]
     lanes:   [<target lane>]
     limit:   50
   ```

Show the user the two lists as concise tables (id, kind, lane, title)
so they can sanity-check scope before you spend tokens dissecting.

# Dissect

For each L1/L2 memory, extract **atomic** claims — one fact, decision,
constraint, or pattern per claim. A single finding often holds two or
three. Examples:

> L2 `discovery`: "We tried pg_trgm for fuzzy matching but it was 40×
> slower than the custom tokenizer, and the tokenizer needs a separate
> index on `normalized_name`."
>
> → atomic claims:
> - pattern: "use the custom tokenizer over pg_trgm for name-like fuzzy
>   match; pg_trgm was 40× slower in measurement"
> - constraint: "normalized_name requires its own index when using the
>   tokenizer"

Group atomic claims by proposed L3 kind (`decision`, `pattern`,
`constraint`, or whatever your tenant registered). Discard anything
that's truly ephemeral or already well-covered in L3.

# Dedupe against existing target-lane memories

For each proposed claim, compare against the existing target-lane list:

- **Covered and still accurate** → discard (or note as a
  reinforcement). Do not write a duplicate.
- **Covered but outdated** → propose a *supersedes*: new write at the
  target lane with `supersedes: <old_id>` set.
- **Not covered** → propose a *new* write at the target lane.

When in doubt, prefer fewer, sharper memories over many thin ones.
Higher lanes are read more than they are written — noise here hurts
recall later.

# Preview

Before writing anything, show the user a plan:

```
Rollup preview (anchor: workstream:ingest_v2)

Sources:
  L1/L2 in scope: 12 memories
  L3 already covering this anchor: 3 memories

Plan:
  NEW     pattern    "use custom tokenizer over pg_trgm for fuzzy names"
  NEW     constraint "normalized_name requires its own index"
  UPDATE  decision   (supersedes <mem_id_abc>) "batch size raised from 100 to 500 after throughput test"
  DISCARD 9 memories (ephemeral / already covered)

Proceed? [y/n]
```

**Wait for the user to confirm.** Let them edit the plan — drop items,
reword titles, change kind assignments — before any write happens.

# Write

On confirm, for each NEW / UPDATE entry, call:

```
mcp__mem-mcp__write_memory_direct
  lane:        "<target lane>"
  kind:        "<the chosen kind>"
  title:       "<concise, grep-friendly>"
  summary:     "<one or two sentences>"
  content:     "<full claim with enough context to stand alone>"
  anchors:     [<inherit the grouping anchor plus any others>]
  supersedes:  <only for UPDATE entries>
  refs:        [<optional — the L1/L2 memory ids that sourced this>]
```

Report each write's result (id) as you go. If one fails (e.g. kind
isn't registered), stop and ask the user — do not silently skip.

# Verify

After writes, run the target-lane recall again and show the user the
final picture for this anchor. This is the "did we end up in a
sensible place" check.

# Close the loop (optional)

If the source was a briefing, ask the user whether to close it now
(`mcp__mem-mcp__close_briefing`). If it was a time-window pass,
suggest anchor-tagging the promoted notes so the next rollup skips
them.

**Remember:** this command's dissection heuristic is generic. Edit it
to match how *your* team talks about canonical-worthy evidence —
what's a pattern vs. a decision, when supersedes is warranted, how
aggressive to be about discarding.
