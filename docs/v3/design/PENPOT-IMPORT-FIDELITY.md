# #419 — Penpot Fluent 2 import and design-fidelity assessment

**Status:** deliverable for design-library review; imported-source parity is **not certified**. Verified in the project-owned `Bluent v3 Design System` file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, using the connected upstream `Microsoft Fluent 2 Web (Community)` file `b64f6665-c9ab-80b5-8008-c3cd9685a0a0`. Findings dated 2026-10-11. Do not confuse this with an independently validated source-Figma → Penpot pixel/interaction diff: **no lossless import claim** can be made.

## Scope and source provenance

| Question | Directly verified evidence | Confidence / limitation |
| --- | --- | --- |
| Is there a real imported reference? | Upstream connected library with **124 reusable components**; source has **51 Penpot pages**, **153 token sets** (at earlier inspection) and **150 Button variants** = 2 layouts × 3 sizes × 5 states × 5 styles | Verified in Penpot; the original Figma file's complete node/component/token counts were not independently measured, so absence of import loss **cannot** be inferred |
| Can owned designs link to external components? | **134 upstream-linked specimens** in six research matrices: Button 25, Input 28, Checkbox 30, Dialog 4, DataGrid **cell-only** 7, Switch 40; `isComponentInstance()` and source component ID checked | Pass, no unsupported claim of a working DataGrid |
| Does the owned Penpot library exist separately? | **26 design pages**, seven draft token sets/49 tokens, two draft Light/Dark modes, four original editable prototypes, five **core** native `VariantContainer` families containing **65 unique designs / 65 linked previews** | Verified live; draft, not complete component library or released design system |
| Are Fluent-style variants represented at all? | 25 core Button `Appearance × State` and six core Button `Size × Layout`; original Fluent has 150 cross-product combinations | **Partial**; 25+6 independent 2-axis slices do not cover 150 four-axis interactions |
| Are original reference colors, geometry and icon paths extractable? | Controlled Medium Button page has 10 source/owned pairs: same 91×32px frames, label, color, borders and **exact copied vector Path commands**; live audit **233 checks / 0 errors** | Pass **for the tested fixtures**, not typography/overall source fidelity |
| Is font fidelity lossless? | Fluent reference Button declares **Segoe UI**, while available local Penpot font family for owned comparison is **Inter**; draft Persian specimens use **Noto Sans Arabic** | **Open font-fidelity gap**. No packaged font distributed or injected into this project; deployment-specific font availability and license must be resolved |
| Does ordinary Penpot resizing preserve native component anatomy? | Initial native Button root stretch left face fixed; after constraints, six source variants passed **18 actual linked natural/wide/compact instances**, **145 checks / 0 errors** | Pass for authored/tested widths. Shape remains circle for icon-only; text Button faces stretch. Minimum text width remains a separate runtime requirement |
| Does imported source `switchVariant` behave like the owned variants via plugin? | Scratch instances tested on the active project-owned page: **local native Primary/Rest → Primary/Hover** updated source ID immediately and after next Penpot read. **Imported Fluent Primary/Rest → Hover** returned without API error but **remained Primary/Rest after next read**. Both scratch instances removed | **Observed Penpot-plugin/source-linked mutation limitation**, not proof that interactive Penpot UI cannot switch variants or that library import corrupted variant definitions |
| Does `FlexLayout` solve geometry? | Initial Small Button flex-layout experiment rendered with a missing label in PNG; experiment reverted. Fixed geometry/constraints then passed live tests | Plugin/layout synchronization risk; cannot claim CSS flexbox or general resize behavior from this draft |
| What is known about full Figma import loss? | The linked Penpot import is editable and the reference specimens work; exact original Figma node count, constraints, component properties, interaction wiring, typography and tokens were **not** exhaustively compared against the original Figma file | **Not proven.** Never write `lossless`, `100% imported` or `identical` from this evidence |

## Reproduction of imported-source variant switching

The following was executed only against disposable scratch instances **in the Bluent working file**. The read-only Microsoft reference source remained unchanged.

1. On local Button 25-state source family `e31294c6-7c55-805f-8008-c5900fba48e4`, create a Primary/Rest instance, append to active page. Invoke `switchVariant(1, "Hover")` (axis `State`). **Observed:** component ID changes from `e31294c6-7c55-805f-8008-c5900987e9aa` to `e31294c6-7c55-805f-8008-c5901c61e8f7`, `variantProps.State="Hover"` immediately and on a subsequent read.
2. On connected original Fluent Button, create Primary/Rest/Medium/icon+label instance; invoke `switchVariant(2, "Hover")` (source axes: Layout, Size, State, Style). **Observed:** no thrown API error, but component ID `fb887d9a-dd90-5e60-b292-c0952346aab3` and `variantProps.State="Rest"` remain unchanged immediately and on the next tool call.
3. Remove both scratch instances. Verify there are no `TEMP ·` probes on the page. Import remains connected and the independently instantiated 134 visual source references remain usable.

**Follow-up to distinguish API limitation vs import defect:** manually change an imported Button variant in the Penpot inspector on a temporary linked instance, then inspect resulting ID; test source `switchVariant` on another plugin or Penpot version; if inspector succeeds but plugin fails, file upstream plugin issue rather than modifying the imported library or silently detaching source instances.

## Fidelity / coverage risk ledger

| Severity | Gap | Owner / next acceptance |
| --- | --- | --- |
| **High** | Imported v3 reference has **Segoe UI** but owned Penpot draft falls back to Inter; Persian uses provisional Noto Sans Arabic | #419 review + #418 typography tokens; font deployment and visual review on actual supported operating systems |
| **High** | Public Bluent 2.x `Default`/Danger and more capabilities than source Fluent Style axes | Future Button component issue after #417/#418; [migration impact ledger](MIGRATION-IMPACT-LEDGER.md) |
| **High** | No Figma-file ↔ Penpot export node-by-node diff | If exact original Figma import parity becomes an approval requirement, acquire verifiable source snapshots and compare counts, responsive constraints, typography and component interactions |
| **Medium** | Imported connected `switchVariant` did not mutate via the tested plugin command, though local variant switching did | Reproduce using UI and plugin version, keep source reference immutable |
| **Medium** | Native Button fixed/responsive dimensions work only at authored widths ≥ intrinsic content minimum | Individual Button component acceptance; real 200–400% browser zoom, long Persian label, SSR and keyboard tests |
| **Medium** | Penpot AutoLayout experiment lost caption in exported preview | Avoid claiming native AutoLayout compliance, use explicitly audited Penpot constraints and separate CSS runtime rules |
| **Medium** | Light/Dark token mechanism works, but only default initial brand values are represented | #418 design tokens, ten brands × both modes, forced-colors and reduced-motion |
| **Medium** | Penpot visuals are noninteractive; no `EditContext`/screen-reader/portal behavior | Dedicated TextField/Checkbox/Switch/Dialog/Button issues, feature-complete demos and browser/AT tests |
| **Low** | Upstream DataGrid references are **only seven cell variants** | DataGrid-specific issue, no premature Grid parity claim |

## Reusable and versioned workflow

1. **Reference:** always identify original connected component file/name/variant axes and create a live linked reference in the owned design file. Require a real component source ID and PNG inspection.
2. **Author:** make a project-owned `VariantContainer`; never modify source Fluent Community assets. Preserve main instance names to avoid the observed Penpot variant-axis reset.
3. **Verify:** read back the axes and **unique** tuples; verify all local preview instances link to exact source variants. Audit geometry, complete states, Persian RTL, min-width, token/mode semantics, and export a PNG.
4. **Handoff:** store page/board/VariantContainer IDs and caveats in [the manifest](penpot-workspace.manifest.json). Use [design-to-code handoff](DESIGN-TO-RAZOR-HANDOFF.md) to map properties to actual Razor APIs without inventing them.
5. **Change control:** record migrations/consumer consequences explicitly. Request actual Penpot/Figma and final semantic styling approval before making product-level Blazor changes; do not merge v3 work to stable `Dev` or publish old NuGet.

**Acceptance boundary:** This report completes the **import viability / import-loss risk evaluation** for #419. It does **not** resolve #417 CSS architecture sign-off, #418 token schema implementation, final font support, or parity of every Fluent 2 and existing Bluent component.
