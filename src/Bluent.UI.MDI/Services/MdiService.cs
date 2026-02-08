using Bluent.Core;
using Bluent.Core.Utilities;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.MDI.Services;

internal class MdiService : IMdiService
{
    public event EventHandler<OpenDocumentEventArgs>? OnOpen;
    public event EventHandler<CloseDocumentEventArgs>? OnClose;
    public event EventHandler? OnTabItemStateChanged;
    
    public void OpenDocument<TComponent>(string? id = null,
        CommandManager? commandManager = null,
        Dictionary<string, object?>? parameters = null)
        where TComponent : ComponentBase, IMdiDocument
    {
        var args = new OpenDocumentEventArgs(typeof(TComponent),
            id ?? Identifier.NewId(),
            commandManager,
            parameters);
        OnOpen?.Invoke(this, args);
    }

    public void TabItemStateHasChanged()
    {
        OnTabItemStateChanged?.Invoke(this, EventArgs.Empty);
    }

    public void CloseDocument(string id)
    {
        OnClose?.Invoke(this, new CloseDocumentEventArgs(id));
    }
}