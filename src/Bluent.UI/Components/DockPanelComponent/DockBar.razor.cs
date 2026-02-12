using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class DockBar
{
    [Parameter, EditorRequired] public string DockName { get; set; }
    [Parameter] public bool DisplayTitle { get; set; }
    [Parameter] public Orientation Orientation { get; set; } = Orientation.Horizontal;
    [Inject] private IDockService DockService { get; set; } = default!;

    private List<DockPanel> Panels => DockService.GetRegisteredPanels(DockName);
    private DockPanel? ActivePanel => DockService.GetActivePanel(DockName);

    protected override void OnInitialized()
    {
        DockService.PanelActivated += OnPanelActivated;
        DockService.PanelDeactivated += OnPanelDeactivated;
        DockService.PanelRegistered += OnDockPanelRegistered;
        DockService.PanelUnregistered += OnDockPanelUnregistered;

        base.OnInitialized();
    }

    public override ValueTask DisposeAsync()
    {
        DockService.PanelActivated -= OnPanelActivated;
        DockService.PanelDeactivated -= OnPanelDeactivated;
        DockService.PanelRegistered -= OnDockPanelRegistered;
        DockService.PanelUnregistered -= OnDockPanelUnregistered;

        return base.DisposeAsync();
    }

    public override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-dock-bar";
        
        if (Orientation == Orientation.Vertical)
            yield return "vertical";
    }

    private void OnPanelDeactivated(object? sender, EventArgs e)
    {
        StateHasChanged();
    }

    private void OnPanelActivated(object? sender, EventArgs e)
    {
        StateHasChanged();
    }

    private void OnDockPanelUnregistered(object? sender, EventArgs e)
    {
        StateHasChanged();
    }

    private void OnDockPanelRegistered(object? sender, EventArgs e)
    {
        StateHasChanged();
    }

    private void TogglePanel(DockPanel panel)
    {
        if (ActivePanel == panel)
            DockService.DeactivatePanel(panel);
        else
            DockService.ActivatePanel(panel);
    }

    private bool IsActive(DockPanel panel) => ActivePanel == panel;
}