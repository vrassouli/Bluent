namespace Bluent.UI.Services.EventArguments;

internal class RemoveTooltipEventArgs : EventArgs
{
    public RemoveTooltipEventArgs(string elementId)
    {
        ElementId = elementId;
    }

    public string ElementId { get; }
}
