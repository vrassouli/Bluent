using Bluent.UI.Diagrams.Components;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Bluent.UI.Diagrams.Tools;

public interface ITool: INotifyPropertyChanged
{
    event EventHandler? Completed;
    string Cursor { get; set; }
    void Register(DrawingCanvas canvas);
    void Unregister();
}
