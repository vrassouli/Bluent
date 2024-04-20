using Bluent.UI.Components;
using Bluent.UI.Components.PopoverComponent;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services;

internal class PopoverService : IPopoverService
{
    public event EventHandler<SetTriggerPopoverEventArgs>? OnSetTrigger;
    public event EventHandler<ShowPopoverSurfaceEventArgs>? OnShowSurface;
    public event EventHandler<DestroyPopoverEventArgs>? OnDestroy;
    public event EventHandler<HidePopoverSurfaceEventArgs>? OnHideSurface;
    public event EventHandler<HideRefreshSurfaceEventArgs>? OnRefreshSurface;

    public void SetTrigger(RenderFragment content, PopoverConfiguration config)
    {
        var context = new PopoverContext(content, config);
        OnSetTrigger?.Invoke(this, new SetTriggerPopoverEventArgs(context));
    }

    public void Show(string triggerId)
    {
        OnShowSurface?.Invoke(this, new ShowPopoverSurfaceEventArgs(triggerId));
    }

    public void Destroy(string triggerId)
    {
        OnDestroy?.Invoke(this, new DestroyPopoverEventArgs(triggerId));
    }

    public void Close(string triggerId)
    {
        OnHideSurface?.Invoke(this, new HidePopoverSurfaceEventArgs(triggerId));
    }

    public void RefreshSurface(string triggerId)
    {
        OnRefreshSurface?.Invoke(this, new HideRefreshSurfaceEventArgs(triggerId));
    }
}
