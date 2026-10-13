# #501 — Button Focus Visible to #428 implementation handoff

**Date:** 2026-10-13. **Scope:** native Penpot design evidence and explicit runtime implementation contract, not an approved production Button change.

## Source-linked design state

| Concern | Actual design artifact | Evidence |
| --- | --- | --- |
| Main Appearance × Focus | Owned page 38 `535db143-a732-807e-8008-c64d2fb91b9a`, native family `535db143-a732-807e-8008-c64f10ae5f75` | Ten native variants, Focus Off / Visible for five Fluent appearances |
| Danger native Focus | Native family `cd054205-a525-80d8-8008-c853b7ac86f0` | Separate genuine Focus Off / Visible variants |
| Interaction combinations | Board `cd054205-a525-80d8-8008-c84dc7f13d55` | Source-linked Hover/Pressed/Selected with independent rings; Disabled has none |
| Size + RTL + shape | Boards `cd054205-a525-80d8-8008-c84ea8fb870b` and `cd054205-a525-80d8-8008-c8513c9cdb13` | Small/Medium/Large, Persian RTL/LTR, Danger, Circular/Square, Compound, Split Main/Menu |
| Source typography | Owned pages 07, 19, 20, 25, 34, 35 | Page-07 and page-20 alignment repairs, page-35 Persian reflow fixes; 215 live read-only checks passed |

All are **real** source-owned Penpot artifacts in `Bluent v3 Design System` (file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`). Source library and imported Fluent kit have not been overwritten.

## Exact Focus ring and keyboard handoff

Focus ring outer vector is 2px thick and starts 3px beyond the **actual Button face**; inner contrast gap starts 1px beyond the face and is a separate 1px vector. The rings are centered, with their own radii derived from the face. Labels/icons are vertically centered within the actual face. Split targets use inset rings, one independent keyboard target for Main and one for Menu (including RTL).

The #418 token bridge (PR #500, **still opt-in and not approved**) now proposes `--colorStrokeFocus2` → `--bui-v3-focus-ring-strong-candidate` → `--bui-v3-button-focus-outer-candidate`, without modifying the old brand-focus semantic token. It has 20 brand-mode computed-style samples and the #418 demo runtime matrix has tested painted Focus edges. **Do not assume those experimental names are accepted public API.**

To implement under **#428** *after the issue enters Ready and In progress*, ensure `:focus-visible` is not conflated with Hover/Selected, implement a reliable Focus ring on all applicable appearances without changing width/height, preserve keyboard interaction, and surface `aria-pressed` correctly on Toggled buttons. Real Split keyboard path, forced-colors `Highlight`, selected+focused, Persian RTL, pointer modality and focus restoration need repeatable browser cases, with interactive-server hosting as a distinct test (Static SSR is not interactive).

## Evidence and next real gates

The connected Penpot plugin was used to run design audits: **469/469**, **105/105**, **215/215**, all with 0 failures. Source-level syntax/identity checks and Chrome/Edge WASM browser probe can be re-run by `.github/workflows/v3-button-focus-contract.yml`; CI for this new workflow must be verified independently after Push, not inferred from Dev01 results.

Outstanding for signoff: native semantic TokenSet binding of the chosen accessible Focus color for all designs; user/maintainer acceptance of the semantic/color decision; actual browser zoom and native assistive technology/high contrast review; and the full #428 component implementation. Those are **explicit unfulfilled conditions**, not solved by a green CI. PR #502 targets only `bluent-v3`, no stable `Dev` merge and no NuGet publication.

Reusable workflow details: [native contract](BUTTON-FOCUS-VISIBLE-CONTRACT.md), [alignment repair](BUTTON-FOCUS-ALIGNMENT-REPAIR.md), and [browser evidence](BUTTON-FOCUS-BROWSER-EVIDENCE.md). Skill: `.agents/skills/bluent-v3-button-focus/SKILL.md`.

## 2026-10-13 actual token-bound Native variants (draft)

The five actual native Focus Visible Button variants and separate native Danger Focus Visible are now linked to **independent Penpot Light/Dark candidate TokenSets**, with twelve live `strokeColor` property bindings. See [native TokenSet IDs and explicitly pending Dark readback](BUTTON-FOCUS-NATIVE-TOKEN-BRIDGE.md). The Light theme/source/semantic/component value and visible shape binding were verified live. The connected Penpot tab suspended immediately after a Dark theme toggle, so **do not claim the Dark mode or subsequent Light restore have been verified** until the plugin can be focused and the read-only audit run again. The opt-in #418 CSS proposal remains unapproved.

## Native design token validation update (2026-10-13)

The connection reopened and real Penpot **Dark and Light** rendered Focus colors were verified on all six actual enabled native Button variants, followed by **71/71 Light native binding assertions**, zero failures, 12/12 stroke bindings and a live recount of **40 sets / 205 tokens**. See [native Penpot evidence](BUTTON-FOCUS-NATIVE-TOKEN-BRIDGE.md). The original Dark evidence blocker is thus resolved, but the UI was later switched back to Dark during an additional audit attempt and the plugin froze; **restoring Light remains a pending housekeeping step on reconnection**. Approval of final public token names and actual OS/AT testing is a separate gate.
