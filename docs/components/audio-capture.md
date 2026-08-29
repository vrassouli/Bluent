# AudioCapture

`AudioCapture` is Bluent's browser microphone-recording control. It is JS/media-device dependent and returns the captured audio buffer through an event callback.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<AudioCapture Text="Record"
              CaptureStarted="OnStarted"
              CaptureEnded="OnCaptured"
              NotSupported="OnUnsupported"
              NotAvailable="OnUnavailable" />
```

## Public API

| Parameter | Type | Default / notes |
| --- | --- | --- |
| `Text` | `string?` | optional button text |
| `Icon` | `IconDefinition` | `FluentIcons.Mic` |
| `Format` | `string` | `"audio/mp3"` |
| `Appearance` | `ButtonAppearance` | `Default` |
| `CaptureStarted` | `EventCallback` | invoked after recording successfully starts |
| `CaptureEnded` | `EventCallback<byte[]>` | receives the JS-captured byte buffer |
| `NotSupported` | `EventCallback` | invoked when initial browser support probe fails |
| `NotAvailable` | `EventCallback` | invoked when recording cannot start, including unavailable/denied capture paths reported by interop |

## Runtime lifecycle

The component creates `AudioCaptureInterop` during initialization. On first render it awaits `IsSupportedAsync()`; unsupported browsers update internal support state, invoke `NotSupported`, and rerender.

Click behavior toggles recording:

- when idle, `RecordAsync()` is called; success sets recording state and invokes `CaptureStarted`, failure invokes `NotAvailable`;
- when recording, `Stop()` is called and local recording state is cleared;
- JS calls the `[JSInvokable] OnAudioCaptured(byte[] buffer)` method, which forwards the buffer through `CaptureEnded`.

Interop is disposed with the component.

## Browser/security requirements

Microphone capture depends on browser media APIs, user permission, secure-context/origin policy, device availability, and format support. Static SSR cannot provide recording behavior. Treat this component as high-risk runtime functionality and test the actual target browser/hosting mode.

The default `Format="audio/mp3"` is a requested interop format; do not infer universal browser encoder support from that default.

## Accessibility

The visible control is Button-based, but recording status/permission errors are not automatically exposed as a live region by the source reviewed here. Applications should provide accessible state/feedback appropriate to the recording workflow.

## Evidence boundary

Source verified from `AudioCapture.razor(.cs)` and `AudioCaptureInterop` usage contract. Do not invent stream APIs, maximum duration, waveform, playback, file persistence, permission preflight guarantees, or cross-browser format support without runtime evidence.
