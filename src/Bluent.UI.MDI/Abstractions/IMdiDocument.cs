using Bluent.Core;

namespace Bluent.UI.MDI.Services;

public interface IMdiDocument
{
    CommandManager CommandManager { get; set; }
    string Title { get; }
    string Icon { get; }
}