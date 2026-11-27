namespace Bluent.UI.Services.EventArguments;

internal class HidePopoverSurfaceEventArgs : EventArgs
{
    public HidePopoverSurfaceEventArgs(string triggerId, bool restoreFocus = false)
    {
        TriggerId = triggerId;
        RestoreFocus = restoreFocus;
    }

    public string TriggerId { get; }
    public bool RestoreFocus { get; }
}
