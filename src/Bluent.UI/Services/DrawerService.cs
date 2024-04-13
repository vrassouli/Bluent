using Bluent.UI.Components.DrawerComponent;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;

namespace Bluent.UI.Services;

internal class DrawerService : IDrawerService
{
    public event EventHandler<OpenDrawerEventArgs>? OpenDrawer;


    public Task<dynamic?> OpenAsync(DrawerConfiguration config)
    {
        var context = new DrawerContext(config);

        OpenDrawer?.Invoke(this, new OpenDrawerEventArgs(context));

        return context.ResultTCS.Task;
    }
}
