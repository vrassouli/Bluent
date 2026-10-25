# Bluent Handoff

This is the operational entry point for continuing the current Bluent v3 work. The current Dev01 checkout is the isolated `v3/issue-418-design-tokens` task branch, not the stable `Dev` branch.

## Current Objective

Complete the remaining acceptance work for [Issue #418](https://github.com/vrassouli/Bluent/issues/418): the Fluent 2-aligned token/theme schema, source-to-token mapping, editable design-tool review, and bounded runtime/accessibility evidence.

| Tracking field | Current value |
|---|---|
| Branch | `v3/issue-418-design-tokens` |
| Base / PR target | `bluent-v3` |
| Pull request | [#500](https://github.com/vrassouli/Bluent/pull/500) — open, non-draft |
| Last verified implementation base before this contrast-audit follow-up | `7b3d5853e42a6d97e084375dcb7ac964dd1c649a` (all six required CI workflows passed on this commit) |
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
- Exact current-head CI on `dc80a0dcee5a510658cf0f34298725b5ae9cbe58`: all six required workflows succeeded — [real browser lab](https://github.com/vrassouli/Bluent/actions/runs/40193841678), [token contract](https://github.com/vrassouli/Bluent/actions/runs/40193841724), [v3 docs](https://github.com/vrassouli/Bluent/actions/runs/40193841687), [package boundary](https://github.com/vrassouli/Bluent/actions/runs/40193841688), [component census](https://github.com/vrassouli/Bluent/actions/runs/40193841679), [Button-focus contract](https://github.com/vrassouli/Bluent/actions/runs/40193841703).
- Dev01 native-environment inventory (2026-10-25, Windows 11 Pro build 28000): Narrator is installed but was not running; NVDA is not installed. This inventory is separate from the completed native High Contrast browser check below; no screen-reader interaction has been tested.
- Native Windows High Contrast browser check (2026-10-25): temporarily enabled real OS High Contrast with `SPI_SETHIGHCONTRAST`, without DevTools media emulation, and drove headful Microsoft Edge against the actual local Blazor WASM `/v3/styling-lab`. **6/6 assertions passed**: `forced-colors:active` reached Edge, native `Highlight` resolved to `rgb(142, 227, 240)`, keyboard Tab focused the real Bluent Default Button, its solid 2px/2px-offset focus ring matched native Highlight, and the invalid TextField exposed `aria-invalid=true` plus `aria-describedby`. Native screenshot was captured; no console errors, exceptions or failed network loads were observed. The OS flag and registry were restored exactly (`Flags=126`, High Contrast OFF, blank scheme fields). This proves a focused native OS/CSS/keyboard slice only—not screen-reader, full WCAG, all-component, or final design acceptance.
- Local live runtime check (2026-10-25): `node scripts/quality/probe_v3_blazor_runtime.mjs` exited 0 with **950/950 real Blazor WebAssembly Chrome/CDP assertions passed**, zero failed assertions/errors. Coverage includes the live 10-brand × Light/Dark matrix, real controls, keyboard focus, zoom/narrow/RTL and screenshot checks; its embedded Forced Colors emulation is not native OS/AT testing.
- The Forced Colors candidate remains research-only and opt-in. It is not a shipped component fix, a public token decision, or a claim of Fluent/WCAG/AT parity.
- Source contrast follow-up (2026-10-25): an independent parse of the actual 20 source theme CSS files found the draft `action.foreground` → `--colorBrandForeground1` pair below 4.5:1 in all 10 Dark brand themes (minimum 3.551:1). `--colorBrandForegroundLink` has the same 10/10 gap; `--colorBrandForeground2` is below 4.5:1 in 8/10 Dark themes, so it is not a universal replacement. Extended `audit_v3_token_preview_contrast.py` to 180 source-backed pair checks and added two measured fallback-role diagnostics plus two explicit report-contract tests. These are draft tokens with no product consumer found; values/API are not approved, and no product stylesheet was changed. Detailed evidence: `docs/v3/tokens/CONTRAST-AUDIT.md`. Follow-up candidate readings: `--colorBrandForeground2Hover` clears 4.5:1 in all 20 cases (minimum 6.172:1) but is a Hover-state role; `--colorNeutralForeground2` clears all 20 (minimum 10.010:1) but is neutral. Neither is selected as the generic action foreground without design review.

## Remaining Gates

1. **Editable design review:** design-first acceptance must happen in the authoritative Penpot file (ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`) or an authorized editable Figma fallback, and the real page/board/node IDs must be recorded. The Penpot plugin was unavailable/suspended in the latest session. A Figma fallback file was created at [this URL](https://www.figma.com/design/pUC3kEmDMHf44EWDiEFK0i), but Figma MCP hit its Starter-plan tool-call limit before authoring; the file is blank and is not evidence or sign-off.
2. **Native accessibility:** the focused real Windows High Contrast browser slice is complete (6/6 assertions, 2026-10-25), separate from emulated palette tests. Remaining: dependable real Narrator/NVDA announcement evidence and approved final system-color roles / focus / disabled mapping across Light/Dark/RTL. The attempted Narrator session could not reliably maintain page focus, so no screen-reader pass is claimed.
3. **Component ownership:** production Slider and RangeSlider keyboard/ARIA, pointer-coordinate, and complete visual behavior remain owned by their dedicated issues (including #442/#443). Do not silently implement them in #418 or ship the research-only stylesheet.
4. The zero-byte, untracked `scripts/quality/probe_v3_component_lab.mjs` stub was removed from this #418 checkout on 2026-10-25. The real 152,137-byte script remains tracked on `v3/issue-421-component-lab` (history includes #421 pilot commits such as `34f71f06`); do not recreate a duplicate in #418 or alter the real #421 probe here.
5. After any follow-up commit, run affected local checks and inspect current-head CI; keep PR #500 open until all acceptance criteria are met.

## Branch and Release Guardrails

- All Epic #416 work and PRs remain isolated on `bluent-v3` / issue-specific task branches. Do not merge or cherry-pick v3 changes into `Dev`, `main`, stable branches, or existing NuGet releases.
- Do not publish packages, create tags/releases, or deploy as part of #418.
- Follow the real GitHub Project #5 Status flow: `Backlog → Ready → In progress → Review → Done`. Verify the actual Status field before changing it; `Done` requires reviewed evidence and accepted/merged PR into `bluent-v3`. Do not process `Analysis` without the maintainer's explicit request.
- Preserve public API compatibility unless an approved issue explicitly authorizes otherwise. Do not invent token names, API support, accessibility behavior, or design IDs.

## Completed Parallel Work

The v2.x consumer-skill workstream is complete: [Issue #406](https://github.com/vrassouli/Bluent/issues/406) is closed and [PR #407](https://github.com/vrassouli/Bluent/pull/407) is merged. The canonical Bluent-first consumer Skill and 65-family retrieval inventory remain maintained; they are not the active workstream for this checkout.
