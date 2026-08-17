# Codex Handoff

This file is the operational entry point for continuing Bluent with Codex or another coding agent.

## Current Objective

Document and prevent application-owned component naming collisions with Bluent
public types, especially `DrawerContent`, as tracked in
[Issue #397](https://github.com/vrassouli/Bluent/issues/397).

This work does not publish packages, create a tag or GitHub Release, add public
APIs, or push the local branch without maintainer instruction.

## Current Branch and Tracking

- Base branch: `Dev`
- Active branch: `codex/issue-397`
- Active issue: [#397](https://github.com/vrassouli/Bluent/issues/397)
- Completed benchmark issue:
  [#394](https://github.com/vrassouli/Bluent/issues/394)
- Sprint 4 plan: `.bluent/sprints/sprint-04.md`
- Pull request: not opened
- Completed reference-application issue:
  [#393](https://github.com/vrassouli/Bluent/issues/393)
- Completed reference-application pull request:
  [#396](https://github.com/vrassouli/Bluent/pull/396) — merged
- Completed example issues:
  [#391](https://github.com/vrassouli/Bluent/issues/391) and
  [#392](https://github.com/vrassouli/Bluent/issues/392)
- Completed examples pull request:
  [#395](https://github.com/vrassouli/Bluent/pull/395) — merged
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

- The canonical Drawer/Popover guidance now warns that an application-owned
  `DrawerContent` collides with `Bluent.UI.Components.DrawerContent`, recommends
  a task-specific name such as `OrderFilterDrawer`, and documents full
  qualification as the reliable fallback for an existing collision.
- The standalone task consumer uses the distinctive `OrderFilterDrawer` name.
  Its negative validation source deliberately creates the collision and must
  fail with `CS0104`.
- No Bluent public API or package boundary changes are included.
- Full local validation passed: tool/solution restore, zero-warning Release
  build, 19/19 application tests, the positive task consumer plus focused
  `CS0104` negative control, 50-file Markdown links, and
  `git diff --check origin/Dev`.
- `benchmarks/ai-readiness` now contains a repeatable run layout, record
  template, and structural validator.
- One OpenAI Codex repository-context run preserved all 15 existing prompts,
  first responses, structured package/setup/API/link review, failure flags,
  score rationales, and compilation evidence. The exact model identifier was
  not exposed and was not inferred.
- The rerun scored 139/150 (92.7%) versus the committed 99/150 (66.0%)
  baseline. The baseline's row-derived API subtotal is 18/30, not the printed
  20/30; the dated comparison calls out that arithmetic discrepancy.
- Nine of ten generated samples compiled unchanged. The first drawer sample
  failed with `CS0104` because an application-owned `DrawerContent` collided
  with `Bluent.UI.Components.DrawerContent`. All ten compiled with zero
  warnings after a documented fully qualified repair.
- No hallucinated Bluent API was recorded. Context-free, link-only,
  `llms.txt`-only, web-only, external-assistant, runtime, and visual modes were
  not tested or claimed.
- The report is linked from the documentation index, canonical benchmark, and
  `llms.txt`.
- [Issue #397](https://github.com/vrassouli/Bluent/issues/397) tracks the
  focused naming-collision guidance and compiled regression example.
- Full local validation passed: tool/solution restore, zero-warning Release
  build, 19/19 application tests, canonical task-example gate, 13/13
  release-tool tests, 50-file Markdown links, all three workflow YAML files,
  benchmark record validation, repaired ten-sample build, and
  `git diff --check origin/Dev`.

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
- Issue #397 is the active focused Sprint 4 follow-up. Issues #391, #392,
  #393, and #394 are closed; PRs #395, #396, and #398 are merged into `Dev`.

## Constraints

- Do not publish a real NuGet release without explicit maintainer authorization.
- Do not create a release tag or GitHub Release without explicit authorization.
- Do not introduce new public APIs, product components, or package boundaries without approval.
- Preserve the zero-warning Release baseline.
- Do not claim compatibility, accessibility, or release validation without actual evidence.
- Keep changes focused and reviewable.

## Next Session

1. Review the committed `codex/issue-397` branch and its local validation
   evidence.
2. Push and open a pull request targeting `Dev` only when requested.
3. Record external CI evidence if a pull request is opened. Do not publish
   packages, tags, or releases.
