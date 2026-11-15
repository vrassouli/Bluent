# #418 — Foundation review decisions and public-contract boundaries

**Review checkpoint:** 2026-11-15
**Scope:** engineering decisions for the isolated, opt-in bluent-v3 token preview.
**Approval status:** these decisions make the preview internally coherent; they do not promote draft Penpot boards, public token APIs, production CSS, or stable packages.

## 1. Source token namespace taxonomy

The existing source layer deliberately retains two namespaces:

| Namespace | Meaning | Members |
|---|---|---:|
| bluent.color.* | Reusable neutral/brand palette primitives and state-specific Link palette roles | 9 |
| bluent.source.* | Context-constrained source roles whose safe meaning depends on the consumer/surface: OnBrand, accessible stroke, Danger, disabled, accessible palette text, and focus | 7 |

Both groups resolve directly to existing source CSS variables. The prefixes distinguish the role contract, not whether one group is more native or more source-backed. A bluent.source.* role must not be generalized into an interchangeable foreground/background color merely because it is represented by a color value.

The exact 9/7 membership is recorded in issue-418-token-schema.preview.json and guarded by test_v3_issue418_review_contract.py. Keep these aliases stable within this preview so the Penpot model and generated CSS do not drift. A future rename requires one coordinated Penpot TokenSet migration, schema/generator update, migration note, and separate public-vocabulary review.

## 2. Danger is not one interchangeable text role

- bluent.semantic.status.danger continues to reference --colorStatusDangerForeground1. On the tested Dark NeutralBackground1 its minimum source ratio is 4.164:1. This is above the 3:1 non-text comparison target in the tested opaque pairs, but below the 4.5:1 normal-text target. Use it only for non-text status indicators/icons/accents on the studied surface; do not present it as a normal text foreground.
- bluent.semantic.text.dangerAccessible references --colorPaletteRedForeground1. The tested opaque NeutralBackground1 pairs are 5.848:1 in Light and 5.204:1 in Dark. The approved consumer scope is Label's decorative required marker only. The marker does not own validation; the input does.
- Both generated Badge roles remain unapproved preview candidates: `component.badge.dangerForeground` aliases `semantic.status.danger` and is restricted to non-text indicators/icons/accents on the studied neutral surface; it is not approved for Badge text. `component.badge.dangerTextAccessible` aliases the Label-only `semantic.text.dangerAccessible` candidate and is not approved for Badge text either. Their presence in preview output grants no consumer permission. Badge, Alert, Toast and Button Danger text each require their own source/contrast/design decision.

These figures are pair-specific opaque-color arithmetic, not a blanket WCAG claim for every component, state, overlay, or assistive technology.

## 3. Focus host context

The visual host mapping approved under #501 remains the selected design: Neutral uses the brand-colored treatment, while the named Brand/BrandHover/Danger/Inverted hosts use their source-role counterpart by mode. The #418 preview contract is intentionally explicit:

- the host must be inside the data-bui-v3-tokens opt-in scope;
- data-bui-v3-focus-mode and data-bui-v3-focus-host must be on the same host element;
- supported host kinds are only neutral, brand, brandHover, danger, and inverted;
- automatic background/pixel inference is forbidden.

The candidate CSS property and host attributes are not approved public consumer API. Translucent, gradient, image-backed, nested/composited, or arbitrary application surfaces are outside the tested matrix. #501 owns visual design, #428 owns Button runtime/consumer API, and #418 owns only the opt-in token bridge. Do not turn this preview contract into a public Button parameter or global CSS attribute.

## 4. D2/D5 portal ownership

The accepted engineering invariant for the prototype is ownership-based, not "last active theme wins": a detached portal must receive an immutable snapshot from its actual owner. A Popover follows its owning cascade; a Dialog captures its owner's scope at ShowAsync; an unscoped call preserves the legacy fallback. The opt-in D5 modal helper must establish inert/aria-hidden background state before claiming aria-modal, preserve and restore prior state, and keep only the topmost owned portal interactive.

PortalThemeScope, the portal preview CSS, and the D5 modal helper remain opt-in research, not an approved public Portal/Dialog/Popover API. Native Dialog/Popover Contrast Themes, spoken NVDA/Narrator/VoiceOver acceptance, independent Firefox/Safari engine behavior, third-party popup arbitration, and route/unmount/iframe races remain unverified. The browser proof packs are independent and must not be added together or relabeled as native AT acceptance.

## 5. Typography, RTL, forced-colors and reduced motion

The production authority is the complete Segoe UI / Segoe UI Web / native-system fallback chain in the source CSS. Penpot's Inter and Noto Sans Arabic specimens are canvas fallbacks, not production font approval. Browser tests and CSS media emulation remain useful regression evidence; they do not certify native Persian OS IME composition/caret/selection, cross-platform font metrics, OS Contrast Themes for all components, or spoken screen-reader output.

Keep dir/logical layout ownership with the component shell, preserve language-specific text behavior, and do not silently infer that numeric data should inherit RTL direction. The NumericField page 51 design decision is tracked under #433, not promoted by this foundation review.

## 6. Workflow disposition

- #417, #419, #420 and #425 are Done in Project #5; #421 is In progress, with its reusable Component Lab platform gate accepted independently of the remaining 66-family coverage ledger.
- #418 is returned to In progress while this review follow-up is implemented on v3/issue-418-design-tokens.
- PR #500 continues to target bluent-v3 only. No Dev/2.x merge, stable NuGet publication, production CSS activation, or issue Done transition is authorized by this engineering follow-up.
- Final Review/Done still require a genuine design-tool acceptance of the owned foundation boards and maintainer acceptance of the public token vocabulary/production alias policy. A green CI result alone cannot supply those approvals.

### Firefox regression lane — added, execution pending (2026-11-15)

A dedicated .github/workflows/v3-firefox-portal-lab.yml job now runs a Playwright Firefox probe against the real Published InteractiveServer /v3/interactive-portal-lab host. It independently covers the D2 Popover owner cascade, nested Word-vs-Excel portal isolation, Dialog snapshot immutability under owner changes, and D5 modal-owned Popover/Escape/nested-dialog/route-teardown behavior. It does not reuse the Chromium-only CDP harness.

The workflow and probe pass local syntax/configuration checks, and the Published SSR application builds successfully. Dev01 has no Firefox installation, so no local Firefox execution is claimed. Until the new CI job succeeds, Firefox evidence remains pending; Safari/WebKit, native OS Contrast Themes and spoken assistive-technology testing remain separate open gates. The lane does not approve the experimental portal API or move the board from DRAFT.

#### Workflow setup correction

The first GitHub Actions attempt failed in the Playwright installation step before starting Firefox: PowerShell wrote bare paths to GITHUB_ENV, and the runner rejected them. The step now writes valid NAME=VALUE records with Add-Content. YAML parsing, a static check that rejects the old malformed form, Node syntax, and git diff --check pass locally. Firefox runtime evidence remains pending a new Actions run.

#### Firefox probe correction after first real execution

The first browser run passed owner initialization, Excel/Dark/RTL scope, detached Popover rendering, and live owner propagation. It then timed out because the probe incorrectly expected clicking the trigger again to toggle the KeepSurface Popover closed. Source and the existing Chrome/Edge probe confirm this component opens on Trigger click and dismisses on an outside click; it is not a trigger-toggle control. The Firefox probe now clicks the static .v3-lab h1 outside the Popover before asserting collapsed/ARIA state. This corrects the test interaction, not the product contract. The failure trace and screenshot were retained as CI artifact 14160839807.
