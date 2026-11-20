# Issue #418 — Dark brand foreground browser rerun

- **Date:** 2026-11-20
- **Repository:** vrassouli/Bluent
- **Branch:** v3/issue-418-design-tokens
- **Baseline HEAD:** 092fc75b56a6e5aa0f09ca07a307298945bbd8e0
- **Current pushed base before this follow-up:** 2119544e56a5cacdc3e76d9351bd5317342251fd
- **Evidence category:** local build, automated tests, and real-browser runtime

## Why this rerun exists

The hosted Chrome / InteractiveServer Real Browser Lab on the starting HEAD sampled the Light neutral surface during a Dark brand-foreground assertion. The probe had changed data-bui-theme directly in the DOM, while the Blazor page owned that state in _dark. A later InteractiveServer render could therefore overwrite the test's DOM-only change. A fixed sleep did not guarantee that the final Dark state had been rendered.

The first pushed correction still failed once in hosted Chrome / InteractiveServer with a Blazor theme callback timeout. Its click targeted the component id rather than the native button. The follow-up now reads the Blazor-owned surface theme attribute, finds the actual native button by the action label (Switch to dark / Switch to light), clicks it, and waits for the rendered theme attribute to change. It fails closed with the visible button labels if the control cannot be found. The probe also waits for the requested brand, direction, and computed Dark neutral surface before reading foreground colors. The nested Word sample is checked against its intentional opposite AlternateScope mode, and the probe restores Light through the same native button interaction before subsequent checks.

## Local verification

The following checks ran on Dev01 against the working tree containing the above probe/test changes.

| Check | Result |
| --- | ---: |
| Chrome / InteractiveServer deep probe | **1,178 / 1,178** |
| Chrome / WebAssembly deep probe | **1,179 / 1,179** |
| Edge / InteractiveServer deep probe | **1,178 / 1,178** |
| Edge / WebAssembly deep probe | **1,179 / 1,179** |
| Token preview contrast tests | **13 / 13** |
| Issue #418 review contract tests | **15 / 15** |
| Approved focus-host token bridge tests | **7 / 7** |
| Focus alpha-host tests | **22 / 22** |
| Runtime failure diagnostics tests | **4 / 4** |
| Blazor WebAssembly Debug demo build | **0 warnings / 0 errors** |
| Node syntax check for the probe | **Passed** |
| Git whitespace check | **Passed** |

All four browser runs covered the 20 brand × mode combinations and 80 Dark foreground samples. Each reported zero browser assertion failures; the minimum sampled Dark foreground contrast was **4.600125:1** against the opaque Dark NeutralBackground1 candidate. Focus zoom, narrow viewport, and double-ring viewport probes also reported zero failures in those runs.

Commands used (with the installed browser executable supplied through CHROME_PATH):

- BLUENT_V3_LAB_MODE=server; node scripts/quality/probe_v3_blazor_runtime.mjs — Chrome / InteractiveServer
- Remove-Item Env:BLUENT_V3_LAB_MODE -ErrorAction SilentlyContinue; node scripts/quality/probe_v3_blazor_runtime.mjs — Chrome / WebAssembly
- BLUENT_V3_LAB_MODE=server; node scripts/quality/probe_v3_blazor_runtime.mjs — Edge / InteractiveServer
- Remove-Item Env:BLUENT_V3_LAB_MODE -ErrorAction SilentlyContinue; node scripts/quality/probe_v3_blazor_runtime.mjs — Edge / WebAssembly
- dotnet build src/Bluent.UI.Demo/Bluent.UI.Demo.csproj --configuration Debug --no-restore --nologo -warnaserror
- dotnet build Bluent.sln --configuration Release --no-restore --nologo -warnaserror
- dotnet test Bluent.sln --configuration Release --no-build --nologo
- python scripts/quality/check_v3_docs_contract.py
- python scripts/quality/check_v3_skill_contract.py
- python scripts/quality/check_markdown_links.py
- python -m unittest discover -s scripts/quality -p test_v3_token_preview_contrast.py -v
- python -m unittest discover -s scripts/quality -p test_v3_issue418_review_contract.py -v
- python -m unittest discover -s scripts/quality -p test_v3_approved_focus_host_token_bridge.py -v
- python -m unittest discover -s scripts/quality -p test_v3_focus_alpha_hosts.py -v
- python -m unittest discover -s scripts/quality -p test_v3_runtime_failure_diagnostics.py -v
- node --check scripts/quality/probe_v3_blazor_runtime.mjs
- git diff --check

## Scope and limitations

- These are local Dev01 results from the current working tree layered on pushed HEAD 2119544e; the native-button follow-up is not yet committed/pushed and hosted exact-head CI for it is still pending.
- Chrome and Edge were both exercised in both local render modes: InteractiveServer and WebAssembly. These remain local runs, not hosted exact-head CI.
- The minimum ratio is a measurement of these preview candidates on the specified opaque Dark surface; it is not blanket WCAG conformance.
- Browser forced-colors emulation, Chromium accessibility-tree inspection, and these runtime probes do not certify native Windows Contrast Themes or spoken Narrator/NVDA/VoiceOver behavior.
- Native Safari, Persian operating-system IME/caret/selection, final public token aliases/API, and the remaining Penpot review/acceptance gates remain open.
- No production CSS, public token alias, stable Dev/main branch, NuGet package, release, or deployment was changed.
- Issue #418 and PR #500 remain open; no merge or GitHub Project status transition is implied by this local rerun.
