using Bluent.UI.Services;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Bluent.UI.Components.DialogComponent;

public partial class DialogContainer : IDisposable
{
    private readonly List<DialogContext> _contexts = [];
    private string? _pendingFocusTargetId;
    [Inject] private IServiceProvider Services { get; set; } = default!;

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
        // A newer Dialog supersedes any delayed focus restoration.
        _pendingFocusTargetId = null;
        _contexts.Add(e.Context);
        StateHasChanged();
    }
    
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);
        if (_pendingFocusTargetId is not { } targetId || _contexts.Count != 0)
            return;
        _pendingFocusTargetId = null;
        // Import only for explicitly opted-in v3 callers, not existing v2 Dialogs.
        var jsRuntime = Services.GetService(typeof(IJSRuntime)) as IJSRuntime
            ?? throw new InvalidOperationException("The opt-in Dialog focus feature requires IJSRuntime.");
        await using var module = await jsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./_content/Bluent.UI/v3/issue-418-dialog-focus.preview.js");
        await module.InvokeVoidAsync("restoreFocus", targetId);
    }
    private void OnDialogClose(dynamic? result, DialogContext context)
    {
        context.ResultTCS.TrySetResult(result);
        _contexts.Remove(context);
        if (_contexts.Count == 0)
            _pendingFocusTargetId = context.Config.ReturnFocusTargetId;
        StateHasChanged();
    }

    private void OverlayClickHandler(DialogContext context)
    {
        context.DialogReference?.Close();
    }
}
