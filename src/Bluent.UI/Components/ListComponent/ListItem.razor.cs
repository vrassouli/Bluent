using Bluent.Core;
using Bluent.UI.Common.Utilities;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Routing;

namespace Bluent.UI.Components;

public partial class ListItem
{
    private string? _href;
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
    [CascadingParameter] public AccordionPanel? AccordionPanel { get; set; } = default!;
    [Inject] private NavigationManager NavigationManager { get; set; } = default!;

    private bool IsLink => !string.IsNullOrEmpty(Href);

    protected override void OnInitialized()
    {
        if (List is null)
            throw new InvalidOperationException($"'{nameof(ListItem)}' component should be nested inside a '{nameof(ItemsList)}' component.");

        if (List.SelectionMode == SelectionMode.Multiple && IsLink)
            throw new InvalidOperationException($"'{nameof(ListItem)}' component does not support '{nameof(SelectionMode.Multiple)}' selection mode, when rendered as link.");

        NavigationManager.LocationChanged += NavigationManager_LocationChanged;

        List.Add(this);

        // initially selected?
        if (Selected)
            List.OnItemSelectionChanged(this);

        //Selected = List.IsSelected(this);

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
        List.Remove(this);
        base.Dispose();
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "listitem";

        if (Selected)
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

            if (selected)
                AccordionPanel?.Expand();

            StateHasChanged();
        }
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

        if (isActive != Selected)
            SetSelection(isActive);
    }
}
