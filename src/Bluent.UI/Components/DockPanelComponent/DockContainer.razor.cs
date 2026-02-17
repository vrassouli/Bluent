using Bluent.UI.Components.SplitPanelComponent.Internal;
using Bluent.UI.Interops.Abstractions;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;

namespace Bluent.UI.Components;

public partial class DockContainer : IPointerUpEventHandler, IPointerMoveEventHandler
{
    private int? _size;
    private DockMode _dockMode = DockMode.Pinned;
    [Parameter, EditorRequired] public string DockName { get; set; }
    [Parameter] public int DefaultSize { get; set; } = 150;
    [Parameter] public DockMode DockMode { get; set; } = DockMode.Pinned;
    [CascadingParameter] public SplitPanel? SplitPanel { get; set; }
    [Inject] private IDockService DockService { get; set; } = default!;
    [Inject] private IDomHelper DomHelper { get; set; } = default!;

    private DockPanel? ActivePanel => DockService.GetActivePanel(DockName);
    private string[] DockNames => DockService.GetDockNames();

    protected override async Task OnInitializedAsync()
    {
        DockService.PanelActivated += OnPanelActivated;
        DockService.PanelDeactivated += OnPanelDeactivated;
        DockService.PanelRegistered += OnDockPanelRegistered;
        DockService.PanelUnregistered += OnDockPanelUnregistered;
        DockService.PanelStateHasChanged += OnPanelStateHasChanged;

        DockService.SetDockMode(DockName, DockMode);
        await UpdateSplitPanel();
        
        await base.OnInitializedAsync();
    }

    protected override void OnParametersSet()
    {
        if (_dockMode != DockMode)
        {
            _dockMode = DockMode;
            DockService.SetDockMode(DockName, DockMode);
            SplitPanel?.SetFloating(DockMode == DockMode.Floating);
        }

        base.OnParametersSet();
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender && RendererInfo.IsInteractive)
        {
            await DomHelper.RegisterPointerUpHandler(this);
            await DomHelper.RegisterPointerMoveHandler(this);

            if (DockMode is DockMode.Floating)
            {
                SplitPanel?.SetSize(DefaultSize);
                
                StateHasChanged();
            }
        }

        await base.OnAfterRenderAsync(firstRender);
    }

    public override async ValueTask DisposeAsync()
    {
        try
        {
            if (RendererInfo.IsInteractive)
            {
                await DomHelper.UnregisterPointerUpHandler(this);
                await DomHelper.UnregisterPointerMoveHandler(this);
            }
        }
        catch (JSDisconnectedException)
        {
            // swallow
        }

        DockService.PanelActivated -= OnPanelActivated;
        DockService.PanelDeactivated -= OnPanelDeactivated;
        DockService.PanelRegistered -= OnDockPanelRegistered;
        DockService.PanelUnregistered -= OnDockPanelUnregistered;
        DockService.PanelStateHasChanged -= OnPanelStateHasChanged;

        await base.DisposeAsync();
    }

    public override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-dock-container";

        if (SplitPanel is not null && DockMode == DockMode.Floating)
        {
            yield return "floating";

            if (SplitPanel.SplitArea == SplitArea.Header ||
                SplitPanel.SplitArea == SplitArea.Top)
                yield return "top-aligned";

            if (SplitPanel.SplitArea == SplitArea.Footer ||
                SplitPanel.SplitArea == SplitArea.Bottom)
                yield return "bottom-aligned";

            if (SplitPanel.SplitArea == SplitArea.Start ||
                SplitPanel.SplitArea == SplitArea.StartSide)
                yield return "left-aligned";

            if (SplitPanel.SplitArea == SplitArea.End ||
                SplitPanel.SplitArea == SplitArea.EndSide)
                yield return "right-aligned";
        }
    }

    public override IEnumerable<(string key, string value)> GetStyles()
    {
        foreach (var c in base.GetStyles())
            yield return c;

        var size = SplitPanel?.GetSize();
        if (SplitPanel is not null &&
            size is not null &&
            DockMode == DockMode.Floating &&
            ActivePanel is not null)
        {
            if (SplitPanel.SplitArea == SplitArea.Header ||
                SplitPanel.SplitArea == SplitArea.Top ||
                SplitPanel.SplitArea == SplitArea.Bottom ||
                SplitPanel.SplitArea == SplitArea.Footer)
                yield return ("height", $"{size}px");

            if (SplitPanel.SplitArea == SplitArea.Start ||
                SplitPanel.SplitArea == SplitArea.StartSide ||
                SplitPanel.SplitArea == SplitArea.End ||
                SplitPanel.SplitArea == SplitArea.EndSide)
                yield return ("width", $"{size}px");
        }
    }

    private void ChangeDock(string name)
    {
        if (ActivePanel is null || ActivePanel.DockName == name)
            return;

        // preserve active panel reference, before deactivation
        var activePanel = ActivePanel;
        DockService.DeactivatePanel(ActivePanel);

        // use the preserved reference, as ActivePanel should be null here...
        activePanel.SetDockName(name);
        DockService.ActivatePanel(activePanel);
    }

    private async Task ChangeMode(DockMode mode)
    {
        DockMode = mode;
        SplitPanel?.SetFloating(DockMode == DockMode.Floating);

        if (mode == DockMode.Floating)
        {
            await UpdateSplitPanel();
        }
    }

    private void OnPanelDeactivated(object? sender, DockPanelUpdateEventArgs e)
        => DockPanelUpdate(e);

    private void OnPanelActivated(object? sender, DockPanelUpdateEventArgs e)
    {
        DockPanelUpdate(e);
    }

    private void OnDockPanelUnregistered(object? sender, DockPanelUpdateEventArgs e)
        => DockPanelUpdate(e);

    private void OnDockPanelRegistered(object? sender, DockPanelUpdateEventArgs e)
        => DockPanelUpdate(e);

    private void OnPanelStateHasChanged(object? sender, DockPanelUpdateEventArgs e)
        => DockPanelUpdate(e);

    private void DockPanelUpdate(DockPanelUpdateEventArgs e)
    {
        if (e.DockName == DockName)
        {
            InvokeAsync(UpdateSplitPanel);
        }
    }

    private async Task UpdateSplitPanel()
    {
        if (SplitPanel is null)
            return;

        if (ActivePanel is not null)
        {
            SplitPanel.SetAllowResize(true);

            if (SplitPanel.GetSize() == null)
            {
                var rect = await DomHelper.GetBoundingClientRectAsync($"#{Id}");
                if (rect != null)
                {
                    var size = SplitPanel.SplitArea switch
                    {
                        SplitArea.Header or SplitArea.Top or SplitArea.Bottom or SplitArea.Footer
                            => (int)rect.Height,
                        SplitArea.StartSide or SplitArea.Start or SplitArea.EndSide or SplitArea.End
                            => (int)rect.Width,
                        _ => (int?)null
                    };

                    if (size > 0)
                        SplitPanel.SetSize(size.Value);
                    else if (DockMode == DockMode.Floating)
                        SplitPanel.SetSize(_size ?? DefaultSize);
                }
            }
        }
        else
        {
            SplitPanel.ResetSize();
            SplitPanel.SetAllowResize(false);
        }

        StateHasChanged();
    }

    private Task Deactivate()
    {
        if (ActivePanel is null)
            return Task.CompletedTask;

        DockService.DeactivatePanel(ActivePanel);
        return UpdateSplitPanel();
    }

    [JSInvokable]
    public Task OnPointerUp(PointerEventArgs args)
    {
        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task OnPointerMove(PointerEventArgs args)
    {
        if (DockMode == DockMode.Floating)
        {
            var size = SplitPanel?.GetSize();

            if (size != _size)
            {
                _size = size;
                StateHasChanged();
            }
        }

        return Task.CompletedTask;
    }
}