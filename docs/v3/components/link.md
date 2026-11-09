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

Inherited Bluent parameters/attributes remain available, including Id, Class, Style, tooltip parameters and unmatched HTML attributes. No public Disabled parameter is added; use the inherited HTML disabled attribute.

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

The source-owned page is still DRAFT. Light/Dark and focus-token candidates remain owned by #418. Design-to-code parity and final visual review are not yet accepted.

## Verification

Focused HtmlRenderer tests live in tests/RegexSampleGeneratorTest/LinkRenderSemanticsTests.cs. They cover null/empty/whitespace Href, enabled anchor attributes, disabled navigation role/name/focus and href suppression, disabled native action, case-insensitive conflicts, explicit false disabled and Subtle appearance.

The interactive demo exposes enabled navigation/action and disabled navigation/action, callback counters and a Persian RTL sample. Do not infer native screen-reader acceptance from markup or browser AX. Source/build/unit-test, real-browser, visual, OS contrast and assistive-technology evidence must be reported separately.