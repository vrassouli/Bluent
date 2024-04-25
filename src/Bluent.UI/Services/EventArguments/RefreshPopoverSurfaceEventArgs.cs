namespace Bluent.UI.Services.EventArguments;

internal class RefreshPopoverSurfaceEventArgs : EventArgs
{
    public RefreshPopoverSurfaceEventArgs(string triggerId)
    {
        TriggerId = triggerId;
    }

    public string TriggerId { get; }
}
