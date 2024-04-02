using Bluent.UI.Extensions;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public abstract class BluentComponentBase : ComponentBase, IDisposable
{
    private Guid? _id;
    [Parameter(CaptureUnmatchedValues = true)] public Dictionary<string, object>? AdditionalAttributes { get; set; }
    [Parameter] public string? Class { get; set; }
    [Parameter] public string? Style { get; set; }
    [Parameter] public string? Tooltip { get; set; }
    [Parameter] public RenderFragment? TooltipContent { get; set; }
    [Parameter] public Placement TooltipPlacement { get; set; } = Placement.Top;
    [Parameter] public bool DisplayTooltipArrow { get; set; }

    [Inject] private ITooltipService TooltipService { get; set; } = default!;

    public string Id
    {
        get
        {
            var providedId = GetUserProvidedId();

            if (!string.IsNullOrEmpty(providedId))
                return providedId;

            _id ??= Guid.NewGuid();

            return $"_{_id}".Replace('-', '_');
        }
    }

    private string? GetUserProvidedId()
    {
        return AdditionalAttributes?.TryGetValue("id", out var attribute) is true ? attribute.ToString() : null;
    }

    public string GetComponentClass() => $"{string.Join(' ', GetClasses())} {Class}";
    
    public abstract IEnumerable<string> GetClasses();

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

        TooltipService.RegisterTooltip(Id, GetTooltipFragment(), TooltipPlacement, DisplayTooltipArrow);
    }

    private void RemoveTooltip()
    {
        if (TooltipContent != null || string.IsNullOrEmpty(Tooltip))
            TooltipService.DestroyTooltip(Id);
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
