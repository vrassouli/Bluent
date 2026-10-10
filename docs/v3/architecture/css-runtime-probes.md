# Bluent v3 — browser cascade and real overlay theme evidence (#417)

> **Status:** verified exploratory QA, not approved v3 behavior or a Fluent 2 parity assertion. Design reference is the **existing draft D2/D3 Figma board** [`14:3`](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=14-3). No new Penpot/Figma artwork was created in this phase because Figma's Starter MCP quota was reached and the connected Penpot file belongs to PuyaStudio Runner; neither unrelated file nor original Fluent community kit was modified.

## 1. Native CSS cascade regression model (real Chrome)

Run from repository root:

```powershell
python scripts/quality/probe_v3_css_cascade.py
```

This self-contained test writes a temporary HTML fixture, runs a local headless Chrome instance, extracts `getComputedStyle` results, and deletes the fixture. It does **not** load Bluent components or change the library CSS.

| Assertion | Browser-observed | Expected | Outcome |
| --- | --- | --- | --- |
| Ordinary unlayered declaration vs layered declaration | green `rgb(0,128,0)` | unlayered wins | Passed |
| Layered `!important` vs unlayered `!important` | red `rgb(255,0,0)` | layered wins | Passed |
| First vs subsequent explicit layer for `!important` | blue `rgb(0,0,255)` | earlier important layer wins | Passed |
| Nested `[data-bui-theme=dark]` foreground | white `rgb(255,255,255)` | inherits dark local variable | Passed |
| Simulated out-of-tree portal foreground | `rgb(36,36,36)` | inherits light/global variable | Passed |

**Total: 5/5.** This demonstrates why a blind global `@layer` conversion can invert consumer CSS override behavior. It does **not** prove actual Bluent selectors or CSS specificity compatibility; these need a separate opt-in integration comparison.

## 2. Actual Bluent DialogContainer experiment (Debug WASM)

Run the **existing** Debug demo locally (port is configurable):

```powershell
dotnet run --project src/Bluent.UI.Demo --configuration Debug --no-build --no-launch-profile --urls http://127.0.0.1:5080
```

Then, with Node 22+ and Chrome installed:

```powershell
node scripts/quality/probe_v3_dialog_theme.mjs http://127.0.0.1:5080
```

The standalone Node script launches isolated headless Chrome, talks to the Chrome DevTools protocol (built-in `WebSocket`; no Playwright/npm dependency), waits for the existing `/components/dialogs` page, sets **only the page content** to `data-bui-theme=dark`, clicks the **actual Bluent** `Show default dialog` button, and measures real DOM ancestry and computed tokens. This is a QA-only browser DOM change, **not** a product code change.

| Observation | Actual Chrome output |
| --- | --- |
| Root `html` theme | `light` |
| Scoped `.page-content` theme | `dark` |
| Scoped `--colorNeutralBackground1` | `#292929` |
| Dialog `--colorNeutralBackground1` | `#fff` (same color as `#ffffff`) |
| Dialog computed background | `rgb(255,255,255)` |
| Dialog inside the scoped `.page-content` | **false** |
| Dialog's overlay inside the scoped `.page-content` | **false** |

**Runtime behavior reproduced.** This is a scope limitation, not necessarily a defect for applications that use only a single global theme. Source inspection explains the result:

- `src/Bluent.UI.Demo.Pages/Layout/MainLayout.razor` renders `<Containers/>` **after** the `.page` body; it is not a child of `.page-content`.
- `src/Bluent.UI/Components/ContainersComponent/Containers.razor` includes the singleton `DialogContainer`.
- `src/Bluent.UI/Components/DialogComponent/DialogContainer.razor` renders `.dialog-wrapper`, `Overlay` and `Dialog` at that shared container location. The service event is wired in `DialogContainer.razor.cs`.
- `src/Bluent.UI.Scripts/src/Theme/Theme.ts` sets global `data-bui-theme` on `document.documentElement`; existing theme scoping is `[data-bui-theme=light|dark]`. The service call does not currently carry a scoped theme context in this verified path.

**Draft decision D2:** before committing to nested theme support, evaluate (a) explicitly passing a typed theme/brand context to overlay host/services, (b) per-scope overlay hosts and layering contexts, and (c) retaining global-only theme semantics with clear documentation. Do not automatically copy computed custom properties, change the public service API, or move host containers without design/API review.

## 3. Real media-preference observations (Debug styling lab)

In the same isolated Chrome session, the Node script navigates to the existing `/v3/styling-lab`, uses DevTools media emulation and measures real Bluent elements.

| Simulated preference | Observed computed behavior | Interpretation |
| --- | --- | --- |
| `prefers-reduced-motion: reduce` | query matches; **lab Button** transition duration `0s` | Its demo-only scoped CSS has a reduced-motion rule |
| `prefers-reduced-motion: reduce` | **real `.bui-overlay`** animation `fade-in`, duration **`0.25s`** | Overlay motion is **not suppressed** by the current demo rule. This is a concrete accessibility follow-up, not acceptable as completed reduced-motion support |
| `forced-colors: active` | query matches; Button background `rgb(0,0,0)`, text `rgb(255,255,255)`, surface background `rgb(0,0,0)` | Browser applied forced colors to these samples. Does **not** establish contrast, focus-outline visibility, or complete high-contrast support |

The recorded `passed` from `probe_v3_dialog_theme.mjs` asserts only the **observed existing theme separation**; it must **not** be interpreted as an acceptance pass for nested themes, high contrast, keyboard behavior or reduced motion.

## 4. Decisions and remaining acceptance

1. **D2 confirmed risk:** Shared DialogContainer lives outside a locally themed page, and actual Dialog does not inherit its theme. Decide desired app/global vs nested scope contract in the next design-tool review; once approved, implement separately under the appropriate foundation/component issue.
2. **D3 confirmed browser behavior:** ordinary vs `!important` cascade ordering changes under `@layer`. Keep current unlayered CSS until a consumer-style precedence migration suite demonstrates safe adoption.
3. **Reduced-motion follow-up:** establish component-level motion policy in the v3 design spec; test overlay/dialog/drawer/popover animations, rather than claiming the lab Button's rule solves it.
4. **Forced-colors follow-up:** check actual focus visibility, border distinguishability, control states, hover and disabled under forced-color emulation and assistive input. A black/white screenshot is insufficient for WCAG compliance claims.
5. **Design-tool gate:** Figma MCP returned `You've reached the Figma MCP tool call limit on the Starter plan` when trying to inspect/update the design. Penpot currently points to **PuyaStudio Runner**; do not modify it. Continue only source/runtime validation and documentation that corresponds to the already recorded [D2/D3 Figma architecture board](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=14-3). Future design revisions and ADR sign-off must wait until an authorized Bluent Penpot session or available Figma quota.

No changes to released Bluent 2.x API/CSS/assets or NuGet have been made; all experiments are in `v3/issue-417-css-architecture` targeting `bluent-v3`. Keep GitHub Project Status **In progress** while independently actionable tests remain; do not move to Review without design approval.
