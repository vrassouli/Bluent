# Issue #418 — Acceptance checkpoint — 2026-11-24

## Current disposition

- Issue: [#418 — Design Tokens](https://github.com/vrassouli/Bluent/issues/418), remains **In progress** in GitHub Project #5.
- Branch: `v3/issue-418-design-tokens`, targeting the isolated `bluent-v3` integration branch.
- PR: [#500](https://github.com/vrassouli/Bluent/pull/500), OPEN / unmerged, merge state CLEAN, no formal approval decision.
- Previous verified pushed baseline before this Native UIA evidence update: `811c376633fbb339d828d37e57572eb829d4753d`; its exact-head GitHub Actions completed **13/13 successfully**. The current evidence changes are recorded in this checkpoint and require fresh exact-head CI after push.
- Exact-head GitHub Actions: **13/13 workflows successful**, zero failures and zero active jobs. All completed PR checks passed; the source/evidence job also reports success via the job API and its parent workflow.
- This checkpoint records engineering and design-review progress only. It does not approve the public token/API contract, mark the issue Done, or authorize merge, production CSS activation, package publication, stable-branch changes or deployment.

## Completed engineering follow-ups

### Owned browser cleanup

The alpha-host browser probe now waits for process shutdown within a bounded 8-second deadline, scopes process matching to the probe's unique temporary profile path, and performs a fresh final process inventory. The source audit and regression suite reject missing profile scoping, unbounded waiting, broad process termination and missing post-loop inventory.

Local evidence on Dev01:
- Chrome alpha-host probe: 80/80; zero temporary-profile leftovers.
- Cleanup regression suite: 24/24.

### Label Info focus readiness

The Label Info runtime probe now considers the surface ready only after:
1. the Popover surface has the `show` class;
2. the trigger has `aria-expanded="true"`;
3. `document.activeElement` is the Info surface.

The existing focus/no-trap accessibility assertions remain unchanged. A source guard and negative regression test pin the readiness condition.

Local Dev01 evidence:
- Chrome/Edge × en-US/fa-IR: 72/72 assertions across four browser/locale runs.
- Edge/WASM alpha-host probe: 1,179/1,179 assertions.
- Label contract tests: 11/11.
- Popover JavaScript bundle tests: 26/26.

The latest exact-head hosted CI passed all four Label Info locale/browser cells. The earlier Edge/WASM loopback fetch error on an intermediate head did not reproduce locally and the current exact-head workflow set is fully green.

## Additional focused checks

- Native High Contrast evidence guard: 7/7; Native Windows UIA evidence contract: 12/12.
- #418 review contract: 21/21.
- Validation-text contrast tests: 10/10.
- Token-preview contrast tests: **15/15 locally and on exact-head hosted Token Contract CI**.
- Token generator `--check`: pass.
- Main token contrast diagnostics: 360 checks, no unexpected diagnostics.
- Docs contract: 0 findings.
- Markdown links: **244 files** checked.
- `git diff --check`: pass at the latest engineering checkpoint.


### Dark candidate proposal drift guard — local follow-up

The token-preview regression suite now parses the ten-brand Dark candidate table in `DARK-SEMANTIC-FOREGROUND-PROPOSAL.md` and compares all **40 documented hex values and four-decimal contrast ratios** with the generated brand matrix. A second guard pins the source-state mapping, 4.6:1 preview target, opaque NeutralBackground1 scope and DRAFT / not-production disposition. Local suite: **15/15**. The follow-up was present in the verified pushed baseline `811c376633fbb339d828d37e57572eb829d4753d`, whose exact-head GitHub Actions completed 13/13 successfully, including the Token Contract workflow.

## Contrast evidence and limits

### Formal neutral-base check

Across 10 brands × Light/Dark × Neutral Background 1/2/3, all **60/60** formal normal-text contrast pairs pass 4.5:1. Minimum measured ratio: **5.2036:1**. This is limited to the stated neutral surfaces.

### Opaque host diagnostics

The separate 2,180-pair diagnostic across 109 additional opaque backgrounds is not a universal pass result:
- 834 pairs meet 4.5:1.
- 26 surfaces pass in every theme.
- 51 surfaces fail in every theme.
- 32 surfaces are mixed across themes.
- 16 non-opaque/alpha/transparent surfaces are excluded from simple arithmetic.

The existing `--colorPaletteRedForeground1` validation mapping is not universal across arbitrary hosts. `semantic.text.validation` remains review-only and is not part of the 17-role public allow-list.

### Dark candidates

Forty Dark foreground candidates for Action Rest and Link Rest/Hover/Pressed meet the 4.6:1 preview target on opaque Dark NeutralBackground1. Minimum: **4.6001:1**. These are candidates only; exact values, aliases and usage are not approved.

The current role taxonomy is 46 logical color roles: 16 source, 17 semantic and 13 component.

## Editable design-review artifact

[Open the editable #418 acceptance-review board in Figma](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=132-2).

- Working file: independent Bluent v3 Figma file `JfxkDgSbNr8W0ppUZPQPHc`.
- Existing page: `14:2` — `01 · CSS & token decision matrix (#417)`.
- New frame: `132:2` — `#418 · Acceptance review / DRAFT`, 1540 × 1769.
- Structure: seven sections, 76 editable text nodes. The rendered board was visually inspected after creation.
- Penpot was unavailable in this session (the connected Penpot tab was frozen). The repository explicitly permits the independent Bluent v3 Figma file as a fallback. Existing boards were not deleted or altered; the Microsoft Fluent community file was not touched.
- The Figma board is decision context only. It is not canonical Penpot approval, a final token library, product font approval or evidence that unresolved decisions have been accepted. The board uses Inter because that font family is available in the Figma session.

The board separates:
1. measured neutral-base evidence and diagnostic boundaries;
2. the Option B token vocabulary and Danger-role scope;
3. the prototype Focus/Portal/Dialog directions;
4. the explicit pending maintainer decision register;
5. native Windows, browser, Persian IME and design acceptance gaps.


## Editable 17-role semantic evidence register

[Open the 17-role semantic evidence/scope register in Figma](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=134-12).

- Page 14:2, frame 134:12; 1540 × 2463, 17 semantic-role records, 17 instances of shared component 134:2, 127 editable text nodes.
- Disposition: 3 first-wave candidates (not public), 2 restricted roles, 12 deferred roles. Every row records exact source alias, current consumer evidence, narrowest supported scope, and open acceptance gate.
- The board was structurally read back and visually inspected. It is an independent-file Figma fallback because the connected Penpot tab was frozen.
- It is review context only. It does not approve the public allow-list, exact CSS aliases, schema changes, production token/CSS/API activation, or design status labels. No consumer approval was widened.

## Remaining acceptance gates

1. Final public semantic-token allow-list, including permitted surfaces/states and unsupported contexts.
2. Exact production CSS alias names and backwards-compatible mapping.
3. Explicit disposition of the 40 Dark candidate foreground values.
4. Public Focus/Portal/Dialog type/member contract and ownership semantics.
5. Canonical Penpot page-45 contrast review and page-55 Dark-value review; page 45 remains DRAFT with its main contrast board REVIEW REQUIRED, and page 55 remains DRAFT. Pages 52–54 record prototype directions only.
6. Native Windows Contrast Themes evidence now covers built-in High Contrast White and High Contrast Black on one Windows 11/Edge fixture for the prototype Dialog and generic Popover. Still open: user-defined schemes; broader component and Focus-host matrix; additional OS/browser versions; user-facing fallback behavior; and independent pixel review. The paired HC Black run verifies that separate light/default/LTR and dark/Word/RTL ThemeScope metadata reaches both detached Popover roots.
7. Physical-keyboard coverage, broader UI Automation of components beyond the Dialog/Popover prototype, and spoken Narrator/NVDA/VoiceOver acceptance remain open. The available White/Black UIA runs use synthetic OS key events; no spoken output was captured or listened to.
8. Native Safari.app/SafariDriver verification; Playwright WebKit CI is not equivalent.
9. Persian OS IME composition, caret/selection behavior and cross-platform font metrics.

## Native Windows prototype evidence boundary

The available native probe used Windows 11 Pro build 28000 / Edge 158.0.4370.33 / High Contrast White. It restored the original OS flags/scheme, observed `forced-colors: active`, and captured limited Dialog semantics plus a Tab/Shift+Tab/Escape/focus-return path. Popover trigger relationships were captured, but its surface had no explicit role and a transparent computed background.

This was CDP-dispatched input, not physical keyboard input. It did not include High Contrast Black, user-defined schemes, UI Automation inspection, spoken AT output or full independent pixel acceptance. See `docs/v3/quality/evidence/BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-HC-2026-11-23.md` and the JSON/PNG companions.

## Native Windows UI Automation follow-up — 2026-11-24

A new probe ran the published Release InteractiveServer fixture at /v3/interactive-portal-lab on Windows 11 Pro build 28000 / Microsoft Edge 158.0.4370.33 (Edge UA token Edg/158.0.0.0), with the real native High Contrast White scheme enabled through SystemParametersInfoW. Edge reported both forced-colors: active and prefers-contrast: more. The original High Contrast flags 126 / disabled / High Contrast White were restored exactly from test flags 127; a post-run native read confirmed the original flags, enabled state and scheme. Probe-owned Edge processes remaining: 0.

The Windows UI Automation ControlView tree exposed the open Dialog as a named Window (v3 keyboard modal), its heading as Text, and the Close modal action as an invokable Button. With synthetic user32.keybd_event input targeted to the private Edge window, Tab focused Close modal; Shift+Tab focused Last focusable; Escape closed the Dialog and returned browser focus to v3-show-keyboard-modal. This is Windows UIA and synthetic OS input evidence, not physical keyboard hardware acceptance.

The Popover trigger exposed aria-expanded=true and aria-controls=v3-popover-trigger_surface. UIA exposed the detached content as a named Group and its body as Text. The surface itself remains a DIV with no explicit role, and the trigger has no aria-haspopup. In this run the measured surface node had computed background rgb(255, 250, 239), unlike the separate transparent-node observation on 2026-11-23; no contrast ratio or full ancestor/portal composite claim is made.

Raw captures and the full evidence manifest:
- docs/v3/quality/evidence/BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-UIA-2026-11-24.md
- docs/v3/quality/evidence/BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-UIA-2026-11-24.json
- BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-UIA-2026-11-24-DIALOG.png
- BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-UIA-2026-11-24-POPOVER.png

The fail-closed evidence regression suite passes 12/12; the pre-existing native HC evidence suite passes 7/7 and the #418 review contract 21/21. Docs contract has 0 findings and Markdown links were checked in 244 files. Keyboard events were synthetic, Narrator was not launched, no spoken Narrator/NVDA/VoiceOver output was captured, and screenshots have not been independently pixel-reviewed. Only High Contrast White was tested; High Contrast Black and user-defined schemes remain open.
## Explicit exclusions

- Do not mark #418 Done or move it to Review just because the engineering tests are green.
- Do not merge PR #500 or change the Project #5 status.
- Do not start #438 DateField; it remains Backlog and independently gated.
- Do not activate `--bui-v3-*` preview aliases in production CSS.
- Do not publish NuGet packages, create releases/tags, change stable `Dev`/`main` or deploy v3 work.
- Do not imply native OS/AT acceptance from browser-emulated forced-colors, Playwright WebKit or CDP key dispatch.


## 2026-11-25 — Native High Contrast Black UI Automation follow-up

A second native Windows UIA artifact now records the opt-in Dialog/Popover fixture under **High Contrast Black** on Windows 11 Pro build 28000 / Edge 158.0.4370.33 / published InteractiveServer. Edge observed `forced-colors: active` and `prefers-contrast: more`. The native Dialog was exposed in Windows UIA as a named Window with a Text heading and invokable Close modal Button; synthetic Tab/Shift+Tab observations and Escape/focus return were retained. Both Dialog and Popover screenshots have verified SHA-256 manifests.

The run began with High Contrast Black already active (flags 127). The probe records this exact initial state and verified the same flags/scheme/enabled value after its `finally` restoration (`exactlyMatchesOriginal=true`). This run did not demonstrate a White-to-Black transition. The Dialog computed surface was `rgb(32, 32, 32)` with white text and a system-colored outline. The separate Popover surface still computed white background / dark text under this Black scheme and has no explicit role; no contrast pass is claimed. This is a concrete outstanding #418 forced-colors portal-surface review finding, not a general Popover role recommendation.

Evidence: `docs/v3/quality/evidence/BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-UIA-2026-11-25-HC-BLACK.md`, matching JSON and two PNG captures. The focused Black evidence suite pins the native scheme, exact restoration, UIA structure, synthetic keyboard limits, screenshot SHA-256 and Popover gap. The native probe now accepts only built-in High Contrast White/Black schemes and refuses to overwrite an existing evidence JSON or screenshot; a deliberate repeat run requires a unique `BLUENT_ISSUE418_NATIVE_EVIDENCE_SUFFIX`.

Local verification on this checkpoint: Black evidence 10/10, prior White UIA evidence 12/12, prior White HC evidence 7/7, #418 review contract 22/22, full `RegexSampleGeneratorTest` Release suite 189/189, docs contract 0 findings, Markdown links 246 files and Node syntax check passed. This is limited engineering/UIA evidence: keyboard events were synthetic, no physical keyboard or spoken Narrator/NVDA/VoiceOver output was captured, only the Black scheme was exercised in this run, and screenshots have not been independently pixel-reviewed. #418 remains In progress; #438 remains Backlog; no public API, product CSS or stable/v2 behavior changed.


## 2026-11-25 — Paired native HC Black portal ThemeScope comparison

The HC Black UIA probe now opens two detached service-hosted Popovers at once: one under the lab's CurrentScope (light/default/LTR) and another under AlternateScope (dark/Word/RTL). This compares two independent portal scopes in one Windows/Edge/native-scheme session, avoiding cross-run differences. Both portal surfaces reported `aria-expanded=true`, matching `aria-controls` roots, and their own detached-root attributes. CurrentScope: theme=light, default brand, v3-token marker present, comfortable density, LTR. AlternateScope: theme=dark, brand=word, v3-token marker present, comfortable density, RTL.

Under native High Contrast Black, both computed surfaces were `rgb(32,32,32)` with white foreground and system border/outline. This is expected forced-colors replacement of authored theme colors, not a failure of ThemeScope propagation. The data attributes on both detached roots prove the different scope values reached the portal. Neither generic surface has a role; no universal Popover role is inferred. This paired evidence supersedes the tentative interpretation of the first standalone HC Black sample as a lost theme scope. That earlier raw observation remains archived and its exact values remain pinned by its own artifact test.

Paired artifact: `docs/v3/quality/evidence/BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-UIA-2026-11-25-HC-BLACK-SCOPED-WORD-COMPARE-4.md` plus JSON and three SHA-256 verified PNGs (Dialog, CurrentScope Popover, AlternateScope Word/dark Popover). Native HC Black was already active at the start (flags 127) and exactly restored; Edge owned processes remaining=0. Probe uses unique evidence suffix and refuses overwrite.

A focused test `test_v3_issue418_native_hc_black_scoped_portals.py` guards same-run scope metadata, forced-colors output, screenshots, native restore and the no-universal-role boundary; the #418 Token Contract workflow now runs it. This is limited native engineering evidence only: no physical keyboard or spoken AT, one OS/browser/scheme, no blanket contrast certification, and no API/product runtime change.


## 2026-11-25 — Exact-head GitHub CI confirmation after native portal evidence

PR #500 head `e650d337c4d804ad4d0a7ac7d7776acddcd310b8` completed the full `Bluent v3 Real Compatibility Browsers` workflow (`45555459625`) successfully. The first Chrome/WASM attempt passed all 51 primary runtime assertions and native 200%/400% zoom assertions, but reported a PowerShell process-inventory cleanup timeout. Only that failed job was rerun. The rerun job `139010721850` succeeded with **72/72** Chrome/WASM checks, **10/10** native 200% zoom, **10/10** native 400% zoom, `killed=0 remaining=0` for both zoom cleanup records, and uploaded JSON/PNG evidence. No product code change was necessary; no #425 cleanup harness change was made on this branch.

The final `gh pr checks 500` snapshot on the same exact head had no failed or pending checks. PR state: OPEN / unmerged, base `bluent-v3`, merge state CLEAN, no formal review decision. This closes the exact-head CI gate only; it does not approve the public token vocabulary/aliases, Dark candidates, Focus/Portal/Dialog API signatures, Penpot boards, user-defined native schemes, physical keyboard, spoken AT, native Safari, or Persian OS IME/selection behavior. #418 remains In Progress; #438 remains Backlog.
