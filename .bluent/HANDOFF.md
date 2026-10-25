# Bluent Handoff

This is the operational entry point for continuing the current Bluent v3 work. The current Dev01 checkout is the isolated `v3/issue-418-design-tokens` task branch, not the stable `Dev` branch.

## Current Objective

Complete the remaining acceptance work for [Issue #418](https://github.com/vrassouli/Bluent/issues/418): the Fluent 2-aligned token/theme schema, source-to-token mapping, editable design-tool review, and bounded runtime/accessibility evidence.

| Tracking field | Current value |
|---|---|
| Branch | `v3/issue-418-design-tokens` |
| Base / PR target | `bluent-v3` |
| Pull request | [#500](https://github.com/vrassouli/Bluent/pull/500) — open, non-draft |
| Reviewed head | `52fa29a07f7565673ff9d8e0ce724d406302e31f` |
| Last recorded Project #5 status | Review; verify the actual Status field before transitions |

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

- `dotnet build Bluent.sln --configuration Release --no-restore --warnaserror`: **0 warnings, 0 errors** on the current reviewed head.
- `dotnet test Bluent.sln --configuration Release --no-build --no-restore`: **61/61 passed**.
- `python scripts/quality/generate_v3_token_preview.py --check`: **PASS** for the 20 brand/mode combinations; no legacy variable change and no published-bundle inclusion.
- `python scripts/quality/sync_v3_token_demo_asset.py --check`: **PASS**, demo-only research CSS remains synced and shipping CSS is untouched.
- `python -m unittest discover -s scripts/quality -p test_v3_slider_hc_token_candidate.py -v`: **11/11 passed**.
- Current tracked Chrome/Edge Forced Colors reports record **8,320/8,320 computed-style checks passing** across 480 specimens per browser. They cover emulated OS palettes, not real Windows Contrast Themes or screen readers.
- Current-head CI runs passed: [real browser lab](https://github.com/vrassouli/Bluent/actions/runs/39332963141), [token contract](https://github.com/vrassouli/Bluent/actions/runs/39332963186), [v3 docs](https://github.com/vrassouli/Bluent/actions/runs/39332963230), [package boundary](https://github.com/vrassouli/Bluent/actions/runs/39332963177), [component census](https://github.com/vrassouli/Bluent/actions/runs/39332963251), [Button-focus contract](https://github.com/vrassouli/Bluent/actions/runs/39332963140).
- The Forced Colors candidate remains research-only and opt-in. It is not a shipped component fix, a public token decision, or a claim of Fluent/WCAG/AT parity.

## Remaining Gates

1. **Editable design review:** design-first acceptance must happen in the authoritative Penpot file (ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`) or an authorized editable Figma fallback, and the real page/board/node IDs must be recorded. The Penpot plugin was unavailable/suspended in the latest session. A Figma fallback file was created at [this URL](https://www.figma.com/design/pUC3kEmDMHf44EWDiEFK0i), but Figma MCP hit its Starter-plan tool-call limit before authoring; the file is blank and is not evidence or sign-off.
2. **Native accessibility:** obtain real Windows Contrast Themes and assistive-technology evidence. Emulated Chrome/Edge system palettes are not a substitute. Final system-color roles and focus/disabled mapping still require accepted Light/Dark/RTL design.
3. **Component ownership:** production Slider and RangeSlider keyboard/ARIA, pointer-coordinate, and complete visual behavior remain owned by their dedicated issues (including #442/#443). Do not silently implement them in #418 or ship the research-only stylesheet.
4. Keep the working tree safe: `scripts/quality/probe_v3_component_lab.mjs` is untracked in the current checkout. Do not delete, stage, or commit it unless explicitly reviewed and deliberately added. Always use an explicit file list when staging changes.
5. After any follow-up commit, run affected local checks and inspect current-head CI; keep PR #500 open until all acceptance criteria are met.

## Branch and Release Guardrails

- All Epic #416 work and PRs remain isolated on `bluent-v3` / issue-specific task branches. Do not merge or cherry-pick v3 changes into `Dev`, `main`, stable branches, or existing NuGet releases.
- Do not publish packages, create tags/releases, or deploy as part of #418.
- Follow the real GitHub Project #5 Status flow: `Backlog → Ready → In progress → Review → Done`. Verify the actual Status field before changing it; `Done` requires reviewed evidence and accepted/merged PR into `bluent-v3`. Do not process `Analysis` without the maintainer's explicit request.
- Preserve public API compatibility unless an approved issue explicitly authorizes otherwise. Do not invent token names, API support, accessibility behavior, or design IDs.

## Completed Parallel Work

The v2.x consumer-skill workstream is complete: [Issue #406](https://github.com/vrassouli/Bluent/issues/406) is closed and [PR #407](https://github.com/vrassouli/Bluent/pull/407) is merged. The canonical Bluent-first consumer Skill and 65-family retrieval inventory remain maintained; they are not the active workstream for this checkout.
