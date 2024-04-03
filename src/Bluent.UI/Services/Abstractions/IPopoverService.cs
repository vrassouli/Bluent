using Bluent.UI.Components;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services.Abstractions;

internal interface IPopoverService
{
    event EventHandler<SetTriggerPopoverEventArgs>? OnSetTrigger;
    event EventHandler<DestroyPopoverEventArgs>? OnDestroy;
    event EventHandler<ShowPopoverSurfaceEventArgs>? OnShowPopoverSurface;

    void Destroy(string triggerId);
    void SetTrigger(PopoverConfiguration config);
}
