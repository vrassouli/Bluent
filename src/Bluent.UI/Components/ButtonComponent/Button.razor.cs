using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Button
{
    [Parameter] public string? Text { get; set; }
    [Parameter] public string? SecondaryText { get; set; }
    [Parameter] public string? Icon { get; set; }
    [Parameter] public string? ActiveIcon { get; set; }
    [Parameter] public bool? Toggled { get; set; } = null;
    [Parameter] public EventCallback<bool> ToggledChanged { get; set; }
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter] public ButtonShape Shape { get; set; } = ButtonShape.Rounded;
    [Parameter] public ButtonAppearance Appearance { get; set; } = ButtonAppearance.Default;
    [Parameter] public ButtonSize Size { get; set; } = ButtonSize.Medium;
    [Parameter] public string? Href { get; set; }
    [CascadingParameter] public Popover? Popover { get; set; }

    private bool IsLink => !string.IsNullOrEmpty(Href);

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-button";

        if (string.IsNullOrEmpty(Text) && !string.IsNullOrEmpty(Icon))
            yield return "icon";

        if (!string.IsNullOrEmpty(SecondaryText))
            yield return "compound";

        if (Toggled == true)
            yield return "toggled";

        if (Shape != ButtonShape.Rounded)
            yield return Shape.ToString().Kebaberize();

        if (Appearance != ButtonAppearance.Default)
            yield return Appearance.ToString().Kebaberize();

        if (Size != ButtonSize.Medium)
            yield return Size.ToString().Kebaberize();
    }

    protected override void OnAfterRender(bool firstRender)
    {
        if(firstRender && Popover != null)
            Popover.SetTrigger(this);

        base.OnAfterRender(firstRender);
    }

    private string GetButtonTag()
    {
        if (IsLink)
            return "a";

        return "button";
    }

    private void ClickHandler()
    {
        if (Toggled != null)
        {
            Toggled = !Toggled.Value;
            InvokeAsync(() => ToggledChanged.InvokeAsync(Toggled.Value));
        }
        else
        {
            InvokeAsync(OnClick.InvokeAsync);
        }
    }
}
