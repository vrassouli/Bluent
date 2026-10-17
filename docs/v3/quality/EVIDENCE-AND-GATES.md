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

### Detected false-positive Dark/RTL screenshot semantics

Actual 320px screenshots were inspected (not merely their PNG bytes).
The existing compatibility *test host* rendered its heading/text using
the dark-theme foreground while the surrounding host surface was
still white. The images passed PNG integrity but the dark RTL heading
was invisible (white-on-white). This is a verified screenshot artifact
and an error in the **compatibility sample/layout**, not proof that a
public Bluent component itself is broken.

The independent v3 compatibility layout now paints its MAIN surface
with existing Fluent source CSS variables colorNeutralBackground1 and
colorNeutralForeground1, retaining original child components and event
binding. A subsequent direct screenshot inspection exposed **wrapped
heading line overlap** and a default browser-blue link with inadequate
contrast on the dark host in the **same QA fixture**, even after making
its background correct. Only the compatibility sample now adds
heading line-height 1.3 and safe word wrapping, and a semantically
source-backed colorNeutralForeground2Link NavLink foreground. No
public Bluent component or v2 theme styles were modified. The real browser screenshot matrix measures the heading's
computed foreground vs the painted main background, demanding a
**numeric ratio at least 4.5:1** and in-viewport heading geometry in
every one of the six Light/Dark LTR/RTL 320/768/1280 states. This is
a **specific measured pairing**, not whole-product WCAG conformance.
The real browser also measures computed link-to-painted-host contrast,
requires at least **4.5:1**, and checks actual multi-line h1 Range
client rectangles have no vertical overlap in the six sample
viewports. Chromium may report *duplicate fragments on the very same
single visual line* (observed at 768px and 1280px); the browser check
deduplicates by line top within half a pixel before comparing distinct
lines, preventing a false regression while preserving real 320px
overlap detection. Twelve more browser assertions per job guard this
visibly discovered 320px RTL case. Seven negative/source contract controls
reject removing the host surface, heading line-height, link token,
or any of these browser checks.

Native editable Penpot QA page 41 board now documents foreground/
background contrast as an evidence-integrity gate alongside PNG
validity, while explicitly keeping human visual acceptance separate.
These checks cannot certify all semantic contrast pairs, native OS
Contrast Themes or named assistive-technology behavior.

Exact local real Blazor and GitHub CI results must be recorded against
the task-branch SHA; an image fixture test alone never proves runtime.

**New focused live Dev01 rereview after fixing the scoped host,
mobile heading and neutral link:** actual Chrome/InteractiveServer
**41/41** and Edge/WebAssembly **41/41** assertions passed, both with
zero errors and complete PNG/cleanup evidence. On the real Chrome
Server 320px Light and Dark specimens, computed heading-to-host
contrast was respectively **15.52:1** and **14.55:1**; link-to-host
contrast was **10.05:1** and **10.01:1**, all above the explicit
4.5:1 *pair-specific* threshold. The genuine 320px Dark RTL image
was re-exported and inspected: visible text on the dark painted
surface, corrected multi-line heading spacing and legible link.
The independent 768/1280 line-fragment comparison correctly
deduplicates same-line Chromium text fragment rectangles; this
avoids false overlap failures while preserving narrow actual row
overlap detection. The policy has **29** passing Python source
tests plus **8** PNG image fixture tests.

Two focused real browser combinations are **local** evidence only.
The NEW exact-head GitHub Chrome+Edge x Server+WASM matrix must be
checked separately; these results cannot be projected to the other
two new-state combinations without that CI run. Visual/pixel
acceptance and true OS Contrast Themes/AT are still OPEN.

## 2026-10-16 — CSS text-size reflow and evidence limits

Design-first source: the correct editable Penpot Bluent v3 Design System
file b64f6665-c9ab-80b5-8008-c4ac99d9d000, quality page 41
ed5216bd-3d5b-8015-8008-cb25572ebb61, source board
ed5216bd-3d5b-8015-8008-cb2557357776. A new DRAFT 46th editable
shape describes the 200/400% text scaling reflow requirement while
explicitly distinguishing CSS root text size from native browser zoom.

On a REAL Dev01 Chrome/InteractiveServer browser, the 320 CSS-pixel
viewport initially passed root font size 200% (computed 32px,
document scroll width 305px) but FAILED at 400% (computed 64px,
document scroll width 361px). The existing test-fixture layout
used 2rem padding that grew to 128px on each side, starving the
mobile viewport of readable room. This was a genuine test
failure (42/43), not a CI flake.

Fixed ONLY independent compatibility sample host padding from
2rem to min(2rem, 4vw): desktop maximum retained, tiny viewport
padding remains proportional to viewport width. The next actual
Chrome/InteractiveServer rerun passed 43/43 assertions: 200%
AND 400% returned scroll width 305px, no tested title/input/
status/link/popover/tooltip trigger outside the viewport, zero
errors and owned browser cleanup remaining=0.

The browser probe uses document root inline fontSize 200%/400%
with real Chromium layout. It restores the previous inline value
and viewport in a finally block. This is a source-controlled
experimental CSS text-size reflow test, NOT OS-wide text size,
browser zoom, or proof of full WCAG/assistive technology.
Three negative controls prevent deleting either percentage,
suppressing horizontal-overflow failures or reinstating
nonresponsive compatibility host padding. Public Bluent CSS,
component API, NuGet and frozen Dev are untouched.

Pending acceptance remains target-device native browser zoom,
Windows Text Size/Contrast Themes, named screen readers and
maintainer-approved design screenshot parity. #425 stays
In progress and PR #549 Draft until those gates pass.

## 2026-10-16 actual keyboard versus pointer modality QA

The correct editable Penpot Bluent v3 Design System file
b64f6665-c9ab-80b5-8008-c4ac99d9d000, page 41
ed5216bd-3d5b-8015-8008-cb25572ebb61, board
ed5216bd-3d5b-8015-8008-cb2557357776 now has a draft,
source-owned keyboard/pointer QA annotation
e775e67c-d9da-804b-8008-cccf3d59fdca.
The annotation's actual Penpot textBounds fit its native box.
This is NOT design approval or native OS/AT acceptance.

The real browser harness extends the earlier 43 to **51
assertions per browser/render mode**, preserving the existing
Blazor UI, screenshots, AX tree and static asset checks.
It dispatches CDP Tab from real Bluent TextField to Button,
checks the exact focused Button and :focus-visible; dispatches
a real native Enter keyDown (with carriage-return text) plus
keyUp and verifies exactly one Blazor OnClick callback.
It then clicks the native TextField label using real pointer
events to switch input modality, hit-tests the Button with
document.elementFromPoint, clicks it with real mouse input
and checks both a single callback and *absence* of keyboard
:focus-visible.

The initial Chrome/InteractiveServer run **FAILED 42/49**
because clicking the already keyboard-focused Button can
legitimately preserve :focus-visible, and its scroll had
moved the H1 out of the screenshot viewport (six false
contrast/geometry failures). Corrected the TEST HARNESS,
not component behavior: true pointer modality transition
via label, and explicit scroll-to-top before the viewport
contrast/screenshot grid. Both independent local Dev01 runs
then PASSED: **Chrome/InteractiveServer 51/51** and
**Edge/WebAssembly 51/51**, zero errors each. The PNG,
responsive RTL, text-size reflow, emulated forced-colors,
computed AX roles, and isolated browser cleanup remain
mandatory.

**36/36 Python quality contract tests PASS**, including
four new negative controls that fail on removal of the
Enter path, pointer modality assertion, pointer hit-test
or scroll reset. Exact-HEAD GitHub CI in the full four-way
Chrome/Edge x Server/WASM matrix remains to be checked.

This establishes a basic keyboard/pointer *pseudo-class
behavior* in an existing native Bluent Button, NOT the
final brand-colored Fluent 2 focus ring, TextField underline
visual parity, browser zoom, real Windows Contrast Themes,
a named screen reader, or WCAG certification.
Issue #425 stays In progress / PR #549 Draft.

## 2026-10-17 — native Chromium per-site Zoom 200% and 400%

The authoritative design source is the editable Penpot Bluent v3 Design
System file b64f6665-c9ab-80b5-8008-c4ac99d9d000, quality page 41
ed5216bd-3d5b-8015-8008-cb25572ebb61, board
ed5216bd-3d5b-8015-8008-cb2557357776. Its pre-existing editable
Browser zoom and native AT acceptance boundary annotation is
e775e67c-d9da-804b-8008-cc3b60b6d9ee. This is a draft and
NOT a human-approved design or native OS/AT signoff. Penpot was
suspended during this session, so no live design mutation is claimed.

Several potential false-zoom methods were rejected in live research:
CDP Control-Plus in headless Chrome left DPR and CSS viewport unchanged.
A browser-extension experiment changed true zoom, but inspection
revealed the responding worker was a Chrome built-in extension rather
than the proposed owned extension. Windows also refused to foreground
an isolated headful Chrome window, so no global keyboard input was
sent to an unknown window.

A reliable independent native Chromium mechanism was then proven:
a fresh, private temporary Chrome/Edge profile receives the real
persisted per-host site-zoom preference before launching the browser,
with zoom level computed as log(factor)/log(1.2) for factors 2 and 4.
The schema was checked against an actual Chrome profile after native
site zoom. No fontSize CSS mutation, privileged extension, DevTools
Emulation device metrics or fake page-scale command is used.

Reusable probe: scripts/quality/probe_v3_native_site_zoom.mjs.
It runs inside the existing REAL browser probe while the production
published Bluent SSR host remains alive. Each of Chrome/Edge and
InteractiveServer/WebAssembly is exercised at 200% and 400% in separate
temporary native profiles, with actual DPR=2/4, shrinking CSS viewport,
unchanged computed 16px root font, heading/TextField/status/Popover
geometry within that viewport and a hard gate on true document overflow.
Two actual PNG images and a JSON report are saved per matrix job, and
browser cleanup must report remaining=0.

One important transient was discovered and separately reported to
Chart #486: initial canvas intrinsic width 300px could temporarily
extend past a CSS viewport of 314-316px during hydration, producing
4-6px overflow. Subsequent real runs proved this was NOT a persistent
Zoom400 defect: Chart.js/ResizeObserver later resized the canvas to fit.
The new probe records an early layout snapshot and waits for settled
hydration and further sizing samples before verdict; no clipping CSS or
Chart component code changed. The earlier persistent-bug claim was
explicitly corrected on #486.

Before joining the four-mode parent smoke, published-Server native
Zoom200/Zoom400 research passed Chrome: viewport/scroll 632/624,
316/312; Edge: 628/620, 314/310. Both actual DPR values matched
2 and 4; zero final horizontal overflow or process leftovers.
The first integrated real Chrome/InteractiveServer run passed 62/62
checks (previously 51/51): ten native Zoom assertions plus one
artifact/cleanup cross-check. Two PNGs are added to the existing
seven images per mode. Exact-head CI for the new code must be
checked separately from previous commits.

Five new source-contract unit checks ensure the probe uses saved
site-zoom, checks settled overflow and real PNG capture, and that
the main four-way runtime suite actually invokes it. Emulated zoom
is not native zoom. This evidence is still NOT Windows OS Text Size,
native Contrast Themes, named screen-reader testing, WCAG or
human-approved screenshot parity. #425 remains In progress,
PR #549 Draft and stable Dev/NuGet unchanged.

### Local four-renderer matrix and separate evidence filenames

The complete integrated real browser suite on Dev01, at the
pre-filename-finalization source revision, returned Chrome/Server
62/62, Chrome/WASM 62/62, Edge/Server 62/62 and Edge/WASM
62/62: **248/248 actual checks**, zero runtime errors. Each
entry includes the genuine site Zoom200 and Zoom400 separate
profile tests. No persistent Zoom400 horizontal overflow was found
after Chart.js settled, and all owned temporary browsers were
removed (remaining=0). The original 7 PNGs and the two native-zoom
PNGs are kept distinct. A subsequent small evidence-integrity fix
now keys native screenshot/JSON filenames by **browser and render
mode**, preventing local Server/WASM artifacts from overwriting one
another; exact-head CI must confirm this latest version separately.
