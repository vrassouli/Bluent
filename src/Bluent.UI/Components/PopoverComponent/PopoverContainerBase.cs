using Bluent.UI.Extensions;
using Bluent.UI.Interops.Abstractions;
using Bluent.UI.Interops;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Bluent.UI.Services;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components.PopoverComponent;

public class PopoverContainerBase<TPopoverService> : ComponentBase, IPopoverEventHandler, IAsyncDisposable
    where TPopoverService : IPopoverService
{
    protected List<PopoverContext> Contexts { get; } = new();
    private PopoverInterop? _interop;

    [Inject] private TPopoverService Service { get; set; } = default!;
    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;

    [JSInvokable]
    public void RenderSurface(PopoverSettings settings)
    {
        var context = Contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == settings.TriggerId);
        if (context != null && !context.Config.Visible)
        {
            context.Config.Visible = true;

            StateHasChanged();
        }
    }

    [JSInvokable]
    public void HideSurface(PopoverSettings settings)
    {
        var contextx = Contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == settings.TriggerId);
        if (contextx != null && contextx.Config.Visible)
        {
            contextx.Config.Visible = false;

            StateHasChanged();
        }
    }

    protected override void OnInitialized()
    {
        if (Service is not PopoverService service)
            throw new InvalidOperationException($"Required '{nameof(IPopoverService)}' service is not found. You should register '{nameof(Bluent)}' services using 'services.{nameof(ServiceCollectionExtensions.AddBluentUIAsScoped)}' extension method.");

        _interop = new PopoverInterop(this, JsRuntime);

        service.OnSetTrigger += PopoverOnSet;
        service.OnShowSurface += PopoverOnShowSurface;
        service.OnHideSurface += PopoverOnHideSurface;
        service.OnDestroy += PopoverOnDestroy;
        service.OnRefreshSurface += PopoverOnRefreshSurface;
        base.OnInitialized();
    }

    public async ValueTask DisposeAsync()
    {
        if (_interop != null)
            await _interop.DisposeAsync();

        if (Service is PopoverService service)
        {
            service.OnSetTrigger -= PopoverOnSet;
            service.OnShowSurface -= PopoverOnShowSurface;
            service.OnHideSurface -= PopoverOnHideSurface;
            service.OnDestroy -= PopoverOnDestroy;
            service.OnRefreshSurface -= PopoverOnRefreshSurface;
        }
    }

    private void PopoverOnSet(object? sender, SetTriggerPopoverEventArgs args)
    {
        var existing = Contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == args.Context.Config.Settings.TriggerId);
        if (existing != null)
            Contexts.Remove(existing);

        Contexts.Add(args.Context);
        _interop?.SetPopover(args.Context.Config.Settings);

        if (args.Context.Config.KeepSurface)
        {
            args.Context.Config.Visible = false;
            StateHasChanged();
        }
    }

    private void PopoverOnShowSurface(object? sender, ShowPopoverSurfaceEventArgs args)
    {
        var context = Contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == args.TriggerId);
        if (context != null)
            _interop?.ShowSurface(context.Config.Settings);
        else
            Console.WriteLine($"config not found for triggerId: {args.TriggerId}");
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
            Contexts.Remove(context);

        StateHasChanged();
    }

    private void PopoverOnRefreshSurface(object? sender, RefreshPopoverSurfaceEventArgs args)
    {
        var context = Contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == args.TriggerId);
        if (context?.SurfaceReference != null)
            context.SurfaceReference.Refresh();
    }
}