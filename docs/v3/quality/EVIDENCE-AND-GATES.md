# Bluent v3 — Quality evidence, baseline CI, and acceptance boundaries (#425)

**Status: In progress, partial implementation.** Everything runs only on task PRs targeting bluent-v3. Never merge to Dev or publish NuGet from these gates.

## Actual design-tool provenance (not fabricated)

The canonical, real editable Bluent v3 Design System Penpot file is b64f6665-c9ab-80b5-8008-c4ac99d9d000. Existing tested design-evidence exemplars are page 38 Button Focus board f4136a9a-101d-8004-8008-ca2956fe05f9 (previously 78/78 native-shape checks) and page 39 component inventory board 44b12572-0104-807e-8008-ca035bbc8ca7. These are verified **reference designs, not a dedicated #425 gate diagram or #425 design signoff**. On 2026-10-15 the Penpot plugin was frozen. Figma fallback design file https://www.figma.com/design/X6Ima16GAyuk7dVUjGgIkt was created for #420/#425, but the first write was denied by Starter rate limits; it is not claimed to contain a finished diagram. Final #425 Review is pending a genuine editable issue-specific QA flow and reviewer acceptance.

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

The four-job **Chrome + Edge x WASM + Server browser lab is currently on the unmerged #418 task PR #500**, not on bluent-v3. This #425 branch deliberately does not copy that work or pretend it already exists. Once #418 merges, follow up under #425 to remove that browser workflow's path filter and make the four render-mode smoke jobs mandatory on *every* v3 PR. Even then, **component-specific** demos and interactive state/ARIA tests remain separately required, beyond baseline smoke. A generic green CI is not all components meeting WCAG 2.2 AA.

## Still required for actual component Review / Done

- An authoritative editable Penpot/Figma issue design board with explicit source/behavior mapping, reviewed state matrix and parity.
- Per-component exhaustive public parameters, correct binding/validation, selected/loading/disabled, keyboard & ARIA semantics, labels and restored focus, overlays and JS cleanup.
- **Visual verified** screenshot comparisons across 320/768/1280 widths, Light/Dark, RTL/LTR and Persian typography, with stable baselines and reviewed diffs.
- **Native OS/AT verified** tests with real Contrast Themes and named screen readers. Save platform/browser/AT versions and exceptions.
- Migration ledger and valid consumer compilation for public API changes; final version/release approval separately.

Each PR must record exact SHA, affected components and packages, source design page/node, commands, rendered modes, viewport/locale/theme/direction, CI links, results and **unverified** limitations. Do not substitute source verification for rendered accessibility/visual evidence; avoid prematurely marking #425 or a component issue Done.

## Baseline security regression found by warnings-as-errors

The initial actual #425 Release build rejected two NU1903 high-severity advisories (GHSA-g27p-qf6j-c96c and GHSA-qjpx-jqm5-h2c4) on Microsoft.AspNetCore.Components.WebAssembly.Server **10.0.7**. The patched 10.0.13 package was released 2026-10-13. Only the SSR-host PackageReference was upgraded to **10.0.13** on this isolated v3 task branch; no consumer library API or stable 2.x package references were changed. Restore + full Release -warnaserror build now pass with zero warnings/errors. The quality contract has a real XML parser and a negative test to reject regressions back to 10.0.12 or lower. Official reference: https://github.com/advisories/GHSA-qjpx-jqm5-h2c4 .

Local scope on initial #425 branch: 20 .NET solution tests passed, 4 rendered SSR routes passed the focused accessibility smoke, and all five CI-version NuGet packages passed release_tools package-ID/version/commit checks with a local report under a temporary directory. **This is not actual GitHub runner success** until the new PR jobs run. The Chrome/Edge real-browser jobs on unmerged #418 remain a separate integration dependency.
