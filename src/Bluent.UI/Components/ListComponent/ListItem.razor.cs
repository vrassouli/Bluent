using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class ListItem
{
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public object? Data { get; set; }
    [Parameter] public string? Text { get; set; }
    [Parameter] public string? Icon { get; set; }
    [Parameter] public string? ActiveIcon { get; set; }
    [Parameter] public bool Selected { get; set; }
    [Parameter] public EventCallback<bool> SelectedChanged { get; set; }
    [Parameter] public EventCallback OnClick { get; set; }
    [CascadingParameter] public ItemsList List { get; set; } = default!;

    private bool IsLink => AdditionalAttributes?.ContainsKey("href") == true;
    private string? Href => AdditionalAttributes?["href"]?.ToString();
    private string? Target => AdditionalAttributes?["target"]?.ToString();

    protected override void OnInitialized()
    {
        if (List is null)
            throw new InvalidOperationException($"'{nameof(ListItem)}' component should be nested inside a '{nameof(ItemsList)}' component.");

        List.Add(this);

        base.OnInitialized();
    }

    public override void Dispose()
    {
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

        OnClick.InvokeAsync();
    }

    private string GetItemTag()
    {
        if (IsLink)
            return "a";

        return "div";
    }

    protected Dictionary<string, object>? GetAdditionalAttributes()
    {
        if (AdditionalAttributes == null || !IsLink)
        {
            return AdditionalAttributes;
        }
        else
        {
            var dic = new Dictionary<string, object>();
            foreach (var item in AdditionalAttributes)
            {
                if (!item.Key.Equals("href", StringComparison.InvariantCultureIgnoreCase) &&
                    !item.Key.Equals("target", StringComparison.InvariantCultureIgnoreCase))
                    dic.Add(item.Key, item.Value);
            }

            return dic;
        }
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
