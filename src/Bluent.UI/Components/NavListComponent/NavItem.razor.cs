using Bluent.UI.Common.Utilities;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Routing;

namespace Bluent.UI.Components;

public partial class NavItem
{
    private string? _href;
    private bool _isActive;
    [Parameter, EditorRequired] public string Text { get; set; }
    [Parameter, EditorRequired] public string Icon { get; set; }
    [Parameter] public string? Href { get; set; }
    [Parameter] public NavLinkMatch Match { get; set; }
    [Parameter] public string? ActiveIcon { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public RenderFragment? Options { get; set; }
    [Parameter] public bool Expanded { get; set; }
    [Parameter] public EventCallback<bool> ExpandedChanged { get; set; }
    [Inject] private NavigationManager NavigationManager { get; set; } = default!;
    private bool IsLink => !string.IsNullOrEmpty(Href);
    private bool IsExpandable => ChildContent is not null; 
    
    protected override void OnInitialized()
    {
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
    
    public override ValueTask DisposeAsync()
    {
        NavigationManager.LocationChanged -= NavigationManager_LocationChanged;
        return base.DisposeAsync();
    }
    
    public override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;
        
        yield return "bui-nav-item";
        
        if (_isActive)
            yield return "active";
        
        if (IsExpandable)
            yield return "expandable";
        
        if (Expanded)
            yield return "expanded";
    }

    private string GetItemTag()
    {
        if (IsLink)
            return "a";

        return "div";
    }

    private Task ClickHandler()
    {
        if (IsExpandable)
        {
            Expanded = !Expanded;
            return ExpandedChanged.InvokeAsync(Expanded);
        }
        
        return Task.CompletedTask;
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

        if (isActive != _isActive)
        {
            _isActive = isActive;
            StateHasChanged();
        }
    }
}