using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Bluent.UI.Components;

public class ToolbarButton : OverflowItemComponentBase
{
    [Parameter] public string Text { get; set; } = default!;
    [Parameter] public string? MenuLabel { get; set; }
    [Parameter] public string Icon { get; set; } = default!;
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter] public string? ActiveIcon { get; set; }
    [Parameter] public string? Href { get; set; }
    [Parameter] public RenderFragment? Dropdown { get; set; }
    [Parameter] public bool ShowDropdownIndicator { get; set; }
    [Parameter] public bool? Toggled { get; set; }
    [Parameter] public EventCallback<bool> ToggledChanged { get; set; }
    [Parameter] public Placement DropdownPlacement { get; set; } = Placement.Bottom;
    [Parameter] public ToolbarButtonAppearance Appearance { get; set; } = ToolbarButtonAppearance.Default;

    protected override void RenderOverflowItem(RenderTreeBuilder builder)
    {
        builder.OpenComponent<Button>(0);

        builder.AddAttribute(1, nameof(Text), Text);
        builder.AddAttribute(2, nameof(Icon), Icon);
        builder.AddAttribute(3, nameof(ActiveIcon), ActiveIcon);
        builder.AddAttribute(4, nameof(Href), Href);
        builder.AddAttribute(5, nameof(Appearance), Enum.Parse<ButtonAppearance>(Appearance.ToString()));
        builder.AddAttribute(6, nameof(Dropdown), Dropdown);
        builder.AddAttribute(7, nameof(ShowDropdownIndicator), ShowDropdownIndicator);
        builder.AddAttribute(8, nameof(DropdownPlacement), DropdownPlacement);
        builder.AddAttribute(9, nameof(OnClick), OnClick);
        builder.AddAttribute(10, nameof(Tooltip), Tooltip);
        builder.AddAttribute(11, nameof(Class), Class);
        builder.AddAttribute(12, nameof(Style), Style);
        builder.AddAttribute(13, nameof(Toggled), Toggled);
        builder.AddAttribute(13, nameof(ToggledChanged), ToggledChanged);
        builder.AddMultipleAttributes(14, AdditionalAttributes);

        builder.CloseComponent();
    }

    protected override void RenderOverflowMenuItem(RenderTreeBuilder builder)
    {
        builder.OpenComponent<MenuItem>(0);

        builder.AddAttribute(1, nameof(MenuItem.Title), MenuLabel ?? Text);
        builder.AddAttribute(2, nameof(MenuItem.Icon), Icon);
        builder.AddAttribute(3, nameof(MenuItem.ActiveIcon), ActiveIcon);
        builder.AddAttribute(4, nameof(MenuItem.Href), Href);
        builder.AddAttribute(5, nameof(MenuItem.OnClick), OnClick);
        builder.AddAttribute(6, nameof(MenuItem.ChildContent), Dropdown);
        builder.AddAttribute(6, nameof(MenuItem.Checked), Toggled);
        builder.AddAttribute(7, nameof(Class), Class);
        builder.AddAttribute(8, nameof(Style), Style);
        builder.AddMultipleAttributes(9, AdditionalAttributes);

        builder.CloseComponent();
    }
}
