---
name: pr-green
description: Sweep every open, non-draft pull request authored by J4cku on J4cku/kool-v2, check CI, and drive red ones back to green by delegating each fix to a Sonnet subagent. Use when asked to check PR status, babysit PRs, make PRs green, or fix failing CI across open PRs.
---

# pr-green — keep my open PRs green

One sweep = one pass over every in-scope PR. The sweep itself is cheap and read-only;
all repair work is delegated to Sonnet subagents, one per red PR, running in parallel.

## Scope

In scope: pull requests on `J4cku/kool-v2` that are **open**, **not draft**, and
**authored by `J4cku`**.

Out of scope — never touch these:
- Draft PRs (red CI on a draft is expected, not a defect).
- PRs authored by anyone else, including `dependabot[bot]`.
- Any repository other than `J4cku/kool-v2`.

Find them with one search:

```
mcp__github__search_pull_requests
  query: "repo:J4cku/kool-v2 is:pr is:open draft:false author:J4cku"
```

If the search returns nothing, the sweep is done — report "no in-scope PRs" and stop.

## Step 1 — classify each PR

For each in-scope PR, read its CI state:

- `mcp__github__pull_request_read` method `get_check_runs` — the individual CI jobs.
- `mcp__github__pull_request_read` method `get` — for `mergeable_state` (catches
  merge conflicts, which CI alone will not show).

Classify into exactly one bucket:

| Bucket | Condition | Action |
|---|---|---|
| **green** | every check run `conclusion` is `success`, `neutral`, or `skipped`, and `mergeable_state` is not `dirty` | nothing |
| **pending** | any check is `queued` / `in_progress`, and none has failed | nothing this sweep — it is still running |
| **red** | any check `conclusion` is `failure`, `timed_out`, or `action_required` | delegate a fix |
| **conflicted** | `mergeable_state` is `dirty` | delegate a fix (merge conflict) |
| **no CI** | zero check runs on the head commit | report it; do not push blind |

Only red and conflicted PRs get a subagent. Everything else is reported, not acted on.

## Step 2 — check the attempt budget before delegating

Each repair leaves a marker comment on the PR containing the literal string
`<!-- pr-green-attempt -->`. Before delegating, count those markers via
`mcp__github__pull_request_read` method `get_comments`.

- **3 or more markers already present** → do not delegate again. This PR has resisted
  three repair attempts; post one comment saying the sweep is standing down and what
  is still failing, then leave it alone on all future sweeps.
- Fewer than 3 → proceed.

This budget is what stops a scheduled sweep from pushing the same broken fix forever.

## Step 3 — check whether the failure is actually ours

Before blaming the PR, check whether the same check is failing on `main`:
`mcp__github__actions_list` / `mcp__github__get_check_run` for the base branch head.

If the identical check is red on `main` too, the PR did not cause it. Post one comment
saying so, do not push anything, and move on. That is a legitimate "not mine" outcome.

## Step 4 — delegate each red PR to a Sonnet subagent

Launch every repair in **one message with multiple `Agent` tool calls** so they run
concurrently. One agent per PR, each with `model: sonnet` and
`subagent_type: general-purpose`, and each with `isolation: "worktree"` so parallel
agents never fight over the working tree.

Give each agent this brief, filled in for its PR:

```
Drive PR #<N> on J4cku/kool-v2 back to green CI.

Branch: <head ref>          Base: main
Failing checks: <names + conclusions>
Failing job logs: <fetch with mcp__github__get_job_logs, failed_only: true>

Repo context: Next.js 16 + TypeScript + Tailwind v4, pnpm, next-intl (pl default, en).
Read CLAUDE.md before changing anything — its conventions are binding.

Do this:
1. `git fetch origin <head ref> && git checkout <head ref>` then `pnpm install --frozen-lockfile`.
2. Reproduce the failure locally. Match the CI gate to its command:
   pnpm test · pnpm typecheck · pnpm lint · pnpm check:i18n · pnpm build · pnpm test:e2e
   (`pnpm check` runs typecheck + lint + i18n + build together).
   Playwright is preinstalled at /opt/pw-browsers — never run `playwright install`.
3. Fix the ROOT CAUSE.
4. Re-run the failing gate plus `pnpm check` and confirm both pass locally.
5. Commit with a message naming the gate you fixed, then
   `git push -u origin <head ref>` (retry on network failure: 2s, 4s, 8s, 16s).
6. Report back: what failed, why, what you changed, and whether you pushed.

Hard rules — breaking any of these is worse than leaving the PR red:
- NEVER skip, disable, quarantine, or `.only`/`.skip` a test to get green.
- NEVER weaken a CI gate: no edits to .github/workflows/, lighthouserc.json, or
  eslint/tsconfig strictness to dodge a failure.
- NEVER force-push, and never rewrite existing history on the branch.
- Do not widen the change beyond what the failure requires — no drive-by refactors.
- If the fix is ambiguous, or the failure is a genuine product decision rather than a
  defect, STOP and report instead of guessing.
- A job that died before any test body ran (checkout, dependency install, lost runner)
  is infrastructure: re-trigger it with mcp__github__actions_run_trigger and say so.
  Everything else gets root-caused — "flaky" is not a diagnosis.
```

For a **conflicted** PR the brief is the same, except the work is:
`git fetch origin main && git merge origin/main`, resolve the conflicts (regenerate
`pnpm-lock.yaml` with `pnpm install` rather than hand-merging it), run `pnpm check`,
push. Reply on the PR instead of guessing only when both sides changed the same logic
and picking one would lose behavior.

## Step 5 — leave a marker comment on every PR you touched

For each PR an agent pushed to or stood down on, post one comment via
`mcp__github__add_issue_comment`. Keep it short — what failed, what changed, current
state. It must contain the attempt marker and end with the attribution footer:

```
<!-- pr-green-attempt -->
**CI sweep** — `<check name>` was failing: <one-line cause>.
<what changed, or why nothing changed>. Re-running CI.

---
_Generated by [Claude Code](https://claude.ai/code)_
```

One comment per sweep per PR. Do not narrate individual steps into the thread.

## Step 6 — report

Finish with a compact table for the human: PR number, title, bucket, and what the
sweep did. If every in-scope PR is green, say exactly that in one line — a quiet sweep
should be quiet.

## Notes

- Pushing may reset an approval. That is an accepted cost; push the fix anyway.
- CI takes several minutes. A PR you just pushed to will read **pending** on the next
  sweep — that is correct, not a reason to push again.
