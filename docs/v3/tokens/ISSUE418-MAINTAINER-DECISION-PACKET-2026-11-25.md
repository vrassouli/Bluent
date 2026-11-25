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

## 3. Engineering dispositions and remaining acceptance

### D1 — First semantic-token production allow-list

The compiled opt-in bridge now emits only the three consumer-scoped text aliases below, alongside the nine public `bluent.color.*` roles documented in the implementation contract.

| Alias | Source | First-wave consumer boundary |
|---|---|---|
| `bluent.semantic.text.primary` | `bluent.color.foreground1` | Label #430 primary text only |
| `bluent.semantic.text.disabled` | `bluent.source.foregroundDisabled` | Label #430 disabled visual state only; not ordinary text contrast |
| `bluent.semantic.text.placeholder` | `bluent.color.foreground4` | TextField #432 placeholder only; not an accessible name |

`text.dangerAccessible`, `status.danger`, validation text, Action/Link semantics and remaining semantic/component roles remain excluded. The bridge is under `data-bui-v3-tokens` and is branch-local/unreleased. Page 45 semantic scope and page 52 vocabulary review remain open.

### D2 — Exact Dark foreground values

The generated ten-brand × four-role matrix contains 40 values, all at least 4.6:1 against the opaque Dark Neutral Background 1 preview surface (minimum 4.6001:1). **All 40 values remain preview-only and are not emitted by the compiled bundle.** Page 55 visual review must accept the exact rendered Action/Link states before these values or their semantic aliases are promoted. No claim extends to translucent, composite, gradient, image or arbitrary host surfaces.

### D3 — Focus host public contract

Focus Option A is implemented branch-locally in the opt-in CSS. The same actual painted host inside the v3 token scope carries `data-bui-v3-focus-mode` (`light|dark`) and `data-bui-v3-focus-host` (`neutral|brand|brandHover|danger|inverted`). The scoped rule sets the existing Button focus-ring variable and preserves the existing 2px outline / 2px offset. Unknown metadata receives no host-specific override; the visible fallback remains. Forced-colors uses system `Highlight`.

Only the studied opaque host mapping is supported. Alpha, gradient, image/video and composite surfaces remain out of scope. Page 53 visual/design review and native OS/AT checks remain open.

### D4 — Portal / Dialog API and lifecycle

Source-backed defects are now fixed in the isolated branch: both direct and builder Dialog paths reject description-without-name through the shared configuration validator; the builder does not silently discard descriptions; a named Dialog may omit the close-button label only when the icon-only close button is hidden; and return-focus-only contexts complete when their route/container host is disposed. Existing `IDialogService.ShowAsync` overloads and the selected immutable `PortalThemeScope` snapshot at `ShowAsync` remain unchanged.

The API ledger records `SetAccessibleDialog(string name)` in addition to the existing two-argument overload. Page 54 public naming/constructor review remains open; implementation does not equal design approval.

#### D4.1 — Source-backed refinements before API freeze

The source audit findings have been implemented and regression-tested. `bluent.semantic.text.dangerAccessible` remains excluded from the public first-wave bridge and limited to the Label decorative required marker; `bluent.semantic.status.danger` remains limited to non-text indicators on the studied neutral surface. Neither alias is emitted by the production opt-in bridge.

### D5 — Shared Popover surface role/name contract

The three nullable parameters `SurfaceRole`, `SurfaceAriaLabel` and `SurfaceAriaLabelledBy` are implemented. They render only on the actual detached surface root identified by trigger `aria-controls`, are kept out of JS `PopoverSettings`, and use fail-closed WAI-ARIA role/name validation. Name sources are mutually exclusive; a name requires a role supporting name-from-author; roles requiring a name reject an unnamed configuration. The unconfigured generic surface stays role-less and unnamed; no inferred `aria-haspopup` or `aria-modal` is emitted.

D5 uses **live-update semantics** for the registered Popover owner: changing role/name or the surface fragment refreshes that exact detached surface. This does not implement menu/listbox/dialog keyboard interactions, focus management, dismissal or modality; those remain consumer-owned. HtmlRenderer and parent-refresh regressions pass. A real-browser accessibility-tree assertion for `aria-labelledby` resolution and a real consumer keyboard model remain open. DateField #438 remains Backlog and was not started.

The complete branch-local D1–D5 behavior and sample opt-in markup are recorded in [ISSUE418-IMPLEMENTATION-CONTRACT-2026-11-25.md](ISSUE418-IMPLEMENTATION-CONTRACT-2026-11-25.md). These changes still require the Penpot visual/design reviews, fresh exact-head CI and formal maintainer acceptance before merge/release.

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
