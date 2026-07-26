# Codex Handoff

This file is the operational entry point for continuing Bluent with Codex or another coding agent.

## Current Objective

Complete the canonical task-oriented examples and compilation gate tracked in
[Issue #391](https://github.com/vrassouli/Bluent/issues/391) and
[Issue #392](https://github.com/vrassouli/Bluent/issues/392).

This work does not publish packages, create a tag or GitHub Release, add public
APIs, or include the reference application and benchmark issues.

## Current Branch and Tracking

- Base branch: `Dev`
- Active branch: `Dev`
- Example issues: [#391](https://github.com/vrassouli/Bluent/issues/391) and
  [#392](https://github.com/vrassouli/Bluent/issues/392)
- Sprint 4 plan: `.bluent/sprints/sprint-04.md`
- Pull request: pending
- Related release issue: [#381](https://github.com/vrassouli/Bluent/issues/381)
- Preparation issue:
  [#379](https://github.com/vrassouli/Bluent/issues/379) — completed
- Preparation pull request:
  [#380](https://github.com/vrassouli/Bluent/pull/380) — merged
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
4. `.bluent/sprints/sprint-04.md`
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

## Active Work State

- A standalone `samples/Bluent.TaskExamples` WebAssembly consumer contains ten
  task-oriented examples and does not reference the demo projects.
- Canonical pages under `docs/examples/tasks` link directly to the compiled
  source and cover package, namespace, setup, assets, behavior, mistakes,
  render modes, and evidence.
- Quality CI now runs `scripts/quality/check_task_examples.sh`.
- The focused validator builds all examples and proves drift detection with an
  opt-in invalid source whose compiler failure must name the source file.
- Local validation passed: focused validator, 48-file Markdown link check,
  tool/solution restore, zero-warning Release build, 19 application tests, 13
  release-tool tests, workflow YAML parsing, and `git diff --check`.
- Runtime, visual, deployment, package, and external CI results are not
  claimed.

## Current Release State

- PR #380 is merged into `Dev`; `release/1.0.367` was created from merge commit
  `f1cb349`.
- All five packages have a newer published version than the Sprint 3 audit
  recorded: legacy `master`-push run #366 published aligned `1.0.366` packages
  on 2026-07-25 before the replacement workflow merged.
- `1.0.366` is immutable and cannot be reused.
- The maintainer approved stable version `1.0.367` with release date
  2026-07-26.
- The five existing published package IDs remain `Bluent.UI.Core`, `Bluent.UI`,
  `Bluent.UI.Charts`, `Bluent.UI.Diagrams`, and `Bluent.UI.Utilities`.
- References to `Bluent.Core` as a NuGet package ID in Issue #381 are typos;
  there is no package rename in this release.
- No consumer migration is required by the audited post-`1.0.366` changes.
- The maintainer confirmed that `nuget-production` exists and its
  `NUGET_API_KEY` environment secret is configured. The secret value must not
  be inspected.
- The detailed evidence and remaining checks are in
  `docs/releasing/stable-release-readiness.md`.
- The packaged README now uses a NuGet.org-trusted, commit-pinned screenshot
  URL. Release validation checks every packaged README and rejects relative or
  untrusted image sources.
- PR #380 commit `927dd20` passed Quality run #30189474232 and Release packages
  run #30189474228. Downloaded artifact `bluent-0.0.0-ci.378` contained exactly
  five aligned packages, the validation report, and deterministic notes. Every
  package README recorded only the five expected trusted image sources; both
  publication jobs were skipped.

Before any production publication, the maintainer still must:

1. review and merge the final release pull request;
2. explicitly authorize an annotated `v1.0.367` tag on the exact merged release
   commit;
3. explicitly authorize the production workflow run from that tag with version
   `1.0.367` and `publish: true`;
4. approve the protected `nuget-production` deployment when prompted.

## Deferred Work

- Issues [#387](https://github.com/vrassouli/Bluent/issues/387) and
  [#388](https://github.com/vrassouli/Bluent/issues/388) were completed by
  merged [PR #389](https://github.com/vrassouli/Bluent/pull/389).
- Issue #366 remains open only for work not covered by those focused issues,
  including exact Interactive Auto renderer-transition timing if the
  maintainer still requires instrumentation.
- Issue #363 remains the parent AI-readiness work.
- Sprint 4 Issues #393 and #394 remain separate from the active examples and
  compilation workstream.

## Constraints

- Do not publish a real NuGet release without explicit maintainer authorization.
- Do not create a release tag or GitHub Release without explicit authorization.
- Do not introduce new public APIs, product components, or package boundaries without approval.
- Preserve the zero-warning Release baseline.
- Do not claim compatibility, accessibility, or release validation without actual evidence.
- Keep changes focused and reviewable.

## Next Session

1. Review the focused diff and create a branch/commit when requested.
2. Open a pull request targeting `Dev`.
3. Record the Quality and release-package workflow results without hiding
   failures or skipped checks.
4. Close Issues #391 and #392 only after their independent acceptance criteria
   and required external workflow evidence are satisfied.
