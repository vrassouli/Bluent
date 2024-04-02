using Bluent.UI.Components;

namespace Bluent.UI.Services.EventArguments;

internal class ShowPopoverSurfaceEventArgs : EventArgs
{
    public ShowPopoverSurfaceEventArgs(PopoverConfiguration config)
    {
        Config = config;
    }
    public PopoverConfiguration Config { get; }
}
