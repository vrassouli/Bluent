using Bluent.UI.Components;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;

namespace Bluent.UI.Services;

internal class PopoverService : IPopoverService
{
    public event EventHandler<SetTriggerPopoverEventArgs>? OnSetTrigger;
    public event EventHandler<ShowPopoverSurfaceEventArgs>? OnShowSurface;
    public event EventHandler<DestroyPopoverEventArgs>? OnDestroy;
    public event EventHandler<HidePopoverSurfaceEventArgs>? OnHideSurface;

    public void SetTrigger(PopoverConfiguration config)
    {
        OnSetTrigger?.Invoke(this, new SetTriggerPopoverEventArgs(config));
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
}
