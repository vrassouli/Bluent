using Bluent.UI.Components;

namespace Bluent.UI.Services.EventArguments;

internal class SetTriggerPopoverEventArgs : EventArgs
{
    public SetTriggerPopoverEventArgs(PopoverConfiguration config)
    {
        Config = config;
    }
    public PopoverConfiguration Config { get; }
}
