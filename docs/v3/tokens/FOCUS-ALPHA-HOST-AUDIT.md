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
