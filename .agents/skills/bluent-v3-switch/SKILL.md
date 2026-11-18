# Bluent v3 Switch — #435 implementation handoff

> **Task-branch handoff only; not a released v3 API.** Work is on `v3/issue-435-switch` targeting `bluent-v3`. Existing 2.x Switch consumers and package documentation remain authoritative until a later accepted v3 release.

## Retrieval order

1. [Canonical Switch v3 implementation record](../../../docs/v3/components/switch.md) for API, semantics, build/browser evidence and current acceptance boundary.
2. [Fluent design/API crosswalk](../../../docs/v3/design/SWITCH-DESIGN-AND-API-CONTRACT.md) for reference hierarchy, geometry, token ownership and Penpot traceability.
3. [Issue #435](https://github.com/vrassouli/Bluent/issues/435) and the task PR targeting `bluent-v3` for live status/review.
4. Canonical Penpot file **Bluent v3 Design System** (`b64f6665-c9ab-80b5-8008-c4ac99d9d000`), page 58 (`06b2261f-bfb4-808c-8008-f689e0ff1a1b`): 40-state matrix `06b2261f-bfb4-808c-8008-f689e11abe56`, anatomy/accessibility/CSS crosswalk `06b2261f-bfb4-808c-8008-f68a6da3e29d`, and Medium-first board `b5e126d7-572c-8063-8008-f691ea3d12ec`.
5. Sources: `src/Bluent.UI/Components/SwitchComponent/`, `src/Bluent.UI/Styles/Components/_switch.scss`, `src/Bluent.UI.Demo.Pages/Pages/Components/Switches.razor`, and `src/Bluent.UI.Demo.SSR/Components/Pages/SwitchInteractiveServerProbe.razor`.
6. Focused render tests: `tests/RegexSampleGeneratorTest/SwitchRenderSemanticsTests.cs`; real browser runner/probe: `scripts/quality/run_v3_switch.ps1` and `scripts/quality/probe_v3_switch.mjs`; JSON/PNG artifacts: `docs/v3/quality/evidence/BLUENT-SWITCH-*`.
7. [Migration impact M23](../../../docs/v3/design/MIGRATION-IMPACT-LEDGER.md) for the old 2.x vs proposed v3 consumer differences.

## Source-backed API boundary

- `Switch` directly inherits `BluentInputComponentBase<bool>`, not `Checkbox<bool>`.
- Keep `Value`, `ValueChanged`, `ValueExpression`, `EditContext`, `Class`, `Style`, generated `Id` and normal unmatched input attributes.
- Direct parameters: stable `Label`, decorative `Required`, and `SwitchLabelPosition` (`After`, `Before`, `Above`).
- The input is a native `input[type=checkbox][role=switch]`; native `checked` is authoritative and no authored `aria-checked` exists.
- No `UncheckedLabel`, `IndeterminateLabel`, `Circular`, `CheckboxSize`/`Size`, `Toggle()` or child-content API.
- Visible label must remain unchanged on/off. Without a visible label, require caller `aria-label` or `aria-labelledby`.
- `Required` marker is decorative only. Actual required semantics use native `required` / consumer validators and EditContext messages.

## Fluent and geometry decision

Primary implementation reference: Fluent UI Web Components Switch. The first v3 public API uses a single Medium geometry: 40×20 track, 14×14 thumb, Base300 label, no `Size` parameter and a minimum 24×24 CSS-pixel hit area. Fluent React v9 Small remains a supplementary/deferred reference, not an API to copy without consumer evidence.

Use existing shipped CSS roles only. Do not consume preview-only #418 aliases or introduce new global tokens, Focus host attributes or Portal/Dialog public APIs. The local exception does not alter #418, which remains separately owned and In progress.

## Verification commands

```powershell
python scripts/quality/check_v3_switch_contract.py
python -m unittest discover -s scripts/quality -p 'test_v3_switch_contract.py' -v
python scripts/quality/check_v3_docs_contract.py
python scripts/quality/check_v3_skill_contract.py
python scripts/quality/check_markdown_links.py

dotnet test tests/RegexSampleGeneratorTest/RegexSampleGeneratorTest.csproj -c Release --filter FullyQualifiedName~SwitchRenderSemanticsTests

dotnet build src/Bluent.UI.Demo.Pages/Bluent.UI.Demo.Pages.csproj -c Release --no-restore -warnaserror
dotnet build src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj -c Release --no-restore -warnaserror

pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/quality/run_v3_switch.ps1 -Mode WebAssembly -Browser Chrome
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/quality/run_v3_switch.ps1 -Mode WebAssembly -Browser Edge
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/quality/run_v3_switch.ps1 -Mode Server -Browser Chrome
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/quality/run_v3_switch.ps1 -Mode Server -Browser Edge
```

Latest local checkpoint: focused render semantics 11/11; fail-closed Switch guard/mutation suite 15/15; Chrome/Edge × WebAssembly/InteractiveServer **25/25 per cell, 100/100 total**. All four runs verify native role/name/checked, pointer/Space, focus, labels/disabled/form/RTL, real Light/Dark semantic colors (real Header control in WASM; host theme attribute in the minimal Server QA layout), forwarded `Class`/`Style`/`aria-describedby`, forced-colors/reduced-motion emulation, 320px reflow and zero runtime signals. Full `Bluent.sln` Release build passed with 0 warnings/errors and .NET tests 124/124. The previously verified PR SHA `2bfaa79` passed all 8 hosted workflows; after any follow-up push, verify the live current PR head before status promotion. Browser forced-colors is emulated and does not certify native Windows Contrast Themes or spoken screen-reader output. The Penpot boards remain proposals for independent maintainer visual-parity review; full 66-family Component Lab acceptance is separate and unchanged.

## Lifecycle and safety

Follow GitHub Project #5 Backlog → Ready → In progress → Review → Done. Do not mark Review until the PR and every required evidence/check is ready; do not mark Done until an accepted PR is merged into `bluent-v3`. The design boards are proposals, not blanket design/AT acceptance. Never change stable `Dev`, `main`, released 2.x source, NuGet packages or deployments.