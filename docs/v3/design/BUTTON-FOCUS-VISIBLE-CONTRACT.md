# Bluent v3 — Button focus-visible design contract (#501)

> Status: **in progress, NOT approved**. This document captures a live Penpot gap and the intended resolution; it does not assert that a finished native Button focus design, runtime behavior, or accessibility validation exists.

## Source of truth and verified starting point (2026-10-11)

- Project-owned Penpot file: `Bluent v3 Design System`, ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
- Existing Button appearance/state native variant family: page `19 · Bluent Button native variants`, page ID `e31294c6-7c55-805f-8008-c58ffcf22e07`, variant container `e31294c6-7c55-805f-8008-c5900fba48e4`.
- The inspected 25 linked native variants cover five styles × `Rest`, `Hover`, `Pressed`, `Selected`, `Disabled`; **there is no `Focus Visible` axis, variation, or dedicated native focus ring**.
- Imported Fluent Button reference: page `09 · Fluent Button state reference` contains distinct `Focus ring` shapes. These are source references, **not** finished Bluent-owned focus variants.
- #501 design-review page **created in real Penpot**: `38 · Button Focus Visible states · #501`, page ID `535db143-a732-807e-8008-c64d2fb91b9a`. Review board scaffold ID `535db143-a732-807e-8008-c64d9b8199bd`. **The board was empty at last successful read and must not be portrayed as an implemented design.** Penpot plugin tab repeatedly suspended during writes.
- #419 is **closed**, meaning library/reference setup completed, not that #428 Button state/focus/accessibility coverage is complete.
- Existing #418 semantic token candidate `bluent.semantic.border.focus` resolves to a brand background alias. Its high-contrast/forced-colors suitability must be verified rather than presumed.

## Required visual model

**Focus-visible is orthogonal** to interaction state and appearance, not an alternative to `Hover`, `Pressed`, or `Selected`. A focused toggled Button can be selected **and** focused, and pointer hovering can coexist with keyboard focus.

Suggested design axes:
- `Appearance`: Primary, Secondary (maps to existing Bluent `Default`), Outline, Subtle, Transparent; also verify existing Bluent `Danger` before public API acceptance.
- `Interaction`: Rest / Hover / Pressed / Selected / Disabled.
- `Focus`: Off / Visible **when enabled and focus-visible criteria are met**. Disabled does not have a valid `Visible` variant.
- Size/shape/layout: Small / Medium / Large; Rounded / Square / Circular; icon+label / icon-only; compound/split with independently focusable actions as applicable.

**Rendering contract:** focus ring is a separate overlay or outline (without changing the button's border-box size), using component/theme tokens and an appropriate offset, contrast separation and border radius. Maintain the measured center of text/icon, no overflow clipping and no shift in button/content geometry. Test on both light and dark surfaces (including adjacent dark/brand fill), rather than assuming a single brand-colored 1px stroke is always visible. Preserve visible focus under Windows forced-colors; avoid reliance on a box-shadow alone. Focus ring must remain perceptible at 200% zoom and against nearby controls.

**CSS contract proposal (not yet implemented):** `:focus-visible` drives the ring, including keyboard Tab/Shift+Tab; pointer activation must not universally show the keyboard ring. Do not suppress focus styling via `outline: none` without a verified equivalent. Account for browser programmatic-focus heuristics. Disabled native buttons must not be tabbable; anchors and split/menu-button accessibility require separate testing.

## Acceptance matrix

| Case | Expected design / behavior |
| --- | --- |
| Each of 5 Fluent appearances, enabled and keyboard-focused | Native linked Penpot specimen with ring visually distinguished from the underlying state |
| Hover + Focus Visible | Both effects coexist without losing focus indication |
| Selected + Focus Visible | Selection and focus distinct; toggle state remains semantically exposed |
| Pressed + Focus Visible | No focus flash or unexpected button geometry shift |
| Disabled | No keyboard focus, no misleading focus specimen |
| Danger / Default mapping | Existing 2.x public appearances remain supported or migration explicitly documented |
| Small/Medium/Large, circular/square, icon-only, compound/split | Ring remains correctly fitted, unclipped, and aligned |
| Light/Dark × ten brands, contrast and forced colors | Actual browser coverage recorded under #418 / #428; no Penpot-only WCAG claim |
| LTR/RTL and Persian text | Ring unaffected by direction; text/icon remain centered |
| Tab, Shift+Tab, Enter, Space, toggling, and dropdown/split | Verified keyboard flow, appropriate focus restoration, no accidental interaction |

## Sequence and evidence gate

1. Finish actual editable local Penpot specimens **before** implementing design-dependent runtime styling. Prefer a reusable local Button focus layer or a third `Focus` axis on the existing source family; record each variant tuple and linked instance; preserve the imported Fluent source.
2. Audit actual Penpot source/local-component IDs, ring geometry, button bounds, baseline and alignment; export representative specimens for reviewer inspection.
3. Finalize #418 semantic/component focus tokens and forced-color fallbacks before treating literal candidate colors as approved.
4. Implement native Blazor/CSS interaction in #428 (or coordinated change clearly linked to #501), with actual interactive demo and browser/keyboard/accessibility evidence.
5. Capture design→implementation mapping, docs/Skills, migration impact, tests and approved PR to `bluent-v3` only. Leave `Dev`/2.x/NuGet untouched.

## Unresolved constraints

A correctly named Penpot page and an empty board **are only placeholders**, not proof that #501 has been implemented. Mark this issue Review only after working native ring visual variants and evidence are present; Done only after accepted `bluent-v3` integration and the whole accepted issue scope.


## Live Penpot follow-up — authored focus-visible family (2026-10-11)

**This section supersedes the earlier empty-board snapshot.** Actual native design progress was written into the same project-owned Penpot file and visually exported:

- Page `38 · Button Focus Visible states · #501` (`535db143-a732-807e-8008-c64d2fb91b9a`).
- Editable light/dark-surface illustration board `535db143-a732-807e-8008-c64d9b8199bd`: **5 actual source-linked Rest Button appearances** on a light surface and 5 on a dark surface, each with two separately editable focus-outline strokes. The dark examples are **contrast experiments**, not native Dark-theme implementation or verified token values.
- **NEW true Penpot VariantContainer** `DRAFT · Button / Appearance × Focus`, ID `535db143-a732-807e-8008-c64f10ae5f75`: axes `Appearance` (Primary, Secondary, Outline, Subtle, Transparent) × `Focus` (Off, Visible), **10/10 unique tuples**. Focus-visible components contain a nested linked local native Rest Button and two native editable focus shapes; focus-off components retain the same linked Button without the ring. The original 25-state family is **unchanged**.
- Linked reusable focus-variant preview board `535db143-a732-807e-8008-c64f3402325d`: **10/10 linked native family specimens** (5 appearances × Off/Visible). Its rendered PNG was inspected and visually shows an outer ring without moving Button text/icons.
- Live Penpot validation: **5/5 appearance pairs** retained text geometry (tolerance ±0.01px), each Focus Visible variant contains two ring shapes; **10 variants, 10 distinct tuples, 10 linked previews, 0 issues**. This is a **design-shape-only** test, *not* runtime, keyboard, theme compliance, WCAG, or optical-font approval.

**Still open for #501:** tie ring colors/strokes to approved #418 semantic tokens (current light/dark black/white values are design candidates); actual Dark theme, forced-colors/high-contrast, Hover+Focus / Selected+Focus / Pressed+Focus, Danger and alternate sizes/shapes/RTL, and real Blazor keyboard/browser/demo evidence under #428. Do not mark this issue Done merely because the 10 focus variants exist.


## 2026-10-13 live Penpot extension — interaction, size and RTL focus

The connected, project-owned `Bluent v3 Design System` file was opened and edited on the **correct** page `38 · Button Focus Visible states · #501` (`535db143-a732-807e-8008-c64d2fb91b9a`).

**Editable native review boards, actually created and visually exported:**

- **Focus × interaction** `cd054205-a525-80d8-8008-c84dc7f13d55`: 5 appearances (Primary, Secondary, Outline, Subtle, Transparent) × 4 interaction states (Hover, Pressed, Selected, Disabled) = **20 linked live Penpot component instances** of the existing `Appearance × State` family from page 19. For the 15 enabled examples, there are **30 separate editable ring rectangles** (outer stroke + contrast gap); the 5 Disabled examples deliberately have **zero rings**. The underlying instances retain their original dimensions and native state visuals.
- **Sizes, icon-only, Persian direction** `cd054205-a525-80d8-8008-c84ea8fb870b`: **6 linked native** Small/Medium/Large × Icon-and-label/Icon-only component instances from page 20, plus **6 linked native** LTR/RTL × Small/Medium/Large Persian instances from page 25; every specimen has an editable outer and gap stroke fitted against the exact existing component **Face** / **Button face** shape (24 additional ring rectangles).
- The two boards were each exported as actual Penpot PNGs and visually inspected. Focus strokes are visually distinct from the underlying selected/pressed/hover states; Persian icon order visibly mirrors between directions. They are **design evidence**, not runtime browser snapshots.
- Live API read-back on 2026-10-13 verified: **20 interaction source links, 30 interaction rings, 5 Disabled without rings, 12 additional size/RTL source links, 24 additional rings, 0 validation issues**. The original page-19 family still has **25 native state variants**; the separate page-38 Appearance × Focus native family still has **10 variants**. Source variants were not overwritten or detached.

**Scope boundaries:** The existing 10 Appearance × Focus combinations are reusable **native variants**. The new combined-state and size/RTL boards are **linked, editable preview compositions**, not new multi-axis native variants nor production CSS. Ring colors are literal draft black/white visual candidates, not approved `#418` semantic tokens. Unlike the first rest-family preview, these source-linked examples demonstrate concurrent visual states and responsive/Persian designs. They do **not** certify WCAG, OS forced-colors, browser focus behavior or all text optical metrics.

**Still open for #501 / #428:** native Danger, Square/Circular and compound/split review specimens and keyboard behavior, #418 focus-ring contrast/token decision (the original ring is low contrast across 10 Dark brand modes), cross-platform a11y/assistive-technology verification, and full v3 Button demo/docs/migration implementation. Known `Toggled`-without-`aria-pressed` gap remains under #428; this Penpot design does not repair that runtime semantic issue. Keep #501 **In progress** and PR #502 **Draft**, targeting `bluent-v3` only; `Dev`/2.x/NuGet unchanged.

Repeatable connected-design read-only check: `scripts/quality/penpot_v3_button_focus_matrix_audit.js`.
