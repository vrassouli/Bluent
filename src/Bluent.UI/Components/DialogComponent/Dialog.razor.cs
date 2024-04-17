using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class Dialog
{
    private bool _hiding;
    private object? _result;
    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;
    [Parameter] public string Title { get; set; } = default!;
    [Parameter] public EventCallback<dynamic?> OnClose { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-dialog";
        if (_hiding)
            yield return "hide";
    }

    public void Close(dynamic? result = null)
    {
        _hiding = true;
        _result = result;
        StateHasChanged();
    }

    private void AnimationEndedHandler()
    {
        if (_hiding)
        {
            InvokeAsync(() => OnClose.InvokeAsync(_result));
        }
    }
}
