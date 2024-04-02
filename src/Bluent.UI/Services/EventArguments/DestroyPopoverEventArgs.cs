namespace Bluent.UI.Services.EventArguments;

internal class DestroyPopoverEventArgs : EventArgs
{
    public DestroyPopoverEventArgs(string popoverIdSelector)
    {
        TriggerId = popoverIdSelector;
    }

    public string TriggerId { get; }
}
