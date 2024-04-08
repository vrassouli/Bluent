using Bluent.UI.Components.OverflowComponent;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public class ToolbarButton : BluentComponentBase, IOverflowItem
{
    [Parameter] public string Text { get; set; } = default!;
    [Parameter] public string? MenuLabel { get; set; }
    [Parameter] public string Icon {  get; set; } = default!;
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter] public string? ActiveIcon { get; set; }
    [Parameter] public ToolbarButtonAppearance Appearance { get; set; } = ToolbarButtonAppearance.Default;
    [CascadingParameter] public Overflow Overflow { get; set; } = default!;

    protected override void OnInitialized()
    {
        if (Overflow is null)
            throw new InvalidOperationException($"'{nameof(ToolbarButton)}' component should be nested inside a '{nameof(Components.Overflow)}' component.");

        Overflow.Add(this);

        base.OnInitialized();
    }

    public override void Dispose()
    {
        Overflow.Remove(this);

        base.Dispose();
    }
}
