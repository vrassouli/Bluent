# Dialog

Dialogs present focused content or request a decision without navigating away from the current page. Dialogs opened while another dialog is active are stacked, so closing the newer dialog returns the user to the earlier context.

## When to use

Use a dialog for short, interruptive workflows such as confirmation, editing a focused record, or choosing an action. Use a normal page or drawer when the task is long, should remain visible beside other content, or needs a shareable URL.

## Package and namespace

```bash
dotnet add package Bluent.UI
```

```razor
@using Bluent.UI.Components
@using Bluent.UI.Services.Abstractions
```

Register Bluent with `AddBluentUI()` and place one `<Containers />` in the active layout. See [Getting Started](../getting-started/index.md) for the canonical setup and stylesheet references.

## Minimal example

```razor
@inject IDialogService DialogService

<Button Text="Delete record" OnClick="ConfirmDelete" />

@code {
    private async Task ConfirmDelete()
    {
        var result = await DialogService.ShowMessageBoxAsync(
            "Delete record",
            "This action cannot be undone.",
            MessageBoxButton.Yes | MessageBoxButton.No,
            MessageBoxButton.No);

        if (result == MessageBoxResult.Yes)
        {
            // Delete the record.
        }
    }
}
```

The shared dialog demo also includes an **Open nested dialog** action. The nested dialog appears above its parent; its modal overlay blocks earlier layers, and closing it leaves the parent open.

## Service operations

| Operation | Result | Purpose |
| --- | --- | --- |
| `ShowAsync(RenderFragment, DialogConfiguration?)` | `Task<dynamic?>` | Show arbitrary rendered content |
| `ShowAsync<TContentComponent>(parameters, configuration)` | `Task<dynamic?>` | Show a component as custom dialog content |
| `ShowAsync<TContentComponent>(title, parameters, configurator)` | `Task<dynamic?>` | Show titled component content with configured actions |
| `ShowMessageBoxAsync(title, message, buttons, primaryButton)` | `Task<MessageBoxResult>` | Show a localized message box and await its result |

`DialogConfigurator` supports `SetModal`, `SetSize`, `SetCloseButton`, and `AddAction`. `DialogConfiguration` directly configures modal behavior and size. Await each returned task when subsequent logic depends on the selected result.

## Stacking and close behavior

- A newly opened dialog is added above every existing dialog; existing result tasks remain pending.
- Each modal dialog has its own overlay. The overlay is above earlier dialog layers and below the dialog it belongs to.
- Clicking an overlay closes only its associated dialog.
- A non-modal dialog does not add an overlay and does not block interaction with earlier layers.
- After the top dialog closes, the previous dialog and its state remain available.

## Styling, theming, localization, and RTL

Dialogs use the packaged component and theme stylesheets. Size can be `Small`, `Medium`, `Large`, or `FullWidth`. Built-in message-box button text is localized, including the shipped default and `fa-IR` resources. Dialog layout uses logical CSS where applicable; verify application-specific content in both LTR and RTL.

## Accessibility and keyboard interaction

The titled dialog content renders its title as an `h2` and uses buttons for close and action controls. Focus trapping, focus restoration, Escape-key closing, explicit dialog ARIA semantics, and hiding lower dialog layers from assistive technology are not currently verified; consuming applications should not assume those behaviors without runtime testing.

## Hosting and render modes

Blazor WebAssembly is the verified onboarding path. Other interactive render modes remain under validation; see [Hosting models and render modes](../compatibility/hosting-and-render-modes.md).

## Common mistakes

### Nothing appears

Confirm that `AddBluentUI()` is registered and one `<Containers />` component is rendered in a layout that contains the calling page.

### The caller continues before a choice is made

Await the task returned by `ShowAsync` or `ShowMessageBoxAsync`.

## Source and verification

- Container and stacking source: `src/Bluent.UI/Components/DialogComponent/DialogContainer.razor`
- Service source: `src/Bluent.UI/Services/DialogService.cs`
- Runnable demo: `src/Bluent.UI.Demo.Pages/Pages/Components/Dialogs.razor`
- Nested-content demo: `src/Bluent.UI.Demo.Pages/Pages/Components/DialogComponents/SampleDialogContent.razor`
- Automated render tests: `tests/RegexSampleGeneratorTest/DialogContainerTests.cs`
- Source, test, runtime, and visual verification date: 2026-07-25
- Runtime and visual verification: WebAssembly demo at desktop and 390 × 844 mobile viewports; light/LTR and dark/RTL; nested close-button and overlay-close flows; no horizontal overflow
