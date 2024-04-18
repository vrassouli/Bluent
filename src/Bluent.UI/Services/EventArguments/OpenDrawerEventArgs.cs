using Bluent.UI.Components.DrawerComponent;

namespace Bluent.UI.Services.EventArguments;

internal class OpenDrawerEventArgs : EventArgs
{

    public OpenDrawerEventArgs(DrawerContext context)
    {
        Context = context;
    }

    public DrawerContext Context { get; }
}
