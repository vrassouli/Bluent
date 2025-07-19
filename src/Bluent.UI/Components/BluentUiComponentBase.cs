using Bluent.Core;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public abstract class BluentUiComponentBase : BluentComponentBase, IDisposable
{
    [Parameter] public string? Tooltip { get; set; }
    [Parameter] public RenderFragment? TooltipContent { get; set; }
    [Parameter] public Placement TooltipPlacement { get; set; } = Placement.Top;
    [Parameter] public PopoverAppearance TooltipAppearance { get; set; } = PopoverAppearance.Default;
    [Parameter] public bool DisplayTooltipArrow { get; set; }

    [Inject] private ITooltipService TooltipService { get; set; } = default!;

    protected bool IsDisabled => AdditionalAttributes?.ContainsKey("disabled") == true &&
        AdditionalAttributes["disabled"] != null &&
        AdditionalAttributes["disabled"] is bool b &&
        b != false;

    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender)
            RegisterTooltip();

        base.OnAfterRender(firstRender);
    }

    public virtual void Dispose()
    {
        RemoveTooltip();
    }

    private void RegisterTooltip()
    {
        if (TooltipContent == null && string.IsNullOrEmpty(Tooltip))
            return;

        var setting = new PopoverSettings(Id, TooltipPlacement, 6, 5) { 
            TriggerEvents = ["mouseenter", "focus"],
            HideEvents = ["mouseleave", "blure"],
        };
        TooltipService.SetTrigger(GetTooltipFragment(), new PopoverConfiguration(setting, DisplayTooltipArrow, TooltipAppearance, false));
    }

    private void RemoveTooltip()
    {
        if (TooltipContent != null || string.IsNullOrEmpty(Tooltip))
            TooltipService.Destroy(Id);
    }

    private RenderFragment GetTooltipFragment()
    {
        if (TooltipContent != null)
            return TooltipContent;

        return builder => {
            builder.OpenElement(0, "span");
            builder.AddContent(1, Tooltip);
            builder.CloseElement();
        };
    }
}
