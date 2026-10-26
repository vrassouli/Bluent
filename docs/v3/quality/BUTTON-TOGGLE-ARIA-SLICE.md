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

Observed local evidence on 2026-10-26:

- `dotnet test tests/RegexSampleGeneratorTest/RegexSampleGeneratorTest.csproj --configuration Release` — **27/27 passed**.
- Full Solution Release build and tests also completed; the build reports two pre-existing NU1903 high-severity advisories for Microsoft.AspNetCore.Components.WebAssembly.Server 10.0.7 in the SSR demo. That unrelated dependency update is tracked in [#425 / PR #549](https://github.com/vrassouli/Bluent/pull/549) and was not duplicated in this Button change.
- Release `Bluent.UI.Demo` build — **0 warnings / 0 errors**; Debug build also completed with 0 warnings / 0 errors for the live WebAssembly host.
- Real Chromium DevTools Protocol browser probe on the unmodified live Bluent WebAssembly `/components/buttons` route — **Chrome 23/23 passed; Edge 23/23 passed**. Checks include native Space and Enter activation, the emitted `aria-pressed` state and computed accessibility-tree `pressed` property (`false` then `true`), split-button Tab/Shift+Tab, Disabled skipping, RTL adjacency and forced-colors media emulation.
- Published Production browser matrix via `scripts/quality/probe_v3_button_toggle_interactive_server.mjs` — Chrome and Edge on both `InteractiveServer` (`/compatibility/server`) and `InteractiveWebAssembly` (`/compatibility/webassembly`), **19/19 each run (76/76 total)**. The probe verifies the actual renderer and confirms a SignalR WebSocket HTTP 101 handshake only for InteractiveServer. In both modes it checks that component-owned `aria-pressed` overrides conflicting caller `mixed`, an ordinary Button without `Toggled` preserves caller `aria-pressed="mixed"`, a navigation anchor with `Toggled=true` gets no generated toggle state, and a disabled toggle preserves authoritative `pressed=false`. Real pointer click, Space and Enter activation change state as expected, `ToggledChanged` and `OnClick` each fire exactly once per activation, and the computed accessibility tree exposes the pressed state after initial render, pointer click and Space.
- The public `/components/buttons` showcase now uses independent `@bind-Toggled`` bindings for all six existing appearances, including Danger, and displays each bound state; the row wraps on narrow layouts. The full Release solution build (0 warnings / 0 errors) and 27/27 tests pass.
- `node --check scripts/quality/probe_v3_button_focus_runtime.mjs`, `node --check scripts/quality/probe_v3_button_toggle_interactive_server.mjs`, and `git diff --check` — passed.

## Evidence boundaries

The focus-ring candidate used by the existing #501 probe is injected into a disposable browser tab only; it is not a product stylesheet change. Forced Colors was browser-emulated, not native Windows Contrast Themes. No Narrator/NVDA/JAWS acceptance is claimed. InteractiveServer and InteractiveWebAssembly parity for the toggle semantic slice is now demonstrated by the 76/76 Production browser checks above, including exact-once callback counts and ordinary/link/disabled attribute behavior. Exact-head GitHub CI for the current fixture/probe matrix and reviewer acceptance remain pending; no full Button or native screen-reader acceptance is claimed.

## Design provenance

Reuses the existing source-owned Bluent v3 Button appearance/state design and accepted native Focus Visible design (#501): Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 38 `535db143-a732-807e-8008-c64d2fb91b9a`. No design nodes or visual tokens were modified by this non-visual slice.
