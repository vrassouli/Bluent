using Bluent.UI.Services;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components.DialogComponent;

public partial class DialogContainer : IDisposable
{
    private readonly List<DialogContext> _contexts = [];

    [Inject] private IDialogService DialogService { get; set; } = default!;

    protected override void OnInitialized()
    {
        if(DialogService is DialogService service)
            service.ShowDialog += Service_ShowDialog;

        base.OnInitialized();
    }

    public void Dispose()
    {
        if (DialogService is DialogService service)
            service.ShowDialog -= Service_ShowDialog;
    }

    private void Service_ShowDialog(object? sender, Services.EventArguments.ShowDialogEventArgs e)
    {
        _contexts.Add(e.Context);
        StateHasChanged();
    }
    
    private void OnDialogClose(dynamic? result, DialogContext context)
    {
        context.ResultTCS.TrySetResult(result);
        _contexts.Remove(context);
    }

    private void OverlayClickHandler(DialogContext context)
    {
        context.DialogReference?.Close();
    }
}
