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
