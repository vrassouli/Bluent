using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components.ToastComponent;

internal class ToastContext
{
    public ToastContext(RenderFragment content, ToastConfiguration config)
    {
        Content = content;
        Config = config;
        ResultTCS = new TaskCompletionSource<dynamic?>();
    }

    public RenderFragment Content { get; }
    public ToastConfiguration Config { get; }
    internal TaskCompletionSource<dynamic?> ResultTCS { get; }
    internal Toast? ToastReference { get; set; }
}
