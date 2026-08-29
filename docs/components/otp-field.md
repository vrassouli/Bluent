# OtpField

`OtpField` captures a short numeric verification code across one visual cell per digit while binding a single string value.

## When to use

Use `OtpField` for one-time passwords, verification codes, PIN-like short numeric tokens, or similar fixed-length codes. Use `TextField` when the value is ordinary text or when per-digit UI is unnecessary.

## Package and namespace

```bash
dotnet add package Bluent.UI
```

```razor
@using Bluent.UI.Components
```

Follow [Getting Started](../getting-started/index.md) for standard Bluent services and static assets. `OtpField` has a component-specific JavaScript interop dependency initialized after first render.

## Minimal example

```razor
<OtpField @bind-Value="_code" Length="6" />
```

The Fields showcase compiles the default binding pattern. This page is source/demo verified; JavaScript/runtime behavior was not newly exercised.

## Parameters

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `Length` | `int` | `4` | No | Number of visible digit cells. Rendering uses at least one cell even when a smaller value is supplied. |
| `Password` | `bool` | `false` | No | Renders each visible cell with `type="password"` instead of `text`. |
| `AutoSubmit` | `bool` | `false` | No | Passed to the OTP JavaScript behavior through `data-otp-auto-submit`; exact submit behavior requires runtime verification. |
| `BindValueEvent` | `string` | `"onchange"` | No | Passed to the hidden bound input and exposed to the OTP JavaScript behavior through `data-otp-blazor-event`. |
| `Value` / `ValueChanged` / `ValueExpression` | inherited `InputBase<string?>` | standard Blazor defaults | No | Standard Blazor binding/validation contract. |
| `Class` / `Style` | inherited | `null` | No | Application CSS class and inline style. |
| Unmatched attributes | inherited | `null` | No | Applied to the outer component wrapper. |

## Events and binding

```razor
<OtpField @bind-Value="_verificationCode"
          Length="6"
          AutoSubmit />
```

The bound value is stored in a hidden input. Visible cells display only digit characters from the current value, up to `Length`. The component itself exposes no additional EventCallback beyond the standard `InputBase<string?>` binding contract.

## Child content and composition

`OtpField` exposes no generic child-content or addon slots in its current markup.

## Services and containers

The component injects `IJSRuntime` and creates an `OptFieldInterop` instance after first render. It disposes that interop object asynchronously. No `<Containers />` dependency is present.

## Styling and theming

Use the standard Bluent theme/component CSS. The component renders one wrapper, one cell wrapper per digit, and a hidden bound input. Treat internal CSS/data attributes as implementation details unless explicitly documented for application integration.

## Localization and RTL

The source hard-codes the group accessible label `Verification code` and per-cell labels `Digit N of Length`; these strings are not currently localized. Digit cells use numeric input mode but the component does not expose a culture parameter. RTL/Persian visual and typing behavior has not been runtime verified.

## Accessibility and keyboard interaction

The visible cell group renders `role="group"` with `aria-label="Verification code"`. Each digit cell has an `aria-label`, `inputmode="numeric"`, `autocomplete="one-time-code"`, digit pattern, and `maxlength="1"`. Focus movement, paste distribution, backspace navigation, auto-submit behavior, and screen-reader behavior are JavaScript-dependent and must be runtime verified before stronger claims are made.

## Hosting and render modes

| Render mode | Status | Notes |
| --- | --- | --- |
| Standalone WebAssembly | Unverified | Demo compiles; JS behavior not newly runtime verified. |
| Interactive Server | Unverified | Requires JS interop after first render. |
| Interactive WebAssembly | Unverified | Requires JS interop. |
| Interactive Auto | Unverified | Requires JS interop. |
| Static SSR | Unsupported for interaction | Initial markup may render, but OTP behavior depends on interactive rendering and JS interop. |

## JavaScript and static assets

`OtpField` creates `OptFieldInterop` on first render and calls `InitializeAsync("otp{Id}")`. The interop is disposed with the component. Consumers should not add a manual script tag unless the canonical package setup explicitly requires one; use normal packaged Bluent assets.

## Common mistakes

### Assuming AutoSubmit semantics without runtime evidence

`AutoSubmit` is definitely forwarded to the JavaScript behavior, but source inspection alone does not establish which form/event is submitted. Verify the actual runtime path before relying on it.

### Treating Length as a validation rule

`Length` controls rendered cells and displayed digit count. This page does not claim that the model automatically receives a validation error when its string length differs.

### Expecting localized accessible labels

Current labels are hard-coded English strings in component markup.

## Known limitations

- JavaScript behavior is required for the intended multi-cell interaction.
- Built-in accessible labels are currently English-only.
- Auto-submit, paste, focus navigation, mobile input, RTL, and assistive-technology behavior remain runtime-unverified here.

## Related components

- `TextField`: `text-field.md`
- `MaskedField`: `masked-field.md`

## Source and verification

- Component markup: `src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor`
- Component logic: `src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor.cs`
- Interop: `src/Bluent.UI/Interops/` (`OptFieldInterop`)
- Compiled showcase: `src/Bluent.UI.Demo.Pages/Pages/Components/Fields.razor`
- Source verified against current PR branch `Dev` lineage
- Verification date: 2026-08-29
