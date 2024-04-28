using Bluent.UI.Components.OverflowComponent;
using Bluent.UI.Components.TabListComponent;
using Humanizer;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Bluent.UI.Components;

public class TabList : Overflow
{
    private bool _shouldCheckOverflow;
    private List<TabListTabItem> _tabs = new();
    [Parameter] public TabListAppearance Appearance { get; set; } = TabListAppearance.Transparent;
    [Parameter] public TabListSize Size { get; set; } = TabListSize.Medium;
    [Parameter] public int SelectedIndex { get; set; } = 0;
    [Parameter] public EventCallback<int> SelectedIndexChanged { get; set; }

    protected TabListTabItem? SelectedTab
    {
        get
        {
            if (SelectedIndex > -1 && SelectedIndex < _tabs.Count)
                return _tabs[SelectedIndex];

            return null;
        }
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-tab-list";
        yield return Orientation.ToString().Kebaberize();

        if (Appearance != TabListAppearance.Transparent)
            yield return Appearance.ToString().Kebaberize();

        if (Size != TabListSize.Medium)
            yield return Size.ToString().Kebaberize();
    }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, "div");
        builder.AddMultipleAttributes(1, AdditionalAttributes);
        builder.AddAttribute(2, "id", Id);
        builder.AddAttribute(3, "class", GetComponentClass());
        builder.AddAttribute(4, "style", Style);

        /*** Tab Header ***/
        builder.OpenElement(5, "div");
        builder.AddAttribute(6, "class", "header");

        builder.OpenRegion(7);
        base.BuildRenderTree(builder);
        builder.CloseRegion();

        builder.CloseElement();
        /*-- Tab Header --*/

        if (_tabs.Any(tab => tab.ChildContent != null))
        {
            /*** Tab Panels ***/
            builder.OpenElement(8, "div");
            builder.AddAttribute(9, "class", "panels");

            var index = 0;
            foreach (var tabItem in _tabs.Where(tab => tab.ChildContent != null))
            {
                var isSelected = SelectedTab == tabItem;

                if (!tabItem.DeferredLoading || isSelected)
                {
                    builder.OpenElement(10 + index, "div");
                    builder.SetKey(tabItem);
                    builder.AddAttribute(11 + index, "class", $"tab-panel {(isSelected ? "selected" : "")}");
                    builder.AddContent(12 + index, tabItem.ChildContent);
                    builder.CloseElement();
                }

                index++;
            }

            builder.CloseElement();
            /*-- Tab Panels --*/
        }

        builder.CloseElement();
    }

    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender)
            StateHasChanged();

        if (_shouldCheckOverflow)
        {
            CheckOverflow();
            _shouldCheckOverflow = false;
        }

        base.OnAfterRender(firstRender);
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

    internal void Add(TabListTabItem tabItem)
    {
        _tabs.Add(tabItem);
        StateHasChanged();
    }

    internal void Remove(TabListTabItem tabItem)
    {
        _tabs.Remove(tabItem);
        StateHasChanged();
    }

    internal bool InSelected(TabListTabItem tabItem)
    {
        var index = _tabs.IndexOf(tabItem);

        return index == SelectedIndex;
    }

    internal void SelectTab(TabListTabItem tabItem)
    {
        var index = _tabs.IndexOf(tabItem);

        if (index >= 0)
        {
            SelectTab(index);
        }
    }

    internal void SelectTab(int index)
    {
        var currentIndex = SelectedIndex;

        SelectedIndex = index;
        SelectedIndexChanged.InvokeAsync(index);

        if (currentIndex > -1 && currentIndex < _tabs.Count)
            _tabs[currentIndex].OnStateChanged();

        if (index > -1 && index < _tabs.Count)
            _tabs[index].OnStateChanged();

        _shouldCheckOverflow = true;
        StateHasChanged();
    }

    private RenderFragment RenderTab(Tab tab)
    {
        return builder =>
        {
            builder.OpenComponent<TabListTabItem>(0);

            builder.AddAttribute(1, nameof(TabListTabItem.Text), tab.Text);
            builder.AddAttribute(2, nameof(TabListTabItem.Icon), tab.Icon);
            builder.AddAttribute(3, nameof(TabListTabItem.ActiveIcon), tab.ActiveIcon);
            builder.AddAttribute(4, nameof(TabListTabItem.ChildContent), tab.ChildContent);
            builder.AddAttribute(5, nameof(TabListTabItem.Orientation), tab.Orientation);
            builder.AddAttribute(5, nameof(TabListTabItem.Data), tab.Data);
            builder.AddAttribute(5, nameof(TabListTabItem.Href), tab.Href);
            builder.AddAttribute(5, nameof(TabListTabItem.Match), tab.Match);
            builder.AddAttribute(5, nameof(TabListTabItem.DeferredLoading), tab.DeferredLoading);
            builder.AddAttribute(5, nameof(TabListTabItem.OnClick), tab.OnClick);
            builder.AddAttribute(6, nameof(TabListTabItem.Tooltip), tab.Tooltip);
            builder.AddAttribute(7, nameof(TabListTabItem.Class), tab.Class);
            builder.AddAttribute(8, nameof(TabListTabItem.Style), tab.Style);
            builder.AddMultipleAttributes(6, tab.AdditionalAttributes);

            builder.CloseComponent();
        };
    }

    private RenderFragment RenderTabMenuItem(Tab tab)
    {
        return builder =>
        {
            builder.OpenComponent<MenuItem>(0);

            builder.AddMultipleAttributes(1, tab.AdditionalAttributes);
            builder.AddAttribute(2, nameof(MenuItem.Title), tab.MenuLabel ?? tab.Text);
            builder.AddAttribute(3, nameof(MenuItem.Icon), tab.Icon);
            builder.AddAttribute(4, nameof(MenuItem.ActiveIcon), tab.ActiveIcon);
            builder.AddAttribute(5, nameof(MenuItem.Data), tab.Data);
            builder.AddAttribute(5, nameof(MenuItem.OnClick), EventCallback.Factory.Create(this, () => { SelectTab(Items.IndexOf(tab)); tab.OnClick.InvokeAsync(); }));

            builder.CloseComponent();
        };
    }
}
