using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public class DockPanel : ComponentBase, IDisposable
{
    private string? _dockName;
    
    [Parameter, EditorRequired] public string DockName { get; set; }
    [Parameter, EditorRequired] public string Icon { get; set; }
    [Parameter, EditorRequired] public string Title { get; set; }
    [Parameter, EditorRequired] public RenderFragment ChildContent { get; set; }
    [Inject] private IDockService DockService { get; set; } = default!;

    protected override void OnParametersSet()
    {
        if (_dockName != DockName)
        {
            _dockName = DockName;
            DockService.RegisterPanel(this, DockName);
        }
        
        base.OnParametersSet();
    }

    public void Dispose()
    {
        DockService.UnregisterPanel(this);
    }
}