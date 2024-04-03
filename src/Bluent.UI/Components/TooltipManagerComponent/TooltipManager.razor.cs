using Bluent.UI.Extensions;
using Bluent.UI.Interops;
using Bluent.UI.Interops.Abstractions;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Bluent.UI.Components.TooltipManagerComponent;

public partial class TooltipManager : IPopoverEventHandler, IAsyncDisposable
{
    List<PopoverConfiguration> _popovers = new();
    private PopoverInterop? _interop;

    [Inject] private ITooltipService Service { get; set; } = default!;
    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;

    [JSInvokable]
    public void RenderSurface(PopoverSettings settings)
    {
        var config = _popovers.FirstOrDefault(x => x.Settings.TriggerId == settings.TriggerId);
        if (config != null)
            config.Visible = true;

        StateHasChanged();
    }

    [JSInvokable]
    public void HideSurface(PopoverSettings settings)
    {
        var config = _popovers.FirstOrDefault(x => x.Settings.TriggerId == settings.TriggerId);
        if (config != null)
            config.Visible = false;

        StateHasChanged();
    }

    protected override void OnInitialized()
    {
        if (Service == null)
            throw new InvalidOperationException($"Required '{nameof(IPopoverService)}' service is not found. You should register '{nameof(Bluent)}' services using 'services.{nameof(ServiceCollectionExtensions.AddBluentUI)}' extension method.");

        _interop = new PopoverInterop(this, JsRuntime);

        Service.OnSetTrigger += PopoverOnSet;
        Service.OnShowSurface += PopoverOnShowSurface;
        Service.OnDestroy += PopoverOnDestroy;
        base.OnInitialized();
    }

    public async ValueTask DisposeAsync()
    {
        if (_interop != null)
            await _interop.DisposeAsync();

        Service.OnSetTrigger -= PopoverOnSet;
        Service.OnShowSurface -= PopoverOnShowSurface;
        Service.OnDestroy -= PopoverOnDestroy;
    }

    private void PopoverOnSet(object? sender, SetTriggerPopoverEventArgs args)
    {
        var existing = _popovers.FirstOrDefault(x => x.Settings.TriggerId == args.Config.Settings.TriggerId);
        if (existing != null)
            _popovers.Remove(existing);

        _popovers.Add(args.Config);
        _interop?.SetPopover(args.Config.Settings);
    }

    private void PopoverOnShowSurface(object? sender, ShowPopoverSurfaceEventArgs args)
    {
        var config = _popovers.FirstOrDefault(x => x.Settings.TriggerId == args.TriggerId);
        if (config != null)
            _interop?.ShowSurface(config.Settings);
    }

    private void PopoverOnDestroy(object? sender, DestroyPopoverEventArgs args)
    {
        var config = _popovers.FirstOrDefault(x => x.Settings.TriggerId == args.TriggerId);
        if (config != null)
            _popovers.Remove(config);

        StateHasChanged();
    }
}
