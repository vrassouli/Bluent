# Bluent v3 Design System — Penpot working library (#419)

> **Status: In progress · DRAFT / NOT APPROVED · 2026-10-10**
> **Repository work:** `v3/issue-419-penpot-library` → **PR into `bluent-v3` only**.
> **Design file:** `Bluent v3 Design System`, Penpot file ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`. All IDs below were returned by the **live connected Penpot MCP API**, not inferred from external URLs. The browser workspace URL was not supplied; **do not invent a Penpot deep link**.
> **Scope:** Build a traceable, editable **project-owned** design workspace before any public component/CSS changes. Approval of #417's CSS ADR and #418's token implementation is **not** implied by this draft.

**Penpot recovery points:** the initial named draft was saved at revision 14 as `Bluent v3 · #419 foundation library draft 2026-10-10`; the extended foundation design was subsequently saved at revision **24** as `Bluent v3 · #419 expanded foundation research 2026-10-10`, and the upstream linked Button matrix at revision **27** as `Bluent v3 · #419 Fluent Button 25-state reference 2026-10-10`. A further revision **42** was saved as `Bluent v3 · #419 linked form/grid references 2026-10-10`; then revision **48** as `Bluent v3 · #419 local TextField Checkbox Switch draft 2026-10-10`. All are draft recovery points, not design approval. The primary source of design truth is still the Penpot working file; this repository only stores IDs and review evidence.

## 1. Design provenance and connected library caveat

The original imported Penpot file `Microsoft Fluent 2 Web (Community)` is a **read-only upstream reference**, file ID `b64f6665-c9ab-80b5-8008-c3cd9685a0a0`, revision 12 when inspected. It contains **51 pages, 124 local reusable components, 153 token sets and 150 connected Button variants** (2 layouts × 3 sizes × 5 states × 5 styles); see issue #417 source-audit work on [draft PR #498](https://github.com/vrassouli/Bluent/pull/498).

**Linked-library availability (reverified):** Penpot initially listed the imported Fluent file in `library.connected` but **0 component assets** were visible immediately after opening the new file. A manual call to `penpot.library.connectLibrary(referenceId)` returned 0 **while the library sync was still in progress**. On subsequent reads, the imported library provided the full **124 components**, and the actual `Button` `instance()` operation succeeded. The created instance ID is `07c521b9-e441-80bd-8008-c4afbeace57a`, with `isComponentInstance()=true`, `component().name=Button`, default state `Secondary / Rest / Medium / icon+label` and 91 × 32 dimensions. It was moved to an explicitly labeled read-only reference specimen board (ID `07c521b9-e441-80bd-8008-c4afd554a335`) and **its Penpot PNG render was visually inspected**.

**Status correction:** the upstream library is **now functionally linked** and no separate manual publication request is currently needed. The *first read showing 0* was an unready-library/synchronization observation, **not evidence that the reference file was unpublishable**. The imported source file and assets themselves were not edited; we only instantiated an external linked Button inside our **own** file. Consumer agents must verify `connectedLibrary.components` and `instance.isComponentInstance()` before claiming a live linked instance, rather than trusting the name alone.

## 2. Actual editable file/page/board inventory

| Purpose | Penpot page ID | Main board ID | Verified contents |
| --- | --- | --- | --- |
| `00 · Start here` | `b64f6665-c9ab-80b5-8008-c4ac99d9d001` | `07c521b9-e441-80bd-8008-c4ada8c1f76c` | Workspace overview, external source, D1–D4 draft architecture and #419 scope |
| `01 · Foundations` | `07c521b9-e441-80bd-8008-c4ad87dde57e` | `07c521b9-e441-80bd-8008-c4ae222798a6` | Native editable light/dark specimens from **verified current** default CSS, candidate D1–D4 decision cards |
| `02 · Component anatomy` | `07c521b9-e441-80bd-8008-c4ad87dee26e` | `07c521b9-e441-80bd-8008-c4ae9e63585f` | Native, **locally drawn** Button variant mapping and Bluent-specific extension checklist |
| `03 · Quality & migration` | `07c521b9-e441-80bd-8008-c4ad87df93c3` | `07c521b9-e441-80bd-8008-c4aee23bc3ec` | Four-stage reference → design → implementation → review acceptance flow; v2 isolation policy |
| `04 · Typography & spacing` | `07c521b9-e441-80bd-8008-c4b24ce333b9` | `07c521b9-e441-80bd-8008-c4b27d1df98c` | Source font sizes/line heights and spacing specimens; Inter visual substitute |
| `05 · Density & responsive` | `07c521b9-e441-80bd-8008-c4b24ce4cf82` | `07c521b9-e441-80bd-8008-c4b2a95b3527` | Three proposed density/command-surface patterns, not accepted defaults |
| `06 · Motion & elevation` | `07c521b9-e441-80bd-8008-c4b24ce54e51` | `07c521b9-e441-80bd-8008-c4b2ead05451` | Eight source durations, six illustrative Penpot drop shadows, reduced-motion policy gap |
| `07 · Accessibility & RTL` | `07c521b9-e441-80bd-8008-c4b24ce6f58c` | `07c521b9-e441-80bd-8008-c4b32a4e1bec` | Editable Persian RTL and English LTR, conceptual forced-colors system colors/focus |
| `08 · Brand inventory` | `07c521b9-e441-80bd-8008-c4b24ce7b0aa` | `07c521b9-e441-80bd-8008-c4b3688e43c6` | Ten existing brand × light/dark CSS background token specimens |
| `09 · Fluent Button state reference` | `07c521b9-e441-80bd-8008-c4b57568c3ef` | `07c521b9-e441-80bd-8008-c4b5759995ec` | **25 genuinely linked** imported Fluent Button variants: five styles × five states, Medium/icon+label; upstream visual reference only |
| `10 · Fluent Input reference` | `07c521b9-e441-80bd-8008-c4d65ae7b089` | `07c521b9-e441-80bd-8008-c4d65b54658b` | **28 linked** Input Medium states/appearances, not TextField runtime tests |
| `11 · Fluent Checkbox reference` | `07c521b9-e441-80bd-8008-c4d69e1290a6` | `07c521b9-e441-80bd-8008-c4d69e2a5bfe` | **30 linked** Checkbox state/status/style specimens, including Indeterminate |
| `12 · Fluent Dialog reference` | `07c521b9-e441-80bd-8008-c4d6ead3600b` | `07c521b9-e441-80bd-8008-c4d6eae7cfb0` | **4 linked** 320/600px × Text/Placeholder layouts; no modal behavior testing |
| `13 · Fluent DataGrid cells reference` | `07c521b9-e441-80bd-8008-c4d7543f25ff` | `07c521b9-e441-80bd-8008-c4d7545257d7` | **7 linked** Medium **cell-only** layouts, not a complete Grid |
| `14 · Fluent Switch reference` | `07c521b9-e441-80bd-8008-c4d793a549ff` | `07c521b9-e441-80bd-8008-c4d793b68198` | **40 linked** Checked×Layout×State switch variants |
| `15 · Bluent native control drafts` | `07c521b9-e441-80bd-8008-c4d95657c458` | `07c521b9-e441-80bd-8008-c4d9703f9bc2` | Three locally authored and reusable draft TextField, Checkbox, Switch control designs with three real linked **local** preview instances |

The original design boards, all **five extended foundation boards**, the **25-instance linked Fluent Button reference board**, and the **five new Input/Checkbox/Dialog/DataGrid-cell/Switch reference boards** were exported to PNG and visually inspected through the connected Penpot tool; **this is design-artifact inspection, not runtime parity or CI screenshot regression validation**. Shapes are editable native Penpot boards, rectangles and text layers, not flattened illustration imports.

## 3. Prototype design tokens and themes (never ship as final names)

The design file began with **3 locally authored draft sets** and now has **7 sets / 49 entries** in total. Source-aligned typography, spacing-scale, motion, and experimental density sets are described in the [extended foundations audit](FOUNDATION-EXTENSIONS.md). The initial sets were:

| Set | Active in verified Light baseline? | Values |
| --- | --- | --- |
| `bluent-v3/draft/light` | yes | `bluent.color.background1=#FFFFFF`; `foreground1=#242424`; `brandBackground=#1267B4`; `stroke1=#D1D1D1`; `brandForeground1=#1267B4` |
| `bluent-v3/draft/dark` | no | `bluent.color.background1=#292929`; `foreground1=#FFFFFF`; `brandBackground=#18599B`; `stroke1=#666666`; `brandForeground1=#4F82C8` |
| `bluent-v3/draft/layout` | yes | `bluent.spacing.horizontalM=12` (spacing); `bluent.radius.medium=4` (border radius); `bluent.motion.fasterMs=100` (number) |

Both draft themes now explicitly include **five shared token sets** (layout, typography, spacing-scale, motion, density) plus their single mode-specific Light/Dark set. The verified transition still leaves the shared sets active. There are **two themes** in group `Bluent v3 / Mode`: `Light · Draft` and `Dark · Draft`. A real API toggle **Light → Dark → Light** verified the expected mutually exclusive active theme/semantic sets, while retaining the layout set. The final state was restored to **Light**. This validates the **Penpot token-set/theme activation mechanism**, not complete light/dark visual or 10-brand parity.

The values above are a **source-referenced prototype of Bluent 2.x default-brand styling**, pending #417 styling ADR, #418 source/alias architecture and approved contrast/forced-colors/motion design. They are not claims of exact Microsoft Fluent 2 theme values or the full Bluent design token contract.

## 4. First local reusable prototype component and upstream link

The locally created Penpot library component **`DRAFT · Primary Button`** has ID `07c521b9-e441-80bd-8008-c4aec6fea27e` and main board ID `07c521b9-e441-80bd-8008-c4aec6f7e429`. The first 164 × 40px primary example was made from **native editable Penpot board + text** and its background **successfully applied the local `bluent.color.brandBackground` design token** (`applyToken`). It is **not** an imported Fluent instance, an approved public Button, or a complete v3 Button variant library. **Separately**, a real linked upstream Fluent Button instance now exists in the `#419 · Fluent connected specimen` board (IDs above), and an additional board holds **25 verified linked upstream variants**, with exact IDs in the [extended foundations specification](FOUNDATION-EXTENSIONS.md). This is a reference object only; the Bluent Button is its own distinct editable component.

The [verified upstream Penpot reference](https://github.com/vrassouli/Bluent/issues/417) defines 150 layout/size/state/appearance variants; existing Bluent public `Button` also has `Danger`, `Circular`/`Square`, `Compact`, toggle, icon/badge/link/split/dropdown, secondary text and RTL behaviors. The exact final design, keyboard accessibility and 100%-feature demo belong to the later **individual Button implementation issue**, not #419.

## 5. Linked form/grid reference work

Five additional **source-linked static design** matrices have been authored within this independent Penpot file: Input **28**, Checkbox **30**, Dialog **4**, DataGrid **cell** **7**, Switch **40**. All five boards were visually inspected, and every one of the **109 new instances** was reverified as a connected source variant after the Penpot file was saved at revision 42. **Total linked reference matrix instances including Button: 134 across six families.** This does not mean 134 public Blazor components, full Fluent coverage, or functioning UI.

The exact upstream variant axes, new page/board IDs, existing Bluent C# source/API crosswalk and unresolved acceptance tests are in the [component reference matrices](COMPONENT-REFERENCE-MATRICES.md).

## 6. Expanded local Bluent editable components

The local Bluent library now has **four native reusable Penpot draft components**: Primary Button, TextField, Checkbox and Switch. The last three are authored independently of the upstream Fluent library, their draft background/brand fill properties use local design tokens, and the page `15 · Bluent native control drafts` contains **three linked local instances** (one per new prototype), with the full board visually reviewed. They are *single-state visual proposals*, not final public Blazor controls or comprehensive design variants.

See [locally owned component drafts](LOCAL-COMPONENT-DRAFTS.md) for their exact component IDs, main boards, preview instance IDs, token binding evidence, and the untouched public API boundary.

## 7. Design and code contract: acceptance gates

- **Backlog → Ready → In progress:** #419 was first moved to **Ready**, verified, then to **In progress**, verified on actual GitHub Project #5; user supplied and connected the required editable file. A **draft** #417 token-contract crosswalk is the research input; the final ADR is still pending.
- **Source of truth:** local Bluent-native design artifact IDs above; original imported Fluent remains read-only; prior Figma #417 research remains draft and must be reviewed/synchronized if authoring a final ADR in the new Penpot file.
- **Before Review:** the upstream library is now linked and one Button was instantiated and visually inspected; extend checks to **variant switching**, fonts/icons/layout fidelity and state matrix; enrich own foundations with typography, brand palette, density, RTL, high contrast, reduced motion, responsive/layout patterns and accessibility; document actual design-to-code mapping/constraints.
- **Before Done:** PR reviewed/accepted with evidence, migration implications, docs/Skills/demo/test plans, passed required CI and merge into `bluent-v3` **only**. Keep #419 **In progress** meanwhile.
- **Non-regression guardrail:** never merge any v3 work into `Dev`, publish stable NuGet, or mutate the imported Fluent or unrelated PuyaStudio Penpot file.

For automated tooling/agents, identifiers and status labels are mirrored in [`penpot-workspace.manifest.json`](penpot-workspace.manifest.json). This manifest provides traceability, **not an automatically verified live Penpot connection**; verify with the Penpot tool when resuming work.