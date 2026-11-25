# Issue #418 — current acceptance checkpoint (2026-11-21)

## Branch, PR and workflow state

- Repository: `vrassouli/Bluent`
- Branch: `v3/issue-418-design-tokens`
- Base branch: `bluent-v3`
- Previous pushed head before this follow-up: `c76db7d827f55e7e96029301a5c5cf885366ddd5`
- PR: https://github.com/vrassouli/Bluent/pull/500 — OPEN, non-draft, targeting `bluent-v3`; no formal APPROVED review is recorded.
- GitHub Project #5: #418 remains **In progress**.
- The previous pushed head had 13/13 GitHub Actions workflows successful. The current follow-up requires a fresh exact-head CI run after push.

## 2026-11-21 engineering review follow-up — source namespace taxonomy

The #418 review identified a need to make the split between `bluent.color.*` and `bluent.source.*` explicit and resistant to accidental namespace swaps. The preview already deliberately contains nine reusable palette roles and seven context-constrained roles; this follow-up does not rename either group or promote a public token.

- `bluent.color.*` is reserved for named reusable palette roles whose intended meaning is expressed by the role itself. The three Link Rest/Hover/Pressed colors remain separate, explicit palette roles and must never be substituted for one another.
- `bluent.source.*` is reserved for source roles whose safe use depends on additional consumer, host surface, state, or semantic restrictions: OnBrand, accessible stroke, Danger, disabled foreground/background, Label-marker-only accessible red, and focus stroke.
- New entries must document role, supported context and restrictions. CSS variable names, hex values or contrast ratios alone are not classification criteria.
- `test_v3_issue418_review_contract.py` now pins the exact nine names and CSS variables in the color group and exact seven names and CSS variables in the source group. A prefix swap or synchronized edit to the policy list cannot silently pass the allow-list test.

No token schema, preview CSS, generator output, product CSS, component API, package or public allow-list changed.

## Local verification on this follow-up

| Gate | Result |
|---|---:|
| Issue #418 review-contract tests | 21/21 |
| Token preview contrast tests | 13/13 |
| Token preview generator drift check | PASS; 20 Brand×Mode themes, 46 logical color roles per theme, 40 Dark candidate pairs |
| Source-backed contrast audit | 360/360 diagnostic pairs; no unexpected issues |
| Dark Action/Link Rest/Hover/Pressed candidate minimum | 4.6001:1; values remain unapproved for production |
| Placeholder source-role minimum | 4.5423:1 Light; 6.4663:1 Dark |
| Documentation contract | 0 findings |
| Markdown links | 239 files checked |
| `git diff --check` | PASS |

These are source/schema/documentation and opaque-pair arithmetic checks. They do not substitute for editable-design approval, native Windows Contrast Themes, spoken screen-reader output, native Safari, or OS IME tests.

## Current design and API gates

- Penpot page 45 remains **REVIEW REQUIRED**. Its board records the already selected brand-preserving direction, but the final semantic-role/consumer contract is not approved.
- Penpot page 55 remains **DRAFT / exact values not approved**. The 40/40 candidate contrast pass is preview evidence only.
- Option B remains the selected vocabulary architecture: public candidates are limited to `bluent.color.*` plus individually accepted `bluent.semantic.*`; `bluent.source.*` stays internal and `bluent.component.*` stays private. The final semantic allow-list and production aliases remain pending.
- `semantic.status.danger` remains a non-text status role on the tested neutral surface; `semantic.text.dangerAccessible` remains Label required-marker-only. Badge, Alert, Toast, Button Danger and generic text are not approved by that narrow consumer decision.
- Focus Option A is a selected future direction, not public API approval. The same-painted-host metadata attributes and CSS alias are still opt-in; unsupported/translucent/composited hosts and native contrast behavior remain open.
- Dialog/Popover owner-snapshot Option A remains an opt-in prototype, not an approved public Dialog/Portal API. Native Contrast Themes for Dialog/Popover and unsupported Focus hosts, spoken NVDA/Narrator/VoiceOver acceptance, native Safari.app/SafariDriver, and Persian OS IME composition/caret/selection remain open.

## Disposition

Issue #418 remains **In progress**. PR #500 remains open and unmerged pending exact-head CI, design/maintainer review and the remaining native/public-contract gates. No `Dev`/`main` merge, stable 2.x change, production CSS activation, NuGet publication, release or deployment is authorized by this follow-up. Issue #438 DateField remains Backlog; this foundation-only work does not start its implementation.
