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
- Owner identity is private implementation bookkeeping. The Option A prototype uses one public immutable `PortalThemeScope` value object as the explicit scope carrier; do not add a public `OwnerId`, launcher component or separate accessibility-options object merely to expose internal registry identity.
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

## Additional WebKit regression lane — added 2026-11-16

A separate macOS GitHub Actions lane, `.github/workflows/v3-webkit-portal-lab.yml`, now runs the same bounded D2/D5 published-InteractiveServer scenario against Playwright's WebKit engine. It shares the parameterized regression probe with the Firefox lane and preserves its trace, screenshot and server diagnostics as a workflow artifact.

- Probe: `scripts/quality/probe_v3_firefox_portal.mjs` (engine selected by `BLUENT_V3_PLAYWRIGHT_ENGINE=webkit`).
- Exact current PR head when added: `1a7d25e71bf6300e1e51ee1b1286ee5653a4ef52`.
- Workflow run: 43944623766 is the **Bluent v3 WebKit Portal Lab** run; results are pending at this checkpoint.

This is cross-engine WebKit regression evidence only. It is **not** the Safari.app browser, SafariDriver, VoiceOver, native Apple OS accessibility, or native Windows Contrast Themes certification. The existing Safari Remote Automation blocker on the developer's Mac remains unchanged; no device setting was modified.

#### WebKit attempt 2 — first-Escape probe correction (2026-11-16)

Run: [43944732486](https://github.com/vrassouli/Bluent/actions/runs/43944732486), artifact: [WebKit trace and screenshot](https://github.com/vrassouli/Bluent/actions/runs/43944732486/artifacts/14267427234).

The probe successfully published and launched the InteractiveServer host, passed the D2 live/nested brand-owner cases, passed concurrent Dialog snapshot isolation, and passed the D5 modal semantics plus owned-Popover/inert-background assertions. It failed at the first Escape assertion: the trace shows the modal entered its `hide` state before the expected Popover-only dismissal completed.

The shared Popover source intentionally consumes Escape only when the keyboard event target is the owning trigger or active surface; unrelated Escape events are allowed to reach the owning Modal. The original probe clicked the trigger but did not establish or assert that it was the active keyboard target. That setup is not portable across browser/platform pointer-focus behavior. The probe now explicitly focuses the modal-owned Popover trigger and asserts `document.activeElement` before sending Escape. This adjusts the test precondition to match the implemented keyboard contract; it does not change runtime behavior or claim the WebKit retry has passed. A new exact-head WebKit run is required.

## Workflow boundary

- #418 remains **In progress**; this review does not move it to Review or Done.
- PR #500 remains open against `bluent-v3`; its mergeability and green CI do not close the remaining design/native acceptance gates.
- #434 Checkbox may use these selected directions as design foundations, but its own component design and Ready gate remain separate.
- No stable `Dev` / `main` change, production CSS activation, NuGet publication or deployment is authorized by this checkpoint.


## 2026-11-17 — current-head verification and acceptance boundary

The Penpot primary is restored. The source-owned **Bluent v3 Design System** file (`b64f6665-c9ab-80b5-8008-c4ac99d9d000`) is reachable at revision **836**. Pages **31, 32, 33, 42, 45, 52, 53, 54 and 55** were inspected; the decision/evidence boards 45 and 52–55 were exported and visually inspected. Page 54's Option A risk/invariant text was clarified to identify `PortalThemeScope` as the single public immutable experimental value carrier; the board was re-exported and visually rechecked at revision 836. The original Microsoft Fluent 2 reference remains untouched. Page 45 keeps its REVIEW REQUIRED status; page 55 remains DRAFT / exact values not approved. Pages 52–54 continue to show selected engineering directions as preview/prototype only, not public API promotion.

Exact current PR head `6c9dc96158a554cba88f54ba516f27ed24c15215`: **13/13 GitHub Actions workflows successful, 0 failed, 0 pending**, including Firefox and the GitHub macOS Playwright WebKit Portal Lab.

Local verification on macOS 27.2 ARM64 / .NET SDK 10.0.300:
- `dotnet restore Bluent.sln --nologo` — PASS.
- `dotnet build Bluent.sln --configuration Release --no-restore -warnaserror --nologo` — PASS, **0 warnings / 0 errors**.
- `dotnet test Bluent.sln --configuration Release --no-build --no-restore --nologo` — **140/140**.
- `scripts/quality/test_v3_nuget_boundary.py` — **9/9** negative/positive controls. A local-only `Bluent.UI.1.0.0.nupkg` was packed and inspected: all ten legacy themes and reviewed opt-in Dialog/Danger assets are present; no unexpected v3/demo-only assets or unapproved fonts; no publish/upload was performed.
- Focused #418 review contract **10/10**, additive API ledger **8/8**, token contrast **12/12**, foundation preview **7/7**, Focus bridge **7/7**, Focus host matrix **22/22**; typography and system-font continuity source audits PASS; docs contract **0 findings**; Skills contract **0 errors**; `git diff --check` PASS.

**Still open before #418 Review/Done or PR #500 merge:** native spoken NVDA/Narrator/VoiceOver (including Persian description, localized Close activation and focus return); native Windows Contrast Themes for Dialog/Popover and unsupported Focus hosts; current Safari.app/SafariDriver (the existing Allow Remote Automation setting remains disabled; it was not changed); composition-based Persian OS IME/caret/selection and cross-platform font metrics; and final maintainer approval of the individual public semantic allow-list, exact production alias set and public Focus/Portal/Dialog API contract. Playwright WebKit CI success is cross-engine browser evidence, not native Safari.app or spoken AT acceptance.

**Disposition:** #418 is In progress, not Blocked, because the Penpot access blocker is resolved. PR #500 remains OPEN, CLEAN/mergeable and unmerged against `bluent-v3`. No stable `Dev`/`main`, production CSS activation, NuGet publication, release or deployment changed. Do not mark Done or merge by inferring native acceptance from green CI.


### 2026-11-17 — page-54 scope value carrier and public API audit correction

The source-owned Penpot page-54 Option A board now makes one necessary point explicit: `PortalThemeScope` exists in the isolated prototype as a public immutable value object so callers can construct the explicit scope used by `CascadingValue` and `DialogConfigurator.SetThemeScope`. Its current name/shape remain provisional; it is not production API approval. Option A still adds no public `OwnerId`, launcher component or separate `DialogAccessibilityOptions` object. The page-54 board was updated and re-exported for visual review; its DRAFT/acceptance-open status is unchanged.

A compiled CLR comparison of the Release `Bluent.UI.dll` from the #418 implementation head against the `bluent-v3` base exposed an undercount in the earlier component-only API note. The component delta remains 9 Dialog/Popover properties plus the two Dialog methods listed above, but the complete package delta also includes the new `PortalThemeScope` value type, six `DialogConfigurator` methods, seven `DialogConfiguration` init-only properties and `PopoverSettings.AccessibleTriggerState`. The full list is now in `ISSUE418-ADDITIVE-API-CONTRACT-REVIEW.md` and machine-readable `reviewPolicy.publicApiDelta`, with regression guards. No prior signature or `IDialogService` overload changed. Public names and production promotion remain unapproved.


### 2026-11-17 — complete API ledger and CI checkpoint refresh

The exact-head Actions run on `ae05397a26c3142385b667a96af302bedee5ff51` completed **13/13 SUCCESS**, 0 failures, 0 pending, including Real Browser Lab, Firefox and WebKit Portal Lab. The current local API-ledger correction (eight tests) and schema/design alignment pass locally; a new isolated documentation/schema/test commit will get its own exact-head CI run before this PR body is refreshed.

Current focused tests on the uncommitted tree: Issue #418 review contract **10/10**; complete additive API ledger **8/8**; token contrast **12/12**; foundation preview **7/7**; approved Focus bridge **7/7**; Focus host surface matrix **22/22**; Focus alpha-host tests **PASS**. Full local Release build remains 0 warnings/0 errors; full Solution remains **140/140**; NuGet boundary tests **9/9** and local-only package inspection pass. Docs contract is 0 findings; Skills contract is 0 errors. `git diff --check` is clean.


### 2026-11-17 — native Penpot TokenSet schema reconciliation

A native TokenSet readback against the source-owned Bluent v3 Design System found that the editable design library did not yet match the selected schema, despite generated CSS/schema checks being green. Seven expected logical token names were missing and three Link source tokens still used the old `bluent.source.*` prefix.

The migration was performed only in the owned TokenSets, after saving a recovery version (`Before #418 native token schema alignment — 2026-11-17`). For both Light and Dark it added `bluent.color.foreground4` and `bluent.source.paletteRedForeground1`; added `bluent.semantic.text.placeholder` and the Label-only `bluent.semantic.text.dangerAccessible`; added the explicitly unapproved Badge text candidate `bluent.component.badge.dangerTextAccessible`; renamed Link Rest/Hover/Pressed from `bluent.source.brandForegroundLink*` to `bluent.color.brandForegroundLink*`, preserving exact mode values; and updated all three semantic Link aliases.

The page-27 architecture board was updated/exported to record **46 logical roles (16 source + 17 semantic + 13 component)** and to separate the ten-brand preview from the native Light/Dark bridge.

The repeatable read-only audit is stored at `scripts/quality/penpot_v3_issue418_token_schema_audit.js`. It temporarily activates Light/Dark mode themes, checks all 46 roles and resolved alias values, verifies all 20 Brand×Mode preview themes with eight palette roles each and both shared eight-token semantic/component layers, then restores original active themes in `finally`. Live Penpot verification at file revision **840** passed **1,285/1,285 assertions**, zero errors. Results are mirrored in `issue-418-token-schema.preview.json` → `reviewPolicy.latestValidation.nativePenpotTokenAudit`.

**Acceptance boundary unchanged:** this proves native design-library/schema parity, not approval of page 45, the final public semantic allow-list, production aliases, public Focus/Portal/Dialog API names, native OS Contrast Themes or spoken assistive technology. The preview remains opt-in; no production CSS/package changed.

### 2026-11-17 — Penpot revision and TokenSet inventory refresh

The repeatable audit was fetched from the branch and executed directly inside Penpot. It returned **1,285/1,285 PASS** on file revision **842**, with the original Light · Draft and default / light preview themes restored. Current Penpot inventory: **45 TokenSets / 492 token entries**; the active Light/Dark mode theme each references **17 TokenSets / 262 token entries**, including the 46 logical color roles, separate foundation aliases and candidate layers. The logical token schema remains 16 source + 17 semantic + 13 component roles per mode; it is not the count of every foundation, typography or brand-preview entry.

The machine-readable schema now distinguishes logical color token counts from physical TokenSet/token-entry inventory, avoiding the older 24/48 count being mistaken for the complete #418 layer contract.

### 2026-11-17 — Windows cross-engine acceptance checkpoint (exact PR head ecce36c)

The isolated Windows 11 Pro environment (build 28000, .NET SDK 10.0.403) was checked against PR head ecce36cc52ae9903114c4c104c9b0a029e09c220; the main D:\projects\Bluent checkout stayed on Dev and was not modified.

Release validation on that exact head: dotnet restore PASS; Release build with warnings as errors **0 warnings / 0 errors**; full solution tests **140/140**; focused Issue #418 review **13/13**; additive API ledger **8/8**; NuGet boundary controls **9/9**; Node syntax check and git diff --check PASS.

Independent browser probes on the same isolated PR clone:
- Chrome 157.0.8103.79 / Blazor WASM: probe_v3_blazor_runtime.mjs **1,179/1,179**, zero failures. Twenty brand×mode samples; 80 Dark foreground candidates with minimum contrast **4.600125:1**; focus/zoom, narrow viewport and double-ring matrices 80 samples each. Persian evidence is platform glyph observation, not OS IME acceptance.
- Edge 157.0.4341.60 / Blazor WASM: the same **1,179/1,179**, zero failures.
- Chrome and Edge / forced-colors + reduced-motion CDP emulation: probe_v3_forced_colors_runtime.mjs **299/299 each**. Covers ten brands × Light/Dark × normal, reduced-motion only, forced-colors only and combined media states. Button retains a visible 2px system Highlight focus ring without layout shift; TextField remains underline-only; reduced motion resolves to 0ms independently of forced colors.
- Firefox 159 / Published InteractiveServer: D2/D5 Portal probe **34/34**.
- Playwright WebKit 1.65.1 / Published InteractiveServer: D2/D5 Portal probe **34/34**.

The D2/D5 probe now uses Unicode escapes for the Persian Close accessible name and waits for parent and nested Dialog roots to carry data-bui-v3-keyboard-bound before dispatching Escape. The previous WebKit timeout was a probe-only mojibake/race issue before asynchronous JS-interoperability registration. Once both handlers were registered, Firefox and WebKit each passed 34/34. The ecce36c change touches the probe harness only; no runtime implementation changed.

Exact-head GitHub Actions on ecce36c: **13/13 SUCCESS**, zero failures and zero pending. Real Browser Lab completed all four cells: Chrome/Edge × WASM/InteractiveServer.

**Native acceptance still open:** Windows Contrast Themes remains disabled on the test account and was not changed; Narrator is installed but not running, NVDA/JAWS are not installed. No spoken screen-reader acceptance has been performed. Native Safari.app/VoiceOver and composition-based Persian OS IME/caret/selection remain unverified. Browser CDP forced-colors emulation is not native Windows Contrast Themes. Penpot page 45 remains REVIEW REQUIRED; page 55 remains DRAFT. Public Focus/Portal/Dialog names and production semantic/token promotion still need maintainer approval.
