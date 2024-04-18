using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components.DialogComponent;

internal class DialogContext
{
    public DialogContext(RenderFragment content, DialogConfiguration config)
    {
        Content = content;
        Config = config;
        ResultTCS = new TaskCompletionSource<dynamic?>();
    }

    public RenderFragment Content { get; }
    public DialogConfiguration Config { get; }
    internal TaskCompletionSource<dynamic?> ResultTCS { get; }
    internal Dialog? DialogReference { get; set; }
}
