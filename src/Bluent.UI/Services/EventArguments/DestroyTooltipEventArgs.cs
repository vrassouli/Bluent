namespace Bluent.UI.Services.EventArguments;

internal class DestroyTooltipEventArgs : EventArgs
{
    public DestroyTooltipEventArgs(string elementId)
    {
        ElementId = elementId;
    }

    public string ElementId { get; }
}
