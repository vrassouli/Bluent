# Bluent Handoff

This is the operational entry point for continuing the current Bluent v3 work. The current Dev01 checkout is the isolated `v3/issue-418-design-tokens` task branch, not the stable `Dev` branch.

## Current Objective

Complete the remaining acceptance work for [Issue #418](https://github.com/vrassouli/Bluent/issues/418): the Fluent 2-aligned token/theme schema, source-to-token mapping, editable design-tool review, and bounded runtime/accessibility evidence.

| Tracking field | Current value |
|---|---|
| Branch | `v3/issue-418-design-tokens` |
| Base / PR target | `bluent-v3` |
| Pull request | [#500](https://github.com/vrassouli/Bluent/pull/500) — open, non-draft |
| Verified branch head before the current review-board update | `34324edb0e7ffcc1d4b62858b355a3d7c430a3d6`; working tree was clean and aligned with `origin` |
| Last recorded Project #5 status | Review; verify actual Status field before transitions |

## Read First

1. `AGENTS.md`
2. `docs/v3/ISSUE-WORKFLOW.md`
3. `docs/v3/BRANCHING.md`
4. `.bluent/PROJECT.md`
5. this file and `.bluent/QUALITY.md`
6. Issue #418 and PR #500
7. `docs/v3/tokens/README.md`
8. `docs/v3/tokens/SLIDER-FORCED-COLORS-BROWSER-RESEARCH.md`
9. `docs/v3/tokens/BLZ-RUNTIME-PORTAL-AUDIT.md`
10. `docs/v3/PENPOT-WORKFLOW.md` and `docs/v3/design/penpot-workspace.manifest.json`

## Verified Current State

- Verified on `34324edb0e7ffcc1d4b62858b355a3d7c430a3d6`: `git status --porcelain` was empty and `HEAD` matched `origin/v3/issue-418-design-tokens`.
- Exact-head CI on that commit: all six required workflows passed: real browser lab (`40230742152`), docs contract (`40230741986`), token contract (`40230742006`), public component census (`40230741990`), package boundary (`40230741987`), and Button focus contract (`40230742028`). After the local docs-only update, these results describe the previous pushed head, not any future commit.
- `python scripts/quality/generate_v3_token_preview.py --check`: PASS for 20 brand/mode combinations, 35 logical token aliases per combination, no legacy variable changes and no published-bundle inclusion.
- `python scripts/quality/audit_v3_token_preview_contrast.py`: PASS for **300 numeric opaque foreground/background pairs**. Findings remain review-required: draft `action.foreground` and branded link Rest are below 4.5:1 in 10/10 Dark brands (minimum 3.551:1); `BrandForeground2` and link Hover are below target in 8/10 Dark brands (minimum 4.294:1); link Pressed is below target in 10/10 Dark brands (minimum 2.911:1). Hover/Pressed and neutral roles are not interchangeable with branded Rest semantics.
- `python -m unittest discover -s scripts/quality -p test_v3_token_preview*.py -v`: **8/8 passed**. `git diff --check`: passed before the design-linked documentation update; re-run after edits.
- The current Penpot connection is available and points to the correct owned editable file **Bluent v3 Design System**, ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
- New editable semantic-review page **`45 · #418 semantic contrast decision review · DRAFT`**, page ID `d0bcea67-3af4-8071-8008-d8e442b90ed1`; board **`#418 · Dark-theme semantic contrast decision matrix · REVIEW REQUIRED`**, ID `d0bcea67-3af4-8071-8008-d8e4c3d426d0`. It documents the 300-pair role findings, three unapproved design directions, separate Danger candidate evidence, and explicit acceptance checks. Its PNG was exported and visually inspected. It is a proposal record, **not** approval of any option or public API.
- Detailed evidence and actual design IDs: `docs/v3/tokens/CONTRAST-AUDIT.md`. The current schema remains an opt-in research preview and `--bui-v3-*` aliases are not shipped.
- Previous verified evidence still bounded to its recorded environment/date: local Release solution build was 0 warnings/0 errors; solution tests 61/61; demo CSS sync passed; slider candidate tests 11/11; emulated Chrome/Edge forced-colors 8,320/8,320 computed-style checks; real WASM Chrome/CDP 950/950. Native Windows High Contrast browser slice 6/6 on 2026-10-25 (actual OS setting restored). Narrator was installed but not running; NVDA was not installed, so no actual screen-reader pass is claimed.

## Remaining Gates

1. **Maintainer design decision:** use the new editable Penpot review board/page IDs above. Decide the intended semantic use of `action.foreground` and branded links, and decide Rest/Hover/Pressed/Disabled independently. The board presents options but does not select one. Do not infer that a source role's name guarantees contrast or substitute state-specific/neutral tokens by arithmetic alone.
2. **Danger text:** `--colorPaletteRedForeground1` is an additive candidate with 5.204:1 minimum in the tested Dark neutral pair versus current Danger foreground 4.164:1. It is still unapproved; the result is numerical evidence, not WCAG/AT certification or proof for all component contexts.
3. **Native accessibility:** the focused real Windows High Contrast browser slice is complete (6/6 assertions, 2026-10-25), separate from emulated palette tests. Remaining: dependable real Narrator/NVDA announcement evidence and approved final system-color roles / focus / disabled mapping across Light/Dark/RTL. The attempted Narrator session could not reliably maintain page focus, so no screen-reader pass is claimed.
4. **Component ownership:** production Slider and RangeSlider keyboard/ARIA, pointer-coordinate, and complete visual behavior remain owned by their dedicated issues (including #442/#443). Do not silently implement them in #418 or ship the research-only stylesheet.
5. The zero-byte, untracked `scripts/quality/probe_v3_component_lab.mjs` stub was removed from this #418 checkout on 2026-10-25. The real 152,137-byte script remains tracked on `v3/issue-421-component-lab` (history includes #421 pilot commits such as `34f71f06`); do not recreate a duplicate in #418 or alter the real #421 probe here.
6. PR #500 had no submitted reviews or inline review threads returned by the current GitHub review listing. Keep it open; after any implementation/docs commit run affected local checks and inspect exact-head CI. Do not merge until all criteria are met.

## Branch and Release Guardrails

- All Epic #416 work and PRs remain isolated on `bluent-v3` / issue-specific task branches. Do not merge or cherry-pick v3 changes into `Dev`, `main`, stable branches, or existing NuGet releases.
- Do not publish packages, create tags/releases, or deploy as part of #418.
- Follow the real GitHub Project #5 Status flow: `Backlog → Ready → In progress → Review → Done`. Verify the actual Status field before changing it; `Done` requires reviewed evidence and accepted/merged PR into `bluent-v3`. Do not process `Analysis` without the maintainer's explicit request.
- Preserve public API compatibility unless an approved issue explicitly authorizes otherwise. Do not invent token names, API support, accessibility behavior, or design IDs.

## Completed Parallel Work

The v2.x consumer-skill workstream is complete: [Issue #406](https://github.com/vrassouli/Bluent/issues/406) is closed and [PR #407](https://github.com/vrassouli/Bluent/pull/407) is merged. The canonical Bluent-first consumer Skill and 65-family retrieval inventory remain maintained; they are not the active workstream for this checkout.

## 2026-10-31 #418 — brand-preserving Dark foreground candidates

Maintainer-approved direction: retain each of the ten brand hues with separate Dark Action Rest, Link Rest, Link Hover and Link Pressed foregrounds. Generated per-brand preview values use the minimum sRGB mix toward white to reach 4.6:1 against each emitted Dark neutral surface; the floor is 4.5:1. The 40 pair audit passes with minimum 4.6001:1. Exact candidate values remain draft, scoped to opt-in v3 token hosts, and are recorded in docs/v3/tokens/CONTRAST-AUDIT.md / Penpot page 45. No stable theme, public API or package changed. Rendered Blazor, forced-colors/native OS and AT acceptance remain separate gates.
