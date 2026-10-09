# Bluent v3 Branch Isolation and Release Policy

> **Status: mandatory for all tasks under [Epic #416](https://github.com/vrassouli/Bluent/issues/416).**
>
> **Version 2.x is frozen with respect to v3 work. No v3 commit, feature, docs/skill update, CI change or prerelease is to be merged into the current `Dev` (default), `main`, a stable/release branch, or published as a stable 2.x update before explicit maintainer-approved v3 completion.**

## Branch topology

- **Protected baseline**: `Dev` and current 2.x release lines remain untouched by work relating to v3.
- **Long-lived v3 integration branch**: `bluent-v3`, created directly from the existing `Dev` baseline on 2026-10-09.
- **Isolated task branches**: create each task branch from the current `bluent-v3` head, e.g. `v3/issue-417-css-architecture` or `v3/issue-428-button`.
- **Pull requests**: target `bluent-v3`, never `Dev`/stable. After review, squash/merge task PRs **only into `bluent-v3`**.
- **Penpot, documentation, Skills, CSS/token pipeline, demo, tests, code and migration samples** all follow this policy; no exception for “documentation-only” work.
- **Do not cherry-pick or forward-merge any v3 work into v2 branches** while the epic is underway.
- **Avoid reverse merging v2 work into v3 unless required, separately reviewed, and performed by an explicit integration task**. Keep branch movement intentional.

## Operational workflow

1. Before coding, verify the local workspace/working tree and run `git status --short`. Never discard unrelated uncommitted changes.
2. Fetch `bluent-v3` and create a new `v3/issue-<number>-<topic>` branch from it, or use a dedicated worktree if the existing checkout has unrelated work.
3. PR base must explicitly be `bluent-v3`, and PR descriptions must link Epic #416 and the corresponding implementation issue.
4. CI/tests/demos run on v3 branches and the integration branch; production/stable package publishing from v3 commits is **disabled by policy** unless separately authorized for an explicitly marked prerelease.
5. v3 work is complete only when the audited inventory, Penpot designs, code, docs/Skills, comprehensive demo/tests, migrations and release gates are satisfied and the maintainer explicitly approves the final integration.
6. At that point **plan and approve a separate v3 integration/release PR** into the chosen production/default branch. Nothing merges back solely because a component/phase issue is Done.

## Guardrails / evidence

- The default branch stays `Dev` during v3 development.
- Existing stable NuGet package(s) and demo(s) must remain available; do not retarget stable CI deployments to v3.
- Target-branch reviews are mandatory in the manual workflow; add or strengthen GitHub branch protection / rulesets when available. **This document is a policy, not proof that server-side protection is configured.**
- A manual exception needs the maintainer's explicit approval, documented in the relevant issue, with rationale and rollback plan.

## Project workflow

The existing approval gates still apply: **Backlog → Analysis → Ready → In Progress → Review → Done**, and Analysis must never be auto-processed.

References: Epic #416, foundation #417–#425, release planning #427.
