# Bluent v3 Link — implementation record

> **Development-only API.** Implemented on the isolated v3 task branch for integration into bluent-v3; not part of a released NuGet package. Released consumers must continue using the existing [2.x Link reference](../../components/link.md).

## Provenance

- Issue: [#431 — Link](https://github.com/vrassouli/Bluent/issues/431)
- Target: bluent-v3; task branch: v3/issue-431-link
- Package / namespace: Bluent.UI / Bluent.UI.Components
- Runtime: src/Bluent.UI/Components/LinkComponent/Link.cs
- Appearance: src/Bluent.UI/Components/LinkComponent/LinkAppearance.cs
- Styles: src/Bluent.UI/Styles/Components/_link.scss
- Showcase: /components/links; Component Lab: /component-lab
- Penpot: Bluent v3 Design System, file b64f6665-c9ab-80b5-8008-c4ac99d9d000, page 50 · Link anatomy & behavior · #431 DRAFT (f9b86891-93a1-8056-8008-e9c9617213c3).

## Basic usage

~~~razor
@using Bluent.UI.Components

<Link Text="Read documentation" Href="/docs" />
<Link Text="More information" Href="/details" Appearance="LinkAppearance.Subtle" />
<Link Text="Refresh" OnClick="RefreshAsync" />
<Link Text="Archived destination" Href="/archive" disabled />
<Link Text="Unavailable action" disabled />
~~~

Use Button for new action-only UI. Link's no-Href action fallback is retained for compatibility.

## Public API

| Parameter | Type | Default | Contract |
| --- | --- | --- | --- |
| Text | string | required | Visible text and accessible name. |
| Href | string? | null | Non-blank values render an anchor. Null, empty and whitespace-only values render a native action button. |
| Appearance | LinkAppearance | Default | Default or Subtle. |
| OnClick | EventCallback | empty | Optional callback. On enabled navigation it is additive and does not cancel native browser navigation. |

### Complete inherited API surface

| Origin | Name | Type | Default | Link behavior |
| --- | --- | --- | --- | --- |
| Link | Text | string | required | Text content and default accessible name. Link does not expose ChildContent. |
| Link | Href | string? | null | Non-blank destination selects the native anchor; null/empty/whitespace selects the native action button. |
| Link | Appearance | LinkAppearance | Default | Default or Subtle; controls rest/hover/active/focus styling. |
| Link | OnClick | EventCallback | empty | Optional additive callback; native navigation is not cancelled. |
| BluentUiComponentBase | Tooltip | string? | null | Optional plain-text tooltip. |
| BluentUiComponentBase | TooltipContent | RenderFragment? | null | Optional rich tooltip content; takes precedence over Tooltip when supplied. |
| BluentUiComponentBase | TooltipPlacement | Placement | Top | Tooltip placement; enum values are listed below. |
| BluentUiComponentBase | TooltipAppearance | PopoverAppearance | Default | Tooltip surface appearance: Default, Brand or Inverted. |
| BluentUiComponentBase | DisplayTooltipArrow | bool | false | Shows the tooltip arrow when true. |
| BluentComponentBase | Class | string? | null | Additional CSS classes appended to bui-link and the appearance class. |
| BluentComponentBase | Style | string? | null | Consumer inline styles. |
| BluentComponentBase | AdditionalAttributes | Dictionary<string, object>? | null | Captures unmatched HTML attributes including id, disabled, aria-*, data-*, target, rel and title. Link filters conflicting attributes it owns. |
| BluentComponentBase | Id | string (derived property, not a Parameter) | generated | Uses an unmatched id when supplied; otherwise generates an identifier used by the component and tooltip service. |

The inherited tooltip lifecycle is service-backed: BluentUiComponentBase registers the tooltip after the first render when tooltip content/text is supplied, and destroys the registration when the component is disposed. Link does not implement a separate tooltip API or custom JavaScript interop.

Enum values accepted by the inherited API:

- LinkAppearance: Default, Subtle.
- Placement: Top, Bottom, Left, Right, TopStart, TopEnd, RightStart, RightEnd, BottomStart, BottomEnd, LeftStart, LeftEnd.
- PopoverAppearance: Default, Brand, Inverted.

The following are intentionally not part of the Link API: a Disabled Razor parameter, ChildContent, a generic type parameter, Size/Density, a direction parameter, a separate Target/Rel parameter, or a typed EventCallback<T>. Use unmatched HTML attributes for native target, rel and ARIA attributes. Text is the accessible name unless the consumer deliberately overrides it with an accessible-name attribute such as aria-label or aria-labelledby.

## Navigation and action semantics

- A non-blank Href renders a native anchor with href and preserves browser navigation.
- A null, empty or whitespace-only Href renders button type=button. One normalized destination decision controls both tag selection and output attributes.
- Enabled navigation retains its native href. If OnClick is supplied, Blazor invokes it without cancelling navigation.
- An enabled no-Href action invokes OnClick when activated.
- Disabled navigation keeps the anchor element but removes href; it emits role=link, aria-disabled=true and tabindex=0. Text supplies the accessible name. Pointer, Enter and Space activation do not navigate or invoke OnClick.
- Disabled no-Href action uses a native button type=button disabled and does not invoke OnClick.

Disabled detection is case-insensitive. Boolean false does not disable; a present non-null value other than boolean false is treated as disabled, consistent with HTML boolean-attribute presence.

## Attribute precedence

Link owns and filters conflicting unmatched values case-insensitively: href, type, disabled and onclick. In disabled mode it also owns role, aria-disabled and tabindex. Unrelated attributes such as target, rel, title and data-* pass through. Inherited Id, Class and Style behavior is preserved.

## Appearance and focus

- Default has a persistent underline at rest.
- Subtle is plain at rest and underlined on hover and keyboard focus.
- Both appearances provide a visible focus-visible ring: a 2px brand outline with a 1px contrast gap.
- Under forced-colors: active, focus uses OS Highlight and disabled text uses GrayText.
- Direction and inline wrapping inherit from the host; no Link-specific size/density parameter is added.

Styles use existing Bluent theme variables. No unapproved #418 token candidate is introduced as a public production alias.

## Design reference

- [Link anatomy and behavior](https://pixa.akbaramd.ir/#/workspace?team-id=b64f6665-c9ab-80b5-8008-c3c17dfc1705&file-id=b64f6665-c9ab-80b5-8008-c4ac99d9d000&page-id=f9b86891-93a1-8056-8008-e9c9617213c3&layout=layers&board-id=9ad04949-7c85-8079-8008-e9cba76f0478)
- [Link state, theme and layout matrix](https://pixa.akbaramd.ir/#/workspace?team-id=b64f6665-c9ab-80b5-8008-c3c17dfc1705&file-id=b64f6665-c9ab-80b5-8008-c4ac99d9d000&page-id=f9b86891-93a1-8056-8008-e9c9617213c3&layout=layers&board-id=a70c3eb4-6569-806a-8008-eb3f748a5872)

The source-owned page remains marked DRAFT in Penpot. Issue #431 design comment #6738154524 (2026-11-09) identifies both boards above and records that they were exported and visually inspected. The issue-scoped design contract is accepted for this implementation: native anchor/action structure, Default/Subtle states, disabled-navigation semantics, focus-visible treatment, inline wrapping and inherited RTL. This does not change the page status or approve global Light/Dark token values and aliases owned by #418. Link uses only existing published theme variables and introduces no candidate token names.

## Verification

Focused HtmlRenderer tests live in tests/RegexSampleGeneratorTest/LinkRenderSemanticsTests.cs. They cover null/empty/whitespace Href, enabled anchor attributes, disabled navigation role/name/focus and href suppression, disabled native action, case-insensitive conflicts, explicit false disabled and Subtle appearance.

The interactive demo exposes enabled navigation/action and disabled navigation/action, separate callback counters, a native internal-hash navigation target and a Persian RTL sample.

The Link-specific real-browser probe exercises the actual Component Lab specimen and records:
- Default and Subtle appearance/text changes and underline rest/hover/active behavior;
- native pointer navigation plus additive OnClick;
- no-Href button type=button action and Enter/Space activation;
- disabled navigation and disabled action DOM semantics;
- disabled-navigation accessibility role/name from the browser accessibility tree;
- Tab discovery of disabled navigation, omission of native disabled action from the Tab order, and visible focus-visible outline;
- Pointer/Enter/Space callback suppression on both disabled paths;
- inherited Persian RTL direction and emulated forced-colors focus visibility.

The browser probe runs on Chrome and Edge for WebAssembly and InteractiveServer. It is separate from the local HtmlRenderer tests and the Release/five-package build gate.

Evidence boundaries: browser forced-colors emulation is not a native Windows Contrast Themes test; browser accessibility-tree role/name inspection is not spoken screen-reader acceptance. Native OS contrast themes and spoken screen-reader output are not claimed by this Link acceptance record. The design board and browser screenshots are evidence for their respective scope; neither is a substitute for the other.
