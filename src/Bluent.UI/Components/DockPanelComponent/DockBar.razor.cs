using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class DockBar
{
    [Parameter, EditorRequired] public string DockName { get; set; }
    [Parameter] public bool DisplayTitle { get; set; }
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

    public override void Dispose()
    {
        DockService.PanelActivated -= OnPanelActivated;
        DockService.PanelDeactivated -= OnPanelDeactivated;
        DockService.PanelRegistered -= OnDockPanelRegistered;
        DockService.PanelUnregistered -= OnDockPanelUnregistered;

        base.Dispose();
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
            DockService.ActivatePanel(panel, DockName);
    }

    private bool IsActive(DockPanel panel) => ActivePanel == panel;
}