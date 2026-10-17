# Issue #418 — Focus Ring on Translucent Host Backgrounds

2026-10-17. Design research and fail-closed QA only. NO PUBLIC API OR
UI DESIGN ACCEPTANCE. The user-approved brand Focus ring for OPAQUE
hosts remains in source-owned Penpot Bluent v3 Design System file
b64f6665-c9ab-80b5-8008-c4ac99d9d000, board
f4136a9a-101d-8004-8008-ca2956fe05f9.
Penpot was disconnected; no new design shapes were approved.

## Actual risk beyond the previously approved opaque-host matrix

The focus ring is painted OUTSIDE the Button's face (2px outline with
2px offset), so its contrast is determined by the visible background
of the surrounding HOST, not by Button Appearance. The source contract
for five OPAQUE host roles passed across ten brands and Light/Dark,
but it is NOT an automatic rule for alpha or image-backed hosts.

The actual emitted Fluent CSS was audited across:
- Ten brands and Light/Dark = 20 actual source CSS files
- Alpha layers colorNeutralBackgroundAlpha and colorNeutralBackgroundAlpha2
- Opaque underlays colorNeutralBackground1 and colorBrandBackground

There are 80 unique combinations. The audit composits the emitted
RGBA values over the actual opaque underlays using sRGB channel
alpha blending, then compares the resulting visible host color to
both currently proposed source-based Focus ring choices:
neutral-host brand ring (colorBrandBackground in Light,
colorBrandForeground2 in Dark) and inverse white
(colorNeutralForegroundOnBrand).

**10/80 conditions FAIL 3:1 for BOTH ring colors.**
All ten are Light, colorNeutralBackgroundAlpha (0.5 white),
on top of a brand-colored underlay. The other 70 source conditions
have at least ONE of the two choices at/above 3:1, but that does
NOT mean the production UI selects the appropriate one.

| Context | Actual source finding |
| --- | --- |
| Default Light; alpha white 0.5 above brand #1267B4 | Composite #89B3DA |
| Brand ring #1267B4 vs this host | 2.627:1 |
| Inverse white ring #FFFFFF vs this host | 2.205:1 |
| Affected brands | All ten Light brands; 10/80 source cases |
| Tested Dark subset | No dual failures in tested 40 Dark cases; NOT universal certification |

This documents a real design hole, not a defect that the audit
silently declares fixed. The approved focus-host mapping covers
opaque contexts ONLY. Do not automatically map alpha layers into
neutral/brand host types or assume a white fallback is universally
safe. An intentionally selected context role, new high-contrast
alternative source, or opacity-safe protective backing needs
future editable Penpot/user review and OS/AT inspection.
The maintainer's TextField focus remains BOTTOM UNDERLINE ONLY.

## Reproduction and evidence

From the isolated v3 #418 worktree:
- python -m unittest discover -s scripts/quality -p test_v3_focus_alpha_hosts.py -v
- python scripts/quality/audit_v3_focus_alpha_hosts.py
- node --check scripts/quality/probe_v3_focus_alpha_hosts_browser.mjs
- With installed Chrome or Edge CHROME_PATH:
  node scripts/quality/probe_v3_focus_alpha_hosts_browser.mjs

Nine positive/negative source tests enforce all 80 source scenes,
ten precisely scoped dual-failure cases, sRGB composition,
invalid/unsupported color formats, missing source themes and
rejection of false acceptance. Independently on Dev01, real
Chrome CDP 80/80 and Edge CDP 80/80 observed computed CSS
rgba foreground and opaque underlays from all 20 emitted themes,
zero errors, zero owned browser processes remaining.
The Windows headless --dump-dom shortcut proved unreliable:
its launcher can exit 0 with NO returned DOM. The final
native CDP probe does not treat empty DOM as success.

The v3 Token Contract CI runs nine source tests, the full
source matrix audit and JS syntax; the real v3 browser matrix
runs the native Chrome/Edge computed-style probe in WASM jobs
independently of the existing mounted Blazor interaction tests.

## Limitations, signoff, migration

The 80 scenes cover only two alpha roles, two opaque underlays,
and single-layer sRGB composition. This is NOT actual pixel/ring
raster proof, multilevel nested surfaces, gradients/images,
dynamic transitions, native Windows Contrast Themes, named AT,
full WCAG 2.2 AA, or a new public focus API acceptance.
The same source-owned OPAQUE Focus role design is unchanged.
Keep #418 In progress and PR #500 Draft targeting bluent-v3;
future #428 Button rewrite remains Backlog. Stable Dev,
v2 styling, NuGet releases and public Button/TextField
semantics remain unchanged.

## 2026-10-17 — bounded alpha-host-only Focus2 alternative (research)

The EXISTING Fluent CSS source token colorStrokeFocus2 resolves to
black in Light and white in Dark for all ten emitted brands. Across the
same 80 analytic sRGB-composited alpha-host scenarios, this candidate
has a MINIMUM source contrast of **8.511:1** and **0/80** samples
below 3:1. Existing approved branded/inverse treatments still have
10/80 dual failures; those results are NOT silently revised or accepted.

Default Light visible composite #89B3DA: approved opaque-neutral brand
ring 2.627:1, inverse white 2.205:1, existing Focus2 black 9.524:1.
The source Focus2 Dark ring is white.

**Design scope remains UNAPPROVED.** This option is considered only
for a future EXPLICIT transparent/alpha host role. The user's selected
brand-colored Button Focus ring for neutral OPAQUE hosts is unchanged;
TextField keeps its animated bottom underline, never a rectangular
Focus ring. No new public CSS token/attribute, automatic host inference,
production Button rewrite or stable Dev/NuGet change is delivered.

Editable Figma candidate matrix with ten real Light brand comparisons:
https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=38-2
(working-file page 14:2, board 38:2, DRAFT research). Ten native
editable Brand vs Focus2 ring samples use 2px vector strokes
with 2px offsets and the actual emitted/composited source colors.
All ten numeric ratio captions were compared to and corrected against
the source audit, and the board was exported as PNG and visually checked.
This is NOT user-approved authoritative Penpot design parity.

Real installed Chrome and Edge browsers each PASS **80/80** independent
CDP observations for actual emitted background RGBA, actual underlying
opaque CSS color, and resolved colorStrokeFocus2 OUTLINE COLOR with
2px width + 2px offset on a NATIVE HTML research element. Cleanup
reports owned browser processes remaining=0. A CSS/native fixture is
not equivalent to an actual mounted Bluent Button and does not establish
pixel raster contrast, forced-colors OS behavior or screen-reader support.

Three new fail-closed unit controls bring alpha-host tests to **12/12**:
exact all-brand/mode source Focus2, correct default Light contrast,
and palette-specific source mutation rejection without removing
actual emitted theme files. The established v3 Token Contract and
native Browser Lab triggers include these touched source/test paths;
exact-head CI must independently pass.

The focus candidate still needs named native Windows AT, real rendered
Button/pixel and RTL acceptance, alpha/gradient/nested host coverage and
user signoff in authoritative Penpot before any production API decision.
#418 remains In progress / PR #500 Draft / #428 Backlog.

## 2026-10-17 — actual mounted Bluent Button demo + real native Tab QA

The bounded Focus2 candidate has now been put side-by-side with the
real branded ring on an ACTUAL mounted Bluent Button, solely in the
unpublished /v3/styling-lab research page. The fixture shows a genuine
source Brand underlay plus the emitted colorNeutralBackgroundAlpha
overlay, and two genuine Bluent Buttons marked branded / Focus2.
The main source-owned Figma research board remains the editable
DRAFT at https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=38-2 .
This does not add a product Button attribute, redefine the source
approved opaque host Focus mapping, change TextField underline or
edit the original authoritative Penpot file.

The page-local Blazor CSS uses existing Fluent source properties:
brand underlay, alpha overlay and Focus2 candidate only on the
second explicitly marked research card; old OPAQUE Button contexts
keep the maintainer-selected branded focus. The lab-only rule
switches to system Highlight under CSS forced-colors media;
native Windows/AT still requires separate user verification.
The real UI includes a keyboard-entry sentinel, two actual Bluent
Buttons and a keyboard-exit sentinel; content is Persian and can
be checked with the real LTR/RTL theme control. No shipping
Bluent.UI public component CSS, NuGet package or stable Dev code
is modified by this research fixture.

The existing **real** Blazor browser CDP suite gained 70 assertions:
for each 10 brand x Light/Dark emitted stylesheet/host scope, real
CDP Tab from the start sentinel focuses branded Button, then Tab
focuses Focus2 Button; verify each actual Button focus-visible state,
2px outline and 2px offset, actual source-resolved outline color,
and compute the candidate and branded contrasts against the
measured rgba-overlay/Brand underlay composite (not Button face).
All 20 candidate cases must have >=3:1; all ten Light branded cases
must demonstrate the previous <3:1 contrast failure.
The real packaged Fluent CSS minifies the authored source tokens
as #000 / #fff, so browser QA compares normalized actual RGB
rather than incorrectly equating literal authored hex spellings.
The first real Chrome/WASM test proved this implementation detail,
and the corrected comparison was rerun fully; there was no
Button/style behavior failure.

**Verified independent Dev01 real Blazor runtime:**
- Chrome/WebAssembly: **940/940**, failures 0.
- Edge/WebAssembly: **940/940**, failures 0.
- Chrome/production-published InteractiveServer: **939/939**, failures 0.
- Edge/production-published InteractiveServer: **939/939**, failures 0.
- **3,758/3,758 actual browser checks** across four modes.
The 14 Python alpha research/source guards also pass, including
explicit fixture ownership and actual native Tab/contrast test gates.
These totals are local evidence; new exact-head CI still requires
independent proof. The existing selected Button aria-pressed and
other legacy accessibility gaps are still reported and are NOT
cleared by the new tests.

This is a PROTOTYPE and a bounded browser CSS/computed contrast
study, not authoritatively approved Penpot production CSS,
raster/AA focus visibility, native Windows Contrast Themes,
named assistive technology, actual app image-backed/gradient
alpha hosts, or WCAG conformance. It does not release #428
Backlog or complete #418. Stable Dev/NuGet remain untouched.
