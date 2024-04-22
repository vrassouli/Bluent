using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class TreeItem
{
    private List<TreeItem> _items = new();

    [Parameter, EditorRequired] public string Title { get; set; } = default!;
    [Parameter] public string? Icon { get; set; } = default!;
    [Parameter] public string? ExpandedIcon { get; set; } = default!;
    [Parameter] public bool Expanded { get; set; } = default!;
    [Parameter] public EventCallback<bool> ExpandedChanged { get; set; } = default!;
    [Parameter] public bool? IsChecked { get; set; } = default!;
    [Parameter] public EventCallback<bool?> IsCheckedChanged { get; set; } = default!;
    [Parameter] public object? Data { get; set; } = default!;
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [CascadingParameter] public Tree Tree { get; set; } = default!;
    [CascadingParameter] public TreeItem? ParentItem { get; set; } = default!;

    internal bool HasSubItems => _items.Any();
    //private bool ShouldRenderExpander
    //{
    //    get
    //    {
    //        if (HaveSubItems)
    //            return true;
    //        else if (ParentItem != null)
    //            return ParentItem.ChildrenHaveSubItems;
    //        else
    //            return Tree.ChildrenHaveSubItems;
    //    }
    //}

    //private bool ChildrenHaveSubItems => _items.Any(i => i.HaveSubItems);

    protected override void OnInitialized()
    {
        if (Tree is null)
            throw new InvalidOperationException($"'{nameof(TreeItem)}' component should be nested inside a '{nameof(Components.Tree)}' or '{nameof(TreeItem)}' component.");

        if (ParentItem != null)
            ParentItem.Add(this);
        else
            Tree.Add(this);

        base.OnInitialized();
    }

    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender)
            StateHasChanged();

        base.OnAfterRender(firstRender);
    }

    public override void Dispose()
    {
        if (ParentItem != null)
            ParentItem.Remove(this);
        else
            Tree.Remove(this);

        base.Dispose();
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "item";

        if (Expanded)
            yield return "expanded";
    }

    private void Add(TreeItem item)
    {
        _items.Add(item);
        //StateHasChanged();
    }

    private void Remove(TreeItem item)
    {
        _items.Remove(item);
        //StateHasChanged();
    }

    private void ClickHandler()
    {
        if (HasSubItems)
        {
            Expanded = !Expanded;
            ExpandedChanged.InvokeAsync(Expanded);
        }

        Tree.OnItemClick(this);
    }
}
