# AppBusyIndicator

## Purpose

Use `AppBusyIndicator` from `Bluent.UI.Utilities` as a shared application-level visual busy strip driven by the Utilities `IBusyIndicator` service.

## Setup

```csharp
using Bluent.UI.Utilities.Extensions;

builder.Services.AddBluentUtilities();
```

`AddBluentUtilities` registers `IMdiService` and `IBusyIndicator`. Its optional `ServiceLifetime` argument defaults to `Scoped`.

The component also renders Bluent.UI's `ProgressBar`, so the consuming application needs the main UI package/assets appropriate to that component.

## Usage

Place one `AppBusyIndicator` in the desired shell/layout location. When the injected `IBusyIndicator` raises `StatusChanged` with busy state, the component renders an indeterminate large `ProgressBar`; otherwise it renders nothing.

## Public component API

- `Style` (`string`) — default: `position: absolute; left: 0; right: 0; top: 0;`.

The component subscribes to `IBusyIndicator.StatusChanged` during initialization and unsubscribes on disposal.

## Semantics and layout

The default style positions the visual strip absolutely. The consumer is responsible for ensuring the containing layout makes that placement appropriate.

The underlying current `ProgressBar` implementation does not itself establish automatic progress/status/live-region semantics, so do not treat `AppBusyIndicator` as an accessibility announcement mechanism without additional verified semantics.

## Common mistakes

- Do not forget `AddBluentUtilities()`; `IBusyIndicator` is injected.
- Do not assume the default absolute positioning is suitable for every shell.
- Do not use the visual strip as the only accessible indication that an operation is in progress.

## Evidence

Source verified against current `Dev` `AppBusyIndicator.razor` and `ServiceCollectionExtensions.AddBluentUtilities`.