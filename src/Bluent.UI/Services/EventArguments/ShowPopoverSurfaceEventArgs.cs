namespace Bluent.UI.Services.EventArguments;

internal class ShowPopoverSurfaceEventArgs : EventArgs
{
    public ShowPopoverSurfaceEventArgs(string triggerId)
    {
        TriggerId = triggerId;
    }
    public string TriggerId { get; }
}
