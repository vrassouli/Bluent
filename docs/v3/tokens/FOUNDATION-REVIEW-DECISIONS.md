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

The second Firefox run passed outside-click dismissal for the outer Excel Popover and verified the nested Word portal as Light/LTR with --colorBrandBackground #2F61C1, independently of its Dark/RTL Excel parent. It then exposed the same trigger-toggle assumption on the nested KeepSurface Popover. That final dismissal now also uses an outside click; both Popovers are tested against their actual existing dismissal contract.

### Exact-head GitHub Actions result — 2026-11-15 (54285d38)

All 12 workflows have completed on exact head 54285d38ba1a8479e3041b40b107ebe8e03ed1a8: 11 successful, 1 failed.

The Firefox / Published InteractiveServer / D2-D5 lane passed 32/32 assertions (workflow 43715759724; artifact 14162737020). Real Component Lab passed 4/4 Chrome/Edge × Server/WebAssembly; Interaction Source passed source/consumer compile and 4/4 real Popover Chrome/Edge × Server/WebAssembly; Real Browser Lab passed 4/4 Chrome/Edge × Server/WebAssembly. Token, documentation, package-boundary, public component census, baseline quality, Button runtime and Button Focus contracts also passed.

The one failed workflow is Real Compatibility Browsers: 11/12 matrix cells passed. Its Chrome/WebAssembly native per-site zoom subtest reports 4px settled horizontal overflow at 400%, attributed to a 300px Chart.js canvas (viewport 316 / scrollWidth 320); 200% passes with 0px overflow and all other 400% interaction checks pass. The native zoom probe already waits for Blazor hydration, 1.8s + 0.6s stability and another 1.2s if width changes; the overflow persisted in this WebAssembly run. This evidence was separately added to #486, which owns Chart composition. No masking CSS or Chart implementation was attempted from #418. Artifact: https://github.com/vrassouli/Bluent/actions/runs/43715759701/artifacts/14162437698

The Real Browser Lab Edge/Server job passed overall, but its transparent Focus host CSS audit and independent fresh-browser forced-colors step were skipped; those scopes are not certified for that cell. Firefox verifies Published InteractiveServer only and is not native AT speech, Windows Contrast Themes or Safari/WebKit certification.

This CI result does not close the remaining #418 maintainer/design/API gates. PR #500 stays open; no independent APPROVED review or merge exists. The Penpot pages remain DRAFT / REVIEW REQUIRED; public token aliases/vocabulary, Dark semantic choices, public Focus host and D2/D5 API decisions, native accessibility and remaining lifecycle/third-party portal arbitration remain open.

### Real Browser Lab cleanup follow-up — 2026-11-15

On docs-only HEAD 993dbd84, the Chrome/WASM Real Browser Lab collected the full 80/80 real-Chrome computed CSS records (minimum source contrast 8.511; zero below 3) but the workflow failed its cleanup-verification tail. The helper invoked two WMI process queries under a 19-second PowerShell timeout and omitted stderr/exit detail from the JSON result. The timeout is now 45 seconds and the cleanup error record retains exitCode, signal and stderr.

Local Dev01 verification with installed Chrome now passes 80/80, min contrast 8.511, zero below 3, cleanup remaining=0, errors empty. This remains a computed-CSS-only audit, not raster, OS theme, assistive-technology or WCAG evidence. No product runtime/API/CSS changed; GitHub Windows CI must confirm the helper fix on the new head.

### Final exact-head result — 2026-11-15 (88d37a25)

All 12/12 GitHub Actions workflows passed on 88d37a252fde704c7401b83e1814056dff3446c0.

- Firefox / Published InteractiveServer D2-D5: 32/32 assertions (run 43717665687), including detached/nested ownership, immutable Dialog snapshots, modal-owned Popover, inert/aria-hidden background, Escape ordering, nested focus restoration and route teardown.
- Real Component Lab: 4/4 Chrome/Edge × Server/WebAssembly.
- Interaction Source: compile plus 4/4 real Popover Chrome/Edge × Server/WebAssembly.
- Real Compatibility Browsers: 12/12 cells/jobs successful. Chrome/WASM native site zoom passed 10/10 at 200% and 400%, with zero overflow on this run. The earlier 4px Chart.js canvas overflow from SHA 54285d38 did not reproduce on later runs; #486 retains both observations as intermittent, not resolved.
- Real Browser Lab: 4/4 Chrome/Edge × Server/WebAssembly. Chrome/WASM and Edge/WASM each passed 80/80 Focus2 computed-CSS samples (min source contrast 8.511, none below 3), browser cleanup remaining=0, diagnostics and CDP interactions, independent fresh-browser forced-colors, and 1179/1179 deep browser assertions.
- Real Browser Lab Chrome/Server and Edge/Server passed their real CDP interactions/diagnostics, but their transparent Focus host CSS audit and independent fresh-browser forced-colors step were intentionally skipped. Server is not certified by those two skipped scopes.
- Baseline Quality Gate, Release build/warnings-as-errors, full solution tests, five-package inspect without publishing, Local Package Boundary, Compiled CLR Export Baseline, Button Runtime, Button Focus, Token, Documentation and Public Component Census all passed. Button runtime: 113/113 unit tests and published-host matrix 208/208.

The Windows CI result confirms the cleanup fix introduced in 88d37a25: both Chrome and Edge WASM report 80/80 samples with cleanup remaining=0 and errors empty. This is computed-CSS/browser evidence only; it does not certify native OS Contrast Themes, spoken assistive technology, raster equivalence or WCAG conformance for arbitrary surfaces.

This final result supersedes the earlier provisional text saying GitHub confirmation was still pending. No Bluent product runtime/API/shipped CSS changed, no NuGet was published, and no stable/2.x branch was touched. PR #500 remains open; #418 remains In progress. Public token/alias policy, Dark semantic values, Focus host and D2/D5 public API, Penpot acceptance, native AT, Safari/WebKit and remaining popup/lifecycle arbitration gates remain open.

### Final exact-head result — 2026-11-15 (88d37a25)

All 12/12 GitHub Actions workflows passed on exact head 88d37a252fde704c7401b83e1814056dff3446c0.

- Firefox / Published InteractiveServer D2-D5: 32/32 assertions (workflow 43717665687), including detached/nested ownership, immutable Dialog snapshots, modal-owned Popover, inert/aria-hidden background, Escape ordering, nested focus restoration and route teardown.
- Real Component Lab: 4/4 Chrome/Edge by Server/WebAssembly.
- Interaction Source: source/consumer compile plus 4/4 real Popover Chrome/Edge by Server/WebAssembly.
- Real Compatibility Browsers: 12/12 jobs/cells successful. Chrome/WASM native site zoom passed 10/10 at 200% and 400%, with zero overflow on this run. The earlier 4px Chart.js canvas overflow from SHA 54285d38 did not reproduce on later runs; #486 retains both observations as intermittent evidence, not resolved.
- Real Browser Lab: 4/4 Chrome/Edge by Server/WebAssembly. Chrome/WASM and Edge/WASM each passed 80/80 Focus2 computed-CSS samples (minimum source contrast 8.511, none below 3), browser cleanup remaining=0, diagnostics and CDP interactions, independent fresh-browser forced-colors, and 1179/1179 deep browser assertions.
- Real Browser Lab Chrome/Server and Edge/Server passed their real CDP interactions and diagnostics, but their transparent Focus host CSS audit and independent fresh-browser forced-colors step were intentionally skipped. Server is not certified by those two skipped scopes.
- Baseline Quality Gate, Release build with warnings as errors, full Solution tests, five-package inspect without publishing, Local Package Boundary, Compiled CLR Export Baseline, Button Runtime, Button Focus, Token, Documentation and Public Component Census all passed. Button runtime: 113/113 unit tests and published-host matrix 208/208.

The Windows CI result confirms the cleanup fix introduced in 88d37a25: both Chrome and Edge WASM report 80/80 samples with cleanup remaining=0 and errors empty. This is computed-CSS/browser evidence only; it does not certify native OS Contrast Themes, spoken assistive technology, raster equivalence or WCAG conformance for arbitrary surfaces.

This final result supersedes the earlier provisional text saying GitHub confirmation was still pending. No Bluent product runtime/API/shipped CSS changed, no NuGet was published, and no stable/2.x branch was touched. PR #500 remains open; #418 remains In progress. Public token/alias policy, Dark semantic values, Focus host and D2/D5 public API, Penpot acceptance, native AT, Safari/WebKit and remaining popup/lifecycle arbitration gates remain open.

### Editable public vocabulary decision board — 2026-11-15

Created and visually inspected a native editable Penpot decision board in the source-owned Bluent v3 Design System file:
- Page 52: 388782f1-b766-8073-8008-f3299e62827a
- Board: 388782f1-b766-8073-8008-f3299e849141
- File revision: 812
- Board state: DRAFT / MAINTAINER DECISION REQUIRED

It presents Option A (all layers public), Option B (global palette plus individually accepted semantic roles; recommended proposal), and Option C (semantic-only), then states the CSS serialization and compatibility rules plus the separate Dark/Danger/Focus/D2/D5 acceptance gates. Exported PNG was visually checked after correcting the page-coordinate offset. This is design traceability only, not sign-off. The page-45 contrast board remains DRAFT / REVIEW REQUIRED, and page33/D5 boards remain DRAFT.

### Focus host consumer API and fallback proposal — 2026-11-15

Added FOCUS-HOST-PUBLIC-CONTRACT-PROPOSAL.md and a native Penpot decision board (page 53 388782f1-b766-8073-8008-f32b0b243fc9, board 388782f1-b766-8073-8008-f32b0b39e88b, file revision 815). The accepted page-38 visual mapping is not reopened. The new board/document compare explicit same-host attributes (lowest API weight, recommended proposal), a public wrapper, and no custom-host declaration. The alpha audit's 10/80 dual failures and unsupported gradient/image/nested/portal cases remain visible.

Unknown host kind / missing opt-in metadata: emit no new host-specific alias, do not infer contrast from pixels, and preserve existing visible keyboard focus behavior without claiming a v3 contrast guarantee. This avoids the dangerous interpretation that fail-closed means removing keyboard focus.

The page-53 board remains DRAFT / PUBLIC API / FALLBACK DECISION REQUIRED. No public Razor parameter, wrapper, attribute, production CSS or token was created or approved.

### D2/D5 public Portal and Dialog API proposal — 2026-11-15

Added PORTAL-THEME-PUBLIC-API-PROPOSAL.md and native Penpot page 54 388782f1-b766-8073-8008-f32c913ab071, board 388782f1-b766-8073-8008-f32c9154ed0d (file revision 815). The exported board was visually inspected.

It records the evidence-based lifecycle distinction: Popover follows its live owner cascade; service Dialog receives an explicit caller context and captures an immutable snapshot at ShowAsync. It compares existing DialogConfigurator builder reuse, typed separate PortalContext/AccessibilityOptions, and scoped launcher component. D5 modal accessibility remains a separate opt-in contract with name/modal validation, background inert/aria-hidden, portal-owned Popover exception, nested topmost stack, Escape ordering and focus restoration.

The current PortalThemeScope record intentionally has no public OwnerId; caller identity remains private implementation bookkeeping. A nullable Brand field does not itself prove scoped simultaneous brand CSS. SSR/prerender, no-scope legacy fallback, route/disposal, iframe/third-party popup, native spoken AT/OS contrast and Safari/WebKit are separate gates. Page 54 remains DRAFT; no public API or product runtime was approved/changed.

### Dark semantic foreground exact-value matrix — 2026-11-15

Added DARK-SEMANTIC-FOREGROUND-PROPOSAL.md and native Penpot page 55 (388782f1-b766-8073-8008-f32e8223fd29, board 388782f1-b766-8073-8008-f32e823c8580, file revision 817). The export was visually inspected after a board-height correction.

The 10-brand × four-role table is copied from generated preview candidates: Action Rest, Link Rest, Link Hover, Link Pressed. All 40 numeric opaque pairs meet 4.6:1; minimum 4.6001:1 (Teams Action/Link Rest), maximum 4.6891:1 (Excel Link Hover). The 48-step binary search mixes each matching source state toward white; no Hover/Pressed value is borrowed for Rest. The source CSS and public semantic names remain proposals only.

The already-approved direction of preserving each brand hue is not reopened. Exact candidate values remain DRAFT / REVIEW REQUIRED; page45 remains DRAFT / REVIEW REQUIRED and page55 DRAFT / exact values not approved. Numeric opaque pairs do not certify component rendering, alpha/gradient surfaces, native forced-colors/AT, or full WCAG conformance. No production CSS/API/package changed.

### Dark semantic foreground exact-value matrix — 2026-11-15

Added DARK-SEMANTIC-FOREGROUND-PROPOSAL.md and native Penpot page 55 (388782f1-b766-8073-8008-f32e8223fd29, board 388782f1-b766-8073-8008-f32e823c8580, file revision 817). The export was visually inspected after a board-height correction.

The 10-brand × four-role table is copied from generated preview candidates: Action Rest, Link Rest, Link Hover, Link Pressed. All 40 numeric opaque pairs meet 4.6:1; minimum 4.6001:1 (Teams Action/Link Rest), maximum 4.6891:1 (Excel Link Hover). The 48-step binary search mixes each matching source state toward white; no Hover/Pressed value is borrowed for Rest. The source CSS and public semantic names remain proposals only.

The already-approved direction of preserving each brand hue is not reopened. Exact candidate values remain DRAFT / REVIEW REQUIRED; page45 remains DRAFT / REVIEW REQUIRED and page55 DRAFT / exact values not approved. Numeric opaque pairs do not certify component rendering, alpha/gradient surfaces, native forced-colors/AT, or full WCAG conformance. No production CSS/API/package changed.

## 2026-11-16 — delegated Fluent 2 foundation decisions

The maintainer delegated the unresolved #418 design choices to the engineering/design review. The following directions are selected and are now the basis for further v3 foundation work. This is a decision record, **not** a claim that the draft Penpot boards were accepted, that every candidate passed native accessibility review, or that production/public APIs have shipped. The machine-readable record is `issue-418-token-schema.preview.json` → `reviewPolicy.selectedDecisions`.

### 1. Public token vocabulary — Option B

Expose the reusable global palette namespace `bluent.color.*` and only individually approved meaning-based `bluent.semantic.*` roles. Keep `bluent.source.*` as internal source mappings and `bluent.component.*` as private component implementation aliases. CSS names are a stable serialization, not a second independent API: use `--bui-v3-*` only for approved public logical roles inside the explicit v3 opt-in scope. Never repurpose a shipped name; semantic changes require a new name and migration. Existing Fluent-compatible `--color*` source variables and all 2.x assets remain unchanged. No preview alias is promoted to production by this decision.

### 2. Focus host — Option A

Choose explicit same-host metadata: `data-bui-v3-focus-mode` and `data-bui-v3-focus-host` belong on the actual painted host. Keep the supported opaque host set to neutral, brand, brandHover, danger and inverted. Do not add a wrapper component or Button Razor parameter and do not infer surface identity from pixels. For missing/unknown metadata or translucent, gradient, image-backed or composited hosts, emit no host-specific alias and preserve the existing visible keyboard focus indicator; make no unsupported contrast promise. The target contract is selected, but the attributes/CSS are still opt-in preview pending page-53 design review and the specified host/OS acceptance.

### 3. Portal owner API — Option A

Reuse the existing Dialog configuration-builder path and pass owner context explicitly. Popover follows its nearest live owner cascade while the owner/trigger is alive. A service Dialog captures an immutable owner snapshot at `ShowAsync`; later owner changes do not mutate an already-open Dialog. An unscoped call keeps the legacy fallback. Keep owner identity private to implementation/registry bookkeeping; do not expose `OwnerId` simply to support internal lifecycle management. Keep D5 modal/accessibility behavior separate from D2 owner context; retain explicit validated builder methods for accessible naming, modal keyboard containment and focus targets rather than introducing another public options or launcher type in this iteration.

This is the selected API direction, not a final public API spelling/signature approval. The page-54 and page-33 boards remain DRAFT, and native Windows Contrast Themes for Dialog/Popover, spoken NVDA/Narrator/VoiceOver acceptance, independent engine coverage and lifecycle/popup arbitration remain acceptance gates.

### 3a. Portal scope value carrier clarification — 2026-11-17

Option A retains the existing `DialogConfigurator` builder and Popover owner cascade, but both entry points require a caller-constructible typed value. The isolated prototype therefore exposes one public immutable `PortalThemeScope` record with validated Mode, Direction, Density, optional Brand and UseV3Tokens. It is the data value passed to `SetThemeScope` / `CascadingValue`, not a scoped host component. No public `OwnerId`, launcher component or separate `DialogAccessibilityOptions` object is introduced. The type's current name and exact shape are experimental and remain unapproved for production. The complete CLR delta is recorded in `ISSUE418-ADDITIVE-API-CONTRACT-REVIEW.md` and `reviewPolicy.publicApiDelta`.

### 4. Dark brand foreground candidates — selected for preview only

Use the 40 generated source-derived candidates as the target preview values for exactly four roles (Action Rest, Link Rest, Link Hover, Link Pressed) across the ten brands on the opaque Dark `--colorNeutralBackground1` surface. All 40 currently meet the 4.6:1 preview target; the minimum emitted ratio is 4.6001:1. This choice preserves each brand hue and keeps Rest/Hover/Pressed mapped to their corresponding source roles. It does not certify alpha/composited, gradient, image, other component surfaces/states, native forced-colors or spoken AT, and does not create final public token names. The values stay preview-only pending the page-45/page-55 visual review and the remaining acceptance evidence.

### 5. Danger boundary — keep the narrow scope

`bluent.semantic.text.dangerAccessible` remains limited to the Label decorative required marker. `bluent.semantic.status.danger` remains limited to non-text status indicators/icons/accents on the tested neutral surface; it is not an ordinary/small-text foreground. Badge text, Alert, Toast and Button Danger text remain unapproved and require their own source, surface, contrast and design review.

### Acceptance boundary and next work

- Update source-owned Penpot boards to reflect these selected directions only after their design review; do not change DRAFT/REVIEW REQUIRED statuses by inference.
- Keep all current prototype CSS and APIs opt-in. No public API, production stylesheet, stable branch, package, NuGet publication or deployment is authorized here.
- Finish the design/acceptance work for #418, refresh its evidence and review the PR. Only after the actual design and acceptance gates are satisfied should #418 move to Review; do not merge merely because CI is green.
- #434 Checkbox can use these selected directions as its foundation context, but its own Penpot design and its implementation Ready gate remain separate.

Exact-head CI at the previous synchronized #418 checkpoint `3389a392c8c187d9835cb93d72b817fea06938f2` completed **11/11 workflows successfully**. This is evidence for that exact SHA only; subsequent decision-document commits require their own exact-head checks.
