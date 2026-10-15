# Bluent v3 Quality Gates · #425

This task stays on v3/issue-425-quality-gates, targeting bluent-v3 only. Stable Dev, released v2 packages and NuGet publication must remain untouched.

## Source-of-truth

- Run python scripts/quality/check_v3_quality_gate_contract.py and python -m unittest discover -s scripts/quality -p test_v3_quality_gate_contract.py -v.
- Always-on .github/workflows/v3-quality-gates.yml enforces Release build with warnings as errors, tests, consumer examples, five actual CI-only package validations and real rendered SSR compatibility/accessibility smoke.
- Negative tests reject PR paths filtering, stable branch triggers, fake SSR check, skipped package metadata, nonblocking test failures, package publication and unpatched WebAssembly.Server.
- October 2026 high-severity advisories affect WebAssembly.Server 10.0.7. SSR demo dependency was updated only within v3 to fixed 10.0.13; do not suppress NU1903.
- Never equate source, build, pack, runtime, visual or native OS/AT evidence. Browser CSS forced-colors emulation is NOT native Windows Contrast Themes or screen reader certification.
- Four-mode Chrome/Edge WASM/Server Browser Lab remains on unmerged #418 PR #500, so its all-PR integration under #425 is pending. Do not claim browser completion based on SSR alone.
- Design sources already real and editable: Bluent Penpot b64f6665-c9ab-80b5-8008-c4ac99d9d000; #501 approved Focus board f4136a9a-101d-8004-8008-ca2956fe05f9. The issue-specific quality board is pending because the live Penpot plugin froze and Figma fallback X6Ima16GAyuk7dVUjGgIkt reached its write limit. Do not mark #425 Review/Done without real gate design acceptance.

See docs/v3/quality/EVIDENCE-AND-GATES.md for detailed evidence levels and CI contracts.
