using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Button
{
    //private Popover? _dropdownPopover;

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
    [Parameter] public bool ShowDropdownIndicator { get; set; } = true;
    [Parameter] public RenderFragment? Dropdown { get; set; }
    [CascadingParameter] public Popover? ParentPopover { get; set; }
    [CascadingParameter] public Overflow? Overflow { get; set; } = default!;

    private bool IsLink => !string.IsNullOrEmpty(Href);
    private bool IsDropdownButton => Dropdown != null && !OnClick.HasDelegate;
    private bool IsSplitButton => Dropdown != null && OnClick.HasDelegate;

    public override IEnumerable<string> GetClasses()
    {
        if (Overflow is Toolbar)
            yield return "bui-toolbar-button";
        else
            yield return "bui-button";

        if (string.IsNullOrEmpty(Text))
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
        if (firstRender)
        {
            ParentPopover?.SetTrigger(this);
            //_dropdownPopover?.SetTrigger(this);
        }
        base.OnAfterRender(firstRender);
    }

    private string GetButtonTag()
    {
        if (IsLink)
            return "a";

        return "button";
    }

    private string GetDropdownIcon()
    {
        if (ParentPopover is null)
            throw new InvalidOperationException("Dropdown button needs to be nested in a Popover");

        return ParentPopover.Placement switch
        {
            (Placement.Top or Placement.TopStart or Placement.TopEnd) => "caret_up",
            (Placement.Right or Placement.RightStart or Placement.RightEnd) => "caret_right",
            (Placement.Left or Placement.LeftStart or Placement.LeftEnd) => "caret_left",
            _ => "caret_down"
        } ;
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
