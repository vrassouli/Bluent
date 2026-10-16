# Bluent v3 Quality Gates · #425


VERIFIED 2026-10-15 correction: After awaiting Chrome DevTools despite launcher exit 0 and cleaning exclusively run-owned QA profiles, real Dev01 Chrome/Edge x Server/WASM = **15/15 each, 60/60 total** (actual Button/TextField/AX/Tab/screenshot assertions). Each JSON reports successful first attempt and browser cleanup **remaining=0**; process scan confirms ZERO leftover #425 QA browsers. 22 fail-closed Python QA tests pass. New GitHub PR head still requires independent CI; historical Chrome/WASM failed gate remains recorded. Native OS/AT and approved Penpot parity remain open.


LATEST 2026-10-15 #425 Chrome runner hardening: required Chrome/WASM GitHub CI failed during DevTools port startup (zero assertions; not product regression evidence). Dev01 had 193 orphan browser QA processes from previous #425 runs; targeted cleanup of **only** generated #425 profile Chromium restored resources without touching user Chrome. Standalone real Chrome startup showed a Windows launcher exit 0 while the detached browser writes DevToolsActivePort ~3.5 seconds later. Do not treat launcher exit 0 as failure: await CDP port; retry only startup up to 3 isolated profiles; retain attempt/cleanup details in fail-closed JSON and reclaim browser descendants using specific per-run profile command lines. Tests deliberately remove the zero-exit wait/cleanup safety and expect failure. CI latest head must still complete; do not claim native Windows Contrast/AT or approved Penpot board, do not mark Done.


LATEST 2026-10-15 #425: Always-on Windows Chrome/Edge x InteractiveServer/WASM browser probe now verifies **actual Chromium Accessibility.getFullAXTree**, not just DOM labels: named Button Increment, named TextField Bound value and exact backendDOMNodeId mapping of live counter to status role. Chrome Server 15/15, Edge Server 15/15, Chrome WASM 15/15, Edge WASM 15/15 = **60/60 actual local assertions**. Six responsive PNGs plus extra browser-emulated RTL forced-colors/reduced-motion screenshot and JSON per mode. 16 Python contract tests including 2 negative AX tree/DOM mapping controls. This does NOT substitute for native Windows Contrast/real named screen-reader AT or reviewed Penpot screenshot parity. #425 remains Draft/In progress; no stable Dev merge/NuGet publish. Exact new GitHub CI HEAD must be checked separately.

This task stays on v3/issue-425-quality-gates, targeting bluent-v3 only. Stable Dev, released v2 packages and NuGet publication must remain untouched.

## Source-of-truth

- Run python scripts/quality/check_v3_quality_gate_contract.py and python -m unittest discover -s scripts/quality -p test_v3_quality_gate_contract.py -v.
- Always-on .github/workflows/v3-quality-gates.yml enforces Release build with warnings as errors, tests, consumer examples, five actual CI-only package validations and real rendered SSR compatibility/accessibility smoke.
- Negative tests reject PR paths filtering, stable branch triggers, fake SSR check, skipped package metadata, nonblocking test failures, package publication and unpatched WebAssembly.Server.
- October 2026 high-severity advisories affect WebAssembly.Server 10.0.7. SSR demo dependency was updated only within v3 to fixed 10.0.13; do not suppress NU1903.
- Never equate source, build, pack, runtime, visual or native OS/AT evidence. Browser CSS forced-colors emulation is NOT native Windows Contrast Themes or screen reader certification.
- Independent always-on v3-compatibility-browsers.yml tests Chrome/Edge x Interactive Server/WASM across all v3 PRs, Dev01 local 48/48. Richer ten-brand #418 Styling Lab remains separate/unmerged. Do not claim browser completion based on SSR alone.
- Design sources already real and editable: Bluent Penpot b64f6665-c9ab-80b5-8008-c4ac99d9d000; #501 approved Focus board f4136a9a-101d-8004-8008-ca2956fe05f9. A real issue-specific editable Penpot QA board NOW exists in the canonical file: page ed5216bd-3d5b-8015-8008-cb25572ebb61 and board ed5216bd-3d5b-8015-8008-cb2557357776 (44 source-owned shapes, actual exported PNG visually inspected). This DRAFT board still requires maintainer signoff, true visual screenshot-diff baseline and native OS/AT acceptance before Done.

See docs/v3/quality/EVIDENCE-AND-GATES.md for detailed evidence levels and CI contracts.


2026-10-15 real browser gate: Node 24 probe_v3_compatibility_runtime.mjs using CHROME_PATH, BLUENT_V3_RENDER_MODE=Server|WASM, BLUENT_V3_BROWSER_NAME=Chrome|Edge, BLUENT_V3_EVIDENCE_DIR. All four real Dev01 cases passed 12/12 each = 48/48; six Light/Dark RTL/LTR viewport screenshots plus JSON per job (24 images). Chrome/Edge x Server/WASM CI workflow is path-unfiltered for all bluent-v3 PRs; confirm green on actual head. Images captured are NOT reviewed visual baseline parity. Forced-colors emulation != native OS Contrast/AT and generic smoke != per-component full demo.


2026-10-15 exact GitHub CI for #425 PR #549 SHA 45b1a300 passed all 4 Windows browser jobs and all other quality/docs/Skills jobs; separate real Penpot #425 editable source board page ed5216bd-3d5b-8015-8008-cb25572ebb61 board ed5216bd-3d5b-8015-8008-cb2557357776 exported and inspected. DRAFT board is not reviewer approval, and screenshot capture is not reviewed baseline or screen reader conformance. Pending new PR HEAD CI and genuine acceptance.

2026-10-16 #425: native quality design Penpot page41, board
ed5216bd-3d5b-8015-8008-cb2557357776 now records image artifact
integrity as a separate gate from reviewer-approved pixel parity.
Real Blazor browser harness uses inspect_v3_png_evidence.mjs and 8
Node negative/positive fixtures to require 7 valid PNG images per job,
exact viewport dimensions, nonblank pixel variation, distinct digests,
and JSON evidence including SHA256. Do not call this human-accepted
visual regression, real Windows OS Contrast Theme, or screen-reader
certification. Issue/PR remain In progress/Draft until signoff.

2026-10-16 #425 Dev01 confirmed the NEW PNG artifact integrity policy
on actual Blazor Chrome and Edge across Server and WebAssembly:
23/23 each (92/92 total), 28 real PNGs with valid dimensions and
nonblank pixel variation, seven unique image SHA256s per job, four
JSON reports, test-owned cleanup remaining=0. This is runtime +
image artifact integrity, **not** approved design pixel diff or
native OS/AT. Read exact head CI independently.

2026-10-16 #425 second visual QA gate: human inspection of 320px
Dark/RTL compatibility screenshots exposed invisible heading text:
foreground followed dark theme but test MAIN surface stayed white.
Only the v3 Interactive CompatibilityLayout uses existing
colorNeutralBackground1 / colorNeutralForeground1; public Bluent
theme CSS and component APIs unchanged. Actual CDP screenshot
matrix now tests six computed heading/main contrast pairs >=4.5:1
with in-viewport heading bounds. Two negative policy tests ensure
host color paint and contrast assertion are not silently dropped.
This is narrow test-fixture accessibility evidence, NOT whole-system
WCAG/native OS/screen-reader approval.

2026-10-16 extra screenshot visual inspection in 320px Dark/RTL
revealed collision of wrapped heading text and a low-contrast
browser-default blue NavLink on the correct dark sample background.
The isolated compatibility **fixture only** now uses a heading
line-height of 1.3 with anywhere wrap, and the existing Fluent
NeutralForeground2Link color token for the link. The live browser
samples must check native Range glyph-row nonoverlap and link-to-main
contrast >=4.5:1 for six viewport/theme/direction settings, in
addition to main heading contrast. Five more source-negative tests
guard these rules, not whole-component WCAG or OS/AT approval.

2026-10-16 narrow RTL readability parity reruns AFTER host and
heading/link fix: real Dev01 Chrome/Server 41/41, Edge/WASM 41/41,
zero errors. Actual Chrome/Server 320px computed heading contrast:
Light 15.52:1, Dark 14.55:1; link contrast Light 10.05:1,
Dark 10.01:1. Observed 320px Dark RTL screenshot now has readable
headings without overlap. Chromium Range may return duplicate
fragments for the SAME visual row; source contract requires
deduplication by line top before comparing distinct row overlap.
29 Python quality tests and 8 PNG fixture tests pass. Do not claim
other render modes/engines in the new state until exact CI.

2026-10-16 #425: editable Penpot QA page41 46th DRAFT shape asks
for 200% and 400% CSS text-size reflow on mobile. The real browser
temporarily changes document root fontSize to 200/400% (32/64px),
checks six key controls within a 320px viewport and scrollWidth<=321,
then restores the prior fontSize. Initial Chrome/Server 400% failed
(361px horizontal scroll; 42/43), fixed DEMO-ONLY sample host padding
to min(2rem,4vw), final Chrome/Server 43/43 with scrollWidth305 at
both scales. This is NOT native browser zoom, Windows Text Size,
OS Contrast Themes, named screen-reader or per-component WCAG proof.

## Keyboard/pointer modality and screenshot isolation (#425)

The real Chromium test in scripts/quality/probe_v3_compatibility_runtime.mjs
must prove Tab-to-native-Button, focus-visible keyboard modality,
genuine Enter triggers exactly one Blazor callback, and *actual
pointer modality* by clicking TextField label before a real Button
click. Do not fail merely because clicking an already keyboard-focused
Button retains :focus-visible; that is valid browser behavior.
Hit-test pointer targets using document.elementFromPoint.
Reset page scroll before 320/768/1280 screenshot/contrast checks.
Negative controls protect the assertions in
scripts/quality/test_v3_quality_gate_contract.py.
Penpot QA native note e775e67c-d9da-804b-8008-cccf3d59fdca
in canonical page 41; local Dev01 Chrome/Server and Edge/WASM
each 51/51. Still pending independent 4-way CI and native
Contrast Themes/AT, visual ring and TextField underline approval.
