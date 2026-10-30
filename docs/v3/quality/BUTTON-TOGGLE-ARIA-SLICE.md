# Button toggle semantics — first implementation slice (#428)

**State:** implementation slice in progress; not full Button v3 acceptance. **Target branch:** `v3/issue-428-button-p0` → `bluent-v3`. Stable `Dev`, 2.x assets and published NuGet remain unchanged.

## Selected contract

- On the native `<button>` path, emit exactly one `aria-pressed="true|false"` only when `Toggled.HasValue`.
- When `Toggled` is non-null, the actual component state is authoritative. A contradictory caller-provided `AdditionalAttributes["aria-pressed"]` is omitted case-insensitively before attributes are splatted, and the component emits its actual state once.
- When `Toggled` is null, emit no component-owned toggle state. Pass through a caller-supplied `aria-pressed` (including an advanced value such as `mixed`) unchanged.
- For link/navigation anchors, generate no `aria-pressed`; caller-supplied attributes are preserved as-is.
- Keep all unrelated caller attributes and existing pointer, Enter, Space, `ToggledChanged` and `OnClick` behavior unchanged.

This is a deliberately bounded semantic correction. It does not change styles, tokens, visual variants, focus CSS, or public parameters. The broader Button redesign remains dependent on the accepted visual/token decisions and its complete component Definition of Done.

## Implementation and tests

- `src/Bluent.UI/Components/ButtonComponent/Button.razor` emits the toggle state on the native button render path.
- `Button.razor.cs` filters conflicting caller state only when a component-owned value will be emitted.
- `tests/RegexSampleGeneratorTest/ButtonToggleSemanticsTests.cs` covers true/false precedence, case-insensitive attribute name, null-state passthrough/omission, anchor behavior, disabled state and preservation of unrelated attributes.

Observed local evidence, refreshed on 2026-10-27:

- `dotnet test tests/RegexSampleGeneratorTest/RegexSampleGeneratorTest.csproj --configuration Release` — **29/29 passed**.
- Full Solution Release build and tests were rerun on 2026-10-27: build succeeded with **0 warnings / 0 errors** and tests passed **29/29**. The previously observed NU1903 WebAssembly Server 10.0.7 advisories were not present in this no-restore build output; this check does not replace the separate dependency/security review tracked in [#425 / PR #549](https://github.com/vrassouli/Bluent/pull/549).
- Release `Bluent.UI.Demo` build — **0 warnings / 0 errors**; Debug build also completed with 0 warnings / 0 errors for the live WebAssembly host.
- Initial focused Chromium DevTools Protocol browser probe on the unmodified Bluent WebAssembly `/components/buttons` route — **Chrome 23/23 and Edge 23/23 passed**. This is the original focused keyboard/ARIA run before the accessible-name fix; the broader, current 105/105 probe results are recorded below. It included native Space/Enter activation, computed accessibility-tree `pressed`, split-button Tab/Shift+Tab, disabled skipping, RTL adjacency and browser-emulated forced-colors.
- Published Production browser matrix via `scripts/quality/probe_v3_button_toggle_interactive_server.mjs` — Chrome and Edge on both `InteractiveServer` (`/compatibility/server`) and `InteractiveWebAssembly` (`/compatibility/webassembly`), **19/19 each run (76/76 total)**. The probe verifies the actual renderer and confirms a SignalR WebSocket HTTP 101 handshake only for InteractiveServer. In both modes it checks that component-owned `aria-pressed` overrides conflicting caller `mixed`, an ordinary Button without `Toggled` preserves caller `aria-pressed="mixed"`, a navigation anchor with `Toggled=true` gets no generated toggle state, and a disabled toggle preserves authoritative `pressed=false`. Real pointer click, Space and Enter activation change state as expected, `ToggledChanged` and `OnClick` each fire exactly once per activation, and the computed accessibility tree exposes the pressed state after initial render, pointer click and Space.
- The public `/components/buttons` showcase now uses independent `@bind-Toggled`` bindings for all six existing appearances, including Danger, and displays each bound state; the row wraps on narrow layouts. The full Release solution build (0 warnings / 0 errors) and 29/29 tests pass.
- `node --check scripts/quality/probe_v3_button_focus_runtime.mjs`, `node --check scripts/quality/probe_v3_button_toggle_interactive_server.mjs`, and `git diff --check` — passed. The wider live WebAssembly Button/API/demo probe result below was also recorded on 2026-10-27.

- Expanded live WebAssembly Button/API/demo probe in scripts/quality/probe_v3_button_focus_runtime.mjs — after the accessible-name fix, Chrome 105/105 and Edge 105/105 passed on the actual /components/buttons route. In addition to existing keyboard/focus/ARIA checks, it verifies six accessible two-way toggle specimens, a real Space-driven On-to-Off round trip and displayed bound state, Compact/Vertical/Rotated CSS-class selection, all four Start/End × Top/Bottom badge positions and their accessible labels, Tooltip string and rich content hover/focus/hide with Default/Brand/Inverted appearance, Top/Right/BottomEnd placement and arrow assertions, and dropdown aria-expanded/controls with a stable hidden surface ID; menu type/role and arrow-key behavior accurately remain open (including a caretless trigger) and focus returned after selection/Escape, plus a live top-placement dropdown caret, accessible names on icon-only examples, and trusted pointer activation that updates the OnClick status counter. Its disposable browser profile is cleaned after each run.
## Evidence boundaries

The 2026-10-27 accessible-name defect is now fixed in the Button-owned rendering path: Regular/Filled icon elements and the dropdown caret elements receive `aria-hidden="true"`; the split-button caret trigger receives the explicit stable name `Open menu`. A caller-provided `aria-label` on an icon-only Button remains on the native action element. The refreshed real-browser probe now passes **105/105 in Chrome and 105/105 in Edge**. It confirms the icon-plus-text AX name is the visible text (`Default` both before and after the Regular-to-Filled state change), the icon-only name remains the caller’s label, and the split-menu trigger name is `Open menu`. Standalone Icon and other component-family semantics remain out of scope; #429 is still Backlog and no global Icon implementation was changed. This does not claim native screen-reader acceptance.

The focus-ring candidate used by the existing #501 probe is injected into a disposable browser tab only; it is not a product stylesheet change. Forced Colors was browser-emulated, not native Windows Contrast Themes. No Narrator/NVDA/JAWS acceptance is claimed. InteractiveServer and InteractiveWebAssembly parity for the toggle semantic slice is demonstrated by the 76/76 Production browser checks above, including exact-once callback counts and ordinary/link/disabled attribute behavior. The accessible-name fix and documentation/contract updates were pushed in [`a7886b2d`](https://github.com/vrassouli/Bluent/commit/a7886b2d509f8ad118b69f61707e4e022ea236bc). At that exact head, all four reported checks passed: [Button Focus Design Contract](https://github.com/vrassouli/Bluent/actions/runs/40503849125), [Documentation Contract](https://github.com/vrassouli/Bluent/actions/runs/40503849136), and the [Public Component Census](https://github.com/vrassouli/Bluent/actions/runs/40503849172) including both Source and family snapshot and Compiled CLR export baseline. The follow-up documentation checkpoint is being corrected separately; reviewer acceptance remains open. No full Button or native screen-reader acceptance is claimed.

## Design provenance

Reuses the existing source-owned Bluent v3 Button appearance/state design and accepted native Focus Visible design (#501): Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 38 `535db143-a732-807e-8008-c64d2fb91b9a`. No design nodes or visual tokens were modified by this non-visual slice.


## Latest live demo coverage extension - 2026-10-27

The Button showcase now includes a separate **Tooltip placement matrix** generated from every current public `Placement` enum value: `Top`, `Bottom`, `Left`, `Right`, `TopStart`, `TopEnd`, `RightStart`, `RightEnd`, `BottomStart`, `BottomEnd`, `LeftStart`, and `LeftEnd`. This adds no public API. The live WebAssembly probe now checks that all twelve named controls render, each tooltip opens on hover with its requested placement class and arrow, and each closes when the pointer leaves. The pre-existing string/RenderFragment and Default/Brand/Inverted examples still cover hover/focus and arrow on/off.

- `dotnet build src/Bluent.UI.Demo/Bluent.UI.Demo.csproj --configuration Debug --no-restore --nologo` - passed, **0 warnings / 0 errors**.
- `node --check scripts/quality/probe_v3_button_focus_runtime.mjs` - passed.
- Real Chromium DevTools Protocol run against `http://127.0.0.1:5080/components/buttons`: **Chrome 142/142** and **Edge 142/142**, with zero failed assertions. The expanded probe adds 37 Tooltip assertions to the previous 105-check suite; Chrome/Edge reports the Tooltip checks and the existing Button checks passing.
- `git diff --check` - passed at the code/demo checkpoint. Full Release solution build/test and CI for the current HEAD remain to be run after the documentation/tracking updates.

These are live WebAssembly browser results and do not close native Windows Contrast Themes, Narrator/NVDA/JAWS, complete menu-role/arrow-key, accepted #418 semantic-token, or full Button design-parity gates.


## Appearance, size and shape matrix - 2026-10-27

The interactive Button showcase now derives the entire matrix from the current enums: six `ButtonAppearance` values × three `ButtonSize` values × three `ButtonShape` values = **54 unique controls**. Each has a `data-demo-button-variant` key. The live browser probe verifies the controls render as native buttons, every expected key occurs exactly once, and each runtime CSS class matches the selected appearance/size/shape (including omitted default classes). At the 390px test viewport, all 18 appearance/size rows wrap and neither the page nor any matrix row overflows horizontally. A docs-contract regression test protects the enum-driven demo and browser probe, and CI path filters include both source inputs.

- Debug WebAssembly demo build: **0 warnings / 0 errors**.
- Live WASM probe: **Chrome 198/198; Edge 198/198**, zero failed assertions. This includes 54 separate variant mapping assertions per browser and narrow-viewport checks.
- Docs-contract unit tests: **11/11**. Node syntax check and `git diff --check` passed. After the tracking update, the full Release solution build passed with **0 warnings / 0 errors**, solution tests passed **29/29**, and the docs-contract suite passed **11/11**. The remaining docs/API/link/consumer-skill/focus-handoff/UTF-8/whitespace checks also passed. Exact-head CI is checked after pushing this checkpoint.

This improves source-variant and responsive demo coverage only. It does not approve pending #418 tokens, prove Fluent 2 pixel parity, or replace native OS contrast/screen-reader acceptance.


## Light/Dark theme and LTR/RTL matrix verification - 2026-10-27

The live WebAssembly probe now changes the real root `data-bui-theme` between `light` and `dark`, waits 350ms for Button's background/border/text transitions to settle, then inspects all 54 variant controls' computed values. It verifies each variant still exists exactly once and has concrete resolved color/background/border values in both modes. The Default-Medium-Rounded sample changes from a white background/dark foreground in Light to a dark background/white foreground in Dark. A stable `data-demo-button-direction="icon-text"` case verifies the actual Button's icon is physically to the left of text under LTR and to the right under RTL without changing its accessible name. With Dark+RTL active at a simulated 390px viewport, the whole matrix remains 54 controls, all 18 rows wrap, and neither the document nor any row overflows. The probe restores Light+LTR in its disposable tab after checks.

- Live WebAssembly browser probe: **Chrome 203/203 and Edge 203/203**, zero failures, including theme and RTL checks.
- The initial Light/Dark color assertion was intentionally kept strict; the first run caught the CSS transition race. Splitting theme mutation and computed-style inspection with a transition-settle wait resolved it. This is a test synchronization fix, not a product visual-code change.
- Debug demo build: **0 warnings / 0 errors**; full Release solution build: **0 warnings / 0 errors**; solution tests: **29/29**. Docs contract: **0 findings**; docs-contract tests: **11/11**; Button API baseline: **0 errors**; focus handoff tests: **7/7**; local Markdown links: **157 files**; consumer-skill mapping: **58 families / 67 routes**. Node syntax, UTF-8 validation and `git diff --check` passed. Exact-head GitHub Actions is checked after pushing this checkpoint.

These checks exercise bundled theme variables and browser `dir` layout, not actual Windows Contrast Themes, physical zoom, assistive technologies or approved Fluent 2 pixel parity.


## Direct `ToggledChanged` callback demo - 2026-10-27

The interactive Button showcase now has a separate direct `Toggled` + `ToggledChanged` example without `@bind-Toggled`. Its status text exposes both the current state and callback invocation count. The live browser probe starts from `Off`, `aria-pressed=false`, and zero callbacks; a **trusted pointer click** transitions to `On` with exactly one callback; a **native Space activation** transitions back to `Off` with exactly two calls total. The computed accessible name remains `Explicit callback toggle` throughout. This proves direct callback behavior independently from the existing six-appearance `@bind-Toggled` specimens.

- Live Debug WebAssembly probe: **Chrome 206/206 and Edge 206/206**, zero failures, including both callback assertions.
- Debug demo build: **0 warnings / 0 errors**; the docs-contract test now has a separately named check for the direct callback specimen and probe.
- No library runtime/API/CSS/token or stable v2 changes. This is browser evidence, not an assistive-technology acceptance claim.


## Badge logical-edge geometry in LTR and RTL - 2026-10-27

The live WebAssembly probe now measures each of the four existing Badge wrappers relative to the actual owning Button using `getBoundingClientRect()`. It asserts both horizontal and vertical centers against the edge expected from the logical `BadgeHorizontalPosition` and `BadgeVerticalPosition`, at less than 1.5px tolerance. Results are checked with root `dir=ltr` and `dir=rtl`: Start is on the physical left for LTR and physical right for RTL; End mirrors to the opposite edge; Top/Bottom keep their corresponding vertical edge. The probe uses `classList` for the logical values and restores LTR after the test so the subsequent tooltip/dropdown checks retain their expected direction.

- Full live WASM suite: **Chrome 208/208 and Edge 208/208**, zero failures; the two added checks validate all four real Badge positions in both directions.
- Debug demo build: **0 warnings / 0 errors**; docs-contract unit tests **13/13**; Node syntax and `git diff --check` passed at this checkpoint.
- The first attempt exposed two defects in the test snippet itself (an unbound direction reference and class-name string parsing). They were corrected; the product CSS was not changed.

This establishes logical Badge geometry in current browser rendering, not complete Persian typography, native Windows contrast or full Fluent 2 visual parity.


## Persian text direction inside LTR/RTL Button layouts - 2026-10-27

The source-owned #419 Persian Button design calls for the Persian `ذخیره تغییرات` label to retain RTL writing direction in both LTR and RTL layout specimens, while its icon moves from left to right with the Button layout direction. A focused renderer test reproduced the missing `dir` attribute on Button's inner `.text` wrapper. `Button.razor` now applies HTML `dir="auto"` to that wrapper, allowing localized copy to determine its writing direction without overriding the outer Button/icon layout. No public parameter is introduced. Paired LTR/RTL Persian specimens are part of the live showcase.

- Renderer regression `ButtonTextWrapperUsesAutoDirectionForLocalizedLabels`: passed; verifies the generated attribute and Blazor's HTML-encoded Unicode output.
- Live WebAssembly probe: the expanded suite originally passed **Chrome 211/211 and Edge 211/211** on 2026-10-27. It was freshly rerun on **2026-10-30** against the live Debug `/components/buttons` host and again passed **Chrome 211/211 and Edge 211/211**, with zero failures. It inspects computed direction, exact accessibility names, icon/text geometry, all 54 appearance/size/shape styles in Light/Dark, Tooltip placements, Badge geometry, split/compound/link/toggle behavior, and row overflow at 390px. Research focus CSS and browser-emulated forced-colors are confined to disposable browser tabs; this is not native OS contrast or screen-reader acceptance.
- Debug demo and full Release solution build: **0 warnings / 0 errors**; product tests **30/30**; docs contract **0 findings**; docs-contract tests **14/14**; Button API baseline **0 errors**; focus handoff tests **7/7**; local Markdown links **157 files**; consumer-skill mapping **58 families / 67 routes**; Node syntax, UTF-8 validation and `git diff --check` all pass. This proves browser behavior; candidate font choice/pixel parity, native Windows contrast and named screen-reader acceptance remain open.


## Published Production render-mode verification for Persian Button direction - 2026-10-27

The shared `CompatibilityProbe.razor` now contains paired Persian `ذخیره تغییرات` Buttons in explicit LTR and RTL layout rows. The production browser probe publishes a temporary ASP.NET Core host and checks each row on both `/compatibility/server` and `/compatibility/webassembly`. The Server route's SignalR WebSocket is required to complete HTTP 101, so this is not Static SSR mislabeled as InteractiveServer. For both Chrome and Edge, the probe measures the inner `.text` wrapper's `dir="auto"`, the wrapper/label's computed `direction: rtl`, icon position relative to the text, row overflow, and the exact native AX button name.

- **84/84 total assertions passed** across Chrome/Edge × InteractiveServer/InteractiveWebAssembly (21 checks per route/browser), zero failed in the fresh full run.
- Every route keeps Persian copy RTL in both LTR and RTL rows; the AX name is exactly `ذخیره تغییرات`; the icon is physically before text in LTR and after it in RTL.
- The initial full run had one intermittent Chrome/Server click timeout; the isolated Chrome rerun passed 42/42 and the subsequent full fresh publish passed 84/84. No source behavior change was needed in response to that non-reproducible timeout.
- This is actual Production publish/browser evidence, not deployment. It does not substitute for native OS contrast-theme and named screen-reader acceptance.


## Published Production Button-managed Dropdown lifecycle - 2026-10-27

The shared interactive compatibility fixture now includes a real Button-managed dropdown with the existing public `Dropdown`, `MenuList`, and `MenuItem` composition. It keeps an explicit command-selection counter so the browser probe can prove that a trusted click performs the expected action once rather than merely seeing a popup close. The published-host probe now checks the initial native Button/caret, stable `aria-controls` target and collapsed state, actual surface visibility with `aria-expanded=true`, keyboard Escape dismissal from the focused Copy command, focus restoration to the trigger, reopening, and exactly-once Copy selection followed by closure.

The freshly published Production browser matrix passed **112/112 assertions, 0 failures** across Chrome/Edge × InteractiveServer/InteractiveWebAssembly (**28 assertions per route/browser pair**). This is real browser interaction on the temporary published host; it is not a deployment. The new checks intentionally assert that `aria-haspopup` remains absent until the shared MenuList/MenuItem menu-role contract is approved and implemented. They do not claim arrow-key navigation or native assistive-technology acceptance.

- Full Release solution build: **0 warnings / 0 errors**.
- Published Production browser probe: **112/112 passed**.
- This adds a demo fixture and cross-render regression coverage; it does not change Button public API, production CSS, token mapping, stable v2 assets, or deployment status.
- Native Windows Contrast Themes, named Narrator/NVDA/JAWS acceptance, final #418 token approval, and complete Fluent visual parity remain open. The menu-role/keyboard browser gap was addressed in the later [Button-managed MenuList keyboard slice](BUTTON-MENU-KEYBOARD-SLICE.md). Keep #428 In progress and PR #554 Draft.

## Superseding menu semantics checkpoint — 2026-10-30

The 2026-10-27 entries above are historical checkpoints. At that time, the Button-managed dropdown probe did not yet assert `aria-haspopup="menu"`, `menu`/`menuitem` roles, or the full arrow-key contract. The follow-up implementation now owns that behavior; see [Button-managed MenuList keyboard and ARIA slice](BUTTON-MENU-KEYBOARD-SLICE.md).

The fresh published Production host matrix passes **208/208 assertions** across Chrome/Edge × InteractiveServer/InteractiveWebAssembly (**52 per browser/renderer combination**), covering menu and menuitem semantics, disabled-item skipping, Arrow/Home/End, type-ahead, exactly-once Enter/Space activation, LTR and RTL submenu navigation (including opposite-direction key non-actions), Escape focus restoration, and Tab/Shift+Tab dismissal with verified movement to keyboard-focusable elements outside the menu. This updates the browser evidence only; native Windows Contrast Themes, named Narrator/NVDA/JAWS acceptance, final #418 token approval, and complete Fluent visual parity remain open. Issue #428 stays In progress and PR #554 stays Draft.
