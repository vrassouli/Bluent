# Bluent v3 Design System — Penpot working library (#419)

> **Status: In progress · DRAFT / NOT APPROVED · 2026-10-10**
> **Repository work:** `v3/issue-419-penpot-library` → **PR into `bluent-v3` only**.
> **Design file:** `Bluent v3 Design System`, Penpot file ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`. All IDs below were returned by the **live connected Penpot MCP API**, not inferred from external URLs. The browser workspace URL was not supplied; **do not invent a Penpot deep link**.
> **Scope:** Build a traceable, editable **project-owned** design workspace before any public component/CSS changes. Approval of #417's CSS ADR and #418's token implementation is **not** implied by this draft.

**Penpot recovery point:** a named design-file version was saved on 2026-10-10 as `Bluent v3 · #419 foundation library draft 2026-10-10` (verified working-file revision 14 at the time of the save). This labels **draft progress**, not approval. The primary source of design truth is still the Penpot working file; this repository only stores IDs and review evidence.

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

All three authored boards were exported to PNG and visually inspected through the connected Penpot tool; **this is design-artifact inspection, not runtime parity or CI screenshot regression validation**. Shapes are editable native Penpot boards, rectangles and text layers, not flattened illustration imports.

## 3. Prototype design tokens and themes (never ship as final names)

The new file has **3 locally authored draft sets**:

| Set | Active in verified Light baseline? | Values |
| --- | --- | --- |
| `bluent-v3/draft/light` | yes | `bluent.color.background1=#FFFFFF`; `foreground1=#242424`; `brandBackground=#1267B4`; `stroke1=#D1D1D1`; `brandForeground1=#1267B4` |
| `bluent-v3/draft/dark` | no | `bluent.color.background1=#292929`; `foreground1=#FFFFFF`; `brandBackground=#18599B`; `stroke1=#666666`; `brandForeground1=#4F82C8` |
| `bluent-v3/draft/layout` | yes | `bluent.spacing.horizontalM=12` (spacing); `bluent.radius.medium=4` (border radius); `bluent.motion.fasterMs=100` (number) |

There are **two themes** in group `Bluent v3 / Mode`: `Light · Draft` and `Dark · Draft`. A real API toggle **Light → Dark → Light** verified the expected mutually exclusive active theme/semantic sets, while retaining the layout set. The final state was restored to **Light**. This validates the **Penpot token-set/theme activation mechanism**, not complete light/dark visual or 10-brand parity.

The values above are a **source-referenced prototype of Bluent 2.x default-brand styling**, pending #417 styling ADR, #418 source/alias architecture and approved contrast/forced-colors/motion design. They are not claims of exact Microsoft Fluent 2 theme values or the full Bluent design token contract.

## 4. First local reusable prototype component and upstream link

The locally created Penpot library component **`DRAFT · Primary Button`** has ID `07c521b9-e441-80bd-8008-c4aec6fea27e` and main board ID `07c521b9-e441-80bd-8008-c4aec6f7e429`. The first 164 × 40px primary example was made from **native editable Penpot board + text** and its background **successfully applied the local `bluent.color.brandBackground` design token** (`applyToken`). It is **not** an imported Fluent instance, an approved public Button, or a complete v3 Button variant library. **Separately**, a real linked upstream Fluent Button instance now exists in the `#419 · Fluent connected specimen` board (IDs above). This is a reference object only; the Bluent Button is its own distinct editable component.

The [verified upstream Penpot reference](https://github.com/vrassouli/Bluent/issues/417) defines 150 layout/size/state/appearance variants; existing Bluent public `Button` also has `Danger`, `Circular`/`Square`, `Compact`, toggle, icon/badge/link/split/dropdown, secondary text and RTL behaviors. The exact final design, keyboard accessibility and 100%-feature demo belong to the later **individual Button implementation issue**, not #419.

## 5. Design and code contract: acceptance gates

- **Backlog → Ready → In progress:** #419 was first moved to **Ready**, verified, then to **In progress**, verified on actual GitHub Project #5; user supplied and connected the required editable file. A **draft** #417 token-contract crosswalk is the research input; the final ADR is still pending.
- **Source of truth:** local Bluent-native design artifact IDs above; original imported Fluent remains read-only; prior Figma #417 research remains draft and must be reviewed/synchronized if authoring a final ADR in the new Penpot file.
- **Before Review:** the upstream library is now linked and one Button was instantiated and visually inspected; extend checks to **variant switching**, fonts/icons/layout fidelity and state matrix; enrich own foundations with typography, brand palette, density, RTL, high contrast, reduced motion, responsive/layout patterns and accessibility; document actual design-to-code mapping/constraints.
- **Before Done:** PR reviewed/accepted with evidence, migration implications, docs/Skills/demo/test plans, passed required CI and merge into `bluent-v3` **only**. Keep #419 **In progress** meanwhile.
- **Non-regression guardrail:** never merge any v3 work into `Dev`, publish stable NuGet, or mutate the imported Fluent or unrelated PuyaStudio Penpot file.

For automated tooling/agents, identifiers and status labels are mirrored in [`penpot-workspace.manifest.json`](penpot-workspace.manifest.json). This manifest provides traceability, **not an automatically verified live Penpot connection**; verify with the Penpot tool when resuming work.