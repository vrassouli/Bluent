# #501 - Danger selected contrast and Focus Visible handoff

2026-10-14. Review evidence, NOT final approval of the public Button component.

## Canonical source design

Bluent v3 Design System Penpot file b64f6665-c9ab-80b5-8008-c4ac99d9d000. Page 07 Accessibility & RTL has the native editable Danger state research board 94a03b1b-8cb6-8091-8008-c986fd01b85f. All eight Light/Dark selected ON/OFF/Hover/Pressed specimens use centered Persian RTL labels. Its actual connected Penpot audit passed 61/61. The old Light selected combination white #FFFFFF over pale red #FDF6F6 has only 1.07:1 and is displayed explicitly as a bad reference.

The source-backed candidate uses colorPaletteRedBackground1 plus colorPaletteRedForeground2 when selected, RedBackground2 plus RedForeground2 for selected Hover, RedBackground3 plus neutralForegroundOnBrand for selected Pressed, and existing redBackground3 plus OnBrand for not-selected. All studied source cases meet 4.5:1 across 10 brands in Light/Dark.

Native Button Focus Visible design is separate: page 38 Button Focus Visible states #501 (535db143-a732-807e-8008-c64d2fb91b9a), family 535db143-a732-807e-8008-c64f10ae5f75 and standalone native Danger focus family cd054205-a525-80d8-8008-c853b7ac86f0. Selected and keyboard Focus Visible are orthogonal states. Do not conflate them.

## Concrete v3 package preview

#418 Draft PR #500 task commit 55acc356 provides an explicitly opt-in stylesheet path:
_content/Bluent.UI/v3/danger-toggle.opt-in.preview.css

The consumer loads it after standard component CSS and enables data-bui-v3-danger-toggle on a containing element. Outside that attribute the old Button style is unchanged. The standard shared Button SCSS and v2 stable branches are untouched; no approved final public Button property or style is implied.

Real Chrome and Edge WebAssembly browser matrices each passed 843/843; tests verified actual asset loading, real on/off/on Blazor toggling, pointer Hover/Pressed, focus and the opt-in removal restoring prior styling. Local-only NuGet packaging included the reviewed CSS, all ten existing themes, no unexpected assets; no publish/upload. GitHub six of six checks passed for PR #500 (Chrome/Edge WASM/Server, token-contract and pack-boundary). Full details reside on #418 branch under docs/v3/tokens/DANGER-TOGGLE-PACKAGED-OPTIN.md.

## Explicit outstanding acceptance

The user reported a readability defect during Button review, and the opt-in research prototype + native page07 palette now address that defect for evaluation. This is NOT approval of the final public Button state contract, true native OS/AT, or universal all-surface conformance. Keep #501 in Review. Final code migration and aria-pressed belong to #428 AFTER that issue has progressed from Backlog to Ready by the project workflow; do not advance it autonomously.

The later page-38 design addenda below supersede the earlier no-board checkpoint. The empty candidate on page 00 was positively removed. The correct page-38 source-owned research board has now also passed its live native audit. No stable Dev/2.x merge or NuGet release.
## 2026-10-14 actual page-38 design follow-up

The canonical Penpot Bluent v3 Design System was reconnected during this review. First, the accidental empty draft board 6f4f48b4-7b1e-800e-8008-c9ba336a0e38 on page 00 Start here was VERIFIED EMPTY and removed; removal was read back as true.

On the CORRECT page 38 Button Focus Visible states (#501), ID 535db143-a732-807e-8008-c64d2fb91b9a, an ADDITIVE native editable review board was then created:

- Board: REVIEW · Danger selected contrast × Focus Visible · #501
- ID: 6f4f48b4-7b1e-800e-8008-c9bc0d7c44fa
- 51 editable native shapes created and counted by Penpot, 8 specimens covering Light/Dark × OFF/ON/Hover/Pressed. Focus Off and Focus Visible are deliberately independent of selected state; four specimens render the 2px outer focus outline at 3px bounds. Persian text is drawn centered within actual Button faces using the source-owned existing Fluent color values.
- Explicit sourceBoard Penpot plugin data points to the canonical #418 page-07 board 94a03b1b-8cb6-8091-8008-c986fd01b85f (61/61 prior verified Penpot audit).

Historical checkpoint: the plugin initially suspended before the combined audit. That blocker was subsequently resolved; see the verified audit addendum below. The auditor is scripts/quality/penpot_v3_button_danger_selected_audit.js. Node syntax checks on CI are not a substitute for live Penpot execution. The existing #501 Focus family and #418 original palette board remain intact; this is an additional design review reference, not public Button approval.

## 2026-10-14 completed connected Penpot acceptance evidence

After the plugin reconnected, the actual canonical page-38 editable board 6f4f48b4-7b1e-800e-8008-c9bc0d7c44fa was read back live and audited **77/77 PASS, zero failures**. Verified native board identity and 51 real editable child shapes, exact source-theme backgrounds and foregrounds on all eight Light/Dark Danger states, Persian RTL labels and two-axis centering within the actual button faces, real contrast captions, Focus visible exclusively on four selected/hover/pressed interaction examples with independent outer 2px colored strokes and 3px symmetrical bounds, and sourceBoard identity linking back to the already-audited #418 page-07 board. The actual board was **exported to PNG and visually inspected**; labels were centered and no obvious overlap or clip was observed in these specimens.

The earlier suspended-plugin uncertainty is superseded: **the actual live 77-check audit has passed**, not merely JavaScript syntax checking. Reproducible source: scripts/quality/penpot_v3_button_danger_selected_audit.js. This audit is evidence for this limited source-owned design sample, NOT public Button API approval, OS/AT certification or proof on all host surfaces.
