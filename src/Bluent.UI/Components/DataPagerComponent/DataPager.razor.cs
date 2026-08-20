using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.WebUtilities;

namespace Bluent.UI.Components;

public partial class DataPager
{
    [Parameter] public ButtonShape ButtonShape { get; set; } = ButtonShape.Circular;
    [Parameter] public bool ShowFirstPage { get; set; } = true;
    [Parameter] public bool ShowPreviousPage { get; set; }
    [Parameter] public bool ShowNextPage { get; set; }
    [Parameter] public bool ShowLastPage { get; set; } = true;
    [Parameter] public string? FirstPageText { get; set; } 
    [Parameter] public string? PreviousPageText { get; set; } 
    [Parameter] public string? NextPageText { get; set; }
    [Parameter] public string? LastPageText { get; set; } 
    [Parameter] public IconDefinition? NextButtonIcon { get; set; } = FluentIcons.ChevronRight;
    [Parameter] public IconDefinition? PreviousButtonIcon { get; set; } = FluentIcons.ChevronLeft;
    [Parameter] public IconDefinition? FirstButtonIcon { get; set; } = FluentIcons.ArrowPrevious;
    [Parameter] public IconDefinition? LastButtonIcon { get; set; } = FluentIcons.ArrowNext;
    [Parameter, EditorRequired] public int PageCount { get; set; }
    [Parameter] public int Page { get; set; } = 1;
    [Parameter] public EventCallback<int> PageChanged { get; set; }
    [Parameter] public int MaxPageButtons { get; set; } = 5;
    [Parameter] public string? PageQueryParameter { get; set; }
    [Inject] private NavigationManager NavigationManager { get; set; } = default!;

    private int MaxPreviousButtons => (int)Math.Floor((MaxPageButtons - 1) / (float)2);
    private int RequiredPreviousButtons => Math.Min(MaxPreviousButtons, Page - 1);
    private int RequiredNextButtons => MaxPageButtons - 1 - RequiredPreviousButtons;

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-data-pager";
    }

    private string? GetLink(int page)
    {
        if (string.IsNullOrEmpty(PageQueryParameter))
            return null;

        return UpdatePageQuery(page);
    }
    
    private string UpdatePageQuery(int newPageValue)
    {
        var uri = NavigationManager.Uri;
        var baseUri = new Uri(uri).GetLeftPart(UriPartial.Path);
        var queryParams = QueryHelpers.ParseQuery(new Uri(uri).Query)
            .ToDictionary(kvp => kvp.Key, kvp => kvp.Value.ToString());

        queryParams["page"] = newPageValue.ToString();

        return QueryHelpers.AddQueryString(baseUri, queryParams!);
    }

    private void GoTo(int page)
    {
        if(!string.IsNullOrEmpty(PageQueryParameter))
            return;
        
        if (page != Page)
        {
            Page = page;
            PageChanged.InvokeAsync(page);
        }
    }
}