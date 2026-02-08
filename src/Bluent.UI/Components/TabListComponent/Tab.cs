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
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public RenderFragment? Actions { get; set; }

    protected override void OnInitialized()
    {
        if (Overflow is not TabList tabList)
            throw new InvalidOperationException(
                $"'{this.GetType().Name}' component should be nested inside a '{nameof(Components.TabList)}' component.");

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
        var seq = -1;
        builder.OpenComponent<TabListTabItem>(++seq);

        builder.AddAttribute(++seq, nameof(TabListTabItem.Text), Text);
        builder.AddAttribute(++seq, nameof(TabListTabItem.Icon), Icon);
        builder.AddAttribute(++seq, nameof(TabListTabItem.ActiveIcon), ActiveIcon);
        builder.AddAttribute(++seq, nameof(TabListTabItem.ChildContent), ChildContent);
        builder.AddAttribute(++seq, nameof(TabListTabItem.Actions), Actions);
        builder.AddAttribute(++seq, nameof(TabListTabItem.Orientation), Orientation);
        builder.AddAttribute(++seq, nameof(TabListTabItem.Data), Data);
        builder.AddAttribute(++seq, nameof(TabListTabItem.Href), Href);
        builder.AddAttribute(++seq, nameof(TabListTabItem.Match), Match);
        builder.AddAttribute(++seq, nameof(TabListTabItem.DeferredLoading), DeferredLoading);
        builder.AddAttribute(++seq, nameof(TabListTabItem.OnClick), OnClick);
        builder.AddAttribute(++seq, nameof(TabListTabItem.Tooltip), Tooltip);
        builder.AddAttribute(++seq, nameof(TabListTabItem.Class), Class);
        builder.AddAttribute(++seq, nameof(TabListTabItem.Style), Style);
        builder.AddMultipleAttributes(++seq, AdditionalAttributes);

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
        builder.AddAttribute(7, nameof(MenuItem.OnClick), EventCallback.Factory.Create(this, () =>
        {
            (Overflow as TabList)?.SelectTab(this);
            OnClick.InvokeAsync();
        }));

        builder.CloseComponent();
    }
}