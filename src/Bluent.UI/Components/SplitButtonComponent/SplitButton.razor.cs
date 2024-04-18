using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class SplitButton
{
    [Parameter] public string? Text { get; set; }
    [Parameter] public string? Icon { get; set; }
    [Parameter] public string? ActiveIcon { get; set; }
    [Parameter] public ButtonShape Shape { get; set; } = ButtonShape.Rounded;
    [Parameter] public ButtonAppearance Appearance { get; set; } = ButtonAppearance.Default;
    [Parameter] public ButtonSize Size { get; set; } = ButtonSize.Medium;
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter, EditorRequired] public RenderFragment? DropdownContent { get; set; }


    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-split-button";
    }
}
