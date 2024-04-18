using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components.DrawerComponent;

internal class DrawerContext
{
    public DrawerContext(RenderFragment content, DrawerConfiguration config)
    {
        Content = content;
        Config = config;
        ResultTCS = new TaskCompletionSource<dynamic?>();
    }

    public RenderFragment Content { get; }
    public DrawerConfiguration Config { get; }
    internal TaskCompletionSource<dynamic?> ResultTCS { get; }
    internal Drawer? DrawerReference { get; set; }
}
