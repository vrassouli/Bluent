using Bluent.UI.Components.PopoverComponent;

namespace Bluent.UI.Services.EventArguments;

internal class SetTriggerPopoverEventArgs : EventArgs
{
    public SetTriggerPopoverEventArgs(PopoverContext context)
    {
        Context = context;
    }
    public PopoverContext Context { get; }
}
