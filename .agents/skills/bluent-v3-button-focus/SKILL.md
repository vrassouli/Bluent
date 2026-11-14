# Bluent v3 — Button Focus and Fluent compatibility handoff

Use this Skill only when designing, implementing, reviewing or testing the future Bluent v3 Button. It is not the 2.x consumer API. Keep every v3 edit under a task branch targeting bluent-v3.

## Grounded design sources

- Source-owned Penpot: **Bluent v3 Design System**, file b64f6665-c9ab-80b5-8008-c4ac99d9d000.
- Upstream Fluent Button reference: page 9, 07c521b9-e441-80bd-8008-c4b57568c3ef.
- Bluent Button appearance/state: page 19, e31294c6-7c55-805f-8008-c58ffcf22e07.
- Size/layout: page 20, e31294c6-7c55-805f-8008-c590b2678162.
- API anatomy: page 21, e31294c6-7c55-805f-8008-c5912770e8ab.
- Equal-content upstream/local comparison: page 24, e31294c6-7c55-805f-8008-c5af6658c671, board e31294c6-7c55-805f-8008-c5afb988d983.
- Persian RTL: page 25, e31294c6-7c55-805f-8008-c5b0bae3546a.
- Focus-visible design: page 38, 535db143-a732-807e-8008-c64d2fb91b9a; approved host-context board f4136a9a-101d-8004-8008-ca2956fe05f9.

## Fluent compatibility decision

The pinned reference used by the repository audit is @fluentui/web-components 3.1.3, with @fluentui/react-components 9.74.10 as a related React fallback. Bluent Button combines related Fluent models rather than cloning one tag: Button, ToggleButton, CompoundButton, MenuButton and AnchorButton remain separate upstream components.

The complete current 30-member disposition is in docs/v3/quality/FLUENT2-BUTTON-COMPATIBILITY.md. Main rules:

- Text, Icon, Shape, Appearance (except Danger), Size and native click semantics map to corresponding Fluent Button concepts.
- SecondaryText maps to the separate CompoundButton description concept.
- Href maps to the separate AnchorButton.
- Toggled exposes the supported boolean pressed subset through aria-pressed=false/true; null is ordinary Button behavior. Bluent does not claim ToggleButton's mixed state.
- Danger, Tooltip, Badge, Compact, rotated/vertical layout, Popover/Dropdown composition and cascading contexts are explicit Bluent extensions.
- Bluent uses its own brand palette. It follows Fluent interaction/design language but is not an exact color/pixel clone.
- Production typography uses the Segoe UI / Segoe UI Web / native system token stack. The Penpot Inter fallback is only a canvas limitation, not a production font override.

Do not change Bluent brand tokens merely to match one pinned Fluent screenshot; token ownership remains with #418. Candidate semantic/global token aliases remain not approved public production names until #418 makes its decision. Never treat source audit or browser evidence as Penpot/maintainer approval.

## Implemented behavior on #428

PR #554 was merged from v3/issue-428-button-p0 into bluent-v3 after all exact-head CI checks passed. Current implementation:

- Native toggle state is exposed as aria-pressed only when Toggled has a value; component state wins over conflicting caller state only while it owns that state.
- Button-owned Regular/Filled glyphs and dropdown indicators are decorative in the accessibility tree; icon-only Button still needs a caller-supplied contextual name.
- Disabled links use a native disabled button and do not invoke callbacks.
- Button-managed menu relationships, expanded state, menu/menuitem semantics, keyboard navigation, Escape, focus restoration, Tab dismissal and nested submenu direction are implemented.
- Persian labels use dir=auto; host direction continues to control icon mirroring.
- Production CSS includes the keyboard :focus-visible ring, inset split-button treatment, disabled suppression and forced-colors Highlight.
- Host-aware ring behavior uses the documented CSS custom property where context cannot be inferred. This is not a new Razor parameter or public global token.

## Verification evidence and limits

- Chrome live Debug WebAssembly probe on 2026-10-30: **215/215** against the shipped stylesheet; earlier Edge run on the same branch: **215/215**.
- Fresh Published Production matrix on 2026-10-30: **208/208** across Chrome/Edge × InteractiveServer/InteractiveWebAssembly (52 each); the Server cases include a completed HTTP 101 SignalR WebSocket handshake.
- Native Windows Contrast Themes: Desert was applied for the live test, forced-colors: active was observed, focus outline remained visible, then the system theme was restored to None and forced-colors returned to false.
- Narrator was launched and the native UI Automation tree inspected: 154 page buttons, no empty button names, toggle state observed false → true → false. Actual spoken Narrator output was not captured/listened to; do not call this screen-reader speech acceptance.
- Focus handoff unit tests: 7/7. Docs contract: 0 findings. Button API baseline: 0 errors.
- The maintainer explicitly waived additional human visual/zoom sign-off and spoken screen-reader sign-off as completion gates on 2026-10-30. Narrator speech was not recorded/listened to; future concerns should be filed as follow-up defects, not misreported as completed speech testing.
- Two NU1903 advisories for Microsoft.AspNetCore.Components.WebAssembly.Server 10.0.7 remain tracked by #425; do not suppress them.

## Ownership and lifecycle

- #418 owns global/semantic/component tokens and brand palette approval.
- #501 owns editable focus-visible design and sign-off.
- #428 owns Button runtime/API, accessible names and toggle state, menu composition, demo, migration evidence and cross-render-mode tests.
- Use the real Status field in GitHub Project #5: Backlog → Ready → In progress → Review → Done. #428 is Done after the maintainer accepted the engineering evidence and PR #554 was merged into bluent-v3.
- Never merge this task into stable Dev, main, existing 2.x branches, NuGet or deployments.

See docs/v3/components/button.md and docs/v3/quality/FLUENT2-BUTTON-COMPATIBILITY.md for the current implementation and complete member-by-member mapping.


## Token and focus ownership cross-reference (#418 / #501)

- #418 owns global/semantic/component token schema, brand palette and candidate aliases. Candidate token names remain non-public until #418 is accepted and integrated.
- #501 owns the editable focus-visible design and its review. The current approved opaque-host direction is the branded single Button focus ring; TextField retains its animated bottom underline rather than gaining a second rectangular ring.
- Review the source-owned handoffs before changing focus/token behavior: docs/v3/design/BUTTON-FOCUS-HOST-CONTEXT-NATIVE-REVIEW.md, docs/v3/tokens/FOCUS-HOST-CONTEXT-REVIEW.md, docs/v3/tokens/FOCUS-ALPHA-HOST-AUDIT.md, and docs/v3/tokens/README.md.
- Do not turn candidate aliases or isolated preview CSS into public production tokens. Transparent/alpha host contrast and full native OS/assistive-technology conformance remain separately bounded concerns.
