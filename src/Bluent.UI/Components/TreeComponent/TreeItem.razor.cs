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
    private bool _mouseEntered;
    private bool? _isChecked;

    [Parameter, EditorRequired] public string Title { get; set; } = default!;
    [Parameter] public string? Icon { get; set; } = default!;
    [Parameter] public string? ExpandedIcon { get; set; } = default!;
    [Parameter] public bool Expanded { get; set; } = default!;
    [Parameter] public bool DisableCheckBox { get; set; }
    [Parameter] public EventCallback<bool> ExpandedChanged { get; set; } = default!;
    [Parameter] public bool? IsChecked { get; set; } = false;
    [Parameter] public EventCallback<bool?> IsCheckedChanged { get; set; } = default!;
    [Parameter] public object? Data { get; set; } = default!;
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [CascadingParameter] public Tree Tree { get; set; } = default!;
    [CascadingParameter] public TreeItem? ParentItem { get; set; } = default!;
    public IReadOnlyList<TreeItem> Items => _items;

    internal bool HasSubItems => _items.Any();

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

    protected override void OnParametersSet()
    {
        if(_isChecked != IsChecked)
        {
            _isChecked = IsChecked;
            CheckboxCheckedHandler(_isChecked);
        }

        base.OnParametersSet();
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
    }

    private void Remove(TreeItem item)
    {
        _items.Remove(item);
    }

    private void ItemClickHandler()
    {
        if (Tree.ToggleSubItemsOnClick)
            ExpanderClickHandler();

        if (Tree.ToggleCheckStateOnClick)
            CheckboxCheckedHandler(IsChecked == true ? false : true);

        Tree.OnItemClick(this);
    }

    private void ExpanderClickHandler()
    {
        if (HasSubItems)
        {
            Expanded = !Expanded;
            ExpandedChanged.InvokeAsync(Expanded);
        }
    }

    private void MouseEnterHandler() => _mouseEntered = true;
    private void MouseLeaveHandler() => _mouseEntered = false;

    private void CheckboxCheckedHandler(bool? value)
    {
        SetCheckState(value);

        var mode = Tree.CheckboxMode;
        if (mode == TreeCheckboxMode.Independent)
            return;

        if (mode == TreeCheckboxMode.Cascade || mode == TreeCheckboxMode.CascadeDown)
        {
            if (value != null)
                CascadeDownCheckState(value.Value);
        }

        if (mode == TreeCheckboxMode.Cascade || mode == TreeCheckboxMode.CascadeUp)
        {
            ParentItem?.CascadeUpCheckState();
        }
    }

    private void CascadeUpCheckState()
    {
        var currentState = IsChecked;

        if (_items.All(i => i.IsChecked == true) && currentState != true)
        {
            SetCheckState(true);
        }
        else if (_items.All(i => i.IsChecked == false) && currentState != false)
        {
            SetCheckState(false);
        }
        else if (currentState != null)
        {
            SetCheckState(null);
        }

        ParentItem?.CascadeUpCheckState();
    }

    private void CascadeDownCheckState(bool isChecked)
    {
        foreach (var item in _items)
        {
            item.SetCheckState(isChecked);
            item.CascadeDownCheckState(isChecked);
        }
    }

    private void SetCheckState(bool? value)
    {
        if (!DisableCheckBox)
        {
            _isChecked = IsChecked = value;
            IsCheckedChanged.InvokeAsync(IsChecked);
            StateHasChanged();
        }
    }
}
