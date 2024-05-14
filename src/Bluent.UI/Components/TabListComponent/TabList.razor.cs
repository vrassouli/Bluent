﻿using Bluent.UI.Components.OverflowComponent;
using Bluent.UI.Components.TabListComponent;
using Humanizer;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Bluent.UI.Components;

public partial class TabList
{
    private bool _shouldCheckOverflow;
    private List<TabListTabItem> _tabItems = new();
    private List<Tab> _tabs = new();

    [Parameter] public TabListAppearance Appearance { get; set; } = TabListAppearance.Transparent;
    [Parameter] public TabListSize Size { get; set; } = TabListSize.Medium;
    [Parameter] public int SelectedIndex { get; set; } = 0;
    [Parameter] public EventCallback<int> SelectedIndexChanged { get; set; }

    protected TabListTabItem? SelectedTab
    {
        get
        {
            if (SelectedIndex > -1 && SelectedIndex < _tabItems.Count)
                return _tabItems[SelectedIndex];

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

    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender)
            StateHasChanged();

        if (_shouldCheckOverflow)
        {
            //CheckOverflow();
            _shouldCheckOverflow = false;
        }

        base.OnAfterRender(firstRender);
    }

    internal void Add(TabListTabItem tabItem)
    {
        _tabItems.Add(tabItem);
        StateHasChanged();
    }

    internal void Add(Tab tab)
    {
        _tabs.Add(tab);
        StateHasChanged();
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

    internal bool InSelected(TabListTabItem tabItem)
    {
        var index = _tabItems.IndexOf(tabItem);

        return index == SelectedIndex;
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

        SelectedIndex = index;
        SelectedIndexChanged.InvokeAsync(index);

        if (currentIndex > -1 && currentIndex < _tabItems.Count)
            _tabItems[currentIndex].OnStateChanged();

        if (index > -1 && index < _tabItems.Count)
            _tabItems[index].OnStateChanged();

        _shouldCheckOverflow = true;
        StateHasChanged();
    }
}
