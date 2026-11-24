# #418 — Dark semantic foreground values: review proposal

**Status: DRAFT / REVIEW REQUIRED.** The maintainer-approved direction is to preserve each brand's own hue and derive separate Dark Action Rest, Link Rest, Link Hover and Link Pressed foreground candidates from their corresponding source roles. This document records the exact generated candidates; it does not approve those values, semantic token names, CSS aliases or production defaults.

## 1. What is already accepted, and what is still open

Accepted direction:

- Keep all ten brand identities in Dark mode.
- Do not replace brand-colored actions/links with a universal neutral foreground simply to pass contrast.
- Derive Action, Link Rest, Link Hover and Link Pressed independently from each matching source foreground.
- Never borrow a Hover or Pressed source value to satisfy Rest.
- Keep semantic role meaning separate from the color value. Action Rest and Link Rest may currently resolve to the same hex for a given brand, but remain separate roles.

Still open:

- Exact candidate colors and their visual acceptance on real Button/Link states.
- Final semantic token names and mapping of component aliases.
- Public vocabulary/CSS alias decision in the separate proposal.
- Rendered component state, hover/pressed behavior, native OS contrast and assistive-technology acceptance.

## 2. Source mapping and candidate generation

The 40 candidates come from the source-backed preview contract:

| Semantic preview role | Matching Fluent source role | Preview output variable |
|---|---|---|
| Action Rest | --colorBrandForeground1 | --bui-v3-action-foreground |
| Link Rest | --colorBrandForegroundLink | --bui-v3-semantic-link-foreground-rest |
| Link Hover | --colorBrandForegroundLinkHover | --bui-v3-semantic-link-foreground-hover |
| Link Pressed | --colorBrandForegroundLinkPressed | --bui-v3-semantic-link-foreground-pressed |

Background: the emitted Dark --colorNeutralBackground1 for each brand; the current 10-brand Dark preview emits #292929 for this neutral surface. Minimum gate: 4.5:1. Preview target: 4.6:1.

The generator uses the matching six-digit source color and mixes each sRGB channel independently toward white:
round(channel + (255 - channel) × mixAmount).
A 48-iteration binary search finds the smallest mix amount whose WCAG relative-luminance contrast ratio reaches at least 4.6:1 against the emitted Dark neutral background. If the original source already passes, mix amount is zero. Contrast uses the standard sRGB linearization and luminance weights. The resulting rounded hex is checked again; a rounded result below target fails generation.

This is a deterministic preview-generation rule, not a universal color transform for gradients, alpha composites or arbitrary component surfaces.

## 3. Exact generated candidate matrix

Each cell shows candidate hex and its calculated contrast ratio against the corresponding emitted Dark neutral background. Values are copied from the generated preview JSON, not from raw source brand tokens.

| Brand | Action Rest | Link Rest | Link Hover | Link Pressed |
|---|---|---|---|---|
| Default | #6793CF / 4.6078:1 | #6793CF / 4.6078:1 | #6A93D0 / 4.6396:1 | #6094D0 / 4.6029:1 |
| Excel | #5B9F71 / 4.6018:1 | #5B9F71 / 4.6018:1 | #60A072 / 4.6891:1 | #5A9F73 / 4.6011:1 |
| Office | #E56E46 / 4.6072:1 | #E56E46 / 4.6072:1 | #E86C40 / 4.6071:1 | #DC744D / 4.6059:1 |
| Outlook | #5394DD / 4.6054:1 | #5394DD / 4.6054:1 | #5E92DE / 4.6016:1 | #4197DB / 4.6238:1 |
| Power Apps | #B082AD / 4.6017:1 | #B082AD / 4.6017:1 | #B082AD / 4.6017:1 | #B082AE / 4.6071:1 |
| Power BI | #A79036 / 4.6316:1 | #A79036 / 4.6316:1 | #AC8F1A / 4.6402:1 | #A3904A / 4.6038:1 |
| PowerPoint | #D8765A / 4.6130:1 | #D8765A / 4.6130:1 | #DA7555 / 4.6116:1 | #D6775E / 4.6136:1 |
| Stream | #D77382 / 4.6167:1 | #D77382 / 4.6167:1 | #D9727F / 4.6164:1 | #D67386 / 4.6109:1 |
| Teams | #8A89D7 / 4.6001:1 | #8A89D7 / 4.6001:1 | #8B89D8 / 4.6191:1 | #898AD6 / 4.6208:1 |
| Word | #788FD4 / 4.6265:1 | #788FD4 / 4.6265:1 | #7A8ED4 / 4.6051:1 | #7490D4 / 4.6295:1 |

Generated summary: **40/40** candidate pairs are at least 4.6:1. Minimum is **4.6001:1**, shared by Teams Action Rest and Link Rest. Maximum is Excel Link Hover at 4.6891:1. The minimum is intentionally close to the preview target because the generator seeks the smallest white mix that meets the threshold, not a maximum-brightness solution.

## 4. Why the current source colors are not sufficient

The source contrast audit preserves the underlying findings instead of silently substituting unrelated states:

| Existing source role | Dark result |
|---|---:|
| BrandForeground1 (Action) | below 4.5:1 in 10/10 brands; minimum 3.551:1 |
| BrandForegroundLink (Link Rest) | below 4.5:1 in 10/10 brands; minimum 3.551:1 |
| BrandForeground2 alternative | below 4.5:1 in 8/10 brands; minimum 4.294:1 |
| BrandForeground2Hover | passes all 20 brand/mode pairs, but is a state-specific Hover role and is not approved for Rest |
| BrandForegroundLinkHover | below 4.5:1 in 8/10 Dark brands; minimum 4.294:1 |
| BrandForegroundLinkPressed | below 4.5:1 in 10/10 Dark brands; minimum 2.911:1 |
| NeutralForeground2Link | passes the numeric ratio, minimum 10.010:1, but removes brand coloration |
| NeutralForeground3 | minimum 6.193:1, but is a lower-emphasis neutral role, not a branded action |
| NeutralForeground1 | minimum 14.548:1, but is neutral rather than branded |

The separate Danger issue is not folded into this matrix. Current semantic.status.danger is 4.164:1 on the studied Dark neutral surface and was accepted only as a non-text indicator there. The palette-red candidate and Label required-marker approval have narrower, separate semantics. They do not authorize Badge, Alert, Toast or Button Danger text.

## 5. Design-tool evidence

The editable source is Penpot file **Bluent v3 Design System**, ID b64f6665-c9ab-80b5-8008-c4ac99d9d000.

- Existing decision record: page 45, d0bcea67-3af4-8071-8008-d8e442b90ed1, board d0bcea67-3af4-8071-8008-d8e4c3d426d0 — DRAFT / REVIEW REQUIRED.
- New exact-value matrix: page 55, 388782f1-b766-8073-8008-f32e8223fd29, board 388782f1-b766-8073-8008-f32e823c8580 — DRAFT / exact values not approved.
- The page-55 export was visually inspected after extending the board height so the final preview-only footer remains visible.

The existing page-45 approved direction was not reopened. Page 55 adds review traceability for the exact 40 candidates; neither page was promoted to Review or Done.

## 6. Evidence scope and limits

Reproduce from the branch root:

- python scripts/quality/generate_v3_token_preview.py --check
- python scripts/quality/audit_v3_token_preview_contrast.py
- python -m unittest discover -s scripts/quality -p test_v3_token_preview_contrast.py -q

The current audit summary reports 360 checks: 300 source-backed opaque pair diagnostics, 20 TextField placeholder/BG3 pairs, and 40 Dark brand foreground candidate pairs. All 40 candidates pass 4.6:1; the generator emits only opt-in preview artifacts. A focused regression guard also parses this 10-brand candidate table and compares all 40 documented hex values and four-decimal ratios against `issue-418-brand-matrix.preview.json`. It pins the four matching source-state roles, opaque `--colorNeutralBackground1` scope, 4.6:1 preview target and DRAFT / no-production status, preventing independent drift between the review table and generated evidence.

These numeric results do not certify:
- Real rendered Button and Link component state semantics in every brand.
- Hover/Pressed targetability and visible interaction design in all themes.
- Alpha, translucent, gradient, image, shadow or composited backgrounds.
- Focus indicator contrast or reduced-motion behavior.
- Native Windows Contrast Themes / forced-colors OS behavior.
- Actual spoken Narrator, VoiceOver or other assistive-technology output.
- General WCAG conformance for arbitrary surfaces or components.

No production CSS, stable bundle, NuGet package or public token name is approved by this proposal. Keep the values and aliases in DRAFT until the page-45 decision and rendered/native evidence gates are accepted.

## 2026-11-16 decision — selected opt-in preview target

The maintainer delegated this choice to the engineering/design review. The 40 generated values are selected as the opt-in preview target for Action Rest, Link Rest, Link Hover and Link Pressed across ten brands on the opaque Dark `--colorNeutralBackground1` surface only. The current generated matrix minimum is 4.6001:1 against a 4.6:1 preview target.

This does not approve public semantic names or production CSS, and it is not a blanket WCAG/accessibility claim. Alpha/composited, gradient, image, other component/state surfaces, native forced-colors and spoken AT remain outside this selection. Page 45 and page 55 retain their DRAFT / REVIEW REQUIRED state until reviewed.
