using Bluent.UI.Components.OverflowComponent;
using Bluent.UI.Components.ToolbarComponent;
using Humanizer;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Bluent.UI.Components;

public class Toolbar : Overflow
{
    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-toolbar";
        yield return Orientation.ToString().Kebaberize();
    }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, "div");
        builder.AddMultipleAttributes(1, AdditionalAttributes);
        builder.AddAttribute(2, "id", Id);
        builder.AddAttribute(3, "class", GetComponentClass());
        builder.AddAttribute(4, "style", Style);

        builder.OpenRegion(5);
        base.BuildRenderTree(builder);
        builder.CloseRegion();

        builder.CloseElement();
    }

    protected override RenderFragment<IOverflowItem> RenderItem()
    {
        return item => 
        {
            if (item is ToolbarButton button)
                return RenderToolbarButton(button);

            if (item is ToolbarDivider divider)
                return RenderToolbarDivider();

            return builder => { };
        };
    }

    protected override RenderFragment<IOverflowItem> RenderMenuItem()
    {
        return item => 
        {
            if (item is ToolbarButton button)
                return RenderToolbarButtonMenuItem(button);

            if (item is ToolbarDivider divider)
                return RenderToolbarDividerMenuDividir();

            return builder => { };
        };
    }

    #region Overflow Menu Items

    private RenderFragment RenderToolbarDividerMenuDividir()
    {
        return builder =>
        {
            builder.OpenComponent<MenuDivider>(0);
            builder.CloseComponent();
        };
    }

    private RenderFragment RenderToolbarButtonMenuItem(ToolbarButton button)
    {
        return builder =>
        {
            builder.OpenComponent<MenuItem>(0);

            builder.AddAttribute(1, nameof(MenuItem.Title), button.MenuLabel ?? button.Text);
            builder.AddAttribute(2, nameof(MenuItem.Icon), button.Icon);
            builder.AddAttribute(3, nameof(MenuItem.ActiveIcon), button.ActiveIcon);
            builder.AddAttribute(3, nameof(MenuItem.Href), button.Href);
            builder.AddAttribute(4, nameof(MenuItem.OnClick), button.OnClick);
            builder.AddAttribute(4, nameof(MenuItem.ChildContent), button.Dropdown);
            builder.AddAttribute(4, nameof(Button.Class), button.Class);
            builder.AddAttribute(4, nameof(Button.Style), button.Style);

            builder.CloseComponent();
        };
    }

    #endregion

    #region Toolbar Items

    private RenderFragment RenderToolbarDivider()
    {
        return builder => {
            builder.OpenElement(0, "div");

            builder.AddAttribute(1, "class", $"toolbar-divider {Orientation.ToString().Kebaberize()}");

            builder.CloseElement();
        };
    }

    private RenderFragment RenderToolbarButton(ToolbarButton button)
    {
        return builder => {
            builder.OpenComponent<Button>(0);

            builder.AddAttribute(1, nameof(Button.Text), button.Text);
            builder.AddAttribute(2, nameof(Button.Icon), button.Icon);
            builder.AddAttribute(2, nameof(Button.ActiveIcon), button.ActiveIcon);
            builder.AddAttribute(2, nameof(Button.Href), button.Href);
            builder.AddAttribute(3, nameof(Button.Appearance), Enum.Parse<ButtonAppearance>(button.Appearance.ToString()));
            builder.AddAttribute(3, nameof(Button.Dropdown), button.Dropdown);
            builder.AddAttribute(3, nameof(Button.ShowDropdownIndicator), button.ShowDropdownIndicator);
            builder.AddAttribute(3, nameof(Button.DropdownPlacement), button.DropdownPlacement);
            builder.AddAttribute(4, nameof(Button.OnClick), button.OnClick);
            builder.AddAttribute(3, nameof(Button.Tooltip), button.Tooltip);
            builder.AddAttribute(4, nameof(Button.Class), button.Class);
            builder.AddAttribute(4, nameof(Button.Style), button.Style);
            builder.AddMultipleAttributes(5, button.AdditionalAttributes);

            builder.CloseComponent();
        };
    }

    #endregion
}
