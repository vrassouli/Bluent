using Bluent.UI.Services;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components.DrawerComponent;

public partial class DrawerContainer : IDisposable
{
    private List<DrawerContext> _contexts = new();

    [Inject] private IDrawerService DrawerService { get; set; } = default!;

    private DrawerContext? LastModal => _contexts.LastOrDefault(x => x.Config.Modal);

    protected override void OnInitialized()
    {
        if (DrawerService is DrawerService drawerService)
        {
            drawerService.OpenDrawer += OnOpenDrawer;
        }

        base.OnInitialized();
    }

    public void Dispose()
    {
        if (DrawerService is DrawerService drawerService)
        {
            drawerService.OpenDrawer -= OnOpenDrawer;
        }
    }

    private void OnOpenDrawer(dynamic? sender, OpenDrawerEventArgs e)
    {
        _contexts.Add(e.Context);
        StateHasChanged();
    }

    private void OnDrawerHide(dynamic? result, DrawerContext context)
    {
        context.ResultTCS.SetResult(result);
        _contexts.Remove(context);
    }

    private void OverlayClickHandler()
    {
        if (LastModal?.DrawerReference != null)
        {
            LastModal.DrawerReference.Close(null);
        }
    }
}
