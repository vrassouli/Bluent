# #418 — Source-backed Danger text contrast decision candidate

**Status:** DRAFT / not an approved public token contract; no Bluent 2.x stylesheet or published NuGet changed. The governing [ADR D1–D5](../architecture/ADR-0001-styling-boundaries.md) is Accepted. This is **numerical contrast evidence for specified opaque foreground/background pairs**, not WCAG component/AT/forced-color compliance.

## Actual design artifact

- Owned editable Penpot file **Bluent v3 Design System**: `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
- Actual Penpot page **`30 · Danger text contrast comparison · #418`** ID `acf5f619-7d81-80da-8008-c5ddd53bc436`.
- Editable visually inspected board `#418 · Danger text source and candidate contrast · DRAFT`: `acf5f619-7d81-80da-8008-c5ddf5c26686`.
- **New semantic acceptance board:** [Penpot page 45 · #418 semantic contrast decision review · DRAFT](https://design.penpot.app/#/workspace?file-id=b64f6665-c9ab-80b5-8008-c4ac99d9d000&page-id=d0bcea67-3af4-8071-8008-d8e442b90ed1), page ID `d0bcea67-3af4-8071-8008-d8e442b90ed1`; editable board `#418 · Dark-theme semantic contrast decision matrix · REVIEW REQUIRED`, ID `d0bcea67-3af4-8071-8008-d8e4c3d426d0`. It records the current 300-pair role findings, explicitly separates Rest/Hover/Pressed and branded/neutral semantics, gives three non-approved decision directions, and lists acceptance gates. The exported PNG was visually inspected after the initial layout was corrected.
- Additive, locally owned Penpot token sets: `bluent-v3/418/a11y/light` ID `acf5f619-7d81-80da-8008-c5ddd546a298` and `bluent-v3/418/a11y/dark` ID `acf5f619-7d81-80da-8008-c5ddd54c7980`. Each has two design tokens, `bluent.a11y.danger.current` and `bluent.a11y.danger.candidate`, included in the corresponding `Bluent v3 / Mode` draft theme. Existing imported Fluent source and earlier #419 tokens remain unchanged.
- Saved Penpot recovery version: **`Bluent v3 · #418 20 brand themes and Danger contrast proposal 2026-10-11`**, observed revision **217**. File has **31 pages, 37 TokenSets, 189 tokens and 22 themes**, including the previously audited native 20 Brand×Mode preview themes. Core/default preview token aliases remain independent from this research candidate. The new page is later than that historical recovery snapshot.

## What was actually found

The existing CSS emitted by Bluent 2.x has `--colorStatusDangerForeground1` in both modes. When **used as ordinary text on `--colorNeutralBackground1`**, it falls below the 4.5:1 numerical contrast target in every Dark-brand palette. The separately existing `--colorPaletteRedForeground1` is a better accessible-text candidate for **this specific pairing**, as proven against all emitted 10-brand × Light/Dark CSS source files.

| Text source variable | Light on #FFFFFF | Dark on #292929 | Design conclusion |
| --- | --- | --- | --- |
| Existing `--colorStatusDangerForeground1` | `#B10E1C` → **7.121:1** | `#DC626D` → **4.164:1** | Dark text ratio below 4.5:1; do not promote this source color as universally accessible Danger text |
| Existing `--colorPaletteRedForeground1` | `#BC2F32` → **5.848:1** | `#E37D80` → **5.204:1** | **Candidate** meets 4.5:1 for tested neutral surface pairs |
| Other audited pairs | Primary text minimum **14.548:1** | On-brand foreground minimum across brands **5.552:1** | These selected numeric ratios meet 4.5:1; no full product/WCAG declaration |

**Live evidence:** [Penpot read-only mode/tokens/board audit](../../../scripts/quality/penpot_v3_danger_contrast_audit.js) at design revision **216**, **12 checks / 0 errors**, restored Light draft theme after checking both modes. The existing board PNG was exported and visually inspected; both modes display original/candidate source values and ratios.

**Source + generated CSS evidence:** [Python source contrast scanner](../../../scripts/quality/audit_v3_token_preview_contrast.py) checks **20 palette/mode CSS files × 15 numeric pairs = 300 checks**: 80 original core checks, 60 draft-role diagnostics, 40 initial fallback-role checks, and 120 additional diagnostics covering six source-backed roles. It keeps the **10/10 Dark source-Danger values below 4.5** visible, confirms **0/20 proposed Danger text candidates below 4.5**, and reports the Rest/action gap plus distinct Hover/Pressed link-state and neutral-role readings. This remains opaque-color arithmetic, not full WCAG/AT verification or a test of gradients, alpha compositing, status-on-brand, or all component consumers. The current 8-test contrast contract suite passes and explicitly guards the observed gap patterns.

## Additive, nonbreaking Opt-in CSS prototype

The [versioned #418 draft schema](issue-418-token-schema.preview.json) adds three **new names without renaming existing mappings**:

1. **Source:** `bluent.source.paletteRedForeground1` = existing `--colorPaletteRedForeground1`.
2. **Semantic:** `bluent.semantic.text.dangerAccessible` / `--bui-v3-text-danger-accessible` → source alias.
3. **Component candidate:** `bluent.component.badge.dangerTextAccessible` / `--bui-v3-badge-danger-text-accessible` → semantic alias.

The previous `bluent.semantic.status.danger` and `bluent.component.badge.dangerForeground` aliases remain **unchanged** for backward-compatible traceability. This makes the safe-text option explicit rather than silently changing Danger color semantics across non-text surfaces.

The deterministic [generator](../../../scripts/quality/generate_v3_token_preview.py) covers **15 source + 16 semantic + 13 component = 44 logical tokens** for each of the 20 brand/mode combinations. [CSS candidate output](issue-418-opt-in.preview.css) is still outside the v2 bundle, never overrides `--color*` or `--fui-*`, and only applies under `[data-bui-v3-tokens]`. The browser [computed-style probe](../../../scripts/quality/probe_v3_token_preview.py) includes rendered candidate text and its neutral background: **20 modes × 10 checks = 200/200 passing**.

## Still open, not bypassed

- Decide a final Danger text semantic meaning and exact normal/large text/contrast requirements, brand/forced-colors/high-contrast fallback, hover/pressed/disabled state. Existing reported 4.164:1 is conditional on ordinary Danger text on neutral dark surface; **not all uses of red are defects**.
- Decide the intended meaning of `action.foreground` and branded links before any consumer adopts them. The 300-pair audit shows `--colorBrandForeground1` and `--colorBrandForegroundLink` below 4.5:1 in all ten Dark brands; `--colorBrandForeground2` and link Hover fail in eight Dark brands; link Pressed fails in all ten Dark brands. Do not substitute Hover/Pressed values for Rest, or neutral values for branded roles, merely because a measured pair clears the numeric threshold. The [new editable semantic-review board](https://design.penpot.app/#/workspace?file-id=b64f6665-c9ab-80b5-8008-c4ac99d9d000&page-id=d0bcea67-3af4-8071-8008-d8e442b90ed1) presents three unapproved paths; it does not choose one.
- Visual mode and alpha-blending tests, focus visibility, Windows/Persian font metrics, page-level RTL, screen-reader/live-region reporting, zoom/reflow and theme/portal ancestry.
- Real compiled Blazor Badge/Alert/Dialog consumption and preserving old public API. This research does not implement or change runtime Badge, `Danger` Button style or source CSS.
- Reviewer approval of final token naming and intended consumers. Keep #418 in its current lifecycle state / PR #500 open while the evidence is evaluated. Do not mark #418 Done or merge the task PR until the editable design/token mapping is accepted and the outstanding native accessibility evidence is recorded; integrate only into `bluent-v3`.

**2026-10-13 #418 amendment:** The historical 35-token count and 200/200 browser results included a *separate, opt-in* Focus2 source → semantic candidate → Button candidate alias chain; [crosswalk](FOCUS2-ALIAS-CHAIN-CROSSWALK.md). The legacy brand Focus alias remains unchanged. Historical 32-token/140-check test snapshots elsewhere describe the earlier checkpoint, not the current generated inventory.

## Additional dark-mode brand foreground gap — 2026-10-25

A follow-up audit measures the actual source CSS roles used by the draft token mapping against `--colorNeutralBackground1` across all 10 brands × Light/Dark (20 cases). This was missing from the earlier four-pair audit.

| Source role on `--colorNeutralBackground1` | Dark cases below 4.5:1 | Minimum measured ratio | Review result |
| --- | ---: | ---: | --- |
| Draft `action.foreground` → `--colorBrandForeground1` | 10/10 | **3.551:1** (`office/dark`) | Not approved as ordinary/small text |
| `--colorBrandForegroundLink` | 10/10 | **3.551:1** (`office/dark`) | Not approved as ordinary/small text |
| `--colorBrandForeground2` (possible alternative) | 8/10 | **4.294:1** (`office/dark`) | Not a universal text-safe replacement |
| `--colorBrandForeground2Hover` | 0/10 | **6.172:1** (`stream/dark`) | Numeric contrast passes all 20 cases, but Hover is a state-specific source role, not a generic Rest decision |
| `--colorNeutralForeground2` | 0/10 | **10.010:1** (`default/dark`) | High-contrast neutral fallback; loses brand coloration and is not a branded-action choice by itself |

The follow-up keeps **state and hierarchy roles separate** rather than treating every numerically strong foreground as interchangeable:

| Additional emitted source role on the neutral surface | Dark cases below 4.5:1 | Minimum across 20 pairs | Review interpretation |
| --- | ---: | ---: | --- |
| `--colorBrandForeground2Pressed` | 0/10 | **10.017:1** (`teams/dark`) | Pressed-state role; not a generic Rest/idle action mapping |
| `--colorBrandForegroundLinkHover` | 8/10 | **4.294:1** (`office/dark`) | Hover is still below the target in eight Dark brands |
| `--colorBrandForegroundLinkPressed` | 10/10 | **2.911:1** (`powerpoint/dark`) | Pressed-state contrast gap in every Dark brand |
| `--colorNeutralForeground1` | 0/10 | **14.548:1** (all Dark themes) | Strong neutral foreground; not branded |
| `--colorNeutralForeground2Link` | 0/10 | **10.010:1** (all Dark themes) | Neutral-link role; does not retain brand identity |
| `--colorNeutralForeground3` | 0/10 | **6.193:1** (all Light themes) | Lower-emphasis neutral role; intended content hierarchy still needs review |

These additions are diagnostic only. They guard the observed eight-brand Dark Hover gap and ten-brand Dark Pressed gap against silent source drift, and explicitly avoid promoting Pressed/Hover or neutral tokens to the generic branded Rest action role.

For all 10 Light themes, the first two tested roles meet 4.5:1 on the neutral surface. The measured gaps are reproducible from the source theme CSS through the quality scanner; the 300-check report includes 60 draft-foreground diagnostics plus 160 candidate-role diagnostics and explicit expected-gap patterns, so a source change cannot silently remove or reclassify the findings.

The original source-to-semantic Action Rest alias remains defined as `--bui-v3-action-foreground: var(--colorBrandForeground1)` in the [opt-in preview CSS](issue-418-opt-in.preview.css). The Dark candidate selector preserves the approved per-brand hue by overriding only the matching role inside the explicit preview scope. Link Rest/Hover/Pressed now also have formal source → semantic → component aliases; see the current 44-token schema. The preview consumes them only in the Styling Lab and does not add them to the released bundle. Therefore this is **not being reported as a regression in a shipped component**, and no stable CSS, token value, or public API was changed. It is a token-contract/design acceptance gap: before any future consumer uses `action.foreground` for ordinary text or links, maintainers must decide its intended semantic role and select or define a mapping that satisfies that role across all supported brands/modes. Do not assume `colorBrandForeground2` fixes the gap: its value is below 4.5:1 in eight Dark brand themes. The same source scan found `--colorBrandForeground2Hover` and `--colorNeutralForeground2` above 4.5:1 in all 20 brand/mode cases; however, the former is explicitly a Hover-state role and the latter neutral, so neither is selected as generic `action.foreground` here. Fluent 2 documents BrandForeground2 and BrandForeground2Hover as distinct Rest/Hover aliases ([official alias token table](https://fluent2.microsoft.design/color-tokens2/)).

The existing [Fluent 2 alias token reference](https://fluent2.microsoft.design/color-tokens/) distinguishes BrandForeground1, BrandForeground2, and BrandForegroundLink roles. Those source names do not by themselves prove that the current customized brand palettes meet a specific contrast target; measured values and the intended consumer role still need review.

## 2026-10-31 — maintainer decision: preserve per-brand Dark foregrounds

**Approved direction:** retain brand identity in Dark Mode by giving each of the ten source brands its own readable foreground. The ordinary Action/Link Rest value is not replaced with a neutral role, nor borrowed from Hover or Pressed. Each interaction role is derived independently from its corresponding brand source token.

The actual editable Penpot decision page is [page 45 — semantic contrast decision review](https://design.penpot.app/#/workspace?file-id=b64f6665-c9ab-80b5-8008-c4ac99d9d000&page-id=d0bcea67-3af4-8071-8008-d8e442b90ed1); the companion board is `#418 · Per-brand Dark foreground candidates · DRAFT` (board `fce13529-02e2-80e4-8008-df6f76b3b4ac`). The direction is approved by the maintainer; exact values remain draft candidates pending rendered consumer review.

### Candidate generation rule

- Background: each brand’s emitted `--colorNeutralBackground1` in Dark Mode (currently `#292929` for all ten).
- Minimum normal-text contrast floor: **4.5:1**. The preview algorithm targets **4.6:1** to leave a small buffer for 8-bit RGB rounding.
- Each source foreground is moved the minimum distance toward white in sRGB space, rounded to an opaque 8-bit hex value, then measured again. This preserves the brand hue family while improving lightness.
- Four separate source roles are evaluated: `--colorBrandForeground1`, `--colorBrandForegroundLink`, `--colorBrandForegroundLinkHover`, and `--colorBrandForegroundLinkPressed`.
- Preview CSS overrides only the corresponding variables inside the existing opt-in `data-bui-v3-tokens` / `data-bui-brand` / `data-bui-theme` scope. It is not included in the stable 2.x bundle and does not rename or change legacy CSS.

| Brand | Action Rest | Link Rest | Link Hover | Link Pressed |
| --- | --- | --- | --- | --- |
| Default | `#6793CF` (4.608:1) | `#6793CF` (4.608:1) | `#6A93D0` (4.640:1) | `#6094D0` (4.603:1) |
| Excel | `#5B9F71` (4.602:1) | `#5B9F71` (4.602:1) | `#60A072` (4.689:1) | `#5A9F73` (4.601:1) |
| Office | `#E56E46` (4.607:1) | `#E56E46` (4.607:1) | `#E86C40` (4.607:1) | `#DC744D` (4.606:1) |
| Outlook | `#5394DD` (4.605:1) | `#5394DD` (4.605:1) | `#5E92DE` (4.602:1) | `#4197DB` (4.624:1) |
| Powerapps | `#B082AD` (4.602:1) | `#B082AD` (4.602:1) | `#B082AD` (4.602:1) | `#B082AE` (4.607:1) |
| Powerbi | `#A79036` (4.632:1) | `#A79036` (4.632:1) | `#AC8F1A` (4.640:1) | `#A3904A` (4.604:1) |
| Powerpoint | `#D8765A` (4.613:1) | `#D8765A` (4.613:1) | `#DA7555` (4.612:1) | `#D6775E` (4.614:1) |
| Stream | `#D77382` (4.617:1) | `#D77382` (4.617:1) | `#D9727F` (4.616:1) | `#D67386` (4.611:1) |
| Teams | `#8A89D7` (4.600:1) | `#8A89D7` (4.600:1) | `#8B89D8` (4.619:1) | `#898AD6` (4.621:1) |
| Word | `#788FD4` (4.627:1) | `#788FD4` (4.627:1) | `#7A8ED4` (4.605:1) | `#7490D4` (4.630:1) |

**Validation:** 40 generated opaque-color candidate pairs (10 brands × 4 roles); all 40 are at least **4.6001:1** against their corresponding emitted Dark neutral background. The existing 300 source-role diagnostics are intentionally preserved, including all ten Dark `BrandForeground1` / `BrandForegroundLink` gaps, eight Dark `BrandForegroundLinkHover` gaps, and ten Dark `BrandForegroundLinkPressed` gaps. The generator does not substitute a state role to hide any source finding.

**Still not a full accessibility sign-off:** these results cover numerical contrast for opaque text/background pairs. They do not certify gradients, alpha compositing, forced-colors/native OS behavior, rendered component states, browser zoom/reflow or screen-reader output. Keep exact candidate colors and public semantic token names in Review until the actual Blazor consumer matrix and the remaining accessibility gates are satisfied.

## 2026-11-01 — rendered Dark brand-foreground consumer evidence

The source-owned Bluent Styling Lab now exercises **Action · Rest as a real `Bluent.UI.Components.Button`** instead of a bare text specimen. It uses the existing `TextClass` parameter so the candidate foreground is applied to the actual button's text node while the button face continues to use its neutral surface. The three link specimens remain real anchors. No public component API, production Button CSS, stable theme file or generated public bundle changed; this is a Demo.Pages-only, opt-in preview improvement.

Published evidence was captured from the actual ASP.NET Core Blazor SSR Styling Lab on Windows 11 Pro / Microsoft Edge, using the exact source head `5b440e4dd2fe08ad4e5f9adc69eb9ceab8a4d2e6` plus the single uncommitted demo-only `TextClass` change. The new published `Bluent.UI.Demo.Pages.dll` SHA-256 was `0C166D36953D1FD5F29B4309CF100AFF9A0CD6AF086F8225F07DF39D47A6EDB5`. The browser loaded the real `issue-418.opt-in.preview.css` asset and read computed foregrounds from the rendered Button text node and link elements.

**Rendered Dark matrix:** 10 brands × 2 directions × 4 roles (Action Rest, Link Rest, Link Hover, Link Pressed) = **80/80 exact computed-style matches**, zero failures. Minimum rendered foreground/surface contrast was **4.6001:1**. The default brand sample measured Action `#6793CF` at 4.6078:1; Link Rest `#6793CF` at 4.6078:1; Hover `#6A93D0` at 4.6396:1; Pressed `#6094D0` at 4.6029:1. The probe sets the existing root brand/theme/direction scope attributes to enumerate source combinations; this is a computed-style matrix, not an assertion that the lab UI has an interactive ten-brand selector.

The browser Accessibility Tree independently exposed the actual Action sample as a named `button` (`Action · Rest`) and all three anchors as named `link` nodes. This is an accessibility-tree/name check, not spoken screen-reader acceptance. `forced-colors` was inactive for this run; the real Windows Desert Contrast Theme run is separately recorded in [the 2026-11-01 native HCM evidence](https://github.com/vrassouli/Bluent/issues/418#issuecomment-6553740359).

The generator check now covers 20 brand/mode combinations × 44 logical tokens, with 40 Dark candidate pairs and no legacy variable/bundle changes. The numeric source audit remains 340 checks, with all 40 candidate Dark pairs >=4.6001:1. **The values and public semantic token names remain draft/review candidates.** Rendered values passing arithmetic does not approve public token names, final role semantics, or production defaults; the page-45 Penpot decision record and issue acceptance remain in Review.


## 2026-11-10 — complete three-layer Link token bridge

The prior preview had a real contract gap: Dark Link Rest/Hover/Pressed values were generated and consumed by the Blazor lab, but their source/semantic/component identities were absent from the formal three-layer schema and the native shared Penpot preview sets. This is now corrected without changing the selected semantics or replacing any interaction state:

- Source adds `bluent.color.brandForegroundLink`, `...Hover`, and `...Pressed` from the matching emitted Fluent source variables.
- Semantic adds `bluent.semantic.link.foregroundRest`, `...Hover`, and `...Pressed`, each aliasing its matching source role.
- Component adds `bluent.component.link.foregroundRest`, `...Hover`, and `...Pressed`, each aliasing its corresponding semantic role. The existing Action Rest role remains separate.
- The generated Dark candidate values still derive independently from each matching Rest/Hover/Pressed source and are written to the semantic variables; the component aliases resolve through those semantic variables. No Hover or Pressed token is borrowed for Rest.
- Current generator inventory: **15 source + 16 semantic + 13 component = 44 logical tokens** per 10-brand × Light/Dark combination. This is still opt-in preview CSS, outside the released 2.x bundle.
- The real Penpot `Bluent v3 Design System` file has matching Link source/semantic/component tokens in both base modes and 20 Brand×Mode preview themes. Live verification on revision **704** passed **258/258** checks: 240 brand-mode component/palette resolutions plus 18 base alias-chain checks. The file currently contains 40 TokenSets, 311 token entries and 22 themes.

This closes the three-layer Link parity gap; it does not approve every remaining draft token as a production API or waive native assistive-technology/consumer acceptance for the entire foundation.
