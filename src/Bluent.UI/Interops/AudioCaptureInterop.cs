using Bluent.UI.Interops.Abstractions;
using Microsoft.JSInterop;

namespace Bluent.UI.Interops;

internal class AudioCaptureInterop : IAsyncDisposable
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;
    private readonly IAudioCaptureEventHandler _handler;
    private readonly string _id;
    private readonly string _format;
    private IJSObjectReference? _module;
    private IJSObjectReference? _audioCaptureReference;
    private DotNetObjectReference<IAudioCaptureEventHandler>? _handlerReference;

    private DotNetObjectReference<IAudioCaptureEventHandler> HandlerReference
    {
        get
        {
            if (_handlerReference == null)
                _handlerReference = DotNetObjectReference.Create(_handler);

            return _handlerReference;
        }
    }

    public AudioCaptureInterop(IAudioCaptureEventHandler handler, IJSRuntime jsRuntime, string id, string format)
    {
        _handler = handler;
        _id = id;
        _format = format;
        _moduleTask = new(() =>
            jsRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/Bluent.UI/bluent.ui.js").AsTask());
    }

    public async ValueTask DisposeAsync()
    {
        try
        {
            if (_audioCaptureReference != null)
                await _audioCaptureReference.DisposeAsync();

            if (_module != null)
                await _module.DisposeAsync();

            if (_handlerReference != null)
                _handlerReference.Dispose();
        }
        catch (Exception)
        {
            // swallow!
        }
    }

    public async Task<bool> IsSupportedAsync()
    {
        var module = await GetModuleAsync();
        return await module.InvokeAsync<bool>("isSupported");
    }

    public async void Stop()
    {
        try
        {
            var module = await GetModuleAsync();
            await module.InvokeVoidAsync("stop");
        }
        catch
        {
            // swallow!
        }
    }

    public async Task<bool> RecordAsync()
    {
        var module = await GetModuleAsync();
        return await module.InvokeAsync<bool>("record");
    }

    private async Task<IJSObjectReference> GetModuleAsync()
    {
        if (_module == null)
            _module = await _moduleTask.Value;

        if (_audioCaptureReference == null)
            _audioCaptureReference =
                await _module.InvokeAsync<IJSObjectReference>("AudioCapture.create", HandlerReference, _id, _format);

        return _audioCaptureReference;
    }
}