using Bluent.UI.Common.Utilities;
using Humanizer;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Routing;

namespace Bluent.UI.Components.TabListComponent;

public partial class TabListTabItem
{
    private string? _href;
    [Parameter] public string Text { get; set; } = default!;
    [Parameter] public string? MenuLabel { get; set; } = default!;
    [Parameter] public string Icon { get; set; } = default!;
    [Parameter] public string ActiveIcon { get; set; } = default!;
    [Parameter] public bool DeferredLoading { get; set; }
    [Parameter] public string? Href { get; set; }
    [Parameter] public NavLinkMatch Match { get; set; }
    [Parameter] public Orientation Orientation { get; set; } = Orientation.Horizontal;
    [Parameter] public object? Data { get; set; }
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;
    [CascadingParameter] public Overflow TabListOverflow { get; set; } = default!;
    [Inject] private NavigationManager NavigationManager { get; set; } = default!;

    private bool IsLink => !string.IsNullOrEmpty(Href);

    protected override void OnInitialized()
    {
        if (TabListOverflow is not TabList tabList)
            throw new InvalidOperationException($"'{this.GetType().Name}' component should be nested inside a '{nameof(Components.TabList)}' component.");

        tabList.Add(this);

        if (tabList.Orientation == Orientation.Horizontal)
            TooltipPlacement = Placement.Bottom;
        else
            TooltipPlacement = Placement.Right;

        NavigationManager.LocationChanged += NavigationManager_LocationChanged;

        base.OnInitialized();
    }

    protected override void OnParametersSet()
    {
        if (_href != Href)
        {
            _href = Href;
            CheckLinkActiveState();
        }

        base.OnParametersSet();
    }

    public override void Dispose()
    {
        NavigationManager.LocationChanged -= NavigationManager_LocationChanged;
        if (TabListOverflow is TabList tabList)
            tabList.Remove(this);

        base.Dispose();
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "tab-item";
        if (Orientation != Orientation.Horizontal)
            yield return Orientation.ToString().Kebaberize();

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

        OnClick.InvokeAsync();
    }

    internal void OnStateChanged()
    {
        StateHasChanged();
    }

    private string GetItemTag()
    {
        if (IsLink)
            return "a";

        return "button";
    }

    private void NavigationManager_LocationChanged(object? sender, LocationChangedEventArgs e)
    {
        CheckLinkActiveState();
    }

    private void CheckLinkActiveState()
    {
        if (!IsLink)
            return;

        var hrefAbsolute = Href == null ? null : NavigationManager.ToAbsoluteUri(Href).AbsoluteUri;
        var isActive = UrlMatcher.ShouldMatch(Match, NavigationManager.Uri, hrefAbsolute);

        if (isActive && TabListOverflow is TabList tabList)
        {
            tabList.SelectTab(this);
        }

    }
}
