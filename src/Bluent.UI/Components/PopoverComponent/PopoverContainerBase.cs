using Bluent.UI.Extensions;
using Bluent.UI.Interops.Abstractions;
using Bluent.UI.Interops;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Bluent.UI.Services;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Bluent.UI.Components.PopoverComponent;

public class PopoverContainerBase<TPopoverService> : ComponentBase, IPopoverEventHandler, IAsyncDisposable
    where TPopoverService : IPopoverService
{
    protected List<PopoverContext> Contexts { get; } = [];
    private PopoverInterop? _interop;
    private readonly PopoverCommandQueue _interopCommands = new();
    private bool _disposed;

    [Inject] private TPopoverService Service { get; set; } = default!;
    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;

    [JSInvokable]
    public void RenderSurface(PopoverSettings settings)
    {
        var context = Contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == settings.TriggerId);
        if (context is { Config.Visible: false })
        {
            context.Config.Visible = true;

            StateHasChanged();
        }
    }

    [JSInvokable]
    public void HideSurface(PopoverSettings settings)
    {
        var context = Contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == settings.TriggerId);
        if (context is { Config.Visible: true })
        {
            context.Config.Visible = false;

            StateHasChanged();
        }
    }

    protected override void OnInitialized()
    {
        if (Service is not PopoverService service)
            throw new InvalidOperationException($"Required '{nameof(IPopoverService)}' service is not found. You should register '{nameof(Bluent)}' services using 'services.{nameof(ServiceCollectionExtensions.AddBluentUI)}' extension method.");

        _interop = new PopoverInterop(this, JsRuntime);

        service.OnSetTrigger += PopoverOnSet;
        service.OnShowSurface += PopoverOnShowSurface;
        service.OnHideSurface += PopoverOnHideSurface;
        service.OnDestroy += PopoverOnDestroy;
        service.OnRefreshSurface += PopoverOnRefreshSurface;
        base.OnInitialized();
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (!_disposed && RendererInfo.IsInteractive && _interop is not null)
        {
            try
            {
                // The synchronous service notifications are serialized here,
                // with JS work actually awaited in the Blazor render lifecycle.
                await _interopCommands.DrainWithDestroyAsync((show, settings) =>
                    show ? _interop.ShowSurfaceAsync(settings) : _interop.SetPopoverAsync(settings),
                    triggerId => _interop.DestroyPopoverAsync(triggerId));
            }
            catch (JSDisconnectedException)
            {
                // A terminated circuit cannot process queued browser actions.
                _interopCommands.Clear();
            }
        }

        await base.OnAfterRenderAsync(firstRender);
    }

    public async ValueTask DisposeAsync()
    {
        // Subscriptions must be removed even if a JS disposal operation fails.
        _disposed = true;
        _interopCommands.Clear();
        try
        {
            if (_interop is not null)
                await _interop.DisposeAsync();
        }
        finally
        {
            if (Service is PopoverService service)
            {
                service.OnSetTrigger -= PopoverOnSet;
                service.OnShowSurface -= PopoverOnShowSurface;
                service.OnHideSurface -= PopoverOnHideSurface;
                service.OnDestroy -= PopoverOnDestroy;
                service.OnRefreshSurface -= PopoverOnRefreshSurface;
            }
        }
    }

    private void PopoverOnSet(object? sender, SetTriggerPopoverEventArgs args)
    {
        var existing = Contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == args.Context.Config.Settings.TriggerId);
        if (existing != null)
            Contexts.Remove(existing);

        Contexts.Add(args.Context);
        if (_disposed)
            return;

        _interopCommands.Enqueue(false, args.Context.Config.Settings);

        if (args.Context.Config.KeepSurface)
            args.Context.Config.Visible = false;

        // Scheduling a render is synchronous service work, not fire-and-forget
        // JavaScript. OnAfterRenderAsync drains and awaits the queued JS calls.
        if (RendererInfo.IsInteractive)
            _ = InvokeAsync(StateHasChanged);
    }

    private void PopoverOnShowSurface(object? sender, ShowPopoverSurfaceEventArgs args)
    {
        var context = Contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == args.TriggerId);
        if (context is not null && !_disposed)
        {
            _interopCommands.Enqueue(true, context.Config.Settings);
            if (RendererInfo.IsInteractive)
                _ = InvokeAsync(StateHasChanged);
        }
    }

    private void PopoverOnHideSurface(object? sender, HidePopoverSurfaceEventArgs args)
    {
        var context = Contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == args.TriggerId);
        if (context != null)
            HideSurface(context.Config.Settings);
    }

    private void PopoverOnDestroy(object? sender, DestroyPopoverEventArgs args)
    {
        var context = Contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == args.TriggerId);
        if (context != null)
        {
            Contexts.Remove(context);
            if (!_disposed)
                _interopCommands.EnqueueDestroy(context.Config.Settings);
        }

        if (!_disposed && RendererInfo.IsInteractive)
            _ = InvokeAsync(StateHasChanged);
    }

    private void PopoverOnRefreshSurface(object? sender, RefreshPopoverSurfaceEventArgs args)
    {
        var context = Contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == args.TriggerId);
        if (context?.SurfaceReference != null)
            context.SurfaceReference.Refresh();
    }
}
