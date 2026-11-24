# Issue #418 — acceptance checkpoint (2026-11-23)

## Branch, PR and workflow

- Repository: `vrassouli/Bluent`
- Task branch: `v3/issue-418-design-tokens`; target branch: `bluent-v3`
- PR: [#500](https://github.com/vrassouli/Bluent/pull/500), open and unmerged; no formal approving review is recorded.
- Previous engineering baseline before the 2026-11-23 diagnostics: `6dc3bea3c19a4a64a70aec3fd791bfb22aa86913`.
- Current head: `e6e0e58f0fd8cc9b7ba92a8b71e47472cfdd0d25`; exact-head GitHub Actions completed **13/13 workflows successfully, 0 failed, 0 active**, including both `de-DE` and `fa-IR` Chrome/InteractiveServer SelectField culture sessions.
- GitHub Project #5: #418 remains **In progress**; #438 DateField remains **Backlog**.

## 2026-11-23 validation-text host diagnostic follow-up

The shared `.validation-message` rule in `src/Bluent.UI/Styles/Components/_field.scss` already uses `--colorPaletteRedForeground1`. This follow-up does not add a semantic token or change production styles. It makes the existing evidence more explicit about where this foreground is and is not safe.

- Formal neutral-base audit: **60/60** pairs across 10 brands × Light/Dark × Neutral Background 1/2/3 pass the 4.5:1 normal-text threshold. Minimum: **5.2036:1**.
- Source inventory: **112 common opaque background tokens** across all 20 themes; 3 are the formal neutral-base surfaces and the remaining **109 × 20 = 2,180** pairs are diagnostic only. Sixteen non-opaque/alpha/transparent backgrounds are reported separately and excluded from simple arithmetic because their effective color depends on compositing.
- Diagnostic aggregate: **834/2,180** pairs meet 4.5:1; 26 surfaces pass in all 20 themes, 51 fail in all 20 and 32 are mixed. This diagnostic does not affect the neutral-base pass/fail result.
- Representative boundaries: Brand Background **0/20**, min **1.0027:1**; Neutral Background Inverted **0/20**, min **2.4877:1**; Palette Red Background 2 **0/20**, min **3.5017:1**; Danger Background 3 **0/20**, min **1.0372:1**. Palette Red Background 1 is **20/20**, min **5.4831:1**; Neutral Background 2 Hover is **20/20**, min **4.5192:1**. Surface role/state matters; the existing source color is not a context-free validation-text foreground.
- Any future `semantic.text.validation` proposal must name its permitted host surfaces and define behavior on unsupported brand, inverted and stateful surfaces. It remains outside the 17-role preview schema, public allow-list and production CSS.

Commands and local results:

| Gate | Result |
|---|---:|
| `python scripts/quality/audit_v3_validation_text_contrast.py` | PASS; 60 formal neutral pairs + 2,180 exhaustive opaque-background diagnostics; 16 non-opaque/alpha/transparent surfaces listed separately |
| `python -m unittest discover -s scripts/quality -p 'test_v3_validation_text_contrast.py' -v` | 10/10 |
| `python -m unittest discover -s scripts/quality -p 'test_v3_issue418_review_contract.py' -v` | 21/21 |
| `python -m unittest discover -s scripts/quality -p 'test_v3_token_preview_contrast.py' -v` | 13/13 |
| `python scripts/quality/generate_v3_token_preview.py --check` | PASS |
| `python scripts/quality/audit_v3_token_preview_contrast.py` | 360 diagnostics; no unexpected issues |
| `python scripts/quality/check_v3_docs_contract.py` | 0 findings |
| `python scripts/quality/check_markdown_links.py` | PASS; 241 files |
| `git diff --check` | PASS |

Exact-head hosted CI on `e6e0e58f0fd8cc9b7ba92a8b71e47472cfdd0d25`: **13/13 workflows successful, 0 failed, 0 active**. The Real Compatibility Browsers workflow also passed both `de-DE` and `fa-IR` Chrome/InteractiveServer culture-specific SelectField sessions. These source/contract and browser checks do not constitute native OS/AT or design approval.

The extended diagnostic checks are opaque six-digit color arithmetic only. They do not prove rendered component behavior, alpha compositing, custom-host coverage, native Windows Contrast Themes, spoken assistive-technology output or design approval.

## Design / public contract gates still open

- Penpot page 45 remains REVIEW REQUIRED; page 55 remains DRAFT / exact Dark candidate values not approved.
- Option B vocabulary architecture is selected, but the final semantic allow-list and production aliases remain pending.
- `semantic.status.danger` remains non-text-only on its studied neutral surface; `semantic.text.dangerAccessible` remains Label required-marker-only.
- Focus host attributes and Dialog/Popover public contracts remain prototype-only; native Windows Contrast Themes for these contexts remain open.
- Native spoken NVDA/Narrator/VoiceOver, native Safari.app/SafariDriver, and Persian OS IME composition/caret/selection remain open.

## Downstream DateField boundary

The Foundation audit remains the only #438-related work in this branch. DateClass forwarding, typed Min/Max validation, YearSelect parse/mask consistency, calendar-trigger accessible naming, popup keyboard navigation, focus return, RTL/culture-specific calendar behavior and component runtime acceptance stay in #438. No DateField source, API, demo or issue status is changed here.

## Disposition

Keep #418 In progress and PR #500 open until the remaining design/maintainer, public-contract and native acceptance gates are genuinely closed. No production CSS, public API/token promotion, stable `Dev`/`main` change, package publication, release or deployment is part of this follow-up.

## 2026-11-23 native Windows High Contrast prototype snapshot

A focused native-platform probe was run against /v3/interactive-portal-lab on Windows 11 Pro build 28000 / Edge 158.0.4370.33 using the native **High Contrast White** scheme.

- SystemParametersInfoW read the original High Contrast state as flags 126 (scheme selected, mode off). The test temporarily enabled flags 127; Edge then reported both forced-colors: active and prefers-contrast: more. A finally block restored the original flags and scheme, and a post-run read confirmed flags 126 / High Contrast White.
- Dialog: observed role="dialog", aria-modal="true", aria-labelledby="f17659346_title"; one Tab moved to an internal button, one Shift+Tab moved to v3-modal-last-0, Escape closed it and focus returned to v3-show-keyboard-modal.
- Popover: trigger exposed aria-expanded="true" and aria-controls="v3-popover-trigger_surface". The observed surface node was a SECTION with no explicit role; its own computed background was transparent. This is prototype output only and leaves the public role/surface contract open.
- The test used CDP pointer/keyboard input, not physical hardware keys; it did not inspect Dialog/Popover with UI Automation or capture/listen to Narrator/NVDA/VoiceOver speech. The screenshot is raw and not independently pixel-reviewed. Only one Edge/Windows build and High Contrast White were exercised; no contrast ratio or cross-platform guarantee is claimed.

See [native Windows evidence note](../quality/evidence/BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-HC-2026-11-23.md), [JSON manifest](../quality/evidence/BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-HC-2026-11-23.json) and pinned PNG in the same directory. These artifacts do not constitute design, API, AT or product acceptance.

## 2026-11-24 follow-up — native HC evidence regression and local validation

The native Windows snapshot above is pinned by `test_v3_issue418_native_hc_evidence.py` (**7/7**). The test also asserts state restoration, the precise Edge/DOM observations, the no-physical-key/no-spoken-output limitations, the Popover role/background caveat, and the retained screenshot hash/length. Additional current local results:

| Gate | Result |
|---|---:|
| Native High Contrast evidence regression | 7/7 |
| #418 review-contract regression | 21/21 |
| Validation-text contrast regression | 10/10 |
| Token-preview contrast regression | 13/13 |
| Token-preview generator `--check` | PASS |
| Token-preview contrast audit | 360 diagnostics; no unexpected issues |
| Validation-text source audit | 60/60 formal neutral pairs; 2,180 exhaustive opaque-background diagnostics; 16 non-opaque/alpha surfaces reported separately |
| v3 documentation contract | PASS; 0 findings |
| Markdown links | PASS; 242 files |
| `git diff --check` | PASS |

The retained PNG is 104,481 bytes with SHA-256 `b7f79d840d4bbbdbb314a0451d1b31751b906fe28bb40f6caf9f3185603b8232`. Native evidence follow-up was committed and pushed as `31b23c9975da602f7f449df337c7c4a3dace11f4`. Its exact-head hosted CI completed **13/13 workflows successfully, 0 failed, 0 active**; the Real Compatibility Browsers matrix passed **32/32 jobs**, including the `de-DE` and `fa-IR` SelectField sessions. This does not close the remaining native scheme/host, UI Automation, physical keyboard, spoken AT, design or public-contract gates.
