using Bluent.UI.Components.TooltipManagerComponent;
using Bluent.UI.Extensions;
using Bluent.UI.Interops;
using Bluent.UI.Interops.Abstractions;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components.PopverManagerComponent;

public partial class PopoverManager : IPopoverEventHandler, IAsyncDisposable
{
    List<PopoverConfiguration> _popovers = new();
    private PopoverInterop? _interop;

    [Inject] private IPopoverService Service { get; set; } = default!;
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
    public void DestroySurface(PopoverSettings settings)
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
        Service.OnShowPopoverSurface += PopoverOnShowPopoverSurface;
        Service.OnDestroy += PopoverOnDestroy;
        base.OnInitialized();
    }

    public async ValueTask DisposeAsync()
    {
        if (_interop != null)
            await _interop.DisposeAsync();

        Service.OnSetTrigger -= PopoverOnSet;
        Service.OnShowPopoverSurface -= PopoverOnShowPopoverSurface;
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

    private void PopoverOnShowPopoverSurface(object? sender, ShowPopoverSurfaceEventArgs args)
    {
        _interop?.ShowSurface(args.Config.Settings);
    }

    private void PopoverOnDestroy(object? sender, DestroyPopoverEventArgs args)
    {
        var config = _popovers.FirstOrDefault(x => x.Settings.TriggerId == args.TriggerId);
        if (config != null)
            _popovers.Remove(config);

        StateHasChanged();
    }
}
