# Bluent v3 — Quality evidence, baseline CI, and acceptance boundaries (#425)

**Status: In progress, partial implementation.** Everything runs only on task PRs targeting bluent-v3. Never merge to Dev or publish NuGet from these gates.

## Actual design-tool provenance (not fabricated)

The canonical editable Bluent v3 Design System Penpot file is b64f6665-c9ab-80b5-8008-c4ac99d9d000. A dedicated REAL editable #425 QA flow board was created in the correct connected file on 2026-10-15: page 41 / Quality gates and acceptance / #425 ID ed5216bd-3d5b-8015-8008-cb25572ebb61, board #425 / Required CI matrix and evidence policy ID ed5216bd-3d5b-8015-8008-cb2557357776 (44 native editable shapes). The actual board was exported to PNG and visually inspected; three CI lanes and four evidence levels are present. This is a **DRAFT QA architecture design, NOT user/maintainer approval of pixel parity or native OS/AT compliance**. Earlier reference boards are #501 Focus f4136a9a-101d-8004-8008-ca2956fe05f9 and #494 inventory 44b12572-0104-807e-8008-ca035bbc8ca7. Figma fallback https://www.figma.com/design/X6Ima16GAyuk7dVUjGgIkt hit Starter rate limits; Penpot later reconnected and was used. Reviewer signoff and genuine accepted visual baseline/AT tests still remain before Done.

## Evidence levels must remain distinct

| Label | Actual proof | Does not prove |
| --- | --- | --- |
| **Source verified** | Checked current code, design artifact, or approved token sources at a stated SHA | Rendering and real keyboard behavior |
| **Build verified** | Full solution compiled without warnings | Running app correctness |
| **Pack verified** | All five packages packed and version/commit/ID metadata verified at a CI-only version | NuGet publication or consumer behavior |
| **Runtime verified** | A real Blazor app used in the specified browser and render mode | Other devices and accessibility |
| **Visual verified** | Human-reviewed screenshot vs accepted design in specified viewport, RTL/LTR and theme | Screen reader compliance |
| **Native OS/AT verified** | Native Windows Contrast Themes plus named assistive tech, versions and observed interactions | All combinations or operating systems |

CSS emulated forced-colors and reduced motion are **browser media emulation**, not native Windows Contrast Themes. **Not an accessibility certification.**

## Every-v3-PR baseline — automated, fail-closed

The new .github/workflows/v3-quality-gates.yml runs on ALL pull requests into bluent-v3, including docs-only PRs. It does a .NET 10 zero-warning full solution Release build, canonical consumer task-example compile, tests, release-tool tests, and five-package CI-only pack with ID/version/SHA inspection and report artifact. No package is pushed, released or merged to stable Dev. The separate policy job checks docs, Skill routing, Markdown links, workflow YAML syntax, changed-line whitespace, and this contract with negative tests that intentionally remove critical gates and expect rejection.

The first independent quality workflow also starts a **real Blazor SSR server**, waits for its static compatibility endpoint, runs check_rendered_accessibility.py, and retains a server log on failure. This is a real rendered SSR smoke, not keyboard/AT certification.

### Independent real-browser baseline on every v3 PR

The new .github/workflows/v3-compatibility-browsers.yml is unfiltered for every PR targeting bluent-v3: **Chrome + Edge x InteractiveServer + InteractiveWebAssembly** on Windows GitHub runners (four independent jobs; fail-fast disabled). This is independent of the unmerged #418 task PR #500, exercising the existing source-owned Bluent compatibility routes.

The dependency-free Node 24 [CDP browser smoke](../../../scripts/quality/probe_v3_compatibility_runtime.mjs) publishes the real SSR/WebAssembly app, opens each installed browser, waits for the interactive renderer, clicks a real Bluent Button and checks EventCallback, types into an actual TextField and checks binding, checks native input focus and Tab exit, and captures six PNG screenshots at 320/768/1280 across Light/Dark and RTL/LTR. It verifies forced-colors/reduced-motion *browser emulation only*. Windows CI preserves 6 images and exact-SHA JSON report for each mode even on success, not a NuGet release.

**Dev01 local real browser tests 2026-10-15:** Chrome Server 12/12, Chrome WebAssembly 12/12, Edge Server 12/12, Edge WebAssembly 12/12 = **48/48 assertions**, 24 PNGs and four JSON evidence reports. These are LOCAL runs; actual new GitHub CI HEAD requires independent verification. Two first-pass test-only errors (returning an HTMLInputElement by value to CDP and comparing short WASM against actual WebAssembly renderer label) were corrected; all four real browser runs then passed.

Screenshot capture does NOT equal reviewed visual regression acceptance. Native Windows Contrast Themes, screen-reader/assistive-tech and WCAG 2.2 AA certification are not proven by CSS media emulation. Rich #418 ten-brand focus/danger visual parity remains separate and unmerged. Component-specific state/ARIA/keyboard suites still belong to each component issue.


## Still required for actual component Review / Done

- The issue-specific source-owned Penpot draft board now exists (exact IDs above). Reviewer must still accept its mapping/state/evidence matrix and confirm actual runtime/component design parity.
- Per-component exhaustive public parameters, correct binding/validation, selected/loading/disabled, keyboard & ARIA semantics, labels and restored focus, overlays and JS cleanup.
- **Visual verified** screenshot comparisons across 320/768/1280 widths, Light/Dark, RTL/LTR and Persian typography, with stable baselines and reviewed diffs.
- **Native OS/AT verified** tests with real Contrast Themes and named screen readers. Save platform/browser/AT versions and exceptions.
- Migration ledger and valid consumer compilation for public API changes; final version/release approval separately.

Each PR must record exact SHA, affected components and packages, source design page/node, commands, rendered modes, viewport/locale/theme/direction, CI links, results and **unverified** limitations. Do not substitute source verification for rendered accessibility/visual evidence; avoid prematurely marking #425 or a component issue Done.

## Baseline security regression found by warnings-as-errors

The initial actual #425 Release build rejected two NU1903 high-severity advisories (GHSA-g27p-qf6j-c96c and GHSA-qjpx-jqm5-h2c4) on Microsoft.AspNetCore.Components.WebAssembly.Server **10.0.7**. The patched 10.0.13 package was released 2026-10-13. Only the SSR-host PackageReference was upgraded to **10.0.13** on this isolated v3 task branch; no consumer library API or stable 2.x package references were changed. Restore + full Release -warnaserror build now pass with zero warnings/errors. The quality contract has a real XML parser and a negative test to reject regressions back to 10.0.12 or lower. Official reference: https://github.com/advisories/GHSA-qjpx-jqm5-h2c4 .

Local scope on initial #425 branch: 20 .NET solution tests passed, 4 rendered SSR routes passed the focused accessibility smoke, and all five CI-version NuGet packages passed release_tools package-ID/version/commit checks with a local report under a temporary directory. **This is not actual GitHub runner success** until the new PR jobs run. Independent Chrome/Edge x Server/WASM compatibility browser baseline now exists; the richer #418 ten-brand focus browser lab and native OS/AT remain separate.


2026-10-15 GitHub CI evidence on #425 PR #549 SHA 45b1a3006c9f37b1adb4881ce87d619b1aa36240: **Chrome/Server, Chrome/WASM, Edge/Server and Edge/WASM all PASS in Windows GitHub Actions**, plus Release build/test/pack, evidence policy, docs and Skills PASS. The new board exists as an editable design but does not waive native screen-reader/Windows Contrast Themes, reviewed screenshot-diff baseline or component-specific exhaustive coverage. New docs-only commit will rerun all these gates.
