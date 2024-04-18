using Bluent.UI.Components.DrawerComponent;

namespace Bluent.UI.Services.EventArguments;

internal class ShowDrawerEventArgs : EventArgs
{

    public ShowDrawerEventArgs(DrawerContext context)
    {
        Context = context;
    }

    public DrawerContext Context { get; }
}
