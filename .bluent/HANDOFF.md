# Codex Handoff

This file is the operational entry point for continuing Bluent with Codex or another coding agent.

## Current Objective

Execute Sprint 3 — Release Reliability and Compatibility, tracked in
[Issue #372](https://github.com/vrassouli/Bluent/issues/372).

## Current Branch and Tracking

- Base branch: `Dev`
- Active branch: `release/sprint-3-reliability`
- Sprint plan: `.bluent/sprints/sprint-03.md`
- Sprint issue: [#372](https://github.com/vrassouli/Bluent/issues/372)
- Pull request: not opened
- Sprint 2 completion: [PR #370](https://github.com/vrassouli/Bluent/pull/370) and [PR #371](https://github.com/vrassouli/Bluent/pull/371) — merged
- AI-readiness epic: [#363](https://github.com/vrassouli/Bluent/issues/363)
- Render-mode validation: [#366](https://github.com/vrassouli/Bluent/issues/366)
- Release audit: `docs/releasing/release-workflow-audit.md`

## Read First

1. `AGENTS.md`
2. `.bluent/PROJECT.md`
3. this file
4. `.bluent/sprints/sprint-03.md`
5. `.bluent/QUALITY.md`
6. `.bluent/BACKLOG.md`
7. `docs/releasing/release-workflow-audit.md`
8. `RELEASING.md`
9. `CHANGELOG.md`
10. relevant scoped `AGENTS.md` and canonical documentation

## Current State

Sprint 3 implementation is locally complete and awaiting clean CI evidence:

- `Dev` was confirmed current at
  `864f0d308775e4fdebacc1c12504a098ad1cc73c`.
- PRs #370 and #371 are merged; there were no open PRs at Sprint start.
- Open project issues were #363 and #366 before Sprint Issue #372 was created.
- The release audit found five published packages through `1.0.365`, no
  repository tags, no GitHub Releases, and no NuGet production environment.
- The legacy publish workflow is unsafe for another release because it can
  publish from `master` pushes or manual dispatch, omits full build/test gates,
  derives versions from workflow run numbers, and uses sequential pushes with
  `--skip-duplicate`.
- GitHub Pages modernization is already complete and was removed from the
  active backlog.
- No real package release has been authorized or published during Sprint 3.
- The replacement manual workflow validates explicit SemVer, a matching publish
  tag, the full zero-warning Release build, tests, all five aligned packages,
  deterministic changelog notes, and NuGet version availability.
- NuGet publication is isolated behind the `nuget-production` environment;
  that environment and `NUGET_API_KEY` require maintainer configuration before
  real use.
- The clean compiler baseline is zero after fixing all 10 pre-existing
  warnings without suppression.
- Reproducible compatibility routes now cover static SSR, Interactive Server,
  Interactive WebAssembly, and Interactive Auto; the existing standalone
  WebAssembly demo was also exercised.
- Browser checks passed binding, callbacks, dialog, toast, chart, diagram,
  navigation/disposal, and clean console scenarios. Transient server circuit
  reconnection and exact Auto renderer-transition timing remain unverified.
- Quality CI now checks the zero-warning build, 19 tests, five packages,
  metadata/dependencies, release tooling, links, workflow YAML, whitespace, and
  focused rendered accessibility.
- Contributor Issues #374, #375, and #376 are labeled `good first issue`.

## Next Session

1. Confirm the PR-triggered `Release packages` artifact-only run passes and
   inspect its package/report/notes artifact.
2. Update Issues #366 and #372 with the committed evidence.
3. Leave PR #377 open for maintainer review; do not self-merge it.
4. Do not create a real tag, GitHub Release, or NuGet publication without
   explicit maintainer authorization.

## Constraints

- Do not introduce new public Bluent APIs, product components, or package
  boundaries.
- Do not publish a real stable NuGet release without explicit authorization.
- Preserve public API, package dependency, theme, localization, and RTL
  behavior.
- Do not claim release, warning, runtime, render-mode, accessibility, or
  deployment validation unless it actually ran.
- Keep commits focused and reviewable.
- Record failures, skipped checks, and source/documentation mismatches.
- Keep unrelated Issue #363 expansion outside Sprint 3.

## Completion Protocol

Sprint 3 is complete only when:

- release automation passes a safe dry run;
- all five packages and their aligned internal dependencies are validated;
- changelog-derived release notes are deterministic;
- warnings are fixed or formally triaged and CI rejects new warnings;
- Issue #366 contains evidence-backed render-mode results;
- practical quality gates pass;
- contributor-ready issues exist;
- `.bluent/PROJECT.md`, this handoff, Issue #372, and the final PR agree; and
- the completion PR is ready for maintainer review and is not self-merged
  without authorization.
