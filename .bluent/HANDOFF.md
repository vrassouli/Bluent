# Codex Handoff

This file is the operational entry point for continuing Bluent with Codex or another coding agent.

## Current Objective

Prepare the first stable release through the protected Sprint 3 workflow,
tracked in [Issue #379](https://github.com/vrassouli/Bluent/issues/379).

The preparation must not publish packages or create a tag or GitHub Release.

## Current Branch and Tracking

- Base branch: `Dev`
- Active branch: `release/stable-release-preparation`
- Release-preparation issue:
  [#379](https://github.com/vrassouli/Bluent/issues/379)
- Preparation pull request:
  [#380](https://github.com/vrassouli/Bluent/pull/380) — draft
- Sprint 3 plan: `.bluent/sprints/sprint-03.md`
- Sprint issue: [#372](https://github.com/vrassouli/Bluent/issues/372) — completed
- Sprint completion: [PR #377](https://github.com/vrassouli/Bluent/pull/377) — merged
- Closeout pull request: [PR #378](https://github.com/vrassouli/Bluent/pull/378) — merged
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
10. `docs/releasing/stable-release-readiness.md`
11. `docs/quality/compiler-warning-baseline.md`
12. `docs/compatibility/hosting-and-render-modes.md`

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

## Current Release-Preparation State

- PRs #377 and #378 are merged and there were no open pull requests when the
  preparation branch was created from `Dev` commit `23bf85e`.
- All five packages have a newer published version than the Sprint 3 audit
  recorded: legacy `master`-push run #366 published aligned `1.0.366` packages
  on 2026-07-25 before the replacement workflow merged.
- `1.0.366` is immutable and cannot be reused.
- The evidence-based recommendation is stable `1.0.367`, pending explicit
  maintainer approval.
- No consumer migration is required by the audited post-`1.0.366` changes.
- The required `nuget-production` environment is not visible in public GitHub
  metadata. Secret presence cannot be verified through public metadata.
- The detailed evidence and remaining checks are in
  `docs/releasing/stable-release-readiness.md`.

Before any production publication, the maintainer still must:

1. approve or replace the proposed exact version;
2. review and finalize the matching `CHANGELOG.md` section;
3. create and protect the `nuget-production` GitHub environment;
4. add `NUGET_API_KEY` to that environment;
5. create the exact matching `v<version>` tag only after review;
6. explicitly authorize the production workflow run.

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

1. Record clean Quality and Release packages workflow evidence for PR #380.
2. Inspect the uploaded package-validation report and deterministic notes.
3. Update the issue and PR with final CI evidence.
4. Leave the pull request open for the maintainer's version and prerequisite
   decisions.
