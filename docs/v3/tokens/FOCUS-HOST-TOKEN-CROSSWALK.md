# #418 - Approved Focus host-role mapping in the opt-in token bridge

**Visual rule accepted by maintainer on 2026-10-14.** Source-owned Penpot: Bluent v3 Design System, page 38, APPROVED DESIGN board f4136a9a-101d-8004-8008-ca2956fe05f9. The **CSS custom-property name and consumer contract remain provisional** for #418 and #428; no stable 2.x or released Button API changes.

## Explicit host × mode mapping

| Surrounding host | Light focus source | Dark focus source |
| --- | --- | --- |
| Neutral | --colorBrandBackground | --colorBrandForeground2 |
| Brand | --colorNeutralForegroundOnBrand | --colorNeutralForegroundOnBrand |
| BrandHover | --colorNeutralForegroundOnBrand | --colorNeutralForegroundOnBrand |
| Danger | --colorNeutralForegroundOnBrand | --colorNeutralForegroundOnBrand |
| Inverted | --colorNeutralForegroundOnBrand | --colorBrandForeground2 |

The surrounding host backgrounds correspond respectively to --colorNeutralBackground1, --colorBrandBackground, --colorBrandBackgroundHover, --colorPaletteRedBackground3 and --colorNeutralBackgroundInverted. Contrast is measured against the **OUTER host**, not the Button face. The opt-in generator rejects less than 3:1 against any of **10 actual emitted brands × Light/Dark × 5 opaque source hosts = 100** tested combinations.

## Generated, explicit-only preview

The source schema in [issue-418-token-schema.preview.json](issue-418-token-schema.preview.json) now records the approved focusHostPreview mapping and Penpot board ID. [generate_v3_token_preview.py](../../../scripts/quality/generate_v3_token_preview.py) emits the extra host-scoped CSS to [issue-418-opt-in.preview.css](issue-418-opt-in.preview.css), with provisional property **--bui-v3-focus-host-ring-candidate**. This is still a **candidate token name**, not final public CSS.

For a host to acquire that variable: opt in via a data-bui-v3-tokens root/ancestor, and put **data-bui-v3-focus-mode="light" or "dark" plus data-bui-v3-focus-host="neutral", "brand", "brandHover", "danger" or "inverted" on the SAME host element**. Never infer a focus color from Button Appearance, its own fill or underlying pixels. The separate focus-only mode preserves the inherited product brand/theme CSS: putting product data-bui-theme on each nested card would reapply global theme source variables and accidentally override its parent brand. The local context still explicitly selects Light/Dark without changing product Theme or inferring Button fill. Outside the opt-in scope there is **no** such custom property. Under CSS forced-colors: active the variable uses system Highlight.

This CSS does **not** set outline-color, does not target .bui-button, does not mutate legacy --color* roles, does not touch v2 bundles and is not a finalized public Button API. The generated demo-only asset comes from sync_v3_token_demo_asset.py and is consumed only by the isolated v3 Styling Lab.

## Verification and QA boundaries

Run:

    python scripts/quality/generate_v3_token_preview.py --check
    python scripts/quality/test_v3_approved_focus_host_token_bridge.py -v

Five tests require exact source-owned design identity, schema/CSS regeneration parity, 100 source-color contrast cases, forced-colors system fallback, and rejection of intentionally tampered Dark Inverted mapping or unapproved token/attribute names. The actual Blazor Chrome/Edge Browser Lab now temporarily sets explicit role/mode attributes on **five mounted host cards** in each of the **20 brand×mode contexts**, measures computed focus token color versus real host background, verifies >3:1 and correct Fluent source and checks an external non-opted-in element for leakage, then restores DOM without changing public product CSS. The new CI result must be verified before claiming actual browser success.

Native Windows Contrast Themes/screen readers, user browser zoom, gradients, images, nested portal/semantic ownership and final public CSS/component API still require separate review; numeric token tests are not universal WCAG conformance.

### Four-state browser media fallback regression

The independent real-Blazor WebAssembly forced-colors browser probe now also checks the newly generated host alias on the mounted **Danger host** in all 10 brands x Light/Dark x four independent CSS media combinations = **80 additional browser assertions per browser**. It explicitly tests system Highlight during forced-colors-only and forced+reduced-motion, and OnBrand during normal/reduced-only, while restoring explicit theme/host attributes after each case. The Chrome/Edge WASM CI must pass on the new commit; no claim about real native Windows Contrast Themes or AT is inferred from CDP media emulation.

## 2026-10-15 — Actual Blazor Styling Lab consumes the generated alias

The five real mounted Blazor Button cards now declaratively annotate their surrounding host containers with data-bui-v3-focus-mode (bound to the Blazor Light/Dark state, without reapplying the global theme CSS) and data-bui-v3-focus-host (the exact named host kind in the reviewed Penpot matrix). The surrounding Styling Lab is the data-bui-v3-tokens opt-in root. The Razor-scoped CSS no longer reproduces the Brand/Danger/Inverted per-mode ring color switch: the approved mode uses **--v3-lab-focus: var(--bui-v3-focus-host-ring-candidate)** as the single bridge from generated tokens. The historical unconditional brand ring remains available for explicit comparison, not as default. No public Button CSS selector or API changed.

The new CDP Browser Lab asserts **actual Razor-owned host role/focus-only mode** and **painted keyboard-focused Button outline** against the inherited 10-brand source palettes across both Light/Dark themes (five actual cards each), in addition to the outside non-opted-in leak sentinel. During automated brand/theme sweeps the test synchronizes cards’ focus-only mode attributes explicitly because the test changes the DOM root mode directly without Blazor state rendering; this is test scaffolding only. The independent forced-colors WASM probe separately validates system Highlight across four emulated media modes. Six Python contract tests include static real Razor/CSS parity to prevent accidental reintroduction of hardcoded source roles. New browser results must pass on the latest CI before being claimed successful.


### 2026-10-15 nested brand inheritance fix

In the first demo wiring pass, each card used data-bui-theme directly. The emitted Fluent source stylesheet has global selectors such as [data-bui-theme=light] which would reinitialize color roles on every nested card, potentially replacing its inherited brand-scoped source palette. The reviewed **opt-in preview** now uses a distinct **data-bui-v3-focus-mode** attribute, colocated with data-bui-v3-focus-host, while the actual product Theme stays on the outer Blazor opt-in host. This avoids accidentally turning every Button Focus host into a new global theme root. Updated schema/generator, six negative/positive tests, synchronized preview assets, and both standalone forced-colors and broader browser probes protect the distinction. No public API approval implied; verify CI on the latest commit before accepting browser parity.

### 2026-10-15: Blazor-owned theme/brand interaction acceptance probe

In addition to source and DOM-only palette sweeps, the real browser probe
now drives the actual V3StylingLab Blazor controls to switch **Excel/default ×
Light/Dark** (4 live cases). For each case, it checks all five native Button
host cards: the approved generated focus-host candidate resolves to the
expected source role; the keyboard focus outline is visible; contrast
against the parent host is at least 3:1; and every card inherits the parent
product palette without declaring its own product theme. The independent
Word component stays in its opposite mode. This proves real Blazor
rerender behavior rather than assuming that changing raw DOM attributes
also changes Razor component state. The probe first resynchronizes prior
DOM-only test mutations via actual Blazor control toggles.

The Windows CDP launcher now correctly accepts a detached Chromium launcher
that exited 0 before DevToolsActivePort appears, and reclaims only browsers
with the unique probe-owned temporary profile. A launch failure or
failed cleanup still fails the test, never skips assertions. Local Dev01
Chrome WASM: **868/868**, Edge WASM: **868/868**, no failed checks.
Release -warnaserror build: 0 errors/warnings; six focus-host Python
contract tests and token generator drift check passed; Release solution
test invocation passed, observing 61 tests in RegexSampleGeneratorTest.
GitHub Actions still require verification on the new SHA.

Design reference unchanged: approved Bluent v3 Penpot page 38, board
f4136a9a-101d-8004-8008-ca2956fe05f9. This does not constitute native
OS contrast, AT, genuine browser UI zoom, opaque/gradient host universality,
final public API, or v3 release acceptance.

### 2026-10-15: Second independently owned brand/mode Focus host

A real nested **Word** opt-in host now contains its own keyboard-focusable
Bluent Button in the actual v3 Styling Lab. The child focus fixture sets
neutral host role and the Blazor-owned AlternateScope.Mode, but deliberately
does not create another global product theme root. Its candidate ring is
consumed exclusively through the generated opt-in alias, while its background
and source colors inherit the nested Word theme. This is a private demo
fixture, not a new public component or auto-detection API.

The existing EventCallback browser checks now verify both the five primary
Focus contexts and Word's real independently mounted focused Button on each
Excel/default x Light/Dark main-host state. Tests assert Word source inheritance,
the mode-specific Fluent token, 2px+ actual focus-visible stroke and at least
3:1 host contrast; the independent mode remains opposite to its parent. The
source brand matrix omits colorBrandForeground2, so the Dark ring expectation
comes from the real Word owner computed source token, not an invented matrix key.

Local Dev01 browser results: Chrome WASM **868/868** and Edge WASM **868/868**,
zero failures including the four stricter multi-owner assertions. Debug
solution build succeeded with zero errors/warnings; six Python contract
tests and JS syntax validation passed. Exact new-head CI must be verified
after push. The accepted Penpot branded Focus host-role design is unchanged.
Browser-computed CSS does not certify native Windows Contrast Themes or AT.

### 2026-10-15: Detached Word Popover Focus boundary, with real keyboard modality

In the real v3 Styling Lab, a second **Word-owned Focus host** now lives inside
the independent service-hosted Popover. The Popover is rendered outside the
normal component subtree in the global container, so the local Razor-scoped
CSS does not automatically reach it. A single narrowly qualified opt-in CSS
fixture in Demo.Pages (issue-418-portal-focus.opt-in.preview.css) applies
only under a v3-tokens ancestor and the exact demo-only portal fixture, not to
the public Bluent Button API or legacy styling. The generated approved host
variable provides its ring; the actual Word Popover data-bui-brand / product
mode remains the source of truth. Both parent Excel/default and the independent
Word host retain their own theme. The fixture's explicit neutral host role and
focus-only mode never reapply data-bui-theme to the focus card.

The actual CDP probe opens the Word Popover, delivers genuine keyboard input
before focus (programmatic focus following a pointer click is not necessarily
focus-visible), checks computed source ownership, 2px/2px outline, color match
and minimum 3:1 against the immediate host. It then switches emulated
forced-colors and verifies system Highlight, while restoring media state
before closing the Popover. The test uses an actual mounted Bluent Button,
not a CSS clone or fake focus-visible class.

An existing Browser Lab reliability flaw was exposed during stress: rapid
palette mutations sampled mid-transition colors and produced timing-dependent
false failures. The source-brand, independent-host, danger toggle/hover/pressed
and legacy CSS opt-out checks now wait for real terminal computed source colors.
Animations remain enabled and are not bypassed. The test fails if the correct
real rendered color cannot be reached. This improves QA reliability; it does
not certify actual pixels, native Windows Contrast Themes, AT, all consumer
portal types or the eventual public focus-host contract.

Local Dev01 **Chrome/WebAssembly 870/870** and **Edge/WebAssembly 870/870** checks passed after this change, zero failures.
Release -warnaserror build passed with zero warnings/errors, six focus-host contract tests, token preview generator --check, and 61 observed .NET tests passed.
Previous commit a3c2db3e completed 5/5 GitHub workflow checks; the next
commit must be independently checked. The accepted Focus design is still
Penpot Bluent v3, page 38, board
f4136a9a-101d-8004-8008-ca2956fe05f9. No design approval is inferred
for new public API semantics.

## 2026-10-17: Explicit translucent host exclusion

The opaque host-role mapping approved in Penpot is NOT
universal for RGBA hosts. The separate
[alpha host audit](FOCUS-ALPHA-HOST-AUDIT.md) finds
10/80 real emitted Fluent source cases (all ten Light
brands, half-white alpha layer above a brand underlay)
where BOTH brand and inverse-white ring choices fail
the 3:1 review threshold. Independent real Chrome and
Edge computed CSS matched 80/80 cases each. No new
automatic public host role or workaround is approved
without native design/AT review. Do not translate this
diagnostic success into accessibility certification.

### 2026-10-17: Focus2 limited alpha-host research candidate

Existing Fluent Focus2 black Light/white Dark clears >=8.511:1
on the 80 real-source alpha host composites (0/80 below 3:1);
approved opaque host Brand and white alternatives fail together
on 10/80. Both actual Chrome and Edge resolved all 80
source alpha/underlay and candidate 2px outline CSS samples.
Native editable Figma design DRAFT board:
https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=38-2 .
See FOCUS-ALPHA-HOST-AUDIT.md; this is NOT a global
Focus2 switch or an approved public alpha host CSS API.


### 2026-10-17 — distinguish historical contrast comparison from approved mapping

The full #418 real-Blazor CDP probe includes TWO distinct Focus experiments
that must not be conflated:

- The historical default Button Focus is intentionally the original
  unconditional branded ring on the parent Styling Lab. The comparison
  measures less than 3:1 on ten Dark brand/mode neutral backgrounds.
  This is the reason host-context adaptation was researched. It is
  **not** evidence that the approved #501 adaptive Focus rule failed.
- The separate approved Penpot #501 Focus host mapping uses real
  data-bui-v3-focus-host and data-bui-v3-focus-mode on five source-owned
  surrounding hosts. Source-token contract measurements are at least
  3:1 in 100/100 explicit brand/mode/host cases, and the live browser
  probe separately asserts the contextual ring color and at least 3:1
  contrast on those mounted hosts.

The historic low-contrast observation remains visible rather than
being suppressed. Its diagnostic wording was clarified in the browser
probe to avoid misreporting it as a failure of the approved adaptive
design. The public token API, gradients/photo hosts, named AT and native
Windows Contrast Themes remain unapproved / unverified. This does not
alter the existing branded Focus in 2.x or implement the future Button.