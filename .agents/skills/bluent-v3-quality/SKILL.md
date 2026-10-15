# Bluent v3 Quality Gates · #425

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
