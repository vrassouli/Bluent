# Penpot Fluent 2 Web import: verified read-only reference audit

> **Date:** 2026-10-10 · **Scope:** issue [#417](https://github.com/vrassouli/Bluent/issues/417) research feeding [#419](https://github.com/vrassouli/Bluent/issues/419) design-library work, [#418](https://github.com/vrassouli/Bluent/issues/418) tokens and future Button implementation. **Status:** imported-reference structure verified, NOT a Bluent v3 authored/approved design, imported visual-parity certification, runtime evidence or issue #419 implementation.
>
> **Penpot reference file:** `Microsoft Fluent 2 Web (Community)`, ID `b64f6665-c9ab-80b5-8008-c3cd9685a0a0`, revision **12**, verified through the connected Penpot MCP plugin. This **imported Penpot file is read-only as a design reference** for our work: no pages/components/tokens were created, moved, modified or deleted during this audit. The original [Figma community reference](https://www.figma.com/design/UxJ11V0c8TI8aaSVpdKeQD) also remains untouched. The existing independent [Bluent v3 Figma foundation research board](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=14-3) is a **draft** ADR map, not authoritative approved UI.
>
> **Next authoring prerequisite:** connect a **separate editable Penpot file named Bluent v3 Design System**. Do not mix Bluent-specific tokens/components with the imported community library. Only once the v3 file is connected should the actual #419 library work advance through Backlog → Ready → In progress.

## Connected reference inventory

Values below are **Penpot Plugin API results**, not a guess from a Figma screenshot:

| Asset | Imported reference count | Meaning/limit |
| --- | ---: | --- |
| Pages | **51** | Includes Cover/Docs, component pages and Subcomponents; not 51 Blazor components |
| Reusable Penpot library components | **124** | Component-family assets, including internal/subcomponent variants, not public Bluent API count |
| Library color styles | **16** | Not a complete count of semantic color tokens |
| Typography styles | **50** | Can include duplicate display names; not all necessarily appropriate for Bluent |
| Token sets | **153** | Many group-specific variant sets, *not* 153 independent themes |
| Token themes | **152** | Many named variant presets; *not* 152 light/dark theme palettes |
| Token entries over all sets | **2,699** | Different sets often reuse names |
| Distinct token names | **1,366** | Unique names across sets, not a resolved-mode count |
| Values containing token aliases | **1,375** | Reference names are present in the imported catalog; mode-active resolution/rendering still needs validation |
| Missing alias *names* from imported catalog (lexical match) | **0** | Does **not** prove correct active-set resolution, design token values or visual import parity |

Selected groups: `Mode/Light` **365** tokens (**active**), `Mode/Dark` **365** tokens (inactive during inspection), and `Global/Value` **758** tokens. There are **16** library color-style entries (not interchangeable with `Mode` token count). Examples of other set groups: `Brand`, `Layout`, `Avatar color`, `Tree indentation`, `DataGrid row`, `Card padding`, `Popover size`.

This is structurally promising: component assets, variants, color/type styles and mode tokens survived import. But **no lossless Figma→Penpot parity claim** is justified by these counts alone. Follow up with rendered samples, fonts, icon shape fidelity, flexible layouts, and interactions in the separate v3 workspace.

## Reference page/node locations (stable import IDs)

| Reference | Penpot page ID | What was inspected |
| --- | --- | --- |
| Button | `e81e92a3-efe9-80e8-8008-c3cbbc66cbfa` | Variant containers and 150 connected Button components |
| Field | `e81e92a3-efe9-80e8-8008-c3cbbf71f25f` | Two top-level boards, imported component |
| Input | `e81e92a3-efe9-80e8-8008-c3cbbf824b29` | Two top-level boards, imported component |
| Dialog | `e81e92a3-efe9-80e8-8008-c3cbbe87eb17` | Two top-level boards, imported component |
| DataGrid | `e81e92a3-efe9-80e8-8008-c3cbbe3ae000` | Seven top-level boards, cell variants |
| Checkbox | `e81e92a3-efe9-80e8-8008-c3cbbe28cc3f` | Two top-level boards |
| Drawer | `e81e92a3-efe9-80e8-8008-c3cbbeaa9803` | Six top-level boards |
| Subcomponents | `e81e92a3-efe9-80e8-8008-c3cbc6b70e35` | Internal/placeholder elements |

**Important:** these are IDs returned by the live Penpot connection. They are **not** Figma node IDs. Do not fabricate Penpot deep links without the actual Penpot server origin and workspace route.

## Button variant proof and API crosswalk

Penpot Button has main variant container **`a225b2d1-3148-561c-8b2e-5ba89523c87c`**, with **150 connected** variant component children (verified via `component()?.isVariant()`). Imported library Button ID **`76a3faa3-4591-5372-9caa-785ae9ce78df`**; example main instance **`501ff0c2-15eb-5c13-8dac-690a28dacfe0`** (**91 × 32 px**, in its default variant). The 150 variants comprise this complete four-axis matrix:

| Axis | Exact verified values |
| --- | --- |
| Layout (2) | `Icon and label (Default)`, `Icon only` |
| Size (3) | `Small`, `Medium (Default)`, `Large` |
| State (5) | `Rest`, `Hover`, `Pressed`, `Selected`, `Disabled` |
| Style (5) | `Outline`, `Primary`, `Secondary (Default)`, `Subtle`, `Transparent` |

Observed Button variant heights **24/32/40px**, with **50 variants per size**. This represents layout/state/visual variant coverage, **not** proof of keyboard focus, screen-reader semantics, loading animation, Fluent implementation/API parity or Bluent demo coverage.

Source-derived Bluent current code from `src/Bluent.UI/Components/ButtonComponent/`:

- `ButtonAppearance`: `Default`, `Primary`, `Danger`, `Outline`, `Subtle`, `Transparent`.
- `ButtonSize`: `Small`, `Medium`, `Large`.
- `ButtonShape`: `Rounded`, `Circular`, `Square`.
- `Button.razor.cs`: `Text`, `SecondaryText`, `Icon`, `Toggled`/`ToggledChanged`, `Rotated`, `Orientation`, `Dropdown`, `Badge`, `Compact`, `Href`, `OnClick` and other public parameters. Existing `Button.razor` also supports regular, link, dropdown and split-button branches.

**Mapping decisions to review, not yet implemented:**

1. Penpot `Secondary (Default)` likely aligns with Bluent `Default`; **do not rename the public enum** without a compatibility/migration decision.
2. Penpot `Selected` requires Bluent `Toggled` behavior analysis; state naming is not proof of exact selection interaction.
3. Bluent `Danger` is **not** a style value in this imported 150-variant Button matrix. Design its destructive/intent variant with contrast and keyboard semantics rather than silently dropping it.
4. Bluent `Circular` and `Square`, `Compact`, badges, secondary text, link mode, split/dropdown functionality and RTL must be represented by **additional Bluent-specific design variants/related components or documented extensions**.
5. The existing `24/32/40px` visual reference does not authorize changing public Button size/density defaults. Compare actual consumer behavior and minimum interactive target recommendations before adjusting.

## Follow-up process

- The imported Fluent 2 file remains a **read-only external reference**. No Penpot modifications were performed in #417 research.
- Create/connect a **separate** `Bluent v3 Design System` Penpot file. Author Foundations, Token Modes, Brand, Interaction, and component variants there, referencing the IDs above. Continue to use the Figma draft #417 architecture board as *historic draft research* until the new Penpot authoritative design decisions are reviewed.
- #419 remains **Backlog** until its required **Ready** gate and source design workspace prerequisites are satisfied; this audit is **dependency research in #417**, not an unauthorized #419 implementation.
- Approve #417 D1–D4, document the authoritative Penpot v3 design and code-parity gates, then begin #418 on its own task branch once it is Ready.
- Do **not** merge v3 into `Dev`, publish NuGet, or modify the stable consumer design.
