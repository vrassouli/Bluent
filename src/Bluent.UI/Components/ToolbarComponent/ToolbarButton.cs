using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Bluent.UI.Components;

public class ToolbarButton : OverflowItemComponentBase
{
    [Parameter] public string Text { get; set; } = default!;
    [Parameter] public string? MenuLabel { get; set; }
    [Parameter] public string Icon { get; set; } = default!;
    [Parameter] public string IconClass { get; set; } = default!;
    [Parameter] public string TextClass { get; set; } = default!;
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

        builder.AddAttribute(1, nameof(Button.Text), Text);
        builder.AddAttribute(2, nameof(Button.TextClass), TextClass);
        builder.AddAttribute(3, nameof(Button.Icon), Icon);
        builder.AddAttribute(4, nameof(Button.IconClass), IconClass);
        builder.AddAttribute(5, nameof(Button.ActiveIcon), ActiveIcon);
        builder.AddAttribute(6, nameof(Button.Href), Href);
        builder.AddAttribute(7, nameof(Button.Appearance), Enum.Parse<ButtonAppearance>(Appearance.ToString()));
        builder.AddAttribute(8, nameof(Button.Dropdown), Dropdown);
        builder.AddAttribute(9, nameof(Button.ShowDropdownIndicator), ShowDropdownIndicator);
        builder.AddAttribute(10, nameof(Button.DropdownPlacement), DropdownPlacement);
        builder.AddAttribute(11, nameof(Button.OnClick), OnClick);
        builder.AddAttribute(12, nameof(Button.Tooltip), Tooltip);
        builder.AddAttribute(13, nameof(Button.Class), Class);
        builder.AddAttribute(14, nameof(Button.Style), Style);
        builder.AddAttribute(15, nameof(Button.Toggled), Toggled);
        builder.AddAttribute(16, nameof(Button.ToggledChanged), ToggledChanged);
        builder.AddMultipleAttributes(17, AdditionalAttributes);

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
        builder.AddAttribute(7, nameof(MenuItem.Checked), Toggled);
        builder.AddAttribute(8, nameof(Class), Class);
        builder.AddAttribute(9, nameof(Style), Style);
        builder.AddMultipleAttributes(10, AdditionalAttributes);

        builder.CloseComponent();
    }
}
