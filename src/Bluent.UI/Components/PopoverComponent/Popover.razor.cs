using Bluent.UI.Extensions;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class Popover
{
    [Parameter, EditorRequired] public RenderFragment Trigger { get; set; } = default!;
    [Parameter, EditorRequired] public RenderFragment Surface { get; set; } = default!;
    [Parameter] public Placement Placement { get; set; } = Placement.Top;
    [Parameter] public bool DisplayArrow { get; set; }
    [Inject] private IPopoverService PopoverService { get; set; } = default!;

    protected override void OnInitialized()
    {
        if (Trigger == null)
            throw new InvalidOperationException($"'{nameof(Popover)}' component requires '{nameof(Trigger)}' content property.");

        if (Surface == null)
            throw new InvalidOperationException($"'{nameof(Popover)}' component requires '{nameof(Surface)}' content property.");
       
        if (PopoverService == null)
            throw new InvalidOperationException($"Required '{nameof(ITooltipService)}' service is not found. You should register '{nameof(Bluent)}' services using 'services.{nameof(ServiceCollectionExtensions.AddBluentUI)}' extension method.");

        base.OnInitialized();
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-popover";
    }

    internal void Show()
    {
        PopoverService.Show(Id, Surface, Placement, DisplayArrow);
    }
}
