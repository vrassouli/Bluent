# #418 — Source-backed Danger text contrast decision candidate

**Status:** DRAFT / not an approved public token contract; no Bluent 2.x stylesheet or published NuGet changed. The governing [ADR D1–D5](../architecture/ADR-0001-styling-boundaries.md) is Accepted. This is **numerical contrast evidence for specified opaque foreground/background pairs**, not WCAG component/AT/forced-color compliance.

## Actual design artifact

- Owned editable Penpot file **Bluent v3 Design System**: `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
- Actual Penpot page **`30 · Danger text contrast comparison · #418`** ID `acf5f619-7d81-80da-8008-c5ddd53bc436`.
- Editable visually inspected board `#418 · Danger text source and candidate contrast · DRAFT`: `acf5f619-7d81-80da-8008-c5ddf5c26686`.
- Additive, locally owned Penpot token sets: `bluent-v3/418/a11y/light` ID `acf5f619-7d81-80da-8008-c5ddd546a298` and `bluent-v3/418/a11y/dark` ID `acf5f619-7d81-80da-8008-c5ddd54c7980`. Each has two design tokens, `bluent.a11y.danger.current` and `bluent.a11y.danger.candidate`, included in the corresponding `Bluent v3 / Mode` draft theme. Existing imported Fluent source and earlier #419 tokens remain unchanged.
- Saved Penpot recovery version: **`Bluent v3 · #418 20 brand themes and Danger contrast proposal 2026-10-11`**, observed revision **217**. File has **31 pages, 37 TokenSets, 189 tokens and 22 themes**, including the previously audited native 20 Brand×Mode preview themes. Core/default preview token aliases remain independent from this research candidate.

## What was actually found

The existing CSS emitted by Bluent 2.x has `--colorStatusDangerForeground1` in both modes. When **used as ordinary text on `--colorNeutralBackground1`**, it falls below the 4.5:1 numerical contrast target in every Dark-brand palette. The separately existing `--colorPaletteRedForeground1` is a better accessible-text candidate for **this specific pairing**, as proven against all emitted 10-brand × Light/Dark CSS source files.

| Text source variable | Light on #FFFFFF | Dark on #292929 | Design conclusion |
| --- | --- | --- | --- |
| Existing `--colorStatusDangerForeground1` | `#B10E1C` → **7.121:1** | `#DC626D` → **4.164:1** | Dark text ratio below 4.5:1; do not promote this source color as universally accessible Danger text |
| Existing `--colorPaletteRedForeground1` | `#BC2F32` → **5.848:1** | `#E37D80` → **5.204:1** | **Candidate** meets 4.5:1 for tested neutral surface pairs |
| Other audited pairs | Primary text minimum **14.548:1** | On-brand foreground minimum across brands **5.552:1** | These selected numeric ratios meet 4.5:1; no full product/WCAG declaration |

**Live evidence:** [Penpot read-only mode/tokens/board audit](../../../scripts/quality/penpot_v3_danger_contrast_audit.js) at design revision **216**, **12 checks / 0 errors**, restored Light draft theme after checking both modes. The board PNG was exported and visually inspected; both modes display original/candidate source values and ratios.

**Source + generated CSS evidence:** [Python source contrast scanner](../../../scripts/quality/audit_v3_token_preview_contrast.py) now checks **20 palette/mode CSS files × 7 numeric pairs = 140 checks**: the original 80 core checks plus 60 diagnostics for draft brand foreground roles. It keeps the **10/10 Dark source-Danger values below 4.5** visible, confirms **0/20 proposed Danger text candidates below 4.5**, and records the newly identified action/link-foreground gap below. This remains opaque-color arithmetic, not full WCAG/AT verification or a test of gradients, alpha compositing, status-on-brand, or all component consumers.

## Additive, nonbreaking Opt-in CSS prototype

The [versioned #418 draft schema](issue-418-token-schema.preview.json) adds three **new names without renaming existing mappings**:

1. **Source:** `bluent.source.paletteRedForeground1` = existing `--colorPaletteRedForeground1`.
2. **Semantic:** `bluent.semantic.text.dangerAccessible` / `--bui-v3-text-danger-accessible` → source alias.
3. **Component candidate:** `bluent.component.badge.dangerTextAccessible` / `--bui-v3-badge-danger-text-accessible` → semantic alias.

The previous `bluent.semantic.status.danger` and `bluent.component.badge.dangerForeground` aliases remain **unchanged** for backward-compatible traceability. This makes the safe-text option explicit rather than silently changing Danger color semantics across non-text surfaces.

The deterministic [generator](../../../scripts/quality/generate_v3_token_preview.py) now covers **12 source + 13 semantic + 10 component = 35 logical tokens** for each of the 20 brand/mode combinations. [CSS candidate output](issue-418-opt-in.preview.css) is still outside the v2 bundle, never overrides `--color*` or `--fui-*`, and only applies under `[data-bui-v3-tokens]`. The browser [computed-style probe](../../../scripts/quality/probe_v3_token_preview.py) now includes rendered candidate text and its neutral background: **20 modes × 10 checks = 200/200 passing**.

## Still open, not bypassed

- Decide on a final Danger text semantic meaning and exact normal/large text/contrast requirements, brand/forced-colors/high-contrast fallback, hover/pressed/disabled state. Existing reported 4.164:1 is conditional on ordinary Danger text on neutral dark surface; **not all uses of red are defects**.
- Visual mode and alpha-blending tests, focus visibility, Windows/Persian font metrics, page-level RTL, screen-reader/live-region reporting, zoom/reflow and theme/portal ancestry.
- Real compiled Blazor Badge/Alert/Dialog consumption and preserving old public API. This research does not implement or change runtime Badge, `Danger` Button style or source CSS.
- Reviewer approval of final token naming and intended consumers. Keep #418 in **Review** / PR #500 reviewable while the evidence is evaluated. Do not mark #418 Done or merge the task PR until the editable design/token mapping is accepted and the outstanding native accessibility evidence is recorded; integrate only into `bluent-v3`.

**2026-10-13 #418 amendment:** The 35-token count and 200/200 browser results include a *separate, opt-in* Focus2 source → semantic candidate → Button candidate alias chain; [crosswalk](FOCUS2-ALIAS-CHAIN-CROSSWALK.md). The legacy brand Focus alias remains unchanged. Historical 32-token/140-check test snapshots elsewhere describe the earlier checkpoint, not the current generated inventory.

## Additional dark-mode brand foreground gap — 2026-10-25

A follow-up audit now measures the actual source CSS roles used by the draft token mapping against `--colorNeutralBackground1` across all 10 brands × Light/Dark (20 cases). This was missing from the earlier four-pair audit.

| Source role on `--colorNeutralBackground1` | Dark cases below 4.5:1 | Minimum measured ratio | Review result |
| --- | ---: | ---: | --- |
| Draft `action.foreground` → `--colorBrandForeground1` | 10/10 | **3.551:1** (`office/dark`) | Not approved as ordinary/small text |
| `--colorBrandForegroundLink` | 10/10 | **3.551:1** (`office/dark`) | Not approved as ordinary/small text |
| `--colorBrandForeground2` (possible alternative) | 8/10 | **4.294:1** (`office/dark`) | Not a universal text-safe replacement |

For all 10 Light themes, the first two tested roles meet 4.5:1 on the neutral surface. The measured gaps are reproducible from the source theme CSS through the quality scanner; the report includes 60 extra pair checks and explicit expected-gap patterns so a source change cannot silently remove or reclassify the finding.

The current generated alias is defined in [the opt-in preview CSS](issue-418-opt-in.preview.css) as `--bui-v3-action-foreground: var(--colorBrandForeground1)`. A repository search did not find a component consuming that alias yet. Therefore this is **not being reported as a regression in a shipped component**, and no stable CSS, token value, or public API was changed. It is a token-contract/design acceptance gap: before any future consumer uses `action.foreground` for ordinary text or links, maintainers must decide its intended semantic role and select or define a mapping that satisfies that role across all supported brands/modes. Do not assume `colorBrandForeground2` fixes the gap: its value is below 4.5:1 in eight Dark brand themes.

The existing [Fluent 2 alias token reference](https://fluent2.microsoft.design/color-tokens/) distinguishes BrandForeground1, BrandForeground2, and BrandForegroundLink roles. Those source names do not by themselves prove that the current customized brand palettes meet a specific contrast target; measured values and the intended consumer role still need review.

The audit and its contract test intentionally **report and guard this known gap while keeping the research CI green**; they do not claim that the draft foreground roles meet 4.5:1 or that #418 is ready for final approval. No candidate replacement value is selected here.
