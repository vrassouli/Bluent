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
    [Parameter] public string? NextButtonIcon { get; set; } = "icon-ic_fluent_chevron_right_20_regular";
    [Parameter] public string? NextButtonIconClass { get; set; }
    [Parameter] public string? NextButtonActiveIcon { get; set; } = "icon-ic_fluent_chevron_right_20_filled";
    [Parameter] public string? NextButtonActiveIconClass { get; set; }
    [Parameter] public string? PreviousButtonIcon { get; set; } = "icon-ic_fluent_chevron_left_20_regular";
    [Parameter] public string? PreviousButtonIconClass { get; set; }
    [Parameter] public string? PreviousButtonActiveIcon { get; set; } = "icon-ic_fluent_chevron_left_20_filled";
    [Parameter] public string? PreviousButtonActiveIconClass { get; set; }
    [Parameter] public string? FirstButtonIcon { get; set; } = "icon-ic_fluent_arrow_previous_20_regular";
    [Parameter] public string? FirstButtonIconClass { get; set; }
    [Parameter] public string? FirstButtonActiveIcon { get; set; } = "icon-ic_fluent_arrow_previous_20_filled";
    [Parameter] public string? FirstButtonActiveIconClass { get; set; }
    [Parameter] public string? LastButtonIcon { get; set; } = "icon-ic_fluent_arrow_next_20_regular";
    [Parameter] public string? LastButtonIconClass { get; set; }
    [Parameter] public string? LastButtonActiveIcon { get; set; } = "icon-ic_fluent_arrow_next_20_filled";
    [Parameter] public string? LastButtonActiveIconClass { get; set; }
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

        // Split base path and query string
        var baseUri = new Uri(uri).GetLeftPart(UriPartial.Path);

        // Parse query parameters into a dictionary
        var queryParams = QueryHelpers.ParseQuery(new Uri(uri).Query)
            .ToDictionary(kvp => kvp.Key, kvp => kvp.Value.ToString());

        // Update or insert the "page" parameter
        queryParams["page"] = newPageValue.ToString();

        // Rebuild full URL
        var newUri = QueryHelpers.AddQueryString(baseUri, queryParams!);

        return newUri;
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