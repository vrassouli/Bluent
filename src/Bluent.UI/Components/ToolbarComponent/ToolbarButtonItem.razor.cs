using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components.ToolbarComponent;

public partial class ToolbarButtonItem
{
    [Parameter] public string Text { get; set; } = default!;
    [Parameter] public string? MenuLabel { get; set; }
    [Parameter] public string Icon { get; set; } = default!;
    [Parameter] public string? ActiveIcon {  get; set; }
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter] public ToolbarButtonAppearance Appearance { get; set; } = ToolbarButtonAppearance.Default;

    public override IEnumerable<string> GetClasses()
    {
        yield return "toolbar-button";

        if (Appearance != ToolbarButtonAppearance.Default)
            yield return Appearance.ToString().Kebaberize();
    }
}
