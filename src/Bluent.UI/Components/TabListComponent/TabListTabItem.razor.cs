﻿using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components.TabListComponent;

public partial class TabListTabItem
{
    [Parameter] public string Text { get; set; } = default!;
    [Parameter] public string? MenuLabel { get; set; } = default!;
    [Parameter] public string Icon { get; set; } = default!;
    [Parameter] public string ActiveIcon { get; set; } = default!;
    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;
    [CascadingParameter] public Overflow TabListOverflow { get; set; } = default!;

    protected override void OnInitialized()
    {
        if (TabListOverflow is not TabList tabList)
            throw new InvalidOperationException($"'{this.GetType().Name}' component should be nested inside a '{nameof(Components.TabList)}' component.");

        tabList.Add(this);

        base.OnInitialized();
    }

    public override void Dispose()
    {
        if (TabListOverflow is TabList tabList)
            tabList.Remove(this);

        base.Dispose();
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "tab-item";

        if (TabListOverflow is TabList tabList)
        {
            if (tabList.InSelected(this))
                yield return "selected";
        }
    }

    private void ClickHandler()
    {
        if (TabListOverflow is TabList tabList)
        {
            tabList.SelectTab(this);
        }
    }

    internal void OnStateChanged()
    {
        StateHasChanged();
    }
}
