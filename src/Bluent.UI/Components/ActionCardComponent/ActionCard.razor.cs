using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class ActionCard
{
    [Parameter] public RenderFragment? HeaderContent { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public bool IsExpanded { get; set; }
    [Parameter] public EventCallback<bool> IsExpandedChanged { get; set; }
    [Parameter] public string? Icon { get; set; }
    [Parameter] public string? Href { get; set; }
    [Parameter, EditorRequired] public string Title { get; set; } = default!;
    [Parameter] public string? Description { get; set; }

    private bool IsExpandable => ChildContent != null;
    private bool IsLink => !string.IsNullOrEmpty(Href);
    private bool IsActive => ChildContent != null || IsLink;

    protected override void OnParametersSet()
    {
        base.OnParametersSet();
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-action-card";
        if (IsActive)
            yield return "active";
        if (IsExpandable && IsExpanded)
            yield return "expanded";
    }

    private void HeaderClickHandler()
    {
        if (IsExpandable)
        {
            IsExpanded = !IsExpanded;
            IsExpandedChanged.InvokeAsync();
        }
    }

    private string GetTag()
    {
        if (IsLink)
            return "a";

        return "div";
    }
}
