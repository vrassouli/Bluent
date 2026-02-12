using Bluent.UI.Interops;
using Bluent.UI.Interops.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Bluent.UI.Components;

public partial class AudioCapture : IAudioCaptureEventHandler, IAsyncDisposable
{
    bool _recording = false;
    bool _isSupported = true;
    private AudioCaptureInterop _interop = default!;

    [Parameter] public string? Text { get; set; }
    [Parameter] public string? Icon { get; set; } = "icon-ic_fluent_mic_20_regular";
    [Parameter] public string? ActiveIcon { get; set; } = "icon-ic_fluent_mic_20_filled";
    [Parameter] public string Format { get; set; } = "audio/mp3";
    [Parameter] public ButtonAppearance Appearance { get; set; } = ButtonAppearance.Default;
    [Parameter] public EventCallback CaptureStarted { get; set; }
    [Parameter] public EventCallback<byte[]> CaptureEnded { get; set; }
    [Parameter] public EventCallback NotSupported { get; set; }
    [Parameter] public EventCallback NotAvailable { get; set; }

    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;

    protected override void OnInitialized()
    {
        _interop = new AudioCaptureInterop(this, JsRuntime, Id, Format);

        base.OnInitialized();
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            var isSupported = await _interop.IsSupportedAsync();
            if (!isSupported)
            {
                _isSupported = isSupported;
                await NotSupported.InvokeAsync();
                StateHasChanged();
            }
        }

        await base.OnAfterRenderAsync(firstRender);
    }

    [JSInvokable]
    public void OnAudioCaptured(byte[] buffer)
    {
        InvokeAsync(() => CaptureEnded.InvokeAsync(buffer));
    }

    public override async ValueTask DisposeAsync()
    {
        await _interop.DisposeAsync();
        await base.DisposeAsync();
    }

    private async Task HandleOnClickAsync()
    {
        if (_recording)
        {
            _interop.Stop();
            _recording = false;
        }
        else
        {
            var started = await _interop.RecordAsync();
            if (started)
            {
                _recording = true;
                await CaptureStarted.InvokeAsync();
            }
            else
            {
                await NotAvailable.InvokeAsync();
            }
        }
    }
}
