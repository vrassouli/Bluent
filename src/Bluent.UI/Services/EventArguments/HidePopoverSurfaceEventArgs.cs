namespace Bluent.UI.Services.EventArguments;

internal class HidePopoverSurfaceEventArgs : EventArgs
{
    public HidePopoverSurfaceEventArgs(string triggerId)
    {
        TriggerId = triggerId;
    }

    public string TriggerId { get; }
}
