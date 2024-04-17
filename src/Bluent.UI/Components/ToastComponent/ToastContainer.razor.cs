using Bluent.UI.Services;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components.ToastComponent;

public partial class ToastContainer : IDisposable
{
    private List<ToastContext> _contexts = new();

    [Inject] private IToastService ToastService { get; set; } = default!;

    protected override void OnInitialized()
    {
        if (ToastService is ToastService toastService)
        {
            toastService.ShowToast += OnShowToast;
        }

        base.OnInitialized();
    }

    public void Dispose()
    {
        if (ToastService is ToastService toastService)
        {
            toastService.ShowToast -= OnShowToast;
        }
    }

    private void OnShowToast(dynamic? sender, ShowToastEventArgs e)
    {
        _contexts.Add(e.Context);
        StateHasChanged();
    }

    private void OnToastHide(dynamic? result, ToastContext context)
    {
        context.ResultTCS.SetResult(result);
        _contexts.Remove(context);
    }
}
