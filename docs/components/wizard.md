# Wizard and WizardStep

`Wizard` composes an ordered multi-step workflow from nested `WizardStep` components, with optional built-in navigation buttons and step-title navigation.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<Wizard @bind-CurrentStep="_step"
        OnDone="FinishAsync">
    <WizardStep Title="Details">
        Details content
    </WizardStep>
    <WizardStep Title="Review">
        Review content
    </WizardStep>
</Wizard>
```

## Wizard API

| Parameter | Type | Default / notes |
| --- | --- | --- |
| `ChildContent` | `RenderFragment?` | nested steps |
| `Orientation` | `Orientation` | `Horizontal` |
| `DisplayStepTitles` | `bool` | `true` |
| `StepTitleClass` | `string?` | optional title class |
| `DisplayNavigationButtons` | `bool` | `true` |
| `NavigateOnStepClick` | `bool` | `false` |
| `LabelNext` | `string` | `"Next"` |
| `LabelPrevious` | `string` | `"Previous"` |
| `LabelCancel` | `string` | `"Cancel"` |
| `LabelDone` | `string` | `"Done"` |
| `SubmitWhenDone` | `bool` | `false` |
| `CanCancel` | `bool` | `false` |
| `AllowNext` | `bool` | `true` |
| `AllowPrevious` | `bool` | `true` |
| `CurrentStep` | `int` | `0` |
| `CurrentStepChanged` | `EventCallback<int>` | binding callback |
| `OnNext` / `OnDone` / `OnPrevious` / `OnCancel` | `EventCallback` | navigation lifecycle callbacks |

## WizardStep API

| Parameter | Type | Notes |
| --- | --- | --- |
| `Title` | `string?` | optional step title |
| `ChildContent` | `RenderFragment?` | step body |
| `DeferredLoading` | `bool` | controls deferred body rendering |
| `Index` | `int?` | optional requested insertion index |
| `IndexChanged` | `EventCallback<int?>` | receives actual/updated index |

A `WizardStep` must be nested in a `Wizard`. It registers asynchronously with the parent, can be inserted at a requested index, receives index updates when later insertions shift it, and unregisters on disposal.

## Navigation behavior

Next behavior is source-defined:

- when not on the last step, `OnNext` is awaited;
- on the last step with `SubmitWhenDone=false`, `OnDone` is awaited;
- the component then advances/clamps `CurrentStep`.

Previous awaits `OnPrevious`, then decrements/clamps the step. Step-title click changes the current step only when `NavigateOnStepClick=true`. Cancel only invokes `OnCancel`.

`AllowNext` and `AllowPrevious` control the built-in navigation allowance/disabled path; they are not async validation delegates. Application code must update them or handle events according to its validation workflow.

`SubmitWhenDone=true` changes the last navigation control toward submit behavior in the current markup; do not describe it as automatic model persistence.

## Localization and accessibility

Default navigation labels are hard-coded English strings but are public parameters and can be localized by the consumer.

Verify step-title roles, current-step semantics, focus movement after navigation, vertical orientation, validation focus, and keyboard behavior in the target host. Source state management alone does not establish a complete ARIA stepper pattern.

## Evidence boundary

Source verified from `Wizard.razor(.cs)` and `WizardStep.razor(.cs)`. Do not invent per-step async validators, automatic persistence, route synchronization, or completed-step state APIs absent from current source.
