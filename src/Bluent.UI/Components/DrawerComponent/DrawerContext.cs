namespace Bluent.UI.Components.DrawerComponent;

internal class DrawerContext
{
    public DrawerContext(DrawerConfiguration config)
    {
        Config = config;
        ResultTCS = new TaskCompletionSource<dynamic?>();
    }

    internal TaskCompletionSource<dynamic?> ResultTCS { get; }
    internal DrawerConfiguration Config { get; }
    internal Drawer? DrawerReference { get; set; }
}
