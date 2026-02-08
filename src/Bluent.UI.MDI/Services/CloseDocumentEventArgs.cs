namespace Bluent.UI.MDI.Services
{
    public class CloseDocumentEventArgs : EventArgs
    {
        public string Id { get; }

        public CloseDocumentEventArgs(string id)
        {
            Id = id;
        }
    }
}