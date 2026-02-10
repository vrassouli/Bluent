namespace Bluent.UI.Utilities.Services.Events;

public class CloseDocumentEventArgs : System.EventArgs
{
    public string Id { get; }

    public CloseDocumentEventArgs(string id)
    {
        Id = id;
    }
}