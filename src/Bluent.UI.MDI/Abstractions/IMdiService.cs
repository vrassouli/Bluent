using Bluent.Core;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.MDI.Services;

public interface IMdiService
{
    void OpenDocument<TComponent>(string? id = null, 
        CommandManager? commandManager = null,
        Dictionary<string, object?>? parameters = null) 
        where TComponent : ComponentBase, IMdiDocument;

    void TabItemStateHasChanged();
    void CloseDocument(string id);
}