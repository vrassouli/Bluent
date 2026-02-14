using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public class DockPanel : ComponentBase, IDisposable
{
    [Parameter, EditorRequired] public string DockName { get; set; }
    [Parameter, EditorRequired] public string Icon { get; set; }
    [Parameter, EditorRequired] public string Title { get; set; }
    [Parameter, EditorRequired] public RenderFragment ChildContent { get; set; }
    
    [Parameter] public RenderFragment? HeaderContent { get; set; }
    [Parameter] public RenderFragment? MoreActionsContent { get; set; }
    [Inject] private IDockService DockService { get; set; } = default!;

    protected override void OnInitialized()
    {
        DockService.RegisterPanel(this, DockName);
        base.OnInitialized();
    }

    public void Dispose()
    {
        DockService.UnregisterPanel(this);
    }

    public void SetDockName(string name)
    {
        DockName = name;

        DockService.RegisterPanel(this, DockName);
    }
}