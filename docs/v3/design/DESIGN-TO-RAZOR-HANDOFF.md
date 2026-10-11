# Bluent v3 — Penpot design-to-Razor/CSS handoff contract (#419)

**Version:** draft design/review contract, 2026-10-11. **Not executable component API code.** Penpot design file: `Bluent v3 Design System` ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`; machine-readable exact page, board and source IDs are in [the manifest](penpot-workspace.manifest.json). Target runtime: Blazor in `vrassouli/Bluent`, **new v3 feature branches only**, base `bluent-v3`, never the stable `Dev` branch.

## 1. Layers: reference ≠ design ≠ public component

| Layer | Examples | Source of truth / permission | May assert |
| --- | --- | --- | --- |
| Upstream Fluent reference | Connected `Microsoft Fluent 2 Web (Community)` Button/Inputs/etc.; 134 authentic source-linked specimens | Read-only external Penpot file | **Visual reference only**; no Blazor API/runtime behavior |
| Owned v3 design | Five core local `VariantContainer` families (TextField 10, Checkbox 12, Switch 12, Button appearances 25 and sizes 6) and 4 original one-state draft reusable components | Owned file; exact source/preview IDs + 7 draft token sets / Light/Dark mode drafts | Editable state/anatomy geometry, inspected previews and versioned design constraints |
| **Research fixtures** | 10 controlled Fluent-matched Button and 6 Persian directional Button sources, 16 local links | Separate native test families, tracked distinctly | Matching-content/button Path/RTL experiment, **not** additional public v3 variant coverage |
| Proposed v3 implementation | Blazor component Razor/C#, scoped component CSS, approved alias tokens | New component-specific GitHub issue after required `Ready` acceptance and #417/#418 gates | Product behavior **only after interactive/CI/AT evidence** |
| Stable v2 public API | Existing `Button`, `TextField`, `Checkbox<T>`, `Switch`, `Dialog`, charts and diagrams | `src/Bluent.UI/Components/**` in current code/last stable release | Preserved unless separately approved, tested, and documented migration |

## 2. Stable design property naming

**Core local Penpot families**

| Visual control | Native axes | What cannot be inferred directly | Code-side mapping gate |
| --- | --- | --- | --- |
| Button appearance/state | `Appearance=Primary,Secondary,Outline,Subtle,Transparent`; `State=Rest,Hover,Pressed,Selected,Disabled` | Hover/Pressed/Selected are **drawings**, not native event handlers or `aria-pressed`; `Danger` absent from the source's five appearances | Existing Bluent `ButtonAppearance` has `Default`, `Primary`, `Danger`, `Outline`, `Subtle`, `Transparent`. **Default→Secondary is only a draft visual alias**; do not rename enums until migration approved |
| Button size/layout | `Size=Small,Medium,Large`, `Layout=Icon and label,Icon only` | Variant height 24/32/40 is a visual design value; it is **not** the minimum accessible touch target or real DOM button height | Existing `ButtonSize`; `Icon` and `Text` properties; test runtime slot geometry and density |
| TextField | Five interaction states × two appearances (10 native variants) | No public `TextField.Appearance` exists in current component. Filled/Outline is a **v3 decision**, not shipped API | Preserve `Value`, `EditContext`/forms, multiline rows, `BindValueEvent`, digit/Persian transformations, disabled/read-only |
| Checkbox | `Status=Checked,Unchecked,Mixed` × four states (12) | Mixed **visual** does not guarantee `aria-checked=mixed`, DOM `indeterminate` or tri-state cycling | Preserve generic `Checkbox<TValue>`, nullable bool, binding, label fallback; decide explicit mixed semantics and a11y |
| Switch | `Checked=On,Off` × three states × `Direction=LTR,RTL` (12) | Direction imagery does **not** set real `dir`, focus order, input checked state or screen-reader name | Preserve `Switch : Checkbox<bool>`, `LabelPosition.Before/After`, `ValueChanged`, disabled, accessible native input semantics |

**Research-only variants:** the `Appearance × State` ten controlled comparison fixtures are anchored to 91×32px / Segoe reference data; the six `Size × Direction` Persian variants visualize mirrored `+` and `ذخیره تغییرات`. They must **never** be counted as ten more production Button API states or six runtime-supported fonts/directions.

## 3. Draft token and CSS contract (subject to #417/#418 approval)

Design token sets: `bluent-v3/draft/light`, `dark`, `layout`, `typography`, `spacing-scale`, `motion`, `density` (7 sets, 49 entries); themes: `Bluent v3 / Mode: Light · Draft` and `Dark · Draft`. The current default-brand source values come from #417's audited existing CSS, **not an asserted identical Fluent 2 palette**.

A later implementation must document three layers explicitly:

1. **Global/source token:** Fluent 2 intent, typography, spacing/elevation/motion scale; brand-aware Light/Dark candidate mode values; final naming approved via #418. No global unrelated CSS override before #417 ADR.
2. **Bluent semantic alias:** stable CSS variables consumed by component styles, with fallback and precedence rules across ten brands, modes, ancestors, services and portals; actual source mapping tracked in [#417 theme contract crosswalk on the separate styling ADR branch](https://github.com/vrassouli/Bluent/blob/v3/issue-417-css-architecture/docs/v3/architecture/theme-contract-crosswalk.md).
3. **Component consumption:** `Button`, TextField, Checkbox, Switch use aliases with local CSS isolation/density and layout, preserving v2 public API or a separately documented breaking change. Avoid passing a Penpot shape fill directly as runtime truth.

**Do not** infer that `penpot.applyToken()` proves runtime CSS vars. The source from #417 has known service-hosted Dialog/portal theme ancestry gaps; runtime experiments are separate.

## 4. Minimum implementation test handoff for each component issue

The component issue must record:

- **Design:** source Fluent component/variant ID, owned Penpot native variant family/axis IDs, PNG export reference, 10-brand light/dark and tested density sizes; explicit deviations from Fluent and existing Bluent behaviors.
- **Public API:** new/existing enum values, parameters, callbacks, `RenderFragment` slots, `AdditionalAttributes` propagation, casing/namespaces and binding behavior. Guard old Button parameters using [source baseline](../../../scripts/quality/check_v3_button_api_baseline.py).
- **Appearance:** rest, hover, pressed, selected/toggled, disabled, focus-visible, invalid/read-only where applicable; link/button vs split/dropdown semantics; keyboard vs pointer behavior.
- **Accessibility:** semantic native element, screen-reader name/state, ARIA only where appropriate, visible focus/forced-colors, 200–400% zoom/reflow, touch targets, reduced motion and RTL mirrored logical placements.
- **Blazor:** SSR/interactive server/webassembly render modes, form/EditContext validation and field state, theme service/Popover/Dialog portal ancestry, event callbacks and JS disposal.
- **Demo:** a **complete component-specific demo** that shows the actual public component capabilities, not a Penpot screenshot; compare relevant flows with storybooks.fluentui.dev/web-components **as a reference**, while keeping Bluent-only features.
- **Docs/skill:** usage, API reference, accessibility/RTL/theme notes, 2.x migration and a component-level agent skill.
- **Verification:** build/test/release pack (without publishing), browser screenshot/cascade and keyboard tests with explicit pass/fail; issues update **Backlog → Ready → In progress → Review → Done** through real GitHub Project status.

## 5. Example: Button design anatomy → eventual runtime mapping

| Native design layer | Owned geometry experiment | Runtime semantic/implementation requirement |
| --- | --- | --- |
| Outer Button | Draft face 24/32/40px for Small/Medium/Large, radius varies | `<button type>` by default or `<a href>` for Href; preserve `Disabled`/class forwarding and focus/keyboard semantics |
| Content icon+label | Centered 16/18/20px local plus vector in core size/layout family; 6–8px fixed gaps | Actual Bluent `Icon` asset and `Text`, using CSS inline-flex logical gap, stretch/shrink and `min-inline-size` policy; confirm font metrics |
| Icon-only | Fixed circle/square face center-pinned under container stretch | Visual shape should not become wide pill; accessible name required if no visible Text; real minimum interactive target policy |
| Color/state | Named `Appearance` × `State`, draft tokens for Primary/Rest and literal draft state colors | CSS `:hover`, `:active`, `:focus-visible`, `:disabled`, toggled state and brand/mode/forced-colors; **do not treat screenshot states as event logic** |
| RTL | Persian direction fixture swaps icon to right and maintains Persian text direction | CSS logical `gap`/alignment; actual `dir=rtl`, visual and DOM reading/focus order tests, long labels and locale fonts |
| Compound/split | Draft sketches of `SecondaryText`, `Dropdown`, `Badge`, `Danger` etc. | Preserve existing public Bluent behaviors or document approved migration; test popover/portal focus/theme and button-group event routing |

## 6. Quality/acceptance and change control

Before a **new component** issue can reach Ready, confirm styling ADR (#417) and final token decision (#418), independent approved Penpot design page, actual known runtime API inventory, demo plan and traceable migration constraints. **Do not implement the component merely because #419 design references exist.**

Design provenance: [Penpot import report](PENPOT-IMPORT-FIDELITY.md), [controlled source comparison](BUTTON-CONTROLLED-FIDELITY-AND-RTL.md), [Penpot alignment scanner](../../../scripts/quality/penpot_v3_alignment_audit.js), [resize constraints](BUTTON-RESIZE-REVIEW.md), and [migration ledger](MIGRATION-IMPACT-LEDGER.md).

**#419 deliverable** is the *design system/reference/handoff methodology*, not completion of every component's production implementation; #419 may be reviewed independently as a library gate, while the rest of Epic #416 remains uncompleted.