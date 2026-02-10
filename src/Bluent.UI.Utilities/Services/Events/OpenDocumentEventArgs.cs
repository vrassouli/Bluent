using Bluent.Core;

namespace Bluent.UI.Utilities.Services.Events;

public class OpenDocumentEventArgs : System.EventArgs
{
    public Type ComponentType { get; }
    public string Id { get; }
    public CommandManager? CommandManager { get; }
    public Dictionary<string, object?>? Parameters { get; }

    public OpenDocumentEventArgs(Type componentType,
        string id,
        CommandManager? commandManager,
        Dictionary<string, object?>? parameters)
    {
        ComponentType = componentType;
        Id = id;
        CommandManager = commandManager;
        Parameters = parameters;
    }
}