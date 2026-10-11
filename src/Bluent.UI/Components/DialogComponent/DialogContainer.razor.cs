using Bluent.UI.Services;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Bluent.UI.Components.DialogComponent;

public partial class DialogContainer : IDisposable
{
    private readonly List<DialogContext> _contexts = [];
    private string? _pendingFocusTargetId;
    private bool _disposed;
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
        if (_disposed) return;
        _disposed = true;
        if (DialogService is DialogService service)
            service.ShowDialog -= Service_ShowDialog;

        // A route-local host can disappear before an opt-in v3 Dialog closes.
        // Complete the pending ShowAsync task as dismissed, without attempting
        // to focus a launcher that no longer belongs to the current page.
        var pending = _contexts
            .Where(context => context.Config.AccessibleName is not null || context.Config.EnableModalKeyboard)
            .ToArray();
        _contexts.Clear();
        _pendingFocusTargetId = null;
        // Complete after clearing owner state; awaiting callers may resume
        // synchronously, but cannot mutate a list being enumerated.
        foreach (var context in pending)
            context.ResultTCS.TrySetResult(null);
    }

    private void Service_ShowDialog(object? sender, Services.EventArguments.ShowDialogEventArgs e)
    {
        if (_disposed)
        {
            if (e.Context.Config.AccessibleName is not null || e.Context.Config.EnableModalKeyboard)
                e.Context.ResultTCS.TrySetResult(null);
            return;
        }
        // A newer Dialog supersedes any delayed focus restoration.
        _pendingFocusTargetId = null;
        _contexts.Add(e.Context);
        StateHasChanged();
    }
    
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);
        if (_pendingFocusTargetId is not { } targetId)
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
        // Explicit nested launcher restoration is permitted only inside the surviving top Dialog.
        _pendingFocusTargetId = context.Config.ReturnFocusTargetId;
        StateHasChanged();
    }

    private void OverlayClickHandler(DialogContext context)
    {
        context.DialogReference?.Close();
    }
}
