﻿using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Drawer
{
    private bool _hiding;
    private object? _result;

    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;
    [Parameter] public DrawerPosition Position { get; set; } = DrawerPosition.End;
    [Parameter] public EventCallback<dynamic?> OnClose { get; set; }
    [Parameter] public string? Title { get; set; }
    [Parameter] public bool Dismissable { get; set; } = true;

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-drawer";
        yield return Position.ToString().Kebaberize();

        if (_hiding)
            yield return "hide";
    }

    public void Close(dynamic? result = null)
    {
        _hiding = true;
        _result = result;
        StateHasChanged();
    }

    private void OnDismiss()
    {
        Close(null);
    }

    private void AnimationEndedHandler()
    {
        if (_hiding)
        {
            InvokeAsync(() => OnClose.InvokeAsync(_result));
        }
    }
}
