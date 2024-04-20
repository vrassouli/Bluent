using Bluent.UI.Components.PopoverComponent;
using Bluent.UI.Extensions;
using Bluent.UI.Interops;
using Bluent.UI.Interops.Abstractions;
using Bluent.UI.Services;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Bluent.UI.Components.TooltipComponent;

public partial class TooltipContainer //: IPopoverEventHandler, IAsyncDisposable
{
    //List<PopoverContext> _contexts = new();
    //private PopoverInterop? _interop;

    //[Inject] private ITooltipService Service { get; set; } = default!;
    //[Inject] private IJSRuntime JsRuntime { get; set; } = default!;

    //[JSInvokable]
    //public void RenderSurface(PopoverSettings settings)
    //{
    //    var config = _contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == settings.TriggerId);
    //    if (config != null)
    //        config.Config.Visible = true;

    //    StateHasChanged();
    //}

    //[JSInvokable]
    //public void HideSurface(PopoverSettings settings)
    //{
    //    var config = _contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == settings.TriggerId);
    //    if (config != null)
    //        config.Config.Visible = false;

    //    StateHasChanged();
    //}

    //protected override void OnInitialized()
    //{
    //    if (Service is not PopoverService service)
    //        throw new InvalidOperationException($"Required '{nameof(IPopoverService)}' service is not found. You should register '{nameof(Bluent)}' services using 'services.{nameof(ServiceCollectionExtensions.AddBluentUIAsScoped)}' extension method.");

    //    _interop = new PopoverInterop(this, JsRuntime);

    //    service.OnSetTrigger += PopoverOnSet;
    //    service.OnShowSurface += PopoverOnShowSurface;
    //    service.OnHideSurface += PopoverOnHideSurface;
    //    service.OnDestroy += PopoverOnDestroy;
    //    service.OnRefreshSurface += PopoverOnRefreshSurface;
    //    base.OnInitialized();
    //}

    //public async ValueTask DisposeAsync()
    //{
    //    if (_interop != null)
    //        await _interop.DisposeAsync();

    //    Service.OnSetTrigger -= PopoverOnSet;
    //    Service.OnShowSurface -= PopoverOnShowSurface;
    //    Service.OnDestroy -= PopoverOnDestroy;
    //}

    //private void PopoverOnSet(object? sender, SetTriggerPopoverEventArgs args)
    //{
    //    var existing = _contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == args.Context.Config.Settings.TriggerId);
    //    if (existing != null)
    //        _contexts.Remove(existing);

    //    _contexts.Add(args.Context);
    //    _interop?.SetPopover(args.Context.Config.Settings);
    //}

    //private void PopoverOnShowSurface(object? sender, ShowPopoverSurfaceEventArgs args)
    //{
    //    var config = _contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == args.TriggerId);
    //    if (config != null)
    //        _interop?.ShowSurface(config.Config.Settings);
    //}

    //private void PopoverOnDestroy(object? sender, DestroyPopoverEventArgs args)
    //{
    //    var config = _contexts.FirstOrDefault(x => x.Config.Settings.TriggerId == args.TriggerId);
    //    if (config != null)
    //        _contexts.Remove(config);

    //    StateHasChanged();
    //}
}
