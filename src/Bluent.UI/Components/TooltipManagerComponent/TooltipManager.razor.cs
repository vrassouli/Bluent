using Bluent.UI.Components.TooltipManagerComponent;
using Bluent.UI.Extensions;
using Bluent.UI.Interops.Abstractions;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class TooltipManager
{
    List<TooltipConfiguration> _tooltips = new();
    [Inject] private ITooltipService Service { get; set; } = default!;

    protected override void OnInitialized()
    {
        if (Service == null)
            throw new InvalidOperationException($"Required '{nameof(ITooltipService)}' service is not found. You should register '{nameof(Bluent)}' services using 'services.{nameof(ServiceCollectionExtensions.AddBluentUI)}' extension method.");

        Service.OnRegister += TooltipOnRegister;
        Service.OnRemove += TooltipOnRemove;

        base.OnInitialized();
    }

    private void TooltipOnRemove(object? sender, RemoveTooltipEventArgs args)
    {
        var config = _tooltips.FirstOrDefault(x => x.ElementId == args.ElementId);
        if (config != null)
            _tooltips.Remove(config);

        StateHasChanged();
    }

    private void TooltipOnRegister(object? sender, RegisterTooltipEventArgs args)
    {
        var existing = _tooltips.FirstOrDefault(x => x.ElementId == args.ElementId);
        if (existing != null)
            _tooltips.Remove(existing);

        var config = new TooltipConfiguration(args.ElementId,
                                              args.TooltipContent,
                                              args.Placement,
                                              args.DisplayArrow);
        _tooltips.Add(config);


        StateHasChanged();
    }
}
