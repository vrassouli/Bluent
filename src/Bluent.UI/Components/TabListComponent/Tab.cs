using Bluent.UI.Components.TabListComponent;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.AspNetCore.Components.Routing;

namespace Bluent.UI.Components;

public class Tab : OverflowItemComponentBase
{
    [Parameter] public string Text { get; set; } = default!;
    [Parameter] public string? MenuLabel { get; set; } = default!;
    [Parameter] public string Icon { get; set; } = default!;
    [Parameter] public string ActiveIcon { get; set; } = default!;
    [Parameter] public string? Href { get; set; }
    [Parameter] public NavLinkMatch Match { get; set; }
    [Parameter] public object? Data { get; set; }
    [Parameter] public bool DeferredLoading { get; set; }
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter] public Orientation Orientation { get; set; } = Orientation.Horizontal;
    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;

    protected override void OnInitialized()
    {
        if (Overflow is not TabList tabList)
            throw new InvalidOperationException($"'{this.GetType().Name}' component should be nested inside a '{nameof(Components.TabList)}' component.");

        tabList.Add(this);

        base.OnInitialized();
    }

    public override void Dispose()
    {
        if (Overflow is TabList tabList)
            tabList.Remove(this);

        base.Dispose();
    }

    protected override void RenderOverflowItem(RenderTreeBuilder builder)
    {
        builder.OpenComponent<TabListTabItem>(0);

        builder.AddAttribute(1, nameof(TabListTabItem.Text), Text);
        builder.AddAttribute(2, nameof(TabListTabItem.Icon), Icon);
        builder.AddAttribute(3, nameof(TabListTabItem.ActiveIcon), ActiveIcon);
        builder.AddAttribute(4, nameof(TabListTabItem.ChildContent), ChildContent);
        builder.AddAttribute(5, nameof(TabListTabItem.Orientation), Orientation);
        builder.AddAttribute(6, nameof(TabListTabItem.Data), Data);
        builder.AddAttribute(7, nameof(TabListTabItem.Href), Href);
        builder.AddAttribute(8, nameof(TabListTabItem.Match), Match);
        builder.AddAttribute(9, nameof(TabListTabItem.DeferredLoading), DeferredLoading);
        builder.AddAttribute(10, nameof(TabListTabItem.OnClick), OnClick);
        builder.AddAttribute(11, nameof(TabListTabItem.Tooltip), Tooltip);
        builder.AddAttribute(12, nameof(TabListTabItem.Class), Class);
        builder.AddAttribute(13, nameof(TabListTabItem.Style), Style);
        builder.AddMultipleAttributes(14, AdditionalAttributes);

        builder.CloseComponent();
    }

    protected override void RenderOverflowMenuItem(RenderTreeBuilder builder)
    {
        builder.OpenComponent<MenuItem>(0);

        builder.AddMultipleAttributes(1, AdditionalAttributes);
        builder.AddAttribute(2, nameof(MenuItem.Title), MenuLabel ?? Text);
        builder.AddAttribute(3, nameof(MenuItem.Icon), Icon);
        builder.AddAttribute(4, nameof(MenuItem.ActiveIcon), ActiveIcon);
        builder.AddAttribute(5, nameof(MenuItem.Data), Data);
        builder.AddAttribute(6, nameof(MenuItem.Href), Href);
        builder.AddAttribute(7, nameof(MenuItem.OnClick), EventCallback.Factory.Create(this, () => {
            (Overflow as TabList)?.SelectTab(this);
            OnClick.InvokeAsync(); }));

        builder.CloseComponent();
    }
}
