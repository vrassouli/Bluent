# Issue #418 — current acceptance checkpoint (2026-11-20)

## Branch, PR and workflow state

- Repository: vrassouli/Bluent
- Branch: v3/issue-418-design-tokens
- Exact tested head: 9c5ec655f60e5d31a8553635527aed21b36750fa
- Base branch: bluent-v3 (base head 6ad979ddda0b5a4da33f9cd1531f362e9d19a37a)
- PR: https://github.com/vrassouli/Bluent/pull/500 — OPEN, non-draft, merge state CLEAN; no formal APPROVED review is recorded.
- GitHub Project #5: #418 remains In progress.
- Exact-head GitHub Actions: 13/13 workflows SUCCESS, zero failures and zero pending.

## Exact-head browser and quality evidence

| Workflow / matrix | Exact-head result |
|---|---:|
| Real Browser Lab — Chrome/Edge × InteractiveServer/WebAssembly | 4/4 jobs passed |
| Real Compatibility Browsers | 30/30 jobs passed |
| Real Component Lab | 4/4 jobs passed |
| Real Popover interaction | 4/4 jobs passed |
| Firefox Published InteractiveServer D2/D5 | 34/34 |
| Playwright WebKit Published InteractiveServer D2/D5 | 34/34 |
| Button Runtime / ARIA / menu | PASS |
| Button Focus Design Contract | PASS |
| Token Contract | PASS |
| Documentation Contract | PASS |
| Local Package Boundary | PASS |
| Release build / tests / five-package validation | PASS |

The initial Chrome CDP-port failures in Label Info and Popover were startup timeouts before product assertions. Failed jobs were rerun; Chrome and Edge, en-US/fa-IR Label Info and all four Popover cells completed successfully. Playwright WebKit is not native Safari.app or SafariDriver.

## Dev01 local verification

- Environment: Windows 11 Pro build 28000; .NET SDK 11.0.100.
- Release solution build with warnings as errors: 0 warnings / 0 errors.
- Full solution tests: 188/188.
- Focused #418 review contract: 19/19.
- Other focused regression suites: Token Preview 13/13; Focus token bridge 7/7; Focus alpha host 22/22; runtime failure diagnostics 4/4. Combined focused suites: 65/65.
- Documentation contract: 0 findings.
- Skills contract: 0 errors.
- Markdown links: 238 files checked.
- Real browser probe, local Dev01: Chrome/InteractiveServer 1178/1178; Chrome/WASM 1179/1179; Edge/InteractiveServer 1178/1178; Edge/WASM 1179/1179.
- Dark foreground preview covers 20 brand/mode combinations and 80 role samples; minimum sampled opaque-pair ratio 4.600125:1. This does not approve exact Penpot values, all interaction states, alpha/composited surfaces or generic WCAG/AT conformance.

## Current design/token position

- Canonical design file: Bluent v3 Design System, Penpot file b64f6665-c9ab-80b5-8008-c4ac99d9d000.
- Latest native TokenSet audit: revision 883, 1,285/1,285 assertions, zero failures; 16 source + 17 semantic + 13 component roles across Light/Dark and 20 Brand×Mode preview themes. This is schema/library parity, not design approval.
- Page 45 remains REVIEW REQUIRED. Page 55 remains DRAFT / exact values not approved. The Penpot browser tab was suspended during this checkpoint; no further design edits or status-label changes were made.
- Option B public vocabulary architecture was selected 2026-11-16: bluent.color.* plus individually accepted bluent.semantic.*; bluent.source.* remains internal and bluent.component.* private. Exact semantic allow-list and production promotion remain pending.
- A review-only inventory of all 17 semantic roles is recorded in PUBLIC-TOKEN-VOCABULARY-PROPOSAL.md and guarded by regression tests. Suggested first-wave candidates are text.primary, text.disabled and text.placeholder, bounded by current Label/TextField evidence. This is a proposal, not approval or a schema/runtime change.
- text.dangerAccessible remains Label required-marker-only; status.danger is non-text-only on the studied neutral surface (4.164:1). Badge, Alert, Toast, Button Danger and generic text remain unapproved.
- Link #431 is accepted but uses existing published CSS variables; that acceptance does not promote the new semantic Link aliases.
- The 40/40 page-55 opaque candidate pass is preview evidence only. Exact values remain unapproved.
- Source namespace membership is intentionally 9 bluent.color.* palette/state primitives and 7 bluent.source.* context-constrained roles. This is documented and regression-guarded; no rename is needed.

## Current native environment discovery — read only

- Windows High Contrast scheme: High Contrast White is selected, but the native SPI_GETHIGHCONTRAST query returned dwFlags=126 with HCF_HIGHCONTRASTON false. The scheme is not active. No Windows accessibility setting was changed.
- NVDA 2026.3 is installed and running in interactive session 1 (OneCore synth, en-US David voice token). No Speech Viewer/log or spoken output was captured. This is availability discovery only, not spoken-screen-reader acceptance.
- Narrator was not running in the process check. JAWS was not checked.
- Safari.app/SafariDriver was not exercised; the prior Safari remote-automation setting remains untouched. Playwright WebKit evidence is not Safari evidence.
- Persian OS IME composition/caret/selection was not tested in this checkpoint.
- Native Windows Contrast Themes, spoken NVDA/Narrator/VoiceOver, native Safari/VoiceOver, and composition-based Persian IME/caret/selection remain OPEN.

## Disposition

Issue #418 remains OPEN / In progress. PR #500 remains OPEN and unmerged. No public API approval, production token alias/CSS promotion, package publication, stable branch merge, release or deployment was performed. Label #430, TextField #432 and Link #431 decisions are recorded at their precise consumer scope; they do not automatically approve the global semantic-token API.

The historical 2026-11-17 Windows acceptance checkpoint remains preserved in ISSUE418-ACCEPTANCE-CHECKPOINT-2026-11-17.md. Its “NVDA not installed” statement is a historical snapshot; the current read-only Dev01 discovery above supersedes that availability observation without changing the old evidence record.
