# TextField placeholder token decision — 2026-11-14

## Selected source-backed mapping

| Use | Bluent role | CSS alias | Fluent source |
|---|---|---|---|
| Ordinary placeholder | bluent.semantic.text.placeholder | --bui-v3-text-placeholder | --colorNeutralForeground4 |
| Disabled placeholder | bluent.semantic.text.disabled (existing shared role) | --bui-v3-text-disabled | --colorNeutralForegroundDisabled |
| Entered value | bluent.semantic.text.primary (existing shared role) | --bui-v3-text-primary | --colorNeutralForeground1 |

Source chain for the new role:

bluent.color.foreground4 → bluent.semantic.text.placeholder → --bui-v3-text-placeholder

Do not add a TextField-specific disabled role or component alias. Placeholder text is a low-emphasis hint and is never an accessible name; consumers still need a visible/programmatic Label and a description for help/validation.

## Upstream basis

The primary parity target is Fluent Web Components fluent-text-field, not a React-only visual extension. The exact pinned @fluentui/web-components@3.1.3 stylesheet uses var(--colorNeutralForeground4) for the ordinary native placeholder and var(--colorNeutralForegroundDisabled) for the disabled placeholder. The official Text Field component documents Outline and Filled appearances; the four-appearance Bluent matrix remains a clearly labelled cross-platform visual reference.

## Contrast acceptance

Use the actual Filled-darker surface BG3 rather than the generic input surface BG1:

| Mode | Foreground | Surface | Contrast |
|---|---|---|---:|
| Light | #707070 | #F5F5F5 | **4.5423:1** |
| Dark | #999999 | #141414 | **6.4663:1** |

The #418 contrast audit checks the FG4/BG3 pair in every existing brand/mode CSS bundle (10 brands × Light/Dark). Any pair below 4.5:1 fails. The light-mode headroom is deliberately small, so the exact source values and rendered consumer test must remain guarded. FG3 is not selected because the pinned Fluent Web Components implementation uses FG4 and no FG4 failure is measured for these source pairs; a higher-contrast role would be an upstream departure requiring separate evidence and review.

WCAG 2.2 SC 1.4.3 applies the 4.5:1 requirement to normal text. Inactive UI components such as disabled controls are exempt from this requirement; this mapping reuses Bluent's established disabled semantic for consistency, not to claim a separate disabled-state contrast certification.

## Release boundary

This selected TextField consumer contract is represented in the #418 opt-in token preview only. It does not approve the full #418 public token vocabulary, brand candidate values, Penpot design, Windows native Contrast Themes, or spoken assistive-technology acceptance. Generated preview CSS remains outside published bundles. The TextField implementation may use the semantic variable with the exact Fluent source token as its fallback; no public Razor parameter or TextField-only disabled token is introduced.
