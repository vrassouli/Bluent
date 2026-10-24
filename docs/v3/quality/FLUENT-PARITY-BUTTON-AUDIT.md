# #552 family audit — Button (#428)

**Status: partial source/browser audit with confirmed gaps.** This is not Fluent 2 parity acceptance, a design approval, an OS/assistive-technology sign-off, or permission to implement the Button fix. Current source under review is the existing Bluent Button component and the original Component Lab/demo evidence linked below; stable `Dev` and product source remain untouched.

## Upstream comparator and mapping decision

The pinned Fluent Web Components 3.1.3 crosswalk identifies these related public tags: `fluent-button`, `fluent-toggle-button`, `fluent-compound-button`, `fluent-menu-button`, and `fluent-anchor-button`. The pinned Fluent React 9.74.10 fallback separately identifies `Button`, `ToggleButton`, `SplitButton`, `CompoundButton`, and `MenuButton`. These are **related interaction families, not one interchangeable component/API**. In particular, React's `SplitButton` is only a fallback comparator here; the checked Web Components tag inventory does not establish a dedicated one-to-one split-button element.

Bluent's `Button` combines several models in one component: a native `button`, an `a` when `Href` is supplied, optional toggle state, compound text, icons, badge content, and `Dropdown` composition that changes into dropdown-only or split-button behavior depending on whether `OnClick` has a delegate. The public enum domains (`ButtonAppearance`, `ButtonShape`, `ButtonSize`) and `IconDefinition` value are Bluent contracts; matching names or a visual resemblance do not establish upstream equivalence. The existing API-name crosswalk records four name candidates among 30 Button parameter occurrences, with the remaining 26 having no exact-name candidate. This is candidate research, not a complete supported/missing/extension disposition for every feature.

## Evidence reviewed

| Dimension | Current evidence | Finding / status |
| --- | --- | --- |
| Source/API | `src/Bluent.UI/Components/ButtonComponent/Button.razor`, `.razor.cs`, public enums, [canonical Button reference](../../components/button.md), pinned WC and React crosswalks | **Partial only.** Current API and composition paths are identified; full feature-by-feature upstream disposition remains open. |
| Keyboard behavior | [real Enter/Space and toggle evidence](FLUENT-PARITY-P0-BUTTON-KEYBOARD.md) | Native Enter and Space activation work, with one bound toggle callback per observed activation in WebAssembly and Release-published InteractiveServer. Do **not** report the control as keyboard-inert. |
| Accessible name / toggle state | [icon and AX evidence](FLUENT-PARITY-BUTTON-ICON-AX.md), [toggle state transitions](FLUENT-PARITY-BUTTON-TOGGLE-STATES.md) | Confirmed browser AX gaps: decorative private-use icon glyphs contaminate text-button names; icon-only buttons expose a glyph rather than a contextual action name; hover can change the computed name; `aria-pressed` is absent for a `Toggled` button. |
| Visual geometry | [icon alignment evidence](FLUENT-PARITY-BUTTON-ICON-AX.md) | DOM boxes for icon and text were vertically aligned at 0px difference for sampled sizes. This is not optical glyph comparison or a pixelwise Fluent screenshot comparison, so it does not prove visual parity. |
| Focus / appearance | [Button focus evidence](FLUENT-PARITY-P0-BUTTON-KEYBOARD.md) and #501 focus-design handoff | Preserve the maintainer-approved brand focus-ring direction. This audit does not approve a final focus implementation or full appearance/state matrix. |

The evidence documents report Chrome/Edge source observations, including 10/10 observed keyboard checks in both WebAssembly and published InteractiveServer, 45/45 checks per browser for the icon alignment/AX experiment, and 33/33 per browser for toggle-state transitions. These checks deliberately capture the **current defects**; green observation checks are not parity passes. Forced-colors runs cited by the source reports are CSS/browser emulation, not native Windows Contrast Themes or screen-reader acceptance.

## Confirmed gaps and ownership

1. **Toggle state is not exposed by default.** `Toggled.HasValue` drives click state and callbacks, but `Button.razor` does not render intrinsic `aria-pressed=false/true`. The browser evidence confirms the omission in both tested hosting modes. Owner: #428; caller-attribute precedence must align with #420.
2. **Decorative icons enter the accessible name.** Regular and Filled icon children are both rendered; the browser's accessible name can include their private-use glyph, and the glyph/name can change on hover. Icon-only controls lack a meaningful contextual name by default. Owners: #428 and shared icon semantics #429, coordinated through #420.
3. **Composition is not yet mapped to upstream semantics.** Dropdown-only, split, compound, link, and toggle paths need separate per-path keyboard, accessible-name, popup-trigger, focus-order, and event checks. A single Button smoke test does not cover them all.
4. **Full API disposition is incomplete.** Each parameter, inherited attribute, event/callback order, enum value, composition slot and default still needs a grounded Supported / Missing / Intentional Bluent extension / N/A-with-rationale / Unverified mapping against the pinned upstream component signatures.
5. **Visual and design acceptance remain open.** No pixelwise reference comparison or full state matrix is established by the box measurements. The accepted editable Bluent v3 design reference, reviewer decision and complete state/size/appearance/RTL/theme matrix must be linked before design approval.
6. **Native assistive technology remains untested.** Browser AX trees are reproducible evidence of DOM accessibility gaps, not proof of what NVDA/JAWS or another native screen reader announces. Native OS contrast and screen-reader checks remain pending.

## Disposition for the canonical nine-dimension matrix

- `behavior`: `audited_gaps` — narrow, reproducible keyboard/toggle observations exist and expose a gap; exhaustive parity behavior is not complete.
- `accessibility`: `audited_gaps` — browser AX evidence reproduces name and pressed-state gaps; native OS/AT acceptance is still pending.
- `visual`: `audited_gaps` — the Penpot comparison export omits headings and row/column labels; see [core-control design audit](FLUENT-PARITY-CORE-CONTROLS-DESIGN-AUDIT.md).
- `feature`: `audited_gaps` — 30 API parameters are mapped in [Wave A API review](FLUENT-PARITY-WAVE-A-API-REVIEW.md); Danger is an extension and anchor/toggle/menu/Badge composition is not 1:1.
- `designArtifact`: `audited_gaps` — editable reference/draft pair is linked in the core-control design audit; approval remains pending.
- `tokenTheme`, `responsiveRTL`, `BlazorExtensions`, `migrationDocs`: `audited_gaps`.
- Family `auditStatus`: `researching`; `designApproval`: `pending`; `evidenceBundle`: `null`; `gapDisposition`: `known_gaps_open`.

## Next owner actions

- Keep product implementation in #428 until its lifecycle/design/architecture prerequisites are met; do not patch the component in this audit branch.
- Review the [Wave A API ledger](FLUENT-PARITY-WAVE-A-API-REVIEW.md) and decide which Bluent extensions are intentional; then complete the remaining composition/keyboard paths, including disabled behavior, popup focus/return, link behavior, callback ordering and caller-supplied ARIA precedence.
- Review the full editable Bluent v3 Button design (including the focus-visible subset owned by #501) and compare real screenshots across appearances, sizes, states, themes, RTL/LTR, 320px/reflow and forced colors.
- After any owner-approved remediation, rerun the same source-real tests and add native OS/assistive-technology evidence; keep unknown cases explicitly pending.

## Source references

- [Fluent Web Components 3.1.3 family crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md)
- [Fluent Web Components 3.1.3 API-name candidates](FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.md)
- [Fluent React 9.74.10 semantic triage](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md)
- [Fluent React 9.74.10 API-name candidates](FLUENT-REACT-9.74.10-18-API-CANDIDATES.md)
- [Button keyboard evidence](FLUENT-PARITY-P0-BUTTON-KEYBOARD.md)
- [Button icon/accessible-name evidence](FLUENT-PARITY-BUTTON-ICON-AX.md)
- [Button toggle-state evidence](FLUENT-PARITY-BUTTON-TOGGLE-STATES.md)
- [Button owning issue #428](https://github.com/vrassouli/Bluent/issues/428)

**Boundary:** source and browser evidence supports a partial audit with open gaps. It does not mean the Button is Fluent-equivalent, design-approved, implemented, or Done.

