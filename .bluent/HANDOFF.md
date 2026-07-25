# Codex Handoff

This file is the operational entry point for continuing Bluent with Codex or another coding agent.

## Current Objective

Sprint 3 — Release Reliability and Compatibility is complete.

No new sprint is active. The next maintainer decision is release planning through the new protected workflow.

## Current Branch and Tracking

- Base branch: `Dev`
- Active branch: `Dev`
- Sprint 3 plan: `.bluent/sprints/sprint-03.md`
- Sprint issue: [#372](https://github.com/vrassouli/Bluent/issues/372) — completed
- Sprint completion: [PR #377](https://github.com/vrassouli/Bluent/pull/377) — merged
- AI-readiness epic: [#363](https://github.com/vrassouli/Bluent/issues/363)
- Remaining render-mode follow-ups: [#366](https://github.com/vrassouli/Bluent/issues/366)
- Release audit: `docs/releasing/release-workflow-audit.md`

## Read First

1. `AGENTS.md`
2. `.bluent/PROJECT.md`
3. this file
4. `.bluent/sprints/sprint-03.md`
5. `.bluent/QUALITY.md`
6. `.bluent/BACKLOG.md`
7. `RELEASING.md`
8. `CHANGELOG.md`
9. `docs/releasing/release-workflow-audit.md`
10. `docs/quality/compiler-warning-baseline.md`
11. `docs/compatibility/hosting-and-render-modes.md`

## Completed State

Merged through PR #377:

- explicit SemVer-driven release automation;
- artifact-only PR dry runs that cannot publish;
- validation of exactly five aligned NuGet packages;
- deterministic release notes sourced from `CHANGELOG.md`;
- protected production publication path requiring an exact matching tag;
- zero-warning Release baseline enforced by CI;
- 19 application tests and 4 release-tool tests;
- practical quality checks for links, workflow YAML, whitespace, package contents, dependencies, and focused rendered accessibility;
- compatibility evidence for static SSR, Interactive Server, Interactive WebAssembly, Interactive Auto, and standalone WebAssembly;
- contributor-ready Issues #374, #375, and #376.

No real tag, GitHub Release, or NuGet publication was created during Sprint 3.

## Next Decision: Release Planning

Before any production publication, the maintainer must:

1. choose the exact version;
2. choose preview or stable status;
3. review and finalize the matching `CHANGELOG.md` section;
4. create and protect the `nuget-production` GitHub environment;
5. add `NUGET_API_KEY` to that environment;
6. create the exact matching `v<version>` tag only after review;
7. explicitly authorize the production workflow run.

Do not infer or invent a release version.

## Deferred Work

- Issue #366 remains open for transient Interactive Server reconnection and exact Interactive Auto renderer-transition instrumentation.
- Issue #363 remains separate AI-readiness work.
- Community outreach, new public components, and Sprint 4 have not started.

## Constraints

- Do not publish a real NuGet release without explicit maintainer authorization.
- Do not create a release tag or GitHub Release without explicit authorization.
- Do not introduce new public APIs, product components, or package boundaries without approval.
- Preserve the zero-warning Release baseline.
- Do not claim compatibility, accessibility, or release validation without actual evidence.
- Keep changes focused and reviewable.

## Next Session

1. Start from current `Dev`.
2. Verify there are no unexpected open release pull requests.
3. Ask the maintainer to choose the release-planning direction before creating a branch.
4. Keep release planning separate from deferred compatibility and AI-readiness work.
