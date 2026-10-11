# Bluent v3 — Button upstream/native visual parity review (#419)

> **Status: evidence from actual Penpot, NOT design parity approval.** The `Bluent v3 Design System` file (`b64f6665-c9ab-80b5-8008-c4ac99d9d000`) contains a dedicated **`22 · Button Fluent parity review`** page (`e31294c6-7c55-805f-8008-c5a8fb268d03`) with board **`#419 · Linked Button reference comparison`** (`e31294c6-7c55-805f-8008-c5a91188deb7`). The page and 20 component instance links were verified from Penpot while connected on 2026-10-11; the complete page was exported to PNG and visually inspected. This does not alter the upstream Fluent library, approve a new public API, or touch v2 `Dev`.

## First genuine side-by-side: 10 comparison pairs

Unlike earlier independent matrix views, this board places **10 original imported Fluent Button component instances** next to **10 Bluent-owned local native Button variant instances**, for each of five styles × two states.

| Design comparison axis | Source / upstream Fluent 2 | Our native Bluent draft |
| --- | --- | --- |
| Library identity | `Microsoft Fluent 2 Web (Community)` imported/connected; exact source `Button` variant | Local `DRAFT · Button / Appearance × State` `VariantContainer` |
| Quantity/links | **10** real connected source instances verified | **10** real locally linked source-variant instances verified |
| Style/appearance mappings | `Secondary (Default)`, `Primary`, `Outline`, `Subtle`, `Transparent` | `Secondary`, `Primary`, `Outline`, `Subtle`, `Transparent` |
| State | `Rest`, `Disabled` | `Rest`, `Disabled` |
| Selected sample root/face | Reference component bounds **91×32px** at Medium | Native underlying board **174×58px**, visible face **155×33px**, border **157×35px** |
| Label content | **`Button`** | **`Save changes`** |
| Icon content | Source Medium `Icon and label (Default)` has a visible **20×20 icon placeholder** | Native appearance/state slice currently displays **text only**, no icon |
| Fidelity conclusion | Actual Fluent design source; untouched | Clearly a **different component content specification**, not pixel-equivalent reference |

A first-order geometry observation: **155−91 = 64px visible face width difference** and **33−32 = 1px face-height difference** for the selected Medium references. The total width difference **must not** be interpreted as a padding/layout defect until label copy, font metrics and icon inclusion are matched. Both specimens use different source text and icon inventory. The imported 91px width refers to the *entire* source Button root, whereas the native 155px refers to its *visible face*; neither is a controlled equal-content measurement.

The source family's full Button matrix exposes **150 upstream variants**. Our 25 native appearance/state and six separate size/layout variants are **complementary slices**, not 150 coherent state × layout × size combinations.

## Design issues newly exposed by this comparison

| Gate | Finding from PNG/live Penpot | Acceptance action |
| --- | --- | --- |
| **BP1 — same content** | Upstream button carries icon + `Button`; local carries `Save changes`, no icon in this family | Create equivalent-copy + equivalent-icon comparison without modifying the imported Fluent source; ensure 20 actual linked design instances remain traceable |
| **BP2 — common geometry** | Source root 91×32 vs native face 155×33 in sampled Medium state | Verify equal-content interior gap/padding, target height, border/radius, optical icon/text center; explain intentional width differences |
| **BP3 — appearance mapping** | Upstream `Secondary (Default)` is only *conceptually* close to Bluent's public `ButtonAppearance.Default`; local draft says `Secondary` | Explicit public API compatibility decision and versioned migration table, with no unapproved renaming |
| **BP4 — Bluent extensions** | Source's 5 styles omit existing public Bluent `Danger`; local Button API sketches are noninteractive | Preserve Danger, Split, Dropdown, Badge, Href, Toggle, Circular/Square, SecondaryText and document distinct behavior/style states |
| **BP5 — font and modes** | Side-by-side is a default-mode static design | Test Segoe UI/equivalent approved Persian fonts, 10 brands × light/dark, forced colors, density, hover/focus/error, high zoom and RTL |
| **BP6 — response to resize** | Original local size/layout family uses deterministic **fixed positions at authored widths**, not responsive auto-layout | Run a non-destructive instance-resize stress test and evaluate layout constraints before approving responsive components |
| **BP7 — actual runtime** | Penpot graphics are not buttons in a working browser | Native Blazor focus, keyboard, screen reader, touch targets, SSR/portal and state binding must be demonstrated under later component issues |

### Repeatable Penpot source-vs-local evidence script

[`scripts/quality/penpot_v3_button_parity_audit.js`](../../../scripts/quality/penpot_v3_button_parity_audit.js) is a **read-only script intended to execute inside the connected Penpot plugin**. It checks ten exact source/local variant pairs, live link IDs, state/style axes, source and native face dimensions, text strings and whether the source icon is absent from the native counterpart. It explicitly returns `parityApproved:false`.

**Latest evidence:** the script was also rerun at saved Penpot revision **138** and again passed all ten component/instance pair-link checks. Visual pixel parity remains **unapproved**, with all ten label examples and icon slots mismatched.

**Executed audit result:** the comparison board was live verified and PNG-exported. The repeatable Penpot script was then **executed successfully** at observed design revision **125**: **10 reference/native linked pairs, zero structural/link errors, 10/10 mismatched example labels, 10/10 source-icon versus missing native-icon differences; `structuralPass:true`, `parityApproved:false`**. The icon test was corrected to inspect the actual source component's top-level `Placeholder` board, then rerun. This is **evidence of real parity gaps**, not an approval.

**Responsive follow-up:** the subsequent instance-resize test was resumed. It exposed a real failure of fixed-width Button face geometry when resizing the component root. The six source variants were updated with Penpot horizontal constraints, then tested with actual linked instances at natural, wide and compact widths. The first 18-case live test had zero geometry errors. A visual review then detected that stretched **icon-only** controls became incorrect pills, so those three source variants were changed to center-anchored square faces and all 18 linked stress instances were rebuilt. See [Button responsive/constraint research](BUTTON-RESIZE-REVIEW.md). The final version of the separate repeatable resize audit is an additional sign-off gate.

The previously passed [alignment quality sweep](ALIGNMENT-QUALITY-AUDIT.md) remains separately grounded at Penpot revision 122: 65 native variants, 65 native linked previews, 23 existing design boards, 632 root-board text frames, 910 geometry checks, zero errors. It does **not** establish this page's pixel parity or responsive behavior.

## Workflow and release boundary

This is part of the existing **#419 In progress** design-library issue, on the isolated branch `v3/issue-419-penpot-library` and [Draft PR #499](https://github.com/vrassouli/Bluent/pull/499) targeting **`bluent-v3`**. The #417 CSS ADR and #418 token contract are not approved. No changes to Bluent's stable `Dev`, released NuGet, imported Microsoft assets or public Blazor code are authorized.