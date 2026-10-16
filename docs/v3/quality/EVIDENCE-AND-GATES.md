# Bluent v3 — Quality evidence, baseline CI, and acceptance boundaries (#425)

**Status: In progress, partial implementation.** Everything runs only on task PRs targeting bluent-v3. Never merge to Dev or publish NuGet from these gates.

## Actual design-tool provenance (not fabricated)

The canonical editable Bluent v3 Design System Penpot file is b64f6665-c9ab-80b5-8008-c4ac99d9d000. A dedicated REAL editable #425 QA flow board was created in the correct connected file on 2026-10-15: page 41 / Quality gates and acceptance / #425 ID ed5216bd-3d5b-8015-8008-cb25572ebb61, board #425 / Required CI matrix and evidence policy ID ed5216bd-3d5b-8015-8008-cb2557357776 (44 native editable shapes). The actual board was exported to PNG and visually inspected; three CI lanes and four evidence levels are present. This is a **DRAFT QA architecture design, NOT user/maintainer approval of pixel parity or native OS/AT compliance**. Earlier reference boards are #501 Focus f4136a9a-101d-8004-8008-ca2956fe05f9 and #494 inventory 44b12572-0104-807e-8008-ca035bbc8ca7. Figma fallback https://www.figma.com/design/X6Ima16GAyuk7dVUjGgIkt hit Starter rate limits; Penpot later reconnected and was used. Reviewer signoff and genuine accepted visual baseline/AT tests still remain before Done.

## 2026-10-15 Chrome DevTools startup and resource cleanup hardening

A real GitHub Windows CI run for #425 failed in Chrome/WebAssembly **before the first Blazor assertion**: DevToolsActivePort was not created before the harness deadline. The other three browser/mode jobs passed. This is a failed required gate, **not** a passed application test; evidence JSON contained zero browser assertions.

Investigation on Dev01 found **193 stale headless Chromium processes** from old #425 browser-QA temporary profiles. The previous harness killed only the child_process launcher, but Chrome on Windows can detach or relaunch its actual browser root: descendants may survive beyond process.kill(), consume resources and disrupt later test runs. Targeted cleanup removed ONLY processes whose command line contained the unique #425-generated QA temporary-profile prefix, never general Chrome user sessions or other projects.

A standalone Chrome launch proved the other cause: the Chrome.exe launcher may exit with code **0** while the detached browser continues starting. The actual DevToolsActivePort was written approximately **3.5 seconds later**. The harness now waits for the port after launcher exit 0, treats spawn errors or nonzero exit as terminal startup failures, and retries only the browser/CDP startup (up to three isolated profiles). **No Blazor assertion, AX-tree failure, keyboard error or screenshot failure is retried or ignored.** Each attempt and its error is captured in JSON. The Windows cleanup helper scopes process enumeration and termination to the exact per-run generated QA profile, records cleanup results, and makes unsuccessful cleanup fail the job. It does not kill unrelated browser processes.

A source contract with deliberate negative controls rejects startup retry removal, suppressing failed connections, missing JSON diagnostics, unsafe cleanup scope, hidden cleanup failure and treating a successful Chrome launcher exit as browser failure. This is CI reliability engineering, not product behavior validation or an accessibility certification. The live browser matrix and latest exact-commit GitHub results must be recorded independently before moving #425 to Review. Canonical source-owned Penpot #425 board remains a draft awaiting maintainer review; native OS contrast and named assistive technology acceptance remain separate.

### Verified after the detached-launcher and profile-cleanup fix

Latest Dev01 real browser reruns with the corrected harness: Chrome/InteractiveServer **15/15**, Chrome/WebAssembly **15/15**, Edge/InteractiveServer **15/15**, Edge/WebAssembly **15/15**; **60/60 actual assertions**. Each run validated the Blazor Button callback, bound TextField, focus/Tab, real Chromium AX role/name and status mapping, responsive screenshots and browser media emulation. Four actual-run JSON files were inspected: each recorded one successful browser connection attempt, 15 checks, zero errors and final process cleanup **remaining=0**. A fresh Windows process inventory verified ZERO orphan #425 QA Chromium processes. Targeted cleanup was executed on the same machine, not just source-reviewed. The fail-closed policy suite has **22 passing tests**, including negative controls for delayed Windows Chrome launcher exit 0 and unsafe/incomplete browser cleanup.

These are LOCAL runtime results until latest exact PR head succeeds in GitHub Actions. Earlier failed Chrome/WebAssembly GitHub check is not retroactively green. Tests do not certify native OS contrast/named assistive technology or approve Penpot visual parity.

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


## Latest real Chromium accessibility-tree baseline (2026-10-15)

The dedicated always-on Chrome + Edge x InteractiveServer + WebAssembly browser probe now requests the **actual browser-computed Accessibility.getFullAXTree** after interacting with the real Blazor compatibility page, not merely checking HTML labels. It requires a Button with accessible role/name **button / Increment**, a TextField with **textbox / Bound value**, and maps the precise live event-count DOM node through Chromium's backend DOM node identity to an **exposed status role**. The status role may correctly have no own computed name while its text is accessible via descendant nodes; no fabricated name requirement is imposed. The existing Button callback increments the counter and the native Tab interaction remains part of each test.

Actual **Dev01 local** results for this new extension: Chrome/Server **15/15**, Edge/Server **15/15**, Chrome/WebAssembly **15/15**, Edge/WebAssembly **15/15** = **60/60 browser assertions**. Each real-browser job now captures the six original responsive Light/Dark/RTL/LTR PNGs plus an extra **browser-emulated RTL forced-colors/reduced-motion PNG**, as well as an exact-commit JSON report. Sixteen Python quality-contract tests include negative controls that remove accessibility-tree verification or sever the status role from its actual DOM element. The new exact GitHub CI commit must be checked independently; earlier 8/8 GitHub green jobs were for the older 48/48 probe.

A Chromium Accessibility Tree confirms these sampled roles/accessible names in those browsers, **NOT** reading order or behavior in NVDA, JAWS, VoiceOver or native Windows Contrast Themes. A browser-emulated contrast image is **NOT** human-approved Fluent 2 visual parity or native OS/AT evidence. The source-owned #425 Penpot design board remains a draft pending maintainer review. Therefore #425 remains In progress/Draft and no v3 or stable package is released.

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

## 2026-10-16 — Screenshot integrity gate, not visual approval

**Editable design evidence:** canonical Bluent v3 Design System Penpot,
quality page 41 (ed5216bd-3d5b-8015-8008-cb25572ebb61), board
ed5216bd-3d5b-8015-8008-cb2557357776. Its browser lane now explicitly
calls for checking image dimensions/nonblank pixels and separately
requires human visual approval; the original source board is DRAFT.

The four real-browser jobs now exercise the dependency-free PNG byte
validator scripts/quality/inspect_v3_png_evidence.mjs on EACH screenshot
produced by mounted Blazor:
- Full PNG signature, chunk boundaries and CRCs, IHDR, IEND, inflate
  and scanline filter decoding must all be valid.
- Every screenshot must have exactly the expected viewport dimensions,
  8-bit RGB or RGBA data and nonuniform reconstructed pixel colors.
- Six 320/768/1280 Light/Dark RTL/LTR scenarios plus a separate
  browser-emulated forced-colors/reduced-motion scenario are required.
  The seven SHA-256 digests must not all repeat the same image.
- Per-run evidence JSON now carries seven image records with scenario,
  dimensions, byte length, SHA-256, pixel sample count, and distinct
  sampled colors. Invalid, empty, truncated or uniform screenshots
  fail the actual browser job, not merely a source-check.
- Eight independent Node fixture tests guard success and intentional
  failures from wrong dimensions, CRC drift, invalid rows and truncation.
  The existing source-quality policy also rejects bypassing PNG checks,
  deleting image evidence or skipping negative controls in CI.

**Classification:** valid-nonblank-png-only-not-approved-visual-parity
means real image artifact integrity, NOT alignment to approved Penpot
pixels, correct typography/color/RTL, native Windows Contrast Themes,
or named assistive technology behavior. No golden baseline has yet been
approved by a human reviewer. Screenshot-diff acceptance and real AT
remain OPEN gates. No changes to stable v2/Dev or NuGet publishing.

**Dev01 four actual rendered browser runs with the new PNG integrity
policy:** Chrome/InteractiveServer **23/23**, Edge/InteractiveServer
**23/23**, Chrome/WebAssembly **23/23** and Edge/WebAssembly **23/23**:
**92/92 real browser assertions, zero errors**. All **28 real PNGs**
passed format/CRC/scanline, viewport and nonblank checks; seven
distinct SHA-256 hashes *within each job*. Four JSON reports were
read independently: each has 7 image evidence records, minimum
32 distinct sampled pixel colors per file, and the final
test-scoped browser cleanup reported **remaining=0** (Chrome/Server
killed 4, Edge/Server killed 4, Chrome/WASM killed 4, Edge/WASM killed
6). Correct tested viewports: 320/768/1280 x 820.
No visual Golden baseline or native OS/AT result has been approved.
**These are local Dev01 results only** until the exact new PR head
GitHub browser matrix finishes.

Exact local real Blazor and GitHub CI results must be recorded against
the task-branch SHA; an image fixture test alone never proves runtime.
