using Bluent.UI.Components.OverflowComponent;
using Bluent.UI.Components.ToolbarComponent;
using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public class Toolbar : Overflow
{
    public override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-toolbar";
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
            builder.AddAttribute(4, nameof(MenuItem.OnClick), button.OnClick);

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
            builder.OpenComponent<ToolbarButtonItem>(0);

            builder.AddAttribute(1, nameof(ToolbarButtonItem.Text), button.Text);
            builder.AddAttribute(2, nameof(ToolbarButtonItem.Icon), button.Icon);
            builder.AddAttribute(2, nameof(ToolbarButtonItem.ActiveIcon), button.ActiveIcon);
            builder.AddAttribute(3, nameof(ToolbarButtonItem.Appearance), button.Appearance);
            builder.AddAttribute(3, nameof(ToolbarButtonItem.Tooltip), button.Tooltip);
            builder.AddAttribute(4, nameof(ToolbarButtonItem.OnClick), button.OnClick);
            builder.AddMultipleAttributes(5, button.AdditionalAttributes);

            builder.CloseComponent();
        };
    }

    #endregion
}
