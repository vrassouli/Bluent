using Bluent.UI.Components.OverflowComponent;
using Bluent.UI.Components.TabListComponent;
using Bluent.UI.Components.ToolbarComponent;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Bluent.UI.Components;

public class TabList : Overflow
{
    public override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "header";
    }

    protected override void BuildRenderTree(RenderTreeBuilder __builder)
    {
        __builder.OpenElement(0, "div");
        __builder.AddAttribute(1, "class", "bui-tab-list");

        __builder.OpenRegion(2);
        base.BuildRenderTree(__builder);
        __builder.CloseRegion();

        __builder.CloseElement();
    }

    protected override RenderFragment<IOverflowItem> RenderItem()
    {
        return item =>
        {
            if (item is Tab tab)
                return RenderTab(tab);

            return builder => { };
        };
    }

    protected override RenderFragment<IOverflowItem> RenderMenuItem()
    {
        return item =>
        {
            if (item is Tab tab)
                return RenderTabMenuItem(tab);

            return builder => { };
        };
    }

    private RenderFragment RenderTab(Tab tab)
    {
        return builder => {
            builder.OpenComponent<TabListTabItem>(0);

            builder.AddAttribute(1, nameof(TabListTabItem.Text), tab.Text);
            builder.AddAttribute(2, nameof(TabListTabItem.Icon), tab.Icon);
            builder.AddAttribute(2, nameof(TabListTabItem.ActiveIcon), tab.ActiveIcon);
            //builder.AddAttribute(3, nameof(TabListTabItem.Appearance), tab.Appearance);
            builder.AddAttribute(3, nameof(TabListTabItem.Tooltip), tab.Tooltip);
            //builder.AddAttribute(4, nameof(TabListTabItem.OnClick), tab.OnClick);
            builder.AddMultipleAttributes(5, tab.AdditionalAttributes);

            builder.CloseComponent();
        };
    }

    private RenderFragment RenderTabMenuItem(Tab tab)
    {
        return builder =>
        {
            builder.OpenComponent<MenuItem>(0);

            builder.AddAttribute(1, nameof(MenuItem.Title), tab.MenuLabel ?? tab.Text);
            builder.AddAttribute(2, nameof(MenuItem.Icon), tab.Icon);
            builder.AddAttribute(3, nameof(MenuItem.ActiveIcon), tab.ActiveIcon);
            //builder.AddAttribute(4, nameof(MenuItem.OnClick), tab.OnClick);

            builder.CloseComponent();
        };
    }
}
