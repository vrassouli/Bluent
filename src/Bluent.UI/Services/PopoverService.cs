using Bluent.UI.Components;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services;

internal class PopoverService : IPopoverService
{
    public event EventHandler<SetTriggerPopoverEventArgs>? OnSetTrigger;
    public event EventHandler<ShowPopoverSurfaceEventArgs>? OnShowPopoverSurface;
    public event EventHandler<DestroyPopoverEventArgs>? OnDestroy;

    public void SetTrigger(PopoverConfiguration config)
    {
        OnSetTrigger?.Invoke(this, new SetTriggerPopoverEventArgs(config));
    }

    public void ShowSurface(PopoverConfiguration config)
    {
        OnShowPopoverSurface?.Invoke(this, new ShowPopoverSurfaceEventArgs(config));
    }

    public void Destroy(string triggerId)
    {
        OnDestroy?.Invoke(this, new DestroyPopoverEventArgs(triggerId));
    }
}
