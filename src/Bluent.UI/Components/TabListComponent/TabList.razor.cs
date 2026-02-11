using Bluent.UI.Components.TabListComponent;
using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class TabList
{
    //private bool _shouldCheckOverflow;
    private readonly List<TabListTabItem> _tabItems = new();
    private readonly List<Tab> _tabs = new();

    [Parameter] public TabListAppearance Appearance { get; set; } = TabListAppearance.Transparent;
    [Parameter] public TabListSize Size { get; set; } = TabListSize.Medium;
    [Parameter] public int SelectedIndex { get; set; } = -1;
    [Parameter] public EventCallback<int> SelectedIndexChanged { get; set; }
    [Parameter] public EventCallback<int> OnTabAdded { get; set; }

    private TabListTabItem? SelectedTab
    {
        get
        {
            if (SelectedIndex > -1 && SelectedIndex < _tabItems.Count)
                return _tabItems[SelectedIndex];

            return _tabItems.LastOrDefault();
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

    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender)
            StateHasChanged();

        // if (_shouldCheckOverflow)
        // {
        //     CheckOverflow();
        //     _shouldCheckOverflow = false;
        // }

        base.OnAfterRender(firstRender);
    }

    internal void Add(TabListTabItem tabItem)
    {
        if (!_tabItems.Contains(tabItem))
        {
            _tabItems.Add(tabItem);
            StateHasChanged();
        }
    }

    internal void Add(Tab tab)
    {
        if (!_tabs.Contains(tab))
        {
            _tabs.Add(tab);

            var index = _tabs.IndexOf(tab);
            OnTabAdded.InvokeAsync(index);

            StateHasChanged();
        }
    }

    internal void Remove(TabListTabItem tabItem)
    {
        _tabItems.Remove(tabItem);
        StateHasChanged();
    }

    internal void Remove(Tab tab)
    {
        _tabs.Remove(tab);
        StateHasChanged();
    }

    internal bool IsSelected(TabListTabItem tabItem)
    {
        var index = _tabItems.IndexOf(tabItem);
        var selectedTabIndex = SelectedTab is null ? -1 : _tabItems.IndexOf(SelectedTab);

        return index == SelectedIndex || index == selectedTabIndex;
    }

    internal void SelectTab(TabListTabItem tabItem)
    {
        var index = _tabItems.IndexOf(tabItem);

        if (index >= 0)
        {
            SelectTab(index);
        }
    }

    internal void SelectTab(Tab tab)
    {
        var index = _tabs.IndexOf(tab);

        if (index >= 0)
        {
            SelectTab(index);
        }
    }

    internal void SelectTab(int index)
    {
        var currentIndex = SelectedIndex;

        if (index >= _tabs.Count)
            index = _tabs.Count - 1;
        else if (index < 0)
            index = 0;

        SelectedIndex = index;
        SelectedIndexChanged.InvokeAsync(index);

        if (currentIndex > -1 && currentIndex < _tabItems.Count)
            _tabItems[currentIndex].OnStateChanged();

        if (index > -1 && index < _tabItems.Count)
            _tabItems[index].OnStateChanged();

        //_shouldCheckOverflow = true;
        StateHasChanged();
    }
}