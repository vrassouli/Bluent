using Bluent.UI.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services.Abstractions;

public interface IPopoverService
{
    //event EventHandler<SetTriggerPopoverEventArgs>? OnSetTrigger;
    //event EventHandler<DestroyPopoverEventArgs>? OnDestroy;
    //event EventHandler<ShowPopoverSurfaceEventArgs>? OnShowSurface;
    //event EventHandler<HidePopoverSurfaceEventArgs>? OnHideSurface;

    void Destroy(string triggerId);
    void Close(string triggerId);
    void SetTrigger(RenderFragment content, PopoverConfiguration config);
    void Show(string triggerId);
    void RefreshSurface(string triggerId);
}
