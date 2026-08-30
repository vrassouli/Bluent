# Accordion and AccordionPanel

`Accordion` groups expandable `AccordionPanel` children and can enforce single-panel or multi-panel expansion.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<Accordion>
    <AccordionPanel Header="Details">
        Panel content
    </AccordionPanel>
    <AccordionPanel Header="History">
        History content
    </AccordionPanel>
</Accordion>
```

## Accordion API

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `ChildContent` | `RenderFragment?` | `null` | Nested panels. |
| `HeaderAction` | `AccordionHeaderAction` | `Expand` | Controls whether header click only expands or toggles. |
| `Multiple` | `bool` | `false` | When false, expanding one panel collapses the currently expanded panel. |

## AccordionPanel API

Important parameters:

- required `Header` (`string`)
- `HeaderIcon` (`IconDefinition?`)
- `HeaderAction` (`RenderFragment?`) for custom header-side action content
- `ChildContent`
- `DeferredLoading`
- `Expanded` / `ExpandedChanged`
- `PanelClasses`
- `ExpandedClasses` / `CollapsedClasses`
- `ExpandedHeaderClasses` / `CollapsedHeaderClasses`

A panel must be nested in an `Accordion`; initialization throws otherwise. It registers with the parent and unregisters on disposal.

Public methods `Toggle()`, `Expand()`, and `Collapse()` update `Expanded`, notify the parent, invoke `ExpandedChanged`, and rerender.

## Expansion behavior

With `Multiple=false`, the parent collapses the first currently expanded panel before expanding another. `HeaderAction=Expand` makes header clicks expand but not collapse an already-open panel; the other header-action mode uses `Toggle()`.

`DeferredLoading` controls whether collapsed content is withheld until needed in the current markup. Do not treat it as data lazy-loading or a provider API.

## Accessibility boundary

Current behavior is custom Bluent accordion composition. Verify the rendered header element, keyboard activation, `aria-expanded`, and panel relationships before claiming a complete WAI-ARIA accordion pattern. Source-level expansion state alone is not proof of those semantics.

## Evidence boundary

Source verified from `Accordion.razor(.cs)`, `AccordionPanel.razor(.cs)`, and `AccordionHeaderAction`. Do not invent selection, async content providers, or unrestricted standalone `AccordionPanel` usage.
