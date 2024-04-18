using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Dialog
{
    private bool _hiding;
    private object? _result;
    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;
    [Parameter] public DialogSize Size { get; set; } = DialogSize.Medium;
    [Parameter] public EventCallback<dynamic?> OnClose { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-dialog";
        if (Size != DialogSize.Medium)
            yield return Size.ToString().Kebaberize();
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
