# DropdownSelect

`DropdownSelect<TValue>` is a Bluent popover-backed selection display. The consumer supplies both the selected `Options` collection and the dropdown surface used to change that selection.

## When to use
Use it when selected values should be presented in a Bluent trigger with zero/one/many selection display and the application needs a custom dropdown surface. Use `SelectField<TValue>` for a straightforward native select.

## Package and namespace
`Bluent.UI`, namespace `Bluent.UI.Components`.

## Minimal source-verified shape
```razor
<DropdownSelect TValue="int"
                Options="_selected"
                Dropdown="@DropdownContent"
                ClearOption="RemoveSelected" />
```
The exact dropdown surface is intentionally application-defined through the required `Dropdown` fragment; do not invent an item-list API that is not part of this component.

## Public API
- `DropdownPlacement`: `Placement`, default `BottomStart`.
- `CanClear`: `bool`, default `true`.
- `EmptyMessage`: `string`; empty input is replaced with localized `Select...`.
- `Dropdown`: required `RenderFragment?` surface content.
- `Options`: required `IEnumerable<DropdownOption<TValue>>`; represents the selected/displayed options.
- `ClearOption`: `EventCallback<TValue?>` invoked by the clear/dismiss UI.
- public `Close()` and `Refresh()` methods delegate to the internal Popover.

## Display behavior
- zero options: renders `EmptyMessage`;
- one option: renders its text and, when `CanClear`, a transparent dismiss Button;
- multiple options: renders each selected item as a dismissable `Tag`;
- the trigger always includes a chevron icon.

The component does not own the underlying selection model. Consumers update `Options` and implement the dropdown interactions themselves.

## Services / containers / JS
The implementation composes `Popover`, `Button`, `Tag`, and `Icon`. Use normal `AddBluentUI()` setup and one `<Containers />` in the active interactive layout for shared popover infrastructure.

## Localization and RTL
Default empty text comes from `IStringLocalizer<DropdownSelect...>`. Placement defaults to `BottomStart`; surrounding direction/placement behavior should be verified in target RTL layouts.

## Accessibility and keyboard
The trigger is custom `<div>`-based markup inside `Popover`, not a native `<select>`. Source inspection alone does not establish combobox/listbox semantics, focus model, keyboard navigation, or ARIA state. Treat these as runtime/accessibility-unverified unless provided by the composed Popover/dropdown content and verified end-to-end.

## Common mistakes / limitations
- `Options` are selected/displayed values, not the complete available option source.
- `DropdownSelect` does not provide search/virtualization/item selection by itself; those belong to the supplied `Dropdown` content or another richer component.
- `ClearOption` must update consumer state; the component does not mutate `Options` itself.
- Runtime keyboard/focus/RTL behavior is not newly browser-verified by this page.

## Related components
- `SelectField<TValue>`: `select-field.md`
- `Popover`: see [component inventory](inventory.md)

## Source and verification
- `src/Bluent.UI/Components/DropdownSelectComponent/DropdownSelect.razor`
- `src/Bluent.UI/Components/DropdownSelectComponent/DropdownSelect.razor.cs`
- `src/Bluent.UI/Components/DropdownSelectComponent/DropdownOption.cs`
- source verified against the #406 PR branch on 2026-08-29.
