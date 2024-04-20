using Bluent.UI.Components;
using Bluent.UI.Services.EventArguments;

namespace Bluent.UI.Services.Abstractions;

internal interface IPopoverService
{
    event EventHandler<SetTriggerPopoverEventArgs>? OnSetTrigger;
    event EventHandler<DestroyPopoverEventArgs>? OnDestroy;
    event EventHandler<ShowPopoverSurfaceEventArgs>? OnShowSurface;
    event EventHandler<HidePopoverSurfaceEventArgs>? OnHideSurface;

    void Destroy(string triggerId);
    void Close(string triggerId);
    void SetTrigger(PopoverConfiguration config);
    void Show(string triggerId);
}
