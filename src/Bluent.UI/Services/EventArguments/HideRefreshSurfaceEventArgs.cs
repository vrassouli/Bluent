namespace Bluent.UI.Services.EventArguments;

internal class HideRefreshSurfaceEventArgs : EventArgs
{
    public HideRefreshSurfaceEventArgs(string triggerId)
    {
        TriggerId = triggerId;
    }

    public string TriggerId { get; }
}
