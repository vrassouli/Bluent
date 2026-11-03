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
    internal event Func<object?, ShowPopoverSurfaceEventArgs, Task>? OnShowSurfaceAsync;
    public event EventHandler<DestroyPopoverEventArgs>? OnDestroy;
    public event EventHandler<HidePopoverSurfaceEventArgs>? OnHideSurface;
    internal event Func<object?, HidePopoverSurfaceEventArgs, Task>? OnHideSurfaceAsync;
    public event EventHandler<RefreshPopoverSurfaceEventArgs>? OnRefreshSurface;

    public void SetTrigger(RenderFragment content, PopoverConfiguration config)
    {
        var context = new PopoverContext(content, config);
        OnSetTrigger?.Invoke(this, new SetTriggerPopoverEventArgs(context));
    }

    public void Show(string triggerId)
    {
        OnShowSurface?.Invoke(this, new ShowPopoverSurfaceEventArgs(triggerId));
    }

    internal async Task ShowAsync(string triggerId)
    {
        var args = new ShowPopoverSurfaceEventArgs(triggerId);
        var handlers = OnShowSurfaceAsync;
        if (handlers is null)
        {
            Show(triggerId);
            return;
        }

        foreach (var handler in handlers.GetInvocationList().Cast<Func<object?, ShowPopoverSurfaceEventArgs, Task>>())
            await handler(this, args);
    }

    public void Destroy(string triggerId)
    {
        OnDestroy?.Invoke(this, new DestroyPopoverEventArgs(triggerId));
    }

    public void Close(string triggerId)
    {
        OnHideSurface?.Invoke(this, new HidePopoverSurfaceEventArgs(triggerId));
    }

    internal async Task CloseAsync(string triggerId)
    {
        var args = new HidePopoverSurfaceEventArgs(triggerId);
        var handlers = OnHideSurfaceAsync;
        if (handlers is null)
        {
            Close(triggerId);
            return;
        }

        foreach (var handler in handlers.GetInvocationList().Cast<Func<object?, HidePopoverSurfaceEventArgs, Task>>())
            await handler(this, args);
    }

    public void RefreshSurface(string triggerId)
    {
        OnRefreshSurface?.Invoke(this, new RefreshPopoverSurfaceEventArgs(triggerId));
    }
}
