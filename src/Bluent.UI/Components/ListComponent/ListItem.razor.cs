using Bluent.UI.Common.Utilities;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Routing;
using System.Diagnostics;
using System.Globalization;

namespace Bluent.UI.Components;

public partial class ListItem
{
    private bool _isActive;

    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public object? Data { get; set; }
    [Parameter] public string? Text { get; set; }
    [Parameter] public string? Icon { get; set; }
    [Parameter] public string? ActiveIcon { get; set; }
    [Parameter] public bool Selected { get; set; }
    [Parameter] public EventCallback<bool> SelectedChanged { get; set; }
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter] public string? Href { get; set; }
    [Parameter] public NavLinkMatch Match { get; set; }
    [CascadingParameter] public ItemsList List { get; set; } = default!;
    [Inject] private NavigationManager NavigationManager { get; set; } = default!;

    private bool IsLink => !string.IsNullOrEmpty(Href);
    private bool IsSelected
    {
        get
        {
            if (!IsLink)
                return Selected;

            var hrefAbsolute = Href == null ? null : NavigationManager.ToAbsoluteUri(Href).AbsoluteUri;
            _isActive = UrlMatcher.ShouldMatch(Match, NavigationManager.Uri, hrefAbsolute);

            return _isActive;
        }
    }

    protected override void OnInitialized()
    {
        if (List is null)
            throw new InvalidOperationException($"'{nameof(ListItem)}' component should be nested inside a '{nameof(ItemsList)}' component.");

        if (List.SelectionMode == SelectionMode.Multiple && IsLink)
            throw new InvalidOperationException($"'{nameof(ListItem)}' component does not support '{nameof(SelectionMode.Multiple)}' selection mode, when rendered as link.");

        NavigationManager.LocationChanged += NavigationManager_LocationChanged;

        List.Add(this);

        base.OnInitialized();
    }

    public override void Dispose()
    {
        NavigationManager.LocationChanged -= NavigationManager_LocationChanged;
        List.Remove(this);
        base.Dispose();
    }

    private void NavigationManager_LocationChanged(object? sender, LocationChangedEventArgs e)
    {
        var wasActive = _isActive;
        var hrefAbsolute = Href == null ? null : NavigationManager.ToAbsoluteUri(Href).AbsoluteUri;
        var isActive = UrlMatcher.ShouldMatch(Match, NavigationManager.Uri, hrefAbsolute);

        if (wasActive != isActive)
            StateHasChanged();
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "listitem";

        if (IsSelected)
            yield return "selected";
    }

    private void ClickHandler()
    {
        if (!IsLink)
        {
            if (List.SelectionMode == SelectionMode.Single)
            {
                SetSelection(true);
                List.OnItemSelectionChanged(this);
            }
            else if (List.SelectionMode == SelectionMode.Multiple)
            {
                SetSelection(!Selected);
                List.OnItemSelectionChanged(this);
            }
        }

        OnClick.InvokeAsync();
    }

    private string GetItemTag()
    {
        if (IsLink)
            return "a";

        return "div";
    }

    internal void SetSelection(bool selected)
    {
        if (selected != Selected)
        {
            Selected = selected;
            SelectedChanged.InvokeAsync(Selected);

            StateHasChanged();
        }
    }
}
