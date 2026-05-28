using Bluent.Core;

namespace Bluent.UI.Utilities.Abstractions;

public interface IMdiDocument
{
    CommandManager CommandManager { get; set; }
    string Title { get; }
    string Icon { get; }
    List<DocumentToolbarItem> Items { get; }
    bool HasChanges { get; }
    
    void OnActivated();
    void OnDeactivated();
}