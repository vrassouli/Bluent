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
6. Broader native Windows Contrast Themes coverage, including High Contrast Black and user-defined schemes, Dialog/Popover/Focus hosts and user-facing fallback behavior.
7. Physical-keyboard coverage, broader UI Automation component coverage, and spoken Narrator/NVDA/VoiceOver acceptance (the 2026-11-24 UIA probe is limited to the Dialog/Popover prototype and synthetic OS key events).
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
