# Issue #418 — Maintainer decision packet — 2026-11-25

> **Status: DRAFT · decision/review aid only.** This packet consolidates the decisions already selected by delegated engineering review, separates them from exact public-contract approvals that remain open, and identifies the smallest decisions needed to unblock the next acceptance step. It does not approve Penpot boards, promote token aliases, alter the preview schema, change product runtime/API/CSS, or authorize publication.

## 1. Executive summary

The architecture is substantially settled. The remaining work is not to choose the same architecture again; it is to approve exact public names, consumer scopes, values, and design/accessibility evidence.

| Area | Direction already selected | What is still not approved |
|---|---|---|
| Token vocabulary | Option B: public reusable `bluent.color.*` plus individually approved `bluent.semantic.*`; source internal; component private | First production semantic allow-list, exact emitted aliases/values, consumer scopes |
| Focus host contract | Option A: explicit mode + host metadata on the actual painted host; no inference or wrapper | Exact public HTML/CSS attribute contract, design acceptance and full host/OS evidence |
| Portal ownership / Dialog | Option A: Popover follows live owner; service Dialog captures immutable owner snapshot at `ShowAsync`; existing builder route | Exact public CLR names/signatures and final lifecycle/brand/SSR acceptance |
| Dark foregrounds | 40 matching-source-state candidates selected for opt-in preview | Visual acceptance and exact-value approval |
| Popover surface semantics | Explicit consumer-selected semantics; no inferred/default role | Whether/how to add an additive role + accessible-name API on the actual detached surface root |

The selected directions below are treated as settled for this review. A later change to one of them should be an explicit revised decision, not an accidental consequence of API implementation.

## 2. Decisions already selected — do not reopen by default

### 2.1 Public token layering — Option B

- `bluent.color.*`: reusable global palette/state vocabulary intended for consumers.
- `bluent.semantic.*`: public only role-by-role, after the role has an accepted meaning, supported consumer scope and values.
- `bluent.source.*`: internal Fluent/source mapping layer.
- `bluent.component.*`: private implementation layer.
- `--bui-v3-*`: serialization for individually approved public logical tokens, inside the explicit v3 opt-in scope only.
- Preserve existing Fluent-compatible `--color*` variables and all 2.x assets. Never repurpose a shipped alias; semantic changes require a new name and migration.

Current source taxonomy is 9 `bluent.color.*` entries plus 7 `bluent.source.*` entries. The 17 semantic and 13 component entries remain preview inventory, not a public allow-list.

### 2.2 Focus host — Option A

The selected direction is explicit, same-painted-host metadata:

- `data-bui-v3-focus-mode="light|dark"`
- `data-bui-v3-focus-host="neutral|brand|brandHover|danger|inverted"`
- Both attributes belong on the actual painted host; no wrapper component, no Button parameter, and no pixel/background inference.
- Missing/unknown metadata and unsupported translucent, alpha-composited, gradient, image-backed or other composite surfaces receive no host-specific candidate alias.
- Fail-closed behavior must preserve the existing visible keyboard-focus indicator. It must never mean hiding focus.

The names and behavior above describe the selected preview direction. They are not yet an activated public HTML/CSS contract.

### 2.3 Portal owner lifecycle and Dialog — Option A

- Popover follows its nearest live owner while that owner/trigger is alive.
- A service Dialog receives owner context explicitly and captures an immutable snapshot at `ShowAsync`.
- An unscoped call preserves the legacy/root fallback.
- Owner identity remains private implementation/registry bookkeeping.
- Reuse the existing Dialog configuration-builder route. Keep D2 theme ownership separate from D5 modal/accessibility configuration.
- Keep the explicit, validated Dialog builder methods; do not add a public owner ID, launcher component, or separate `DialogAccessibilityOptions` type.

The current immutable `PortalThemeScope` is the experimental value carrier for `CascadingValue` and `SetThemeScope`. Its exact name/shape remains subject to final public API review.

### 2.4 Dark branded foregrounds — preview target selected

The selected preview target is 40 independently generated values: Action Rest, Link Rest, Link Hover and Link Pressed for each of the ten brands. Each value is derived from its matching source state; Hover/Pressed are never substituted for Rest. All 40 currently meet the 4.6:1 preview target (minimum 4.6001:1) against the opaque Dark `--colorNeutralBackground1` surface.

This is not approval of exact production values, arbitrary/alpha/composited surfaces, rendered component behavior, native forced-colors behavior, or a blanket WCAG claim.

## 3. Maintainer decisions still required

### D1 — First semantic-token production allow-list

The evidence supports a deliberately small, consumer-scoped first-wave proposal. The request is to approve or revise these scopes, not to approve all 17 preview roles.

| Candidate role | Preview source mapping | Preview CSS alias | Narrowest existing consumer evidence | Proposed initial scope |
|---|---|---|---|---|
| `bluent.semantic.text.primary` | `bluent.color.foreground1` | `--bui-v3-text-primary` | Label #430 primary text mapping | Label primary text only until other consumers are separately accepted |
| `bluent.semantic.text.disabled` | `bluent.source.foregroundDisabled` | `--bui-v3-text-disabled` | Label #430 visually disabled text mapping | Label disabled visual state only; not a normal-text contrast promise |
| `bluent.semantic.text.placeholder` | `bluent.color.foreground4` | `--bui-v3-text-placeholder` | TextField #432 ordinary placeholder mapping | TextField placeholder only; placeholder is not an accessible name |

Specific exclusions remain:

- `bluent.semantic.text.dangerAccessible`: Label required-marker only; exclude it from the general first-wave text allow-list.
- `bluent.semantic.status.danger`: non-text status indicators/icons/accents on the studied neutral surface only; never ordinary/small text.
- `semantic.text.validation`: not part of the 17-role schema or public allow-list. Existing validation-message source contrast passes the three neutral bases (60/60), but the wider opaque diagnostic matrix is not universal: 834/2,180 pairs reach 4.5:1, and 16 non-opaque/alpha/transparent backgrounds are excluded from simple arithmetic.
- Link Rest/Hover/Pressed and Action roles: defer production semantic promotion until their Dark exact values and rendered consumer states are accepted.
- The remaining semantic and all component-private roles: defer unless an individual consumer contract is supplied.

**Requested decision:** accept the three roles with the limited scopes above, revise the list/scopes, or defer semantic publication. Even acceptance here would not by itself publish CSS or NuGet; the design/value and native gates remain independent.

### D2 — Exact Dark foreground values

Review page 55 and the generated 10-brand × four-role matrix. The technical generator and 40-value drift guard are in place. The remaining question is whether the exact 40 values are visually accepted for their corresponding Action/Link states and may become the first production Dark values.

**Requested decision:** accept the exact table as the initial Dark values within the stated opaque Neutral Background 1 scope, request revisions, or keep them preview-only. Do not widen their host/surface scope by implication.

### D3 — Focus host public contract

The selected Option A direction is clear, but page 53 remains a draft and the public-attribute contract is not activated.

Acceptance must explicitly cover exact spelling, allowed values, same-element requirements, the opt-in boundary, nesting/ownership, unknown-host behavior, and compatibility fallback. Keep the selected fail-closed rule: no host-specific alias for unsupported contexts while preserving the existing visible focus indicator.

### D4 — Portal / Dialog public API spelling and additive CLR surface

The prototype's Release-compiled API ledger identifies the complete additive surface. It includes:

- New immutable `Bluent.UI.Components.PortalThemeScope` record with `Mode`, `Direction`, `Density`, `UseV3Tokens` and optional `Brand`.
- Dialog parameters: `AccessibleName`, `AccessibleDescription`, `CloseButtonLabel`, `IsModal`, `EnableModalKeyboard`, `InitialFocusTargetId`, `UseStandardTitleHeading`.
- Popover parameters: `AccessibleTriggerState`, `ThemeScope`.
- Dialog builder methods: `SetThemeScope`, `SetAccessibleDialog`, `SetAccessibleDescription`, `SetReturnFocusTargetId`, `SetModalKeyboardNavigation`, `SetInitialFocusTargetId`.
- Additions to `DialogConfiguration` and `PopoverSettings`, plus the Dialog `DismissOnEscape` interop method and disposal override.

The complete ledger is in [ISSUE418-ADDITIVE-API-CONTRACT-REVIEW.md](ISSUE418-ADDITIVE-API-CONTRACT-REVIEW.md). The recorded comparison found no removed/changed prior member signatures and no changed or additional `IDialogService` overloads. The existence of these branch-local members is not their production approval.

**Requested decision:** approve or revise the exact public names, constructor validation, optional/default behavior, builder semantics and XML/migration contract. Keep the selected Option A lifecycle; do not add `OwnerId`, a launcher component, a second owner type, or a grouped accessibility-options type.

### D4.1 — Source-backed refinements before API freeze

The dedicated [Portal / Dialog / Popover source audit](ISSUE418-PORTAL-API-SOURCE-AUDIT-2026-11-25.md) identifies a builder-path description that is silently discarded without an accessible name, plus a direct `DialogConfiguration` path that accepts the same unsupported combination because the shared validator does not reject it and the renderer suppresses `aria-describedby`. The return-focus-only Dialog path is also not included in the current opt-in Container disposal completion filter. The audit records the coupling between SetAccessibleDialog(name, closeButtonLabel) and SetCloseButton(false), plus the JS interop-only nature of DismissOnEscape.

These are acceptance questions to resolve in the final contract before freezing exact signatures. No runtime change is included in this PR update.

### D5 — Shared Popover surface role/name contract

The DateField consumer review exposes one concrete shared gap: the detached `PopoverSurface` root is currently an unnamed `div`. Existing `AccessibleTriggerState` supplies the live `aria-expanded` / persistent `aria-controls` relationship; it does not assign surface semantics or an accessible name.

The proposed behavioral contract is:

1. A consumer may explicitly supply the semantic role for the actual controlled surface root.
2. It may supply an accessible-name source (`aria-label` or `aria-labelledby`); the contract must define whether both are allowed and how empty/missing references are validated.
3. The selected attributes are forwarded to the actual detached root referenced by `aria-controls`, not a wrapper or trigger.
4. An unconfigured Popover remains role-less and unnamed; no role is inferred and no default `aria-haspopup` is emitted.
5. Popover does not make every surface a dialog. DateField #438 selects `role="dialog"` and a stable name; menu, listbox and tooltip consumers retain their own semantics.
6. This does not make DateField modal: no `aria-modal`, background inerting, focus trap or modal Dialog lifecycle is implied.

**Requested decision:** approve this minimal opt-in behavioral contract, revise it, or require a different design. The current source audit recommends the following exact-name candidate (not approved or implemented): Popover.SurfaceRole : string?, SurfaceAriaLabel : string?, and SurfaceAriaLabelledBy : string?; all default to null. Carry them in Blazor-side PopoverConfiguration, not JS-serialized PopoverSettings, and forward them only to the controlled detached root. The two name sources are mutually exclusive; either requires an explicit role that permits author-provided naming. See [Portal API source audit](ISSUE418-PORTAL-API-SOURCE-AUDIT-2026-11-25.md) for validation and tests. The source audit also records an unresolved lifecycle choice: Popover currently captures its initial registration/configuration once and refreshes only ThemeScope, so D5 must explicitly select snapshot or live-update semantics for later role/name parameter changes. The calendar's selected-day focus, grid navigation and natural Tab/Shift+Tab exit remain owned by #438, which is still Backlog.

## 4. Design references and current review state

Authoritative source design file: **Bluent v3 Design System**, Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.

| Decision area | Penpot page / artifact | Current state |
|---|---|---|
| Semantic contrast and scopes | Page 45; principal contrast board | DRAFT / REVIEW REQUIRED |
| Public token vocabulary | Page 52 | Option B selected · preview only |
| Focus host contract | Page 53 | Option A selected · preview only |
| Portal / Dialog contract | Page 54 | Option A selected · acceptance open |
| Dark foreground values | Page 55 | DRAFT · exact values not approved |
| DateField consumer choice | Page 61 | Downstream #438 design record |

The independent Figma review boards (acceptance frame 132:2 and semantic register frame 134:12) are supplemental decision aids only. They do not replace the source-owned Penpot review or approve any public API/token.

## 5. Evidence closed on the current PR head vs. remaining acceptance

### Closed on exact PR head `8af943609491ce1e8683c5a2ef042dc8b291833a`

- GitHub Actions: all 13 workflows passed and the PR summary reports **56/56 PR checks green**; PR #500 is open, unmerged and targets `bluent-v3`.
- Real Popover matrix: Chrome/Edge × InteractiveServer/WebAssembly, 73/73 assertions per cell, zero JS errors.
- Compatibility matrix: 32/32 jobs successful.
- Native Windows prototype evidence: built-in High Contrast White and Black were both captured on one Windows 11 Pro / Edge fixture. The paired Black capture shows separate light/default/LTR and dark/Word/RTL ThemeScope metadata reaching their own detached Popover roots.
- Local focused contracts include the #418 review contract 22/22, paired HC Black portal-scope evidence 6/6, HC Black 10/10, HC White 7/7, previous UIA evidence 12/12, and full `RegexSampleGeneratorTest` Release 189/189.

### Still open

- Independent Penpot review/acceptance of page 45 and page 55, with actual visual approval of exact semantic scopes/values.
- Final public semantic allow-list and production alias promotion.
- Exact public Focus attribute and Portal/Dialog CLR contract acceptance.
- Custom, user-defined Windows Contrast Themes, broader component/unsupported-host coverage, physical keyboard acceptance and spoken Narrator/NVDA/VoiceOver review.
- Native Safari.app/SafariDriver (Playwright WebKit is not equivalent).
- Persian OS IME composition, caret/selection behavior and cross-platform font metrics.
- Independent visual/pixel review of retained native screenshots.

The native High Contrast probe used synthetic OS key events; it is not physical keyboard or spoken assistive-technology acceptance. Browser-emulated forced-colors and Playwright WebKit are not substitutes for the remaining native-platform gates.

## 6. Release and workflow boundaries

Until the required decisions and acceptance evidence are complete:

- Keep preview token schema, generated preview aliases, Focus attributes and prototype APIs opt-in and non-production.
- Do not modify production CSS, stable `Dev` / `main`, 2.x assets, package versions or releases.
- Do not publish NuGet, tag, deploy, merge PR #500, or move #418 to Review/Done based on green CI alone.
- Keep DateField #438 in Backlog until its own Ready/design gate is satisfied.
- Do not reinterpret a selected architecture direction as approval of its exact public names, values or implementation.

## 7. Canonical source records

- [Public token vocabulary and alias policy](PUBLIC-TOKEN-VOCABULARY-PROPOSAL.md)
- [Foundation review decisions](FOUNDATION-REVIEW-DECISIONS.md)
- [Dark semantic foreground proposal](DARK-SEMANTIC-FOREGROUND-PROPOSAL.md)
- [Focus host public contract proposal](FOCUS-HOST-PUBLIC-CONTRACT-PROPOSAL.md)
- [Portal theme / Dialog public API proposal](PORTAL-THEME-PUBLIC-API-PROPOSAL.md)
- [Portal / Dialog / Popover source audit](ISSUE418-PORTAL-API-SOURCE-AUDIT-2026-11-25.md)
- [Additive API ledger](ISSUE418-ADDITIVE-API-CONTRACT-REVIEW.md)
- [DateField Popover consumer review](DATEFIELD-POPOVER-CONSUMER-REVIEW.md)
- [Acceptance checkpoint](ISSUE418-ACCEPTANCE-CHECKPOINT-2026-11-24.md)

This packet is an index and decision aid, not a replacement for those source records. Where evidence has a narrower scope, the narrower scope remains authoritative.
