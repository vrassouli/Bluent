# #418 — Penpot decision alignment and remaining acceptance gates

**Review date:** 2026-11-16
**Disposition:** delegated design directions selected and aligned in the source-owned Penpot file; preview/API/native acceptance remains open. This record does **not** approve production tokens, public host attributes, a public Portal/Dialog/Popover API, stable CSS, packages or deployment.

## Authoritative design source and saved version

- File: **Bluent v3 Design System**
- File ID: `b64f6665-c9ab-80b5-8008-c4ac99d9d000`
- Latest saved version for this checkpoint: **Bluent v3 · #418 selected decision alignment + current gates · 2026-11-16**
- Penpot revision: **831**

The original read-only Microsoft Fluent 2 reference was not modified. All review changes below are in the separate Bluent-owned file.

## Decisions reviewed and aligned

### Page 52 — public token vocabulary and CSS aliases

- Page: `388782f1-b766-8073-8008-f3299e62827a`
- Board: `388782f1-b766-8073-8008-f3299e849141`
- Selected direction: **Option B**.
- Public vocabulary direction: reusable `bluent.color.*` plus individually accepted `bluent.semantic.*`; `bluent.source.*` remains internal and `bluent.component.*` remains private.
- CSS alias direction: `--bui-v3-*` is a serialization of approved logical tokens, emitted only within the explicit v3 opt-in scope. Preserve existing `--color*` variables and all 2.x assets; never repurpose a shipped alias.
- Boundary: this is a selected taxonomy and compatibility direction, **not** approval of every semantic role or any production alias.

### Page 53 — Focus host public-contract options

- Page: `388782f1-b766-8073-8008-f32b0b243fc9`
- Board: `388782f1-b766-8073-8008-f32b0b39e88b`
- Selected direction: **Option A**, same-host explicit metadata on the actual painted host: `data-bui-v3-focus-mode` and `data-bui-v3-focus-host`, only under the v3 token opt-in scope.
- Supported opaque preview kinds: neutral, brand, brandHover, danger and inverted. No wrapper component, Button Razor parameter or pixel/background inference.
- Unknown or unsupported surfaces receive no host-specific alias; the existing visible keyboard focus behavior must remain.
- Boundary: the option is selected as the **preview contract direction only**. The attributes, candidate CSS variable and public Button/HTML API remain unapproved for production.

### Page 54 — D2/D5 Portal and Dialog direction

- Page: `388782f1-b766-8073-8008-f32c913ab071`
- Board: `388782f1-b766-8073-8008-f32c9154ed0d`
- Selected direction: **Option A**, reuse the existing Dialog configuration-builder path.
- Popover follows its nearest live cascading owner while attached to that owner/trigger.
- Service Dialog receives an explicit owner scope and captures its immutable snapshot at its own `ShowAsync` call. Unscoped calls retain the legacy/root fallback.
- Owner identity is private implementation bookkeeping. Do not add a public `OwnerId`, public scope type or launcher merely to expose internal registry identity.
- D5 modal/accessibility configuration remains explicitly opt-in and independent of D2 theme ownership.
- Boundary: this is an **opt-in prototype direction**, not approval of the experimental names or released public Portal/Dialog/Popover API.

## Evidence reviewed

- The ten-brand scoped CSS generator emits a complete 49-variable override for each of the 20 brand × mode combinations. The current Blazor research record covers 20 concurrent two-brand host-isolation checks and 20 nested live-brand checks. These are bounded preview checks, not universal CSS or production certification.
- D2 browser proof: Chrome WebAssembly **126/126**, Chrome published InteractiveServer **126/126**; focused NUnit **40/40**.
- Exact current PR head at the time of this review: `c63d08fb325aa9428a8ca7600fd6fe2335450954`. Its GitHub Actions completed **12/12 workflows successfully**.
- Current-head Firefox / Published InteractiveServer D2-D5 job: **32/32** assertions, zero uncaught page errors. It exercised Excel/Dark/RTL Popover ownership, nested Word/Light/LTR isolation, concurrent service Dialog snapshots, owner changes, modal-owned Popover interactivity while the background is inert, Escape ordering, nested focus return and route-local Dialog teardown. Run: [43928875545](https://github.com/vrassouli/Bluent/actions/runs/43928875545); artifact: [Firefox D2-D5 evidence](https://github.com/vrassouli/Bluent/actions/runs/43928875545/artifacts/14256049482).
- D5 Chromium evidence recorded on the current implementation checkpoint: Chrome WASM **1179/1179**, published InteractiveServer **1178/1178**, focused NUnit **45/45**. These browser proof counts do not substitute for native speech or OS testing.
- Page 45 retains the accepted *brand-preserving direction* and its 40 generated opaque Dark candidate pairs (minimum **4.6001:1**) as preview-only. Page 55 remains explicitly exact-values-not-approved.
- Danger remains narrowly scoped: `semantic.text.dangerAccessible` is for Label's decorative required marker only; `semantic.status.danger` is limited to non-text indicators on the studied neutral surface. Badge, Alert, Toast and Button Danger text remain unapproved.
- The production font authority remains the existing Segoe UI / Segoe UI Web / native-system CSS fallback chain. Penpot Inter and Noto Sans Arabic are canvas specimens, not production font approval.

## Remaining acceptance gates

1. Actual native Narrator / NVDA / VoiceOver speech and navigation acceptance, including Persian description/Close behavior and focus return.
2. Native Windows Contrast Themes / OS high-contrast behavior for Dialog/Popover and unsupported Focus host surfaces. Browser emulation is not native OS certification.
3. Current Safari/WebKit acceptance. The prior Safari/VoiceOver work is historical; a current-head SafariDriver retry was blocked because Allow Remote Automation is disabled. No user setting was changed.
4. Explicit SSR/prerender and RenderMode.Auto no-JS fallback acceptance for opt-in portals.
5. Remaining third-party popup arbitration, iframe and route/unmount lifecycle races beyond the bounded passing proof cases.
6. Final public API spelling/ownership and individual semantic allow-list / production alias approvals. The options above are selected design directions, not a release decision.

## Workflow boundary

- #418 remains **In progress**; this review does not move it to Review or Done.
- PR #500 remains open against `bluent-v3`; its mergeability and green CI do not close the remaining design/native acceptance gates.
- #434 Checkbox may use these selected directions as design foundations, but its own component design and Ready gate remain separate.
- No stable `Dev` / `main` change, production CSS activation, NuGet publication or deployment is authorized by this checkpoint.
